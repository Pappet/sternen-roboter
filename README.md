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
  also passt er auch, wenn schon halb falsche Karten liegen.

Die Pfeile sind absolute Richtungen (oben/unten/links/rechts auf dem Bildschirm),
nicht "drehe dich nach links". Das ist für dieses Alter deutlich einfacher — relative
Drehungen sind der klassische Stolperstein bei Bee-Bot-artigen Spielen.

## Kein Verlieren

- Falscher Weg: Der Roboter stößt an, fährt zurück zum Start, die Karten **bleiben
  liegen**, die schuldige Karte wird rot umrandet. Dazu eine ruhige Erklärung.
- Fürs Probieren gibt es einmal pro Aufgabe einen Trost-Stern, für die Lösung 3 Sterne
  plus einen je eingesammeltem Stern. Sterne werden nie abgezogen.
- Alle 4 Aufgaben gibt es ein Runden-Fest und einen neuen Planeten für die Sammlung
  auf der Startseite.

## Schwierigkeitsstufen

12 handgebaute Aufgaben, jede Neuerung wird einzeln angekündigt und eingeführt:

| Aufgabe | Feld | Neu | Kürzeste Lösung |
|---|---|---|---|
| 1–2 | 3×3 | Weg zum Haus, dann der erste Stern | 2 Karten |
| 3–4 | 3×3 | Ecken, Umwege | 4–6 |
| 5–6 | 4×4 | Steine als Hindernis | 6–7 |
| 7–8 | 4×4 | zwei Sterne, Reihenfolge überlegen | 8–9 |
| 9–10 | 5×5 | grösseres Feld | 9–10 |
| 11–12 | 5×5 | drei Sterne | 10–11 |

Danach erzeugt das Spiel **endlos neue Aufgaben** (5×5, 2–3 Sterne). Jede wird vor
dem Anzeigen mit einer Breitensuche geprüft: sie ist garantiert lösbar und braucht
7–11 Karten. Alle 12 festen Aufgaben sind mit demselben Verfahren nachgerechnet.

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
- Gespeichert wird in `localStorage` unter `sternen-roboter-spielstand`
  (Sterne, aktuelle Aufgabe, Planeten, gewähltes Aussehen).
- Freischalt-Schwellen stehen in `index.html` in `ROBOTER`, `WELTEN` und
  `KARTENSTILE` (Feld `ab`) — dort lassen sie sich leicht anders takten.
- Name des Kindes: in `index.html` ganz oben `const KIND = ''` — trägt man dort z. B.
  `'Sofia'` ein, wird der Name ins Lob eingebaut. Nur diese eine Stelle, damit er vor
  dem Veröffentlichen leicht wieder rausfliegt.
- Sprachausgabe läuft über eine Warteschlange, nichts wird abgeschnitten. Ohne
  deutsche Stimme bleibt das Spiel stumm, aber vollständig spielbar — alles Wichtige
  steht auch als Bild da (Zielleiste oben zeigt Sterne ➜ Haus).

## Installieren

Braucht **HTTPS**, sonst gibt es keinen Service Worker und keine Installation
(ein Pi mit `http://192.168.x.x` reicht nicht):

1. Ordner z. B. auf Netlify Drop ziehen oder auf GitHub Pages legen.
2. Auf dem Tablet in Chrome öffnen → Menü → „App installieren".
3. Danach läuft alles offline aus dem Cache.

Nach **jeder** Änderung am Spiel `VERSION` in `sw.js` hochzählen, sonst zeigt das
Tablet weiter die alte Fassung.

## Dateien

    index.html              das ganze Spiel (CSS, JS, SVG inline)
    sw.js                   Service Worker (VERSION = v3)
    manifest.webmanifest
    icons/                  192, 512, 512-maskable, 180, favicon
