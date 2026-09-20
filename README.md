# Sternen-Roboter

Logikspiel zum Wege-Planen für ein Tablet (ab ca. 5 Jahren): Das Kind legt aus
Pfeilkarten einen Weg, drückt auf ▶ und schaut zu, wie der Roboter ihn abfährt —
Sterne einsammeln, dann nach Hause. Das ist die Grundidee vom Programmieren:
erst denken, dann läuft es ab, dann verbessern.

## Wie es gespielt wird

- **Pfeiltasten** legen Karten in den Bauplan unten (bis zu 12 Karten).
- **▶** lässt den Roboter den ganzen Weg abfahren.
- **↩** nimmt die letzte Karte weg, **✖** den ganzen Bauplan.
  Eine einzelne Karte lässt sich auch direkt im Bauplan antippen, um sie zu löschen.
- **🔊** sagt die Aufgabe nochmal an.
- Nach 13 Sekunden ohne Aktion wackelt die Taste, die als Nächstes passen würde,
  und die Ansage kommt nochmal. Der Tipp wird aus einer echten Wegsuche berechnet,
  also passt er auch, wenn schon halb falsche Karten liegen. Die Suche kennt dabei
  die schon liegenden Karten (eine ×3 wiederholt ja auch die) und nur die noch
  freien Slots — passt der Rest nicht mehr hinein, wackelt stattdessen ↩.
- Die **×3-Taste** erscheint erst ab Aufgabe 13, wenn sie eingeführt wird
  (im Freien Fahren immer).

Die Pfeile sind absolute Richtungen (oben/unten/links/rechts auf dem Bildschirm),
nicht "drehe dich nach links". Das ist für dieses Alter deutlich einfacher — relative
Drehungen sind der klassische Stolperstein bei Bee-Bot-artigen Spielen.

## Kein Verlieren

- Falscher Weg: Der Roboter stößt an, fährt sichtbar zurück zum Start (Sterne,
  Schlüssel und Tür werden zurückgesetzt), die Karten **bleiben liegen**, die
  schuldige Karte wird rot umrandet. Dazu eine ruhige Erklärung.
- Fürs Probieren gibt es einmal pro Aufgabe einen Trost-Stern, für die Lösung 3 Sterne
  plus einen je eingesammeltem Stern. Sterne werden nie abgezogen.
- Alle 4 Aufgaben gibt es ein Runden-Fest und einen neuen Planeten für die Sammlung
  auf der Startseite.

## Schwierigkeitsstufen

18 handgebaute Aufgaben, jede Neuerung wird einzeln angekündigt und eingeführt:

| Aufgabe | Feld | Neu | Kürzeste Lösung |
|---|---|---|---|
| 1–2 | 3×3 | Weg zum Haus, dann der erste Stern | 2 Karten |
| 3–4 | 3×3 | Ecken, Umwege | 4–6 |
| 5–6 | 4×4 | Steine als Hindernis | 6–7 |
| 7–8 | 4×4 | zwei Sterne, Reihenfolge überlegen | 8–9 |
| 9–10 | 5×5 | grösseres Feld | 9–10 |
| 11–12 | 5×5 | drei Sterne | 10–11 |
| 13 | 5×4 | ×3-Karte: erste Treppe, 🎯 zeigt 3 | 3 mit ×3 |
| 14 | 7×7 | ×3 üben | 5 mit ×3 |
| 15–16 | 5×5 | 🔑 Schlüssel & Tür: das Haus ist eingemauert, nur durch die Tür geht es | 8–10 |
| 17 | 8×8 | Treppe, ohne ×3 unlösbar (14 Züge) | 7 mit ×3 |
| 18 | 10×10 | die ganz lange Treppe | 4 mit ×3×3 |

