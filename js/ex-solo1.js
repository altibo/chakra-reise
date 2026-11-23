"use strict";
/* pose: sit | stand | wide | lie | c-face | c-back | c-hug | c-side ; fx: Illustrations-Effekte */
Object.assign(EXERCISES, {
  wurzeln: {
    title: "Wurzeln schlagen", chakra: "root", pose: "stand", fx: ["roots"], minutes: 4, intensity: "sanft",
    origin: ["Yoga (Tadasana)", "Embodiment", "Wissenschaft: Interozeption"], breath: "calm",
    intro: "Die tiefe Erdung des Wurzelchakras: Wurzeln in die Erde schlagen, bis du dich ganz getragen fühlst. Halt beginnt bei den Füßen.",
    steps: [
      [30, "Stell dich hüftbreit hin, am besten barfuß. Knie ganz leicht weich, Augen offen oder sanft geschlossen."],
      [45, "Verlagere das Gewicht langsam nach vorn, nach hinten, nach links, nach rechts – und finde die Mitte, in der du mühelos stehst."],
      [60, "Spüre die Fußsohlen: Ferse, Großzehenballen, Kleinzehenballen. Atme ein (4) und lass beim Ausatmen (6) das Gewicht noch tiefer in den Boden sinken."],
      [60, "Stell dir vor, aus deinen Fußsohlen wachsen Wurzeln tief in die warme Erde. Mit jedem Ausatmen reichen sie weiter."],
      [45, "Mit dem Einatmen steigt warme, rote Erdkraft durch die Wurzeln in Beine und Becken. Spüre: Ich werde getragen."]
    ],
    why: "Langsames Atmen mit verlängertem Ausatmen aktiviert den Parasympathikus (Zaccaro et al. 2018). Aufmerksamkeit auf die Fußsohlen stärkt die Körperwahrnehmung (Interozeption, Farb et al. 2015). In der Tradition beginnt jede Arbeit bei Muladhara, dem Erd-Zentrum (Avalon, The Serpent Power)."
  },
  seufzer: {
    title: "Physiologisches Seufzen", chakra: "heart", pose: "sit", fx: ["breath"], minutes: 4, intensity: "sanft",
    origin: ["Wissenschaft (Stanford, Balban et al. 2023)"], breath: "sigh",
    intro: "Die schnellste bekannte Atem-Bremse für ein überdrehtes Nervensystem.",
    steps: [
      [20, "Setz dich bequem hin. Eine Hand auf den Bauch, eine auf die Brust."],
      [90, "Atme durch die Nase tief ein … und setze oben noch einen kleinen zweiten Atemzug drauf („Nachatmen“)."],
      [90, "Dann lang und langsam durch den Mund ausatmen, wie ein erleichtertes Seufzen. Das Ausatmen ist doppelt so lang wie das Einatmen."],
      [40, "Lass den Atem jetzt frei. Spüre nach: Wie fühlt sich dein Brustkorb an? Dein Gesicht? Deine Schultern?"]
    ],
    why: "In einer randomisierten Studie verbesserten 5 Minuten „cyclic sighing“ täglich die Stimmung und senkten die Atemfrequenz stärker als Achtsamkeitsmeditation (Balban et al. 2023, Cell Reports Medicine). Das lange Ausatmen verlangsamt den Herzschlag über den Vagusnerv."
  },
  kohaerenz: {
    title: "Herz-Kohärenz-Atem", chakra: "heart", pose: "sit", fx: ["heart", "breath"], minutes: 5, intensity: "sanft",
    origin: ["Wissenschaft: HRV-Resonanzatmung", "Pranayama"], breath: "coherent",
    intro: "Rund 5,5 Atemzüge pro Minute: der Rhythmus, in dem Herz, Atem und Blutdruck in Resonanz schwingen.",
    steps: [
      [30, "Setz dich aufrecht und bequem. Lege eine Hand auf die Mitte deiner Brust."],
      [120, "Folge dem Atem-Kreis: 5,5 Sekunden ein, 5,5 Sekunden aus. Weich, durch die Nase, ohne Pause dazwischen."],
      [90, "Stell dir vor, du atmest direkt durch dein Herz ein und aus. Lass ein Gefühl von Wärme, Dankbarkeit oder Wohlwollen entstehen."],
      [60, "Bleib im Rhythmus. Wenn Gedanken kommen: freundlich bemerken, zurück zum Herzen."]
    ],
    why: "Bei ≈0,1 Hz (≈5,5–6 Atemzüge/min) wird die Herzratenvariabilität maximal – ein Marker für Selbstregulation und Resilienz (Lehrer & Gevirtz 2014; Zaccaro et al. 2018)."
  },
  orientieren: {
    title: "Orientieren & sanft erwachen", chakra: "root", pose: "sit", fx: ["eyes"], minutes: 4, intensity: "sanft",
    origin: ["Somatische Traumaarbeit (polyvagal-informiert)", "Embodiment"], breath: null,
    intro: "Wenn du dich taub, schwer oder „weit weg“ fühlst, braucht dein System kein Runterfahren, sondern sanftes Wiederankommen.",
    steps: [
      [50, "Augen offen. Lass deinen Blick langsam durch den Raum wandern. Benenne leise 5 Dinge, die du siehst."],
      [40, "Benenne 3 Dinge, die du hörst. Und 2 Dinge, die du gerade auf der Haut spürst (Kleidung, Luft, Boden)."],
      [40, "Drücke die Handflächen fest gegeneinander, 5 Sekunden – und lass los. Dreimal. Spüre die Kraft in den Armen."],
      [50, "Reibe deine Hände warm und streiche Arme, Beine und Gesicht aus, als würdest du dich selbst aufwecken."],
      [60, "Bewege den Kopf langsam nach links und rechts, strecke dich, gähne, wenn es kommt. Willkommen zurück."]
    ],
    why: "Bei „Erstarrung/Abschalten“ (Untererregung in der Verteidigungskaskade, Kozlowska et al. 2015) helfen Orientierung, Muskelaktivierung und Sinneskontakt mehr als tiefe Entspannung. Augen offen zu lassen ist ausdrücklich erlaubt."
  },
  wechselatmung: {
    title: "Nadi Shodhana – Wechselatmung", chakra: "third", pose: "sit", fx: ["nadi"], minutes: 6, intensity: "sanft",
    origin: ["Hatha Yoga Pradipika", "Wissenschaft"], breath: "nadi",
    intro: "Die klassische Reinigung der Energiekanäle Ida und Pingala. Sie bringt den Geist in Balance – ruhig und wach zugleich.",
    steps: [
      [30, "Aufrecht sitzen. Rechte Hand: Zeige- und Mittelfinger auf die Stirn (oder einklappen). Daumen verschließt rechts, Ringfinger links."],
      [150, "Rechts schließen, links einatmen (4) – links schließen, rechts ausatmen (6) – rechts einatmen (4) – rechts schließen, links ausatmen (6). Das ist eine Runde."],
      [120, "Weiter im Rhythmus. Stell dir einen silbernen (links, Mond) und einen goldenen Strom (rechts, Sonne) vor, die sich in der Stirnmitte treffen."],
      [60, "Hand sinken lassen. Atme frei durch beide Nasenlöcher und spüre die Stille hinter der Stirn."]
    ],
    why: "Die Hatha Yoga Pradipika (II.7–10) beschreibt die Wechselatmung zur Reinigung der Nadis. Studien zeigen Senkung von Herzfrequenz und Blutdruck sowie verbesserte Aufmerksamkeit (Übersicht: Saoji et al. 2019). Hier ohne Atemanhalten – sicher für alle."
  },
  schuetteln: {
    title: "Schütteln – Kundalini-Shaking", chakra: "sacral", pose: "stand", fx: ["shake"], minutes: 5, intensity: "aktiv",
    origin: ["Schamanische & tantrische Tradition", "Embodiment", "eigene Synthese"], breath: null, tone: "drum",
    intro: "Tiere schütteln Stress nach einer Gefahr einfach ab. Wir dürfen das auch.",
    steps: [
      [30, "Stell dich hin, Knie weich. Beginne in den Knien sanft zu federn."],
      [90, "Lass das Federn größer werden, bis der ganze Körper locker mitschüttelt: Becken, Bauch, Schultern, Arme, Hände, Kiefer."],
      [90, "Atme hörbar durch den Mund aus. Laute sind erlaubt. Lass dich schütteln, statt zu schütteln."],
      [45, "Werde langsam leiser und kleiner … bis du ganz still stehst."],
      [45, "Stillstand. Spüre das Kribbeln, die Wärme, den Strom. Das ist deine Lebensenergie."]
    ],
    why: "Rhythmische Ganzkörperbewegung steigert Durchblutung und Wachheit und baut Muskelspannung ab. Im Osho-Kundalini-Ritual und in vielen schamanischen Traditionen ist Schütteln ein Weg, Energie zu wecken und Altes loszulassen."
  },
  feueratem: {
    title: "Kapalabhati – Feueratem", chakra: "solar", pose: "sit", fx: ["fire"], minutes: 4, intensity: "intensiv",
    origin: ["Hatha Yoga Pradipika", "Gheranda Samhita"], breath: "fire",
    contra: ["pregnancy", "epilepsy", "heart", "surgery", "breath", "psych"], safeAlt: "klopfen",
    intro: "Der „schädelreinigende“ Atem: kurze, kräftige Ausatemstöße aus dem Bauch. Ein inneres Feuer.",
    steps: [
      [30, "Aufrecht sitzen, Hände auf den Knien. Zwei ruhige, tiefe Atemzüge."],
      [40, "Runde 1: Ziehe den Bauch kurz und kräftig nach innen – die Luft stößt durch die Nase aus. Das Einatmen geschieht von selbst. Ca. 1 Stoß pro Sekunde, 30 Stöße."],
      [40, "Pause: 3 ruhige Atemzüge. Spüre das Kribbeln."],
      [40, "Runde 2: wieder 30 Stöße, gleichmäßig, nicht forcieren."],
      [40, "Pause: ruhig atmen."],
      [40, "Runde 3: 30 Stöße. Bei Schwindel sofort aufhören und normal atmen."],
      [10, "Ruhig atmen. Aufmerksamkeit im Bauch, hinter dem Nabel."]
    ],
    why: "Die Hatha Yoga Pradipika (II.35) nennt Kapalabhati als eine der sechs Reinigungen. Studien zeigen erhöhte Wachheit und sympathische Aktivierung (Saoji et al. 2019). Deshalb nur ohne Risikofaktoren – das Tool bietet sonst automatisch eine sanfte Alternative."
  },
  klopfen: {
    title: "Energie-Klopfen", chakra: "solar", pose: "stand", fx: ["tap"], minutes: 4, intensity: "sanft",
    origin: ["Qigong (Pai Da)", "Embodiment"], breath: null,
    intro: "Sanft wachklopfen: Haut, Muskeln und Kreislauf erwachen.",
    steps: [
      [40, "Locker stehen. Mit lockeren Fäusten oder Handflächen die Außenseiten der Beine abwärts klopfen, die Innenseiten aufwärts."],
      [40, "Klopfe Gesäß und unteren Rücken (Nierengegend) – kräftig, aber angenehm."],
      [40, "Klopfe den Bauch kreisförmig im Uhrzeigersinn und dann das Brustbein, dabei „Aaah“ tönen."],
      [40, "Arme: Innenseite abwärts, Außenseite aufwärts. Dann Schultern und Nacken."],
      [40, "Mit den Fingerspitzen wie Regentropfen auf den Kopf und das Gesicht klopfen."],
      [40, "Stillstehen. Hände auf den Bauch. Spüre die Lebendigkeit."]
    ],
    why: "Klopfmassage aus dem Qigong regt Durchblutung und Körperwahrnehmung an – aktivierend, ohne das Nervensystem zu überfordern."
  },
  gefuehl: {
    title: "Gefühl halten – Hand aufs Herz", chakra: "heart", pose: "sit", fx: ["heart"], minutes: 5, intensity: "sanft",
    origin: ["Achtsamkeit (RAIN)", "Selbstmitgefühl", "Embodiment"], breath: "calm",
    intro: "Gefühle wollen nicht weggemacht, sondern gefühlt werden. Dann fließen sie weiter.",
    steps: [
      [40, "Lege eine oder beide Hände auf dein Herz oder dorthin, wo das Gefühl sitzt. Spüre die Wärme deiner Hände."],
      [60, "Erkennen: Welches Gefühl ist da? Benenne es leise: „Da ist Traurigkeit“ / „Da ist Wut“ / „Da ist Angst“."],
      [60, "Erlauben: Sag innerlich „Du darfst da sein.“ Atme in die Stelle hinein, als würdest du ihr Raum geben."],
      [70, "Erforschen: Wo spürst du es? Wie groß ist es? Welche Farbe, Temperatur? Was braucht dieser Teil von dir?"],
      [70, "Nähren: Gib dir, was du brauchst – ein freundliches Wort, eine sanfte Bewegung, ein Wiegen. Bleib bei dir."]
    ],
    why: "Gefühle zu benennen („affect labeling“) und mit Freundlichkeit zu halten, reguliert emotionale Erregung – ein Kernmechanismus achtsamkeitsbasierter Ansätze (Farb et al. 2015). Beruhigende Selbstberührung aktiviert das Fürsorgesystem."
  },
  loslassen: {
    title: "Anspannen & Loslassen", chakra: "solar", pose: "lie", fx: ["release"], minutes: 6, intensity: "sanft",
    origin: ["Progressive Muskelentspannung (Jacobson)", "Yoga Nidra"], breath: "long",
    intro: "Wo du festhältst, darfst du zuerst noch mehr festhalten – damit das Loslassen tief geht.",
    steps: [
      [30, "Leg dich bequem hin oder bleib sitzen. Ein tiefer Atemzug."],
      [60, "Füße & Beine: Zehen krallen, Beine anspannen – 5 Sekunden halten … und mit einem Seufzer loslassen. Zweimal."],
      [60, "Becken & Bauch: anspannen, halten … loslassen. Spüre den Unterschied."],
      [60, "Hände zu Fäusten, Arme und Schultern Richtung Ohren ziehen, halten … und fallen lassen."],
      [60, "Gesicht: Augen zusammenkneifen, Kiefer fest, Stirn runzeln … und alles weich werden lassen. Zunge weg vom Gaumen."],
      [90, "Jetzt der ganze Körper zugleich: anspannen … halten … und loslassen. Liegen bleiben und schmelzen."]
    ],
    why: "Die Progressive Muskelentspannung nach Edmund Jacobson ist eine der am besten untersuchten Entspannungsmethoden. Der Kontrast macht unbewusste Spannung spürbar."
  }
});
