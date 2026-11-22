"use strict";
/* Stationen der Reise – von unten (Erde) nach oben (Krone).
   Routen: Liste von Übungen; "a>b" = Übung a, bei Risikofaktoren stattdessen b. */
const STATIONS = [
  { id: "checkin", kind: "checkin", title: "Ankommen", short: "Check-in", color: "#f5d0ff", icon: "✦" },
  { id: "sacred", kind: "ritual", coupleOnly: true, title: "Heiliger Raum", short: "Herzgruß", color: "#ff9ecb", icon: "❀", ex: "c_herzgruss",
    note: "Für Paare beginnt die Reise mit einem Ritual nach Margot Anand: Raum schaffen, sich ehren, Grenzen klären." },
  { id: "ground", kind: "ritual", title: "Erdung", short: "Erden", color: "#e2572b", icon: "⏚", ex: "wurzeln",
    note: "Erdung zuerst – sie ist das Fundament für alles, was sich danach öffnet." },
  { id: "nervous", kind: "test", title: "Nervensystem", short: "Nerven", color: "#f472b6", icon: "〰",
    test: {
      intro: "Wie ist dein Nervensystem gerade eingestellt? Unruhig, abgeschaltet oder ruhig-wach?",
      do: ["Lege eine Hand auf die Brust, eine auf den Bauch.", "Spüre 30 Sekunden lang Herzschlag und Atem, ohne etwas zu verändern.", "Beobachte: Tempo, Tiefe, Spannung, Wachheit."],
      timer: 30,
      q: "Was beschreibt deinen Zustand am besten?", qc: "Was beschreibt euren Zustand? (Wählt, was bei mindestens einem von euch zutrifft.)",
      opts: [
        { l: "Ruhig und wach – mein Atem ist langsam, ich bin präsent.", lc: "Wir sind beide ruhig und präsent.", r: "free" },
        { l: "Unruhig, angespannt, gehetzt – schneller Atem, Herzklopfen, innerer Druck.", lc: "Mindestens einer ist unruhig oder angespannt.", r: "over" },
        { l: "Schwer, taub, erschöpft oder „weit weg“ – wenig Gefühl, wenig Antrieb.", lc: "Mindestens einer fühlt sich taub, schwer oder weit weg.", r: "under" }
      ]
    },
    routes: { over: ["seufzer", "kohaerenz"], under: ["orientieren", "klopfen"] },
    croutes: { over: ["c_ruecken", "seufzer"], under: ["orientieren", "c_spiegel"] }
  },
  { id: "mind", kind: "test", title: "Geist", short: "Geist", color: "#a5b4fc", icon: "☁",
    test: {
      intro: "Wie aktiv ist dein Geist? Patanjali nennt die Gedankenwellen „Vrittis“.",
      do: ["Schließe die Augen.", "Zähle 5 Atemzüge: Einatmen – Ausatmen = 1 … bis 5.", "Verlierst du den Faden, beginne wieder bei 1."],
      timer: 45,
      q: "Konntest du den Atemzügen folgen?", qc: "Konntet ihr beide den Atemzügen folgen?",
      opts: [
        { l: "Ja, leicht – höchstens ein Gedanke kam vorbei.", lc: "Ja, wir beide fast ohne Abschweifen.", r: "free" },
        { l: "Ein paar Gedanken, aber ich bin immer zurückgekommen.", lc: "Ein paar Gedanken, aber wir kamen zurück.", r: "free" },
        { l: "Viele Gedanken – ich habe den Faden verloren oder musste neu anfangen.", lc: "Mindestens einer hat den Faden verloren.", r: "blocked" }
      ]
    },
    routes: { blocked: ["wechselatmung", "kohaerenz"] },
    croutes: { blocked: ["c_harmonie", "wechselatmung"] }
  },
  { id: "energy", kind: "test", title: "Lebensenergie", short: "Energie", color: "#fb923c", icon: "⚡",
    test: {
      intro: "Wie viel Lebenskraft (Prana) steht dir gerade zur Verfügung?",
      do: ["Steh auf.", "Wippe 10-mal auf die Zehenspitzen und zurück.", "Strecke dann die Arme weit nach oben und atme tief ein."],
      timer: 25,
      q: "Wie fühlt sich dein Körper danach an?", qc: "Wie fühlen sich eure Körper an?",
      opts: [
        { l: "Lebendig, warm, kribbelig – Energie ist da.", lc: "Bei uns beiden ist Energie da.", r: "free" },
        { l: "Schwer, müde, kraftlos – es war mühsam.", lc: "Mindestens einer ist schwer und müde.", r: "blocked" }
      ]
    },
    routes: { blocked: ["schuetteln", "feueratem>klopfen"] },
    croutes: { blocked: ["c_spiegel", "schuetteln"] }
  },
  { id: "emotion", kind: "test", title: "Gefühl", short: "Gefühl", color: "#f9a8d4", icon: "♡",
    test: {
      intro: "Gefühle sind Energie in Bewegung (E-motion). Was bewegt dich gerade?",
      do: ["Lege eine Hand auf dein Herz.", "Frage dich innerlich: „Wie geht es mir wirklich – jetzt gerade?“", "Warte drei Atemzüge auf die Antwort deines Körpers, nicht deines Kopfes."],
      timer: 30,
      q: "Was taucht auf?", qc: "Was taucht bei euch auf?",
      opts: [
        { l: "Leicht, offen, im Frieden – oder ein Gefühl, das gut fließen darf.", lc: "Bei uns beiden fühlt es sich offen und fließend an.", r: "free" },
        { l: "Ein schweres oder festgehaltenes Gefühl (Traurigkeit, Wut, Angst, Scham, Druck).", lc: "Bei mindestens einem ist ein schweres Gefühl da.", r: "blocked" }
      ]
    },
    routes: { blocked: ["gefuehl", "heart_b"] },
    croutes: { blocked: ["c_schmelz", "gefuehl"] }
  },
  { id: "body", kind: "test", title: "Körperspannung", short: "Körper", color: "#67e8f9", icon: "◎",
    test: {
      intro: "Wo hält dein Körper fest? Spannung ist gespeicherte Energie.",
      do: ["Wandere mit der Aufmerksamkeit langsam von oben nach unten: Stirn, Kiefer, Schultern, Bauch, Becken, Beine.", "Prüfe: Kannst du Kiefer und Schultern ganz loslassen?"],
      timer: 40,
      q: "Was hast du gefunden?", qc: "Was habt ihr gefunden?",
      opts: [
        { l: "Mein Körper ist weitgehend weich und entspannt.", lc: "Wir sind beide weitgehend entspannt.", r: "free" },
        { l: "Deutliche Spannung (z. B. Kiefer, Nacken, Schultern, Bauch) oder Schmerzen.", lc: "Mindestens einer hat deutliche Spannung.", r: "blocked" }
      ]
    },
    routes: { blocked: ["loslassen", "schuetteln"] },
    croutes: { blocked: ["c_ruecken", "loslassen"] }
  },
  { id: "root", kind: "test", chakra: "root", title: "Wurzelchakra", short: "Wurzel",
    test: {
      intro: "Muladhara – Erde. Halt, Sicherheit, Urvertrauen, Lebenswille.",
      do: ["Stell dich barfuß hin, Füße hüftbreit.", "Schließe die Augen für 30 Sekunden.", "Spüre: Wie sicher stehst du? Wie deutlich spürst du Beine, Füße, Boden?"],
      timer: 30,
      q: "Wie hast du gestanden?", qc: "Wie habt ihr gestanden?",
      opts: [
        { l: "Stabil, schwer, getragen – ich spüre meine Füße deutlich.", lc: "Wir beide stabil und getragen.", r: "free" },
        { l: "Wackelig, unsicher, ängstlich, kaum Gefühl in Beinen/Füßen oder „nicht ganz da“.", lc: "Mindestens einer war wackelig oder kaum spürbar.", r: "blocked" }
      ]
    },
    routes: { blocked: ["root_a", "root_b"] },
    croutes: { blocked: ["c_ruecken", "root_a"] }
  },
  { id: "sacral", kind: "test", chakra: "sacral", title: "Sakralchakra", short: "Sakral",
    test: {
      intro: "Svadhisthana – Wasser. Fluss, Genuss, Kreativität, Gefühlsleben.",
      do: ["Stell dich hin, Hände aufs Becken.", "Kreise das Becken langsam 5-mal in jede Richtung.", "Nimm wahr: Fließt es? Macht es Freude?"],
      timer: 30,
      q: "Wie hat sich das Kreisen angefühlt?", qc: "Wie hat sich das Kreisen bei euch angefühlt?",
      opts: [
        { l: "Rund, fließend, vielleicht sogar genussvoll.", lc: "Bei uns beiden fließend und angenehm.", r: "free" },
        { l: "Steif, eckig, peinlich, taub – oder kaum Freude daran.", lc: "Bei mindestens einem steif oder freudlos.", r: "blocked" }
      ]
    },
    routes: { blocked: ["sacral_a", "sacral_b"] },
    croutes: { blocked: ["c_spiegel", "sacral_a"] }
  },
  { id: "solar", kind: "test", chakra: "solar", title: "Solarplexus", short: "Solar",
    test: {
      intro: "Manipura – Feuer. Kraft, Wille, Selbstwert, „Ich kann“.",
      do: ["Lege eine Hand über den Nabel.", "Sag laut und fest: „Ich bin da. Ich kann. Ich darf Raum einnehmen.“", "Spüre die Antwort im Bauch."],
      timer: 20,
      q: "Wie hat sich der Satz im Bauch angefühlt?", qc: "Wie fühlte sich der Satz bei euch an?",
      opts: [
        { l: "Kraftvoll, warm, wahr – der Bauch ist weit.", lc: "Bei uns beiden kraftvoll und wahr.", r: "free" },
        { l: "Klein, eng, unsicher – der Bauch zog sich zusammen, die Stimme war leise.", lc: "Bei mindestens einem eng oder unsicher.", r: "blocked" }
      ]
    },
    routes: { blocked: ["solar_a", "feueratem>sonnenatem"] },
    croutes: { blocked: ["c_handkraft", "solar_a"] }
  },
  { id: "heart", kind: "test", chakra: "heart", title: "Herzchakra", short: "Herz",
    test: {
      intro: "Anahata – Luft. Liebe, Mitgefühl, Verbindung, Vergebung.",
      do: ["Lege beide Hände auf die Brustmitte.", "Denke an einen Menschen (oder ein Tier), den du liebst. Spüre 3 Atemzüge.", "Dann denke an dich selbst – mit derselben Liebe. 3 Atemzüge."],
      timer: 40,
      q: "Was passiert in deiner Brust?", qc: "Was passiert in euren Herzen? (Ihr könnt euch dabei anschauen.)",
      opts: [
        { l: "Weite, Wärme, Weichheit – bei beidem.", lc: "Bei uns beiden Wärme und Weite.", r: "free" },
        { l: "Enge, Schwere, ein Panzer – oder es geht beim anderen, aber nicht bei mir selbst.", lc: "Bei mindestens einem Enge oder Panzer.", r: "blocked" }
      ]
    },
    routes: { blocked: ["heart_a", "heart_b"] },
    croutes: { blocked: ["c_herzsegen", "c_schmelz"] }
  },
  { id: "throat", kind: "test", chakra: "throat", title: "Halschakra", short: "Hals",
    test: {
      intro: "Vishuddha – Raum. Stimme, Ausdruck, Wahrheit.",
      do: ["Atme tief ein.", "Töne ein langes, lautes „Aaaah“ – 10 Sekunden.", "Spüre: Wie fühlt sich dein Hals an? Wie klingt die Stimme?"],
      timer: 20,
      q: "Wie war dein Ton?", qc: "Wie waren eure Töne?",
      opts: [
        { l: "Frei, voll, mühelos – der Hals ist weit.", lc: "Bei uns beiden frei und voll.", r: "free" },
        { l: "Eng, brüchig, zurückgehalten, Kloß im Hals – oder ich habe mich kaum getraut.", lc: "Bei mindestens einem eng oder zurückgehalten.", r: "blocked" }
      ]
    },
    routes: { blocked: ["throat_a", "throat_b"] },
    croutes: { blocked: ["c_toenen", "throat_a"] }
  },
  { id: "third", kind: "test", chakra: "third", title: "Stirnchakra", short: "Stirn",
    test: {
      intro: "Ajna – Geist. Klarheit, Intuition, innere Sicht.",
      do: ["Schau 30 Sekunden ruhig auf den leuchtenden Punkt.", "Bleib mit dem Blick weich beim Punkt.", "Schließe dann die Augen: Siehst du ein Nachbild oder inneres Licht?"],
      timer: 30, dot: true,
      q: "Wie klar war es – außen und innen?", qc: "Wie klar war es bei euch?",
      opts: [
        { l: "Klar und ruhig – ich konnte beim Punkt bleiben.", lc: "Bei uns beiden klar und ruhig.", r: "free" },
        { l: "Neblig, unruhig, Kopfdruck – ständiges Abschweifen.", lc: "Bei mindestens einem neblig oder unruhig.", r: "blocked" }
      ]
    },
    routes: { blocked: ["third_a", "third_b"] },
    croutes: { blocked: ["c_augenblick", "third_b"] }
  },
  { id: "crown", kind: "test", chakra: "crown", title: "Kronenchakra", short: "Krone",
    test: {
      intro: "Sahasrara – Bewusstsein. Weite, Sinn, Verbundenheit mit dem Ganzen.",
      do: ["Setz dich still hin.", "Lenke deine Aufmerksamkeit zum Scheitel, für 3 Atemzüge.", "Dann weite sie in den Raum über dir aus."],
      timer: 30,
      q: "Was nimmst du wahr?", qc: "Was nehmt ihr wahr?",
      opts: [
        { l: "Weite, Leichtigkeit, Frieden oder ein Gefühl von Verbundenheit.", lc: "Bei uns beiden Weite und Frieden.", r: "free" },
        { l: "Enge, voller Kopf, abgeschnitten, sinnlos – oder gar nichts.", lc: "Bei mindestens einem Enge oder Abgeschnittenheit.", r: "blocked" }
      ]
    },
    routes: { blocked: ["crown_a", "crown_b"] },
    croutes: { blocked: ["c_lichtkuppel", "crown_a"] }
  },
  { id: "flow", kind: "ritual", title: "Energiefluss", short: "Fluss", color: "#ffffff", icon: "∞", ex: "floete", cex: "c_kreislauf",
    note: "Alle Zentren sind besucht. Jetzt verbinden wir sie zu einem einzigen, freien Strom." },
  { id: "integration", kind: "integration", title: "Integration", short: "Mitte", color: "#fde68a", icon: "❂", ex: "stille", cex: "c_teilen" }
];

