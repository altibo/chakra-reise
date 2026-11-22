"use strict";
/* Gesprochene Texte der Oberfläche (Schlüssel → Text). Übungs- und Test-Texte kommen aus den Daten-Dateien. */
const NARR_UI = {
  welcome: "Willkommen zur Energie- und Chakra-Reise. Werde wieder heil, energetisiert und verbunden. Mit kleinen Mini-Tests spürst du, wo deine Energie fließt und wo sie stockt – im Nervensystem, im Geist, im Gefühl und in den sieben Chakren. Wo etwas blockiert ist, öffnet sich die passende Übung. Danach prüfst du erneut. Wähle, ob du allein reist oder als Paar.",
  checkin1: "Willkommen. Nimm dir einen Moment. Komm an, hier und jetzt. Wo bist du gerade – und wohin möchtest du heute? Wähle eine Absicht für diese Reise, oder schreibe sie in eigenen Worten.",
  checkin1c: "Willkommen, ihr zwei. Nehmt euch einen Moment, um anzukommen. Wo steht ihr gerade – und wohin möchtet ihr heute gemeinsam? Wählt eine Absicht für diese Reise, oder schreibt sie in eigenen Worten.",
  checkin2: "Wie geht es dir gerade? Schätze spontan ein, ohne nachzudenken: deine Energie, deine innere Ruhe, wie sehr du im Körper bist, und wie verbunden du dich mit dir selbst fühlst. Am Ende vergleichen wir.",
  checkin2c: "Wie geht es euch gerade? Schätzt gemeinsam ein: eure Energie, eure innere Ruhe, wie sehr ihr im Körper seid, und wie verbunden ihr euch miteinander fühlt. Am Ende vergleichen wir.",
  checkin3: "Achtsam mit dir sein. Einige Übungen arbeiten mit kräftigem Atem, Bewegung oder intensiven Gefühlen. Kreuze an, was auf dich zutrifft – zum Beispiel Schwangerschaft, Epilepsie, Herz-Kreislauf-Erkrankungen, frische Verletzungen, Atemwegserkrankungen oder psychische Belastungen. Dann werden automatisch sanfte Alternativen gewählt. Diese Reise ist Selbsterfahrung, keine medizinische oder psychotherapeutische Behandlung. Du bestimmst das Tempo. Augen offen lassen, pausieren oder abbrechen ist jederzeit richtig.",
  checkin3c: "Achtsam miteinander sein. Einige Übungen arbeiten mit kräftigem Atem, Bewegung oder intensiven Gefühlen. Kreuzt an, was auf einen von euch zutrifft – zum Beispiel Schwangerschaft, Epilepsie, Herz-Kreislauf-Erkrankungen, frische Verletzungen, Atemwegserkrankungen oder psychische Belastungen. Dann werden automatisch sanfte Alternativen gewählt. Diese Reise ist Selbsterfahrung, keine Therapie. Ihr bestimmt das Tempo. Pausieren oder abbrechen ist jederzeit richtig.",
  route: "Hier stockt die Energie noch ein wenig. Dein Weg führt dich zu dieser Übung.",
  routec: "Hier stockt die Energie noch ein wenig. Euer Weg führt euch zu dieser Übung.",
  route2: "Es hat sich noch nicht ganz gelöst. Das ist völlig in Ordnung – Energie braucht manchmal einen anderen Zugang. Probier diese Alternative.",
  retest: "Re-Test. Spür noch einmal nach – genauso wie vorhin. Was hat sich verändert?",
  free: "Hier fließt es. Wunderbar!",
  freec: "Hier fließt es bei euch. Wunderbar!",
  resolved: "Spürst du es? Etwas hat sich gelöst. Nimm dir einen Atemzug, um diese Veränderung bewusst zu würdigen.",
  moving: "Manches braucht mehr Zeit als eine Übung. Das ist kein Scheitern: Du hast Energie in Bewegung gebracht, und sie arbeitet weiter. Wir gehen sanft weiter – vielleicht nimmst du diese Übung in den nächsten Tagen mit.",
  int1: "Du bist durch alle Zentren gereist. Jetzt darf sich alles setzen. Stille ist der Ort, an dem Veränderung Wurzeln schlägt.",
  int2: "Was ihr erlebt habt, darf gesehen und geteilt werden.",
  reflect: "Was nimmst du mit? Schreib frei, ohne zu korrigieren. Was hat sich in deinem Körper verändert? Welches Zentrum hat heute am deutlichsten zu dir gesprochen? Welchen Satz nimmst du mit? Und welche kleine Praxis schenkst du dir für die nächsten sieben Tage? Danach schätze noch einmal ein, wie es dir jetzt geht.",
  summary: "Deine Reise ist vollendet. Du bist in deiner Mitte angekommen. Energie, die in Bewegung gekommen ist, wirkt weiter – in den nächsten Stunden und Tagen. Trink etwas Wasser, bleib noch einen Moment bei dir, und nimm die Stille mit in deinen Alltag.",
  summaryc: "Eure Reise ist vollendet. Ihr seid in eurer Mitte angekommen, und im gemeinsamen Fluss. Energie, die in Bewegung gekommen ist, wirkt weiter. Trinkt etwas Wasser, bleibt noch einen Moment beieinander, und nehmt diese Verbindung mit in euren Alltag.",
  exdone: "Die Übung ist vollendet. Spüre noch einen Moment nach. Wenn du bereit bist, geh weiter."
};
