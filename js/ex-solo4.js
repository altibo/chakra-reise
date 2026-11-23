"use strict";
/* Neue Übungen für den Lebensbaum: kurzes Ankommen (Stamm), Entspannen (Stamm) und Unteräste der Chakren */
Object.assign(EXERCISES, {
  ankommen: {
    title: "Ankommen", chakra: "root", pose: "sit", fx: ["glow"], minutes: 2, intensity: "sanft",
    origin: ["Achtsamkeit", "Embodiment"], breath: "calm",
    intro: "Zwei Minuten, um wirklich hier zu sein: Atem, Füße, Sitzfläche. Noch keine Arbeit – nur ankommen.",
    steps: [
      [20, "Setz dich bequem hin oder bleib stehen. Lass den Blick weich werden oder schließe die Augen."],
      [30, "Nimm drei bewusste Atemzüge. Atme ruhig ein – und lass das Ausatmen ein wenig länger werden als das Einatmen."],
      [30, "Spüre deine Füße auf dem Boden und dein Gewicht auf der Sitzfläche. Hier bist du. Getragen."],
      [25, "Lass die Schultern sinken und den Kiefer weich werden. Nichts muss jetzt passieren."],
      [15, "Sag innerlich: „Ich bin angekommen. Hier und jetzt.“"]
    ],
    why: "Ein verlängertes Ausatmen aktiviert den Parasympathikus (Zaccaro et al. 2018), die Aufmerksamkeit auf Kontaktflächen holt dich aus dem Kopf in den Körper (Interozeption, Farb et al. 2015). Die tiefere Erdungsarbeit wartet im Ast des Wurzelchakras."
  },
  koerperreise: {
    title: "Körperreise – Yoga Nidra kurz", chakra: "crown", pose: "lie", fx: ["glow"], minutes: 6, intensity: "sanft",
    origin: ["Yoga Nidra (Tantra)", "Wissenschaft: Tiefenentspannung"], breath: "long",
    intro: "Eine kurze Reise durch den Körper im Liegen. Du tust nichts – du lässt geschehen.",
    steps: [
      [40, "Leg dich bequem auf den Rücken, Arme neben dem Körper, Handflächen nach oben. Lass den Boden dich vollständig tragen."],
      [60, "Wandere mit der Aufmerksamkeit durch die rechte Körperseite: Daumen, Finger, Hand, Arm, Schulter, Rippen, Hüfte, Bein, Fuß. Jede Stelle nur kurz berühren – und weiter."],
      [60, "Jetzt die linke Seite: Daumen, Finger, Hand, Arm, Schulter, Rippen, Hüfte, Bein, Fuß."],
      [70, "Spüre den ganzen Rücken, den ganzen Bauch, das ganze Gesicht. Dann den ganzen Körper auf einmal – als ein einziges, ruhiges Feld."],
      [70, "Mit jedem Ausatmen wird der Körper schwerer und weicher. Zähle innerlich zehn Atemzüge rückwärts: zehn … neun … acht …"],
      [60, "Bleib noch einen Moment in dieser Ruhe. Dann vertiefe den Atem, bewege Finger und Zehen und komm langsam zurück."]
    ],
    why: "Yoga Nidra stammt aus der tantrischen Praxis der Körperreise (Nyasa). Schon eine kurze geführte Yoga-Nidra-Meditation senkte in einer großen Studie Stress und verbesserte Schlaf und Wohlbefinden (Moszeik, von Oertzen & Renner 2022, Current Psychology)."
  },
  vergebung: {
    title: "Vergebung – was das Herz beschwert", chakra: "heart", pose: "sit", fx: ["glow"], minutes: 5, intensity: "sanft",
    origin: ["Yoga: Kshama (Vergebung)", "Buddhistisches Metta", "Wissenschaft: Vergebungsforschung"], breath: "calm", tone: "chakra",
    intro: "Vergeben heißt nicht gutheißen. Es heißt, eine Last nicht länger allein im Herzen zu tragen.",
    steps: [
      [40, "Setz dich aufrecht und weich hin. Lege beide Hände auf die Brustmitte und atme dreimal tief in den Herzraum."],
      [60, "Lass eine Situation auftauchen, die dein Herz noch beschwert – beginne mit etwas Kleinem, nicht mit der größten Wunde. Spüre, wo es im Körper sitzt."],
      [70, "Atme in diese Stelle hinein. Sag innerlich: „Ich sehe den Schmerz. Er darf da sein.“"],
      [70, "Stell dir vor, mit jedem Ausatmen löst sich ein Faden, der dich an diese Situation bindet. Sag innerlich: „Ich lasse los, was mich bindet. Ich wähle meinen Frieden.“"],
      [60, "Wende dich dir selbst zu: „Auch mir vergebe ich – für das, was ich damals nicht anders konnte.“ Spüre Wärme in deinen Händen und im Herzen."]
    ],
    why: "Kshama, Geduld und Vergebung, zählt in mehreren yogischen Schriften zu den ethischen Grundhaltungen. Eine Meta-Analyse zeigt, dass gezielte Vergebungsübungen Groll, Depressivität und Angst verringern und Hoffnung stärken (Wade et al. 2014, J Consult Clin Psychol)."
  },
  grenzen: {
    title: "Grenzen – das kraftvolle Nein", chakra: "solar", pose: "wide", fx: ["glow"], minutes: 4, intensity: "aktiv",
    origin: ["Körperpsychotherapie (Bioenergetik)", "Embodiment", "Tantra: Manipura"], breath: null, tone: "chakra",
    intro: "Wer Nein sagen kann, kann auch aus vollem Herzen Ja sagen. Hier spürt dein Bauch seine Grenze.",
    steps: [
      [30, "Stell dich hüftbreit hin, Knie weich. Lege eine Hand auf den Bauch über dem Nabel und spüre deine Mitte."],
      [50, "Strecke beide Arme nach vorn, Handflächen nach außen, wie eine Wand. Spüre: Bis hierhin reicht mein Raum. Atme in den Bauch."],
      [50, "Schiebe beim Ausatmen kraftvoll nach vorn und sag dabei laut und klar: „Nein.“ Fünfmal. Spüre, wie der Bauch mitarbeitet."],
      [50, "Jetzt das Ja: Öffne die Arme weit zur Seite und sag: „Ja – zu mir.“ Spüre den Unterschied im Körper."],
      [60, "Hände zurück auf den Bauch. Atme in die Wärme dort. Sag innerlich: „Ich darf Grenzen setzen. Ich darf Raum einnehmen.“"]
    ],
    why: "In der Körperpsychotherapie (z. B. Bioenergetik nach Alexander Lowen) gehört das körperlich ausgedrückte Nein zu den klassischen Übungen für gesunde Grenzen. In der tantrischen Tradition ist Manipura der Sitz von Feuer, Wille und Tatkraft (Avalon, The Serpent Power)."
  },
  lauschen: {
    title: "Tiefes Lauschen", chakra: "throat", pose: "sit", fx: ["glow"], minutes: 5, intensity: "sanft",
    origin: ["Nada Yoga", "Hatha Yoga Pradipika (Kap. 4)", "Achtsamkeit"], breath: null, tone: "chakra",
    intro: "Ausdruck beginnt mit Zuhören. Diese Übung öffnet den Hals von innen – durch Lauschen.",
    steps: [
      [40, "Setz dich bequem hin und schließe die Augen. Lass deinen Atem von selbst fließen."],
      [60, "Lausche den fernsten Geräuschen, die du wahrnehmen kannst – draußen, weit weg. Nur hören, nicht benennen."],
      [60, "Lausche nun den nahen Geräuschen im Raum. Dann den Klängen deines eigenen Körpers: Atem, Schlucken, Herzschlag."],
      [70, "Lausche der Stille zwischen den Klängen. Spüre den Hals dabei weich und weit – als ob der Raum selbst durch ihn hindurchklingt."],
      [70, "Frage innerlich: „Was in mir möchte gehört werden?“ Lausche der Antwort, ohne etwas zu tun. Dann öffne langsam die Augen."]
    ],
    why: "Die Hatha Yoga Pradipika (Kapitel 4) beschreibt Nada Anusandhana, das Lauschen auf den inneren Klang, als Weg in die Stille. Vishuddha ist in der Tradition dem Element Raum (Akasha) zugeordnet, dessen Qualität der Klang ist (Avalon, The Serpent Power)."
  }
});
