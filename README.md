# Energie- und Chakra-Reise

Statische Website (HTML/CSS/JS, kein Build nötig). Öffnen: `index.html` im Browser oder lokal `python3 -m http.server` im Ordner starten.
Veröffentlichen: Ordnerinhalt auf einen beliebigen statischen Host laden (GitHub Pages, Netlify Drop, Cloudflare Pages).
Quellen & Recherche: siehe Info-Dialog (i) in der App.

## Aufbau: der Lebensbaum
- **Stamm** (für alle gleich): Check-in → (Paare: Heiliger Raum) → Erden & Ankommen (2 min) → Nervensystem regulieren → Geist beruhigen → Energetisieren → Entspannen. Jede Station: Mini-Test → passende Übung (Blatt) → Re-Test.
- **Baumkrone / Verzweigung**: Chakra-Scan, empfohlene Äste (plus Hinweise aus dem Stamm), alle Äste frei wählbar, beliebig viele pro Sitzung.
- **Äste** = 7 Chakren, je 2–3 **Zweige** (Lebensbereiche) mit Übungen als **Blätter**. Die tiefe Erdung liegt im Ast des Wurzelchakras.
- **Wipfel**: Integration (Stille, Journal, Vorher/Nachher) – jederzeit erreichbar.
- Navigation: Klick auf jeden Punkt im Baum, ◀ ▶ / Pfeiltasten, 🌳 zurück zum Baum, ☰ Übersicht, Browser-Zurück.
- Daten: `js/stations.js` (Stationen, `BRANCHES`, `TRUNK_HINTS`), Übungen in `js/ex-*.js`, Bilder in `img/`, Stimme in `audio/`.

## Vorbereitung & Raum
- **Raum vorbereiten** zu Beginn jeder Reise: Checkliste (Handy lautlos, ungestörter Raum, bequeme Kleidung, Wasser, Matte/Decke, gedämpftes Licht) – für Paare zusätzlich Zeit, Grenzen und Stopp-Wort vereinbaren. Wird von der Stimme angesagt.
- Jede Übung und jeder Mini-Test zeigt eine **Vorbereitung**: Position, Augen, Hände, Hilfsmittel, Platz (`js/setup.js`) – und Seraphina sagt sie vor dem ersten Schritt an.
- Wechselt die Körperhaltung zwischen zwei Übungen/Tests, kündigt die Stimme den **Positionswechsel** kurz an.
- Die Karte ist ein organischer Lebensbaum: Wurzeln bis zum Rahmenkreis, Stamm mit Rinde, natürlich verzweigte Chakra-Äste – jede Übung ist ein Büschel aus 6–9 Blättern.