Danach erzeugt das Spiel **endlos neue Aufgaben** in drei Sorten, damit nichts
Gelerntes verloren geht: Sterne-Feld (5×5, 2–3 Sterne, 7–11 Karten), Schlüssel &
Tür (6×6, das Haus ist eingemauert, die Tür liegt garantiert auf dem einzigen Weg,
8–12 Karten) und Treppe (8–10 Felder, nur mit ×3 in 12 Karten schaffbar; die
Sterne liegen auf dem Treppenpfad). Jede wird vor dem Anzeigen mit einer
Breitensuche geprüft. Die Musterlösungen aller 18 festen Aufgaben und der Treppen
liegen mitgeliefert bei (`lsg` in `LEVELS` bzw. `TREPPE_LSG`, offline verifiziert)
— nur die Zufalls-Sterne- und Tür-Aufgaben suchen zur Laufzeit, mit Budget und
Fallback auf die Pfeil-BFS. Vor Aufgabe 13 nutzt keine Musterlösung die ×3-Karte,
das 🎯 ist also immer mit dem erreichbar, was schon eingeführt wurde.

## Kürzester Weg (🎯)

Über der Zielleiste steht **🎯 + Zahl**: so viele Karten braucht die kürzeste
Lösung. Wer die Aufgabe mit genau dieser Anzahl löst, bekommt zusätzlich einen
**Extra-Stern** („kürzester Weg +1"). Das belohnt Optimieren, ohne etwas zu
strafen — ein Umweg gewinnt trotzdem. Die Suche versteht dabei auch die
×3-Karte, das 🎯 zeigt also immer die wirklich kartenärmste Lösung.

## Wiederhol-Karte (×3)

Die ×3-Karte wiederholt **alles, was vor ihr liegt, drei Mal** (2× zusätzlich).
Beispiel: [→, ↑, ×3] = →↑ →↑ →↑. Sie kommt schon in Stufe 13 — auf der ersten
kleinen Treppe ist sie optional, aber das 🎯 zeigt, dass es in 3 Karten geht.
Ab Stufe 17 wird sie nötig: die 8×8-Treppe braucht 14 Züge, die ohne Wiederholung
nicht in die 12 Karten passen; die 10×10-Treppe in Stufe 18 sogar 18 Züge, dort
löst [↑, →, ×3, ×3] (= ↑→ neun Mal) in 4 Karten. Eine Aufführung wird bei 64
Zügen abgeschnitten, dann wackelt die letzte Karte und eine ruhige Stimme bittet,
eine Karte wegzunehmen.

## Schlüssel & Tür (🔑)

Ein Feld ist verschlossen (T-Kind), der Schlüssel liegt woanders (K-Kind). Erst
der Schlüssel — dann lässt sich die Tür passieren, sie öffnet sich sichtbar.
Fährt der Roboter gegen die geschlossene Tür, stößt er an wie an einem Stein,
und die Stimme erklärt es. In der Zielleiste leuchtet der Schlüssel auf, sobald
er eingesammelt ist.

## Werkstatt (🛠 oben rechts)

Was mit den Sternen passiert: Sie werden **nicht ausgegeben**. Stattdessen schaltet
jede Sternenzahl etwas frei, das dann für immer bleibt und frei an- und abgewählt
werden kann. Grund: Wer mit 6 Jahren 40 Sterne für den „falschen" Roboter ausgibt und
merkt, dass die Welt teurer gewesen wäre, ist ehrlich untröstlich — und ein Zähler,
der schrumpft, entwertet das Sammeln. So kann nichts schiefgehen, und der Zähler
wächst weiter sichtbar.

| Kategorie | Stück | Freigeschaltet bei |
|---|---|---|
| Roboter (Farbe) | 6 | 0 · 15 · 45 · 80 · 120 · 170 |
| Welt (Hintergrund, Kacheln, Hindernisse, Ziel) | 5 | 0 · 30 · 60 · 100 · 150 |
| Pfeilkarten (Farbe) | 4 | 0 · 20 · 70 · 140 |

Die Welten tauschen die Grafik komplett aus: Weltraum (Steine/Haus), Wiese
(Büsche/Nest), Eis (Eisblöcke/Iglu), Wüste (Kakteen/Zelt), Bonbonland
(Kekse/Lebkuchenhaus). Der Wechsel gilt sofort, auch mitten in einer Aufgabe.

Gesperrte Felder zeigen ⭐ + Zahl und sind ausgegraut; antippen erklärt ruhig, wie
viele Sterne noch fehlen. Kommt beim Lösen etwas Neues dazu, zeigt das Abschlussbild
„Neu in der Werkstatt!" mit dem Teil und einem Knopf direkt dorthin.

## Freies Fahren

Das 🪐 oben rechts (und der Knopf auf der Startseite) schaltet in einen Modus ohne
Aufgabe: leeres Feld, der Roboter malt eine grüne Spur. Weil der Bauplan nach dem
Abfahren liegen bleibt, kann man dasselbe Muster mehrfach starten und Treppen oder
Spiralen legen. ✖ wischt die Spur weg.

## Für Eltern

- **Spielstand zurücksetzen**: die Sternenanzeige oben links 3 Sekunden gedrückt
  halten, dann Sicherheitsabfrage.
- **Zu einer Aufgabe springen**: die 🏁-Anzeige 3 Sekunden gedrückt halten und
  die Nummer eingeben (größer als 18 = Endlos-Aufgaben).
- **🔊/🔇 oben rechts**: Ton und Sprachausgabe gemeinsam stummschalten.
- Gespeichert wird in `localStorage` unter `sternen-roboter-spielstand`
  (Sterne, aktuelle Aufgabe, Planeten, gewähltes Aussehen, Ton an/aus, ob der
  Trost-Stern der aktuellen Aufgabe schon vergeben ist).
- Freischalt-Schwellen stehen in `index.html` in `ROBOTER`, `WELTEN` und
  `KARTENSTILE` (Feld `ab`) — dort lassen sie sich leicht anders takten.
- Belohnung pro gelöster Aufgabe: 3 Sterne + 1 je eingesammeltem Stern + 1 je
  Schlüssel + 1 für den kürzesten Weg (🎯). Fürs Probieren gibt es einmal pro
  Aufgabe einen Trost-Stern. Sterne werden nie abgezogen.
- Name des Kindes: in `index.html` ganz oben `const KIND = ''` — trägt man dort z. B.
  `'Sofia'` ein, wird der Name ins Lob eingebaut. Nur diese eine Stelle, damit er vor
  dem Veröffentlichen leicht wieder rausfliegt.
- Sprachausgabe läuft über eine Warteschlange, nichts wird abgeschnitten. Ohne
  deutsche Stimme bleibt das Spiel stumm, aber vollständig spielbar — alles Wichtige
  steht auch als Bild da (Zielleiste oben zeigt Sterne ➜ Haus).
- Noch mehr Polish: Roboter atmet im Leerlauf und tanzt beim Sieg, die gefahrene
  Spur bleibt im Aufgabenmodus sichtbar, gesammelte Sterne sprühen Funken, das
  Fest zeigt 3 Sterne nacheinander, und ▶ „Nochmal schauen" lässt den letzten
  Lauf wiederholt abfahren. Auf Tablets gibt es kurze Vibrationen.

## Installieren

Braucht **HTTPS**, sonst gibt es keinen Service Worker und keine Installation
(ein Pi mit `http://192.168.x.x` reicht nicht):

1. Ordner z. B. auf Netlify Drop ziehen oder auf GitHub Pages legen.
2. Auf dem Tablet in Chrome öffnen → Menü → „App installieren".
3. Danach läuft alles offline aus dem Cache — inklusive der Schrift, die direkt
   mitgeliefert wird (kein Google-Fonts-Abruf mehr).

Nach **jeder** Änderung am Spiel `VERSION` in `sw.js` hochzählen, sonst zeigt das
Tablet weiter die alte Fassung. Die neue Fassung übernimmt der Service Worker
sofort; die Seite lädt sich dafür einmal neu — aber nur auf der Startseite, nie
mitten in einer Aufgabe.

## Dateien

    index.html              das ganze Spiel (CSS, JS, SVG inline)
    sw.js                   Service Worker (VERSION = v6)
    manifest.webmanifest
    fonts/                  Fredoka (Variable Font, latin) — offline eingebettet
    icons/                  192, 512, 512-maskable, 180, favicon
    tests/                  Node-Logiktest: node tests/logik.test.mjs
                            (Musterlösungen, Staffelung ohne ×3 vor 13, Tür nötig,
                            Tipp-Budget, ×3-Semantik, alle drei Endlos-Sorten)