const INTENTIONS = ["Mehr Energie", "Innere Ruhe", "Mein Herz öffnen", "Klarheit", "Wieder im Körper ankommen", "Kreativität & Lust", "Verbindung mit meinem Partner", "Heilung"];

const JOURNAL = [
  "Was hat sich in meinem Körper verändert – im Vergleich zum Anfang?",
  "Welches Zentrum hat heute am deutlichsten zu mir gesprochen, und was wollte es mir sagen?",
  "Ein Satz, den ich mir aus dieser Reise mitnehme:",
  "Eine kleine Praxis, die ich mir für die nächsten 7 Tage schenke:"
];

const QUELLEN = [
  ["Tradition", "Arthur Avalon (Sir John Woodroffe): The Serpent Power, 1919 – gemeinfrei", "https://archive.org/details/arthur-avalon-the-serpent-power"],
  ["Tradition", "Svatmarama: Hatha Yoga Pradipika, übers. Pancham Sinh, 1914 – gemeinfrei", "https://archive.org/details/sacredbooksofthehindusvol15part3hathayogapradipikapanchamsinh_202002"],
  ["Tradition", "Gheranda Samhita, übers. S. C. Vasu – gemeinfrei", "https://archive.org/details/gheranda-samhita"],
  ["Tradition", "Patanjali: Yoga-Sutras, Kommentar Swami Vivekananda (Raja Yoga) – gemeinfrei", "https://archive.org/details/shastras-swami-vivekananda-patanjali-yoga-sutras"],
  ["Wissenschaft", "Zaccaro et al. (2018): How Breath-Control Can Change Your Life. Front Hum Neurosci", "https://pmc.ncbi.nlm.nih.gov/articles/PMC6137615/"],
  ["Wissenschaft", "Lehrer & Gevirtz (2014): Heart rate variability biofeedback: how and why does it work? Front Psychol", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4104929/"],
  ["Wissenschaft", "Balban et al. (2023): Brief structured respiration practices enhance mood and reduce physiological arousal. Cell Rep Med", "https://pmc.ncbi.nlm.nih.gov/articles/PMC9873947/"],
  ["Wissenschaft", "Weitzberg & Lundberg (2002): Humming greatly increases nasal nitric oxide. Am J Respir Crit Care Med", "https://pubmed.ncbi.nlm.nih.gov/12119224/"],
  ["Wissenschaft", "Saoji, Raghavendra & Manjunath (2019): Effects of yogic breath regulation: A narrative review. J Ayurveda Integr Med", "https://pmc.ncbi.nlm.nih.gov/articles/PMC6470305/"],
  ["Wissenschaft", "Kalyani et al. (2011): Neurohemodynamic correlates of ‘OM’ chanting. Int J Yoga", "https://pmc.ncbi.nlm.nih.gov/articles/PMC3099099/"],
  ["Wissenschaft", "Farb et al. (2015): Interoception, contemplative practice, and health. Front Psychol", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4460802/"],
  ["Wissenschaft", "Kozlowska et al. (2015): Fear and the Defense Cascade. Harv Rev Psychiatry", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4495877/"],
  ["Wissenschaft", "Kinreich et al. (2017): Brain-to-Brain Synchrony during Naturalistic Social Interactions. Sci Rep", "https://pmc.ncbi.nlm.nih.gov/articles/PMC5719019/"],
  ["Wissenschaft", "Bentley et al. (2023): Breathing Practices for Stress and Anxiety Reduction. Brain Sci", "https://pmc.ncbi.nlm.nih.gov/articles/PMC10741869/"],
  ["Margot Anand", "Offizielle Seite – SkyDancing Tantra, The Art of Everyday Ecstasy", "https://margotanand.com/"],
  ["Margot Anand", "Interview „Orgasms and Beyond“ (Sounds True, Transkript)", "https://www.soundstrue.com/a/resources/transcript/orgasms-and-beyond/"],
  ["Margot Anand", "Melting Hugs – nach „The Art of Sexual Ecstasy“ (Love Coaching)", "https://www.lovecoaching.com/melting-hugs.html"],
  ["Margot Anand", "Penguin Random House: The Art of Everyday Ecstasy (Verlagsbeschreibung)", "https://www.penguinrandomhouse.com/books/3306/the-art-of-everyday-ecstasy-by-margot-anand/"]
];
