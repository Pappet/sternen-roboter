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
            zufallSterne, zufallTuer, zufallTreppe,
            levelLaden, aufgabe, l, keyBit, maskZiel, MAX_KARTEN, LOOP_AB };
`, ctx);
const T = ctx.__out;

let fehler = 0;
const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if(!ok) fehler++; };
const gewinnt = plan => {
  const sim = T.simuliere(plan);
  return !sim.bums && !sim.zuLang && sim.r === T.l().ziel.r && sim.c === T.l().ziel.c && sim.mask === T.maskZiel();
};

console.log('--- Alle handgebauten Level: mitgelieferte Musterlösung ---');
const soll = [2,2,4,6,6,7,8,9,9,10,10,11,3,5,8,10,7,4];
const opts = [];
T.LEVELS.forEach((lv, i) => {
  T.aufgabe(i);
  const lsg = lv.lsg;
  const okLsg = lsg && lsg.length === soll[i] && lsg.length <= T.MAX_KARTEN && gewinnt(lsg);
  let extra = '';
  if(okLsg && lsg.length <= 6){
    // Kreuzcheck: für kleine Level muss die Suche dasselbe Minimum finden
    const t0 = performance.now();
    const plan = T.planBFS(T.l().start.r, T.l().start.c, 0);
    extra = ` | planBFS: ${plan && plan.length} (${(performance.now()-t0).toFixed(1)} ms)${plan && plan.length === lsg.length ? ' ✓' : ' ✗'}`;
    if(!plan || plan.length !== lsg.length) fehler++;
  }
  check(okLsg, `Level ${i+1} (${lv.g[0].length}×${lv.g.length}): lsg ${lsg && lsg.length} Karten, gewinnt${extra}`);
  opts.push(lsg ? lsg.length : null);
});
console.log('  🎯 Optionen:', opts.join(', '));

console.log('--- Staffelung: kein ×3 in Musterlösungen vor Level 13 ---');
T.LEVELS.forEach((lv, i) => {
  if(i < T.LOOP_AB) check(!lv.lsg.includes('x'), `Level ${i+1}: Musterlösung nur Pfeile`);
});

console.log('--- Tür ist nötig (15, 16): als Wand gedacht gibt es keinen Weg ---');
[14, 15].forEach(i => {
  T.levelLaden(T.LEVELS[i].g.map(z => z.replace('T', '#')));
  const ohne = T.loesung(T.l().start.r, T.l().start.c, 0);
  check(!ohne, `Level ${i+1}: ohne Tür unlösbar`);
});

console.log('--- Tipp: Restbudget und ×3-Kontext ---');
{
  // Level 4 (6 Karten nötig): 8 Karten liegen schon (hin und zurück), es fehlen
  // 6 → nur 4 Slots frei → kein Tipp, sondern „Karte wegnehmen"
  T.aufgabe(3);
  const prog = [1,3,1,3,1,3,1,3];
  const sim = T.simuliere(prog);
  const tipp = T.planBFS(sim.r, sim.c, sim.mask, sim.exp, T.MAX_KARTEN - prog.length);
  check(tipp === null, `Level 4 mit 8 nutzlosen Karten: kein Plan in 4 freien Slots (${tipp})`);
  // Level 18: [↑,→] liegt, ×3 wiederholt auch diese beiden → Tipp: ×3, ×3
  T.aufgabe(17);
  const p2 = [0,1], s2 = T.simuliere(p2);
  const t2 = T.planBFS(s2.r, s2.c, s2.mask, s2.exp, T.MAX_KARTEN - p2.length);
  check(t2 && t2.length === 2 && t2.every(k => k === 'x') && gewinnt(p2.concat(t2)),
    `Level 18 nach [↑,→]: Tipp ${JSON.stringify(t2)} führt zum Ziel`);
}

console.log('--- ×3 einsetzen (13, 14): 🎯-Plan nutzt ×3 ---');
[[12, 3], [13, 5]].forEach(([i, soll]) => {
  T.aufgabe(i);
  const plan = T.planBFS(T.l().start.r, T.l().start.c, 0);
  check(plan && plan.length === soll && plan.includes('x') && gewinnt(plan),
    `Level ${i+1}: 🎯-Plan mit ${plan && plan.length} Karten (soll ${soll}), nutzt ×3, gewinnt`);
});

console.log('--- ×3-Level (17, 18) brauchen die Schleife wirklich ---');
[[16, 7], [17, 4]].forEach(([i, soll]) => {
  T.aufgabe(i);
  const nurPfeile = T.loesung(T.l().start.r, T.l().start.c, 0);
  const mit = T.planBFS(T.l().start.r, T.l().start.c, 0);
  const brauchtLoop = !nurPfeile || nurPfeile.length > T.MAX_KARTEN;
  check(brauchtLoop, `Level ${i+1}: ohne ×3 ${nurPfeile ? nurPfeile.length + ' Züge (>12)' : 'unlösbar'} → Schleife nötig`);
  check(mit && mit.length === soll && mit.includes('x') && gewinnt(mit),
    `Level ${i+1}: planBFS findet ${mit && mit.length}-Karten-Plan (soll ${soll}) und gewinnt (Plan: ${mit && mit.map(k => k === 'x' ? '×3' : '↑→↓←'[k]).join(' ')})`);
});

console.log('--- Schlüssel & Tür (15, 16) ---');
[14, 15].forEach(i => {
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
let ok = true, laengen = new Set(), maxMs = 0;
for(let i=0; i<150; i++){
  const z = T.zufallSterne();
  T.levelLaden(z.g);
  const t0 = performance.now();
  const plan = T.planBFS(T.l().start.r, T.l().start.c, 0);
  maxMs = Math.max(maxMs, performance.now() - t0);
  if(!plan || plan.length > 11 || !gewinnt(plan)){ ok = false; console.log('  ✗ Durchlauf', i, plan && plan.length); break; }
  laengen.add(plan.length);
}
check(ok, `150 Sterne-Level: alle gewinnbar mit ≤ 11 Karten (${[...laengen].sort((a,b)=>a-b).join(',')}), langsamster planBFS: ${maxMs.toFixed(1)} ms`);
ok = true; laengen = new Set(); maxMs = 0;
for(let i=0; i<100; i++){
  const z = T.zufallTuer();
  if(!z){ ok = false; console.log('  ✗ Durchlauf', i, 'kein Tür-Level gefunden'); break; }
  T.levelLaden(z.g);
  const t0 = performance.now();
  const plan = T.planBFS(T.l().start.r, T.l().start.c, 0);
  maxMs = Math.max(maxMs, performance.now() - t0);
  T.levelLaden(z.g.map(zl => zl.replace('T', '#')));
  const ohne = T.loesung(T.l().start.r, T.l().start.c, 0);
  T.levelLaden(z.g);
  if(!plan || plan.length > 12 || !gewinnt(plan) || ohne){ ok = false; console.log('  ✗ Durchlauf', i, plan && plan.length, 'ohne Tür:', ohne && ohne.length); break; }
  laengen.add(plan.length);
}
check(ok, `100 Tür-Level: gewinnbar mit ≤ 12 Karten, Tür immer nötig (${[...laengen].sort((a,b)=>a-b).join(',')}), langsamster planBFS: ${maxMs.toFixed(1)} ms`);
ok = true; laengen = new Set();
for(let i=0; i<30; i++){
  const z = T.zufallTreppe();
  T.levelLaden(z.g);
  const nurPfeile = T.loesung(T.l().start.r, T.l().start.c, 0);
  if(!z.lsg || !gewinnt(z.lsg) || !nurPfeile || nurPfeile.length <= T.MAX_KARTEN){ ok = false; console.log('  ✗ Durchlauf', i, z.g.length, JSON.stringify(z.lsg)); break; }
  laengen.add(z.g.length + ':' + z.lsg.length);
}
check(ok, `30 Treppen: Musterlösung gewinnt, ohne ×3 nicht in 12 Karten (${[...laengen].sort().join(' ')})`);

console.log(fehler ? `\n${fehler} FEHLER` : '\nAlle Tests bestanden.');
process.exit(fehler ? 1 : 0);
