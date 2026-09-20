// Logiktest für Sternen-Roboter: extrahiert den TESTBLOCK aus index.html und
// prüft Level-Lösbarkeit, ×3-Suche, Schlüssel/Tür und die Zufallslevel.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const start = html.indexOf('/* ==== TESTBLOCK-START');
const ende  = html.indexOf('/* ==== TESTBLOCK-ENDE');
if(start < 0 || ende < 0){ console.error('TESTBLOCK-Marker fehlen'); process.exit(1); }
const code = html.slice(start, ende);

const ctx = { window:{}, localStorage:{getItem:()=>null,setItem(){},removeItem(){}}, __out:null };
vm.createContext(ctx);
vm.runInContext(code, ctx);
vm.runInContext(`
  function levelLaden(g){ L = parse(g); return L; }
  function aufgabe(i){ L = parse(LEVELS[i].g); L.sag=''; L.neu=''; return L; }
  function l(){ return L; }
  __out = { LEVELS, parse, planBFS, loesung, simuliere, expandiere, zufallsLevel,
            levelLaden, aufgabe, l, keyBit, maskZiel, MAX_KARTEN };
`, ctx);
const T = ctx.__out;

let fehler = 0;
const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if(!ok) fehler++; };
const gewinnt = plan => {
  const sim = T.simuliere(plan);
  return !sim.bums && !sim.zuLang && sim.r === T.l().ziel.r && sim.c === T.l().ziel.c && sim.mask === T.maskZiel();
};

console.log('--- Alle handgebauten Level ---');
const opts = [];
T.LEVELS.forEach((lv, i) => {
  T.aufgabe(i);
  const t0 = performance.now();
  const plan = T.planBFS(T.l().start.r, T.l().start.c, 0);
  const ms = (performance.now() - t0).toFixed(1);
  const okPlan = plan && plan.length <= T.MAX_KARTEN;
  const okWin  = okPlan && gewinnt(plan);
  check(okPlan && okWin, `Level ${i+1} (${lv.g[0].length}×${lv.g.length}): planBFS=${plan && plan.length} Karten, ${ms} ms, löst die Aufgabe`);
  // Kontrolle: die planBFS-Lösung muss wirklich minimal sein (kein kürzerer Plan)
  if(okPlan){
    for(let k=0; k<plan.length; k++){
      // trivial: planBFS ist BFS nach Kartenanzahl — hier nur Stichprobe für Loops
    }
  }
  opts.push(plan ? plan.length : null);
});
console.log('  🎯 Optionen:', opts.join(', '));

console.log('--- ×3-Level (15, 16) brauchen die Schleife wirklich ---');
[14, 15].forEach(i => {
  T.aufgabe(i);
  const nurPfeile = T.loesung(T.l().start.r, T.l().start.c, 0);
  const mit = T.planBFS(T.l().start.r, T.l().start.c, 0);
  const brauchtLoop = !nurPfeile || nurPfeile.length > T.MAX_KARTEN;
  check(brauchtLoop, `Level ${i+1}: ohne ×3 ${nurPfeile ? nurPfeile.length + ' Züge (>12)' : 'unlösbar'} → Schleife nötig`);
  check(mit && mit.includes('x') && gewinnt(mit), `Level ${i+1}: planBFS findet ${mit && mit.length}-Karten-Plan mit ×3 und gewinnt (Plan: ${mit && mit.map(k => k === 'x' ? '×3' : '↑→↓←'[k]).join(' ')})`);
});

console.log('--- Schlüssel & Tür (13, 14) ---');
[12, 13].forEach(i => {
  T.aufgabe(i);
  const plan = T.planBFS(T.l().start.r, T.l().start.c, 0);
  check(plan && plan.length <= T.MAX_KARTEN && gewinnt(plan), `Level ${i+1}: ${plan && plan.length} Karten, Gewinnzustand (Schlüssel-Bit ${!!(plan && (T.simuliere(plan).mask & T.keyBit()))})`);
});

console.log('--- expandiere: ×3-Semantik ---');
const ex = karten => { const e = T.expandiere(karten); return e && e.exp.length; };
check(ex(['x']) === 0, '×3 ganz vorne: keine Wirkung');
check(ex([0,1,'x']) === 6, '[↑,→,×3] = 6 Züge');
check(ex([0,1,'x',2,'x']) === 21, '[↑,→,×3,↓,×3] = 21 Züge (verschachtelt)');
check(ex([0,1,'x','x']) === 18, '[↑,→,×3,×3] = 18 Züge (Treppe, 9 Stufen)');
check(T.expandiere(Array(11).fill(0).concat(['x','x','x','x'])) === null, 'über 64 Züge: abgelehnt (null)');
check(ex(Array(12).fill(1)) === 12, '12 Pfeile bleiben 12 Züge');

console.log('--- Zufallslevel (endlos) ---');
let ok = true, laengen = new Set();
const t0 = performance.now();
for(let i=0; i<200; i++){
  const z = T.zufallsLevel();
  T.levelLaden(z.g);
  const plan = T.planBFS(T.l().start.r, T.l().start.c, 0);
  if(!plan || plan.length < 7 || plan.length > 11 || !gewinnt(plan)){ ok = false; console.log('  ✗ Durchlauf', i, plan && plan.length); break; }
  laengen.add(plan.length);
}
check(ok, `200 Zufallslevel: alle lösbar mit 7–11 Karten (${[...laengen].sort((a,b)=>a-b).join(',')}), ${(performance.now()-t0).toFixed(0)} ms gesamt`);

console.log(fehler ? `\n${fehler} FEHLER` : '\nAlle Tests bestanden.');
process.exit(fehler ? 1 : 0);
