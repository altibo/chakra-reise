"use strict";
/* Vorbereitung: Ausgangsposition, Augen, Hände, Hilfsmittel, Platz – für jede Übung und jeden Mini-Test */
const POS = {
  sit:          { label: "Sitzend", icon: "🧘", say: "aufrecht und bequem sitzen – auf einem Kissen, einer Decke oder einem Stuhl", change: "Positionswechsel: Als Nächstes im Sitzen. Komm in eine aufrechte, bequeme Sitzhaltung." },
  stand:        { label: "Stehend", icon: "🧍", say: "stehen, Füße hüftbreit, Knie weich", change: "Positionswechsel: Als Nächstes im Stehen. Komm langsam hoch und stell dich hüftbreit hin." },
  wide:         { label: "Breiter Stand", icon: "🤸", say: "stehen, die Füße weiter als hüftbreit, Knie weich", change: "Positionswechsel: Als Nächstes im breiten Stand. Komm hoch und stell die Füße weiter als hüftbreit." },
  lie:          { label: "Liegend", icon: "🛌", say: "auf dem Rücken liegen, auf einer Matte oder Decke", change: "Positionswechsel: Als Nächstes im Liegen. Leg dich bequem auf den Rücken, nimm dir gern eine Decke." },
  "c-face-sit": { label: "Gegenüber sitzend", icon: "🧘‍♀️🧘", say: "setzt euch einander gegenüber, die Knie nah beieinander", change: "Positionswechsel: Als Nächstes sitzt ihr euch gegenüber." },
  "c-face-stand": { label: "Gegenüber stehend", icon: "🧍‍♀️🧍", say: "stellt euch einander gegenüber, etwa eine Armlänge Abstand", change: "Positionswechsel: Als Nächstes steht ihr euch gegenüber." },
  "c-back":     { label: "Rücken an Rücken", icon: "↔", say: "setzt euch Rücken an Rücken, Wirbelsäulen in Kontakt", change: "Positionswechsel: Als Nächstes sitzt ihr Rücken an Rücken." },
  "c-hug":      { label: "Stehend, Umarmung", icon: "🫂", say: "steht voreinander, bereit für eine Umarmung", change: "Positionswechsel: Als Nächstes steht ihr voreinander." },
  "c-side":     { label: "Nebeneinander sitzend", icon: "👫", say: "setzt euch nebeneinander, Schultern oder Knie berühren sich leicht", change: "Positionswechsel: Als Nächstes sitzt ihr nebeneinander." }
};
const SETUP = {
  ankommen:     { pos: "sit", eyes: "weich oder geschlossen", hands: "ruhen auf den Oberschenkeln", props: ["Stuhl oder Kissen"], space: "ein ruhiger Sitzplatz" },
  seufzer:      { pos: "sit", eyes: "geschlossen oder gesenkt", hands: "eine Hand auf dem Bauch, eine auf der Brust", props: ["Kissen oder Stuhl"], space: "ein Sitzplatz" },
  kohaerenz:    { pos: "sit", eyes: "geschlossen oder weich", hands: "eine Hand auf der Brustmitte", props: ["Kissen oder Stuhl"], space: "ein Sitzplatz" },
  orientieren:  { pos: "sit", eyes: "offen", hands: "frei, später gegeneinander gedrückt", props: ["Stuhl"], space: "ein Sitzplatz mit Blick in den Raum" },
  wechselatmung:{ pos: "sit", eyes: "geschlossen", hands: "rechte Hand an der Nase, Daumen und Ringfinger; linke Hand auf dem Knie", props: ["Kissen oder Stuhl"], space: "ein Sitzplatz" },
  schuetteln:   { pos: "stand", eyes: "offen oder halb geschlossen", hands: "locker hängend", props: ["bequeme Kleidung", "gern barfuß"], space: "ca. 2 m² Bewegungsraum" },
  feueratem:    { pos: "sit", eyes: "geschlossen", hands: "auf den Knien", props: ["Kissen", "möglichst leerer Magen"], space: "ein Sitzplatz" },
  klopfen:      { pos: "stand", eyes: "offen", hands: "lockere Fäuste oder flache Hände", props: [], space: "ca. 1 m² zum Stehen" },
  loslassen:    { pos: "lie", eyes: "geschlossen", hands: "neben dem Körper", props: ["Matte", "Decke"], space: "Platz zum Liegen, ca. 2 m" },
  koerperreise: { pos: "lie", eyes: "geschlossen", hands: "neben dem Körper, Handflächen nach oben", props: ["Matte", "Decke", "Kissen unter die Knie"], space: "Platz zum Liegen, ca. 2 m" },
  wurzeln:      { pos: "stand", eyes: "offen oder sanft geschlossen", hands: "locker neben dem Körper", props: ["am besten barfuß"], space: "ca. 1 m² zum Stehen" },
  root_a:       { pos: "wide", eyes: "offen, Blick weich nach vorn", hands: "auf den Oberschenkeln oder vor dem Becken", props: ["barfuß", "rutschfester Boden"], space: "ca. 1,5 m²" },
  root_b:       { pos: "sit", eyes: "geschlossen", hands: "auf dem Unterbauch oder den Knien", props: ["Kissen oder Stuhl, Füße am Boden"], space: "ein Sitzplatz" },
  sacral_a:     { pos: "stand", eyes: "halb geschlossen", hands: "auf dem Becken", props: ["bequeme Kleidung"], space: "ca. 1,5 m²" },
  sacral_b:     { pos: "stand", eyes: "halb geschlossen", hands: "frei, fließend", props: ["bequeme Kleidung", "Musik, wenn du magst"], space: "ca. 2–3 m² zum Tanzen" },
  gefuehl:      { pos: "sit", eyes: "geschlossen", hands: "auf dem Herzen oder dort, wo das Gefühl sitzt", props: ["Kissen", "Taschentuch"], space: "ein geschützter Sitzplatz" },
  solar_a:      { pos: "wide", eyes: "offen, Blick über die vordere Hand", hands: "Arme auf Schulterhöhe ausgebreitet", props: ["rutschfeste Matte"], space: "ca. 2 m in der Breite" },
  feueratem_alt:{ pos: "sit" },
  sonnenatem:   { pos: "sit", eyes: "geschlossen", hands: "übereinander auf dem Oberbauch", props: ["Kissen oder Stuhl"], space: "ein Sitzplatz" },
  grenzen:      { pos: "stand", eyes: "offen", hands: "eine Hand auf dem Bauch, später beide Arme nach vorn", props: [], space: "eine Armlänge Platz nach vorn und zur Seite" },
  heart_a:      { pos: "sit", eyes: "geschlossen", hands: "beide Hände auf der Brustmitte", props: ["Kissen oder Stuhl"], space: "ein Sitzplatz" },
  heart_b:      { pos: "sit", eyes: "zuerst offen, Blick leicht nach oben, später geschlossen", hands: "zuerst hinter dem Rücken verschränkt, dann auf dem Herzen", props: ["Kissen oder Stuhl"], space: "ein Sitzplatz" },
  vergebung:    { pos: "sit", eyes: "geschlossen", hands: "beide Hände auf der Brustmitte", props: ["Kissen", "Taschentuch"], space: "ein geschützter Sitzplatz" },
  throat_a:     { pos: "sit", eyes: "geschlossen", hands: "zuerst auf den Knien, später Daumen an den Ohren", props: ["Kissen oder Stuhl"], space: "ein Ort, an dem du summen darfst" },
  throat_b:     { pos: "sit", eyes: "offen", hands: "auf den Knien", props: ["Glas Wasser"], space: "ein Ort, an dem du laut sein darfst" },
  lauschen:     { pos: "sit", eyes: "geschlossen", hands: "ruhen im Schoß", props: ["Kissen oder Stuhl"], space: "gern bei offenem Fenster" },
  third_a:      { pos: "sit", eyes: "offen, Blick auf die Flamme, später geschlossen", hands: "auf den Knien", props: ["Kerze, ca. 1 m entfernt auf Augenhöhe (oder der Bildschirm)", "gedämpftes Licht"], space: "ein Sitzplatz" },
  third_b:      { pos: "sit", eyes: "geschlossen", hands: "auf den Knien, ein Finger kurz an der Stirn", props: ["Kissen oder Stuhl"], space: "ein Ort, an dem du tönen darfst" },
  crown_a:      { pos: "sit", eyes: "geschlossen", hands: "auf den Knien, Handflächen nach oben", props: ["Kissen oder Stuhl"], space: "ein Sitzplatz" },
  crown_b:      { pos: "sit", eyes: "geschlossen", hands: "ruhen im Schoß", props: ["Kissen oder Stuhl", "Decke für die Schultern"], space: "ein Sitzplatz" },
  floete:       { pos: "sit", eyes: "geschlossen", hands: "auf den Knien", props: ["Kissen"], space: "ein Ort, an dem du tönen darfst" },
  stille:       { pos: "lie", eyes: "geschlossen", hands: "neben dem Körper, Handflächen nach oben", props: ["Matte", "Decke"], space: "Platz zum Liegen, ca. 2 m" },
  c_herzgruss:  { pos: "c-face-sit", eyes: "offen, im Blickkontakt", hands: "Handflächen vor dem Herzen zusammen", props: ["zwei Kissen", "Kerze, wenn ihr mögt"], space: "ca. 2 m², ungestört" },
  c_ruecken:    { pos: "c-back", eyes: "geschlossen", hands: "auf den eigenen Knien", props: ["zwei Kissen oder Matte"], space: "ca. 2 m²" },
  c_harmonie:   { pos: "c-face-sit", eyes: "zuerst offen, dann geschlossen", hands: "gefasst oder auf den eigenen Knien", props: ["zwei Kissen"], space: "ca. 2 m²" },
  c_schmelz:    { pos: "c-hug", eyes: "geschlossen oder offen, wie es sich gut anfühlt", hands: "Arme umeinander", props: [], space: "Platz für zwei zum Stehen" },
  c_spiegel:    { pos: "c-face-stand", eyes: "offen, im Blickkontakt", hands: "Handflächen zueinander, ca. 2 cm Abstand", props: ["bequeme Kleidung"], space: "ca. 2–3 m² Bewegungsraum" },
  c_handkraft:  { pos: "c-face-stand", eyes: "offen", hands: "Handflächen aneinander auf Schulterhöhe", props: ["rutschfester Boden"], space: "ca. 2 m²" },
  c_herzsegen:  { pos: "c-face-sit", eyes: "offen, im Blickkontakt", hands: "rechte Hand auf dem Herzen des anderen, linke Hand auf der Hand am eigenen Herzen", props: ["zwei Kissen"], space: "ca. 2 m²" },
  c_toenen:     { pos: "c-face-sit", eyes: "offen oder geschlossen", hands: "auf den Knien", props: ["zwei Kissen"], space: "ein Ort, an dem ihr tönen dürft" },
  c_augenblick: { pos: "c-face-sit", eyes: "offen, Blick ins linke Auge des anderen", hands: "auf den Knien oder gefasst", props: ["zwei Kissen", "sanftes Licht"], space: "ca. 2 m²" },
  c_lichtkuppel:{ pos: "c-side", eyes: "geschlossen", hands: "gefasst", props: ["zwei Kissen oder Sofa"], space: "ca. 2 m²" },
  c_kreislauf:  { pos: "c-face-sit", eyes: "geschlossen oder weich offen", hands: "gefasst oder auf den Knien des anderen", props: ["zwei Kissen"], space: "ca. 2 m²" },
  c_teilen:     { pos: "c-face-sit", eyes: "offen", hands: "frei", props: ["Glas Wasser", "Journal, wenn ihr mögt"], space: "ca. 2 m²" }
};
delete SETUP.feueratem_alt;
/* Mini-Tests: Ausgangsposition */
const TEST_SETUP = {
  nervous: { pos: "sit", eyes: "geschlossen oder gesenkt", hands: "eine Hand auf der Brust, eine auf dem Bauch" },
  mind:    { pos: "sit", eyes: "geschlossen", hands: "ruhen im Schoß" },
  energy:  { pos: "stand", eyes: "offen", hands: "zuerst locker, dann Arme nach oben" },
  body:    { pos: "sit", eyes: "geschlossen", hands: "ruhen locker" },
  root:    { pos: "stand", eyes: "geschlossen", hands: "locker neben dem Körper", props: ["barfuß"] },
  sacral:  { pos: "stand", eyes: "offen oder halb geschlossen", hands: "auf dem Becken" },
  solar:   { pos: "sit", eyes: "offen", hands: "eine Hand über dem Nabel" },
  heart:   { pos: "sit", eyes: "geschlossen", hands: "beide Hände auf der Brustmitte" },
  throat:  { pos: "sit", eyes: "offen oder geschlossen", hands: "auf den Knien" },
  third:   { pos: "sit", eyes: "offen, Blick auf den Punkt, dann geschlossen", hands: "auf den Knien" },
  crown:   { pos: "sit", eyes: "geschlossen", hands: "ruhen im Schoß" }
};
/* Stehende Paar-Übungen behalten Pose fürs Bild, Position kommt aus SETUP */
function setupOf(eid) { const s = SETUP[eid] || {}; const ex = EXERCISES[eid] || {}; return { pos: s.pos || ex.pose || "sit", eyes: s.eyes || "", hands: s.hands || "", props: [...(s.props || []), ...(ex.couple ? ["Partnerin oder Partner"] : [])], space: s.space || "" }; }
function prepSay(eid) {
  const s = setupOf(eid), ex = EXERCISES[eid], ihr = !!ex.couple, P = POS[s.pos];
  let t = `Vorbereitung. Ausgangsposition: ${P.say}.`;
  if (s.eyes) t += ` Augen: ${s.eyes}.`;
  if (s.hands) t += ` Hände: ${s.hands}.`;
  const props = s.props.filter(p => !/Partner/.test(p));
  if (props.length) t += ` ${ihr ? "Ihr braucht" : "Du brauchst"}: ${props.join(", ")}.`;
  if (s.space) t += ` Platz: ${s.space}.`;
  return t;
}
function testPrepSay(id) {
  const s = TEST_SETUP[id]; if (!s) return "";
  return `Ausgangsposition für den Mini-Test: ${POS[s.pos].label.toLowerCase()}. Augen: ${s.eyes}. Hände: ${s.hands}.`;
}
/* Raum vorbereiten – Checkliste zu Beginn der Reise */
const ROOM = [
  ["📵", "Handy lautlos oder im Flugmodus"],
  ["🚪", "Ein ungestörter Raum – Tür zu, Mitbewohnern Bescheid geben"],
  ["👕", "Bequeme, lockere Kleidung, gern barfuß"],
  ["💧", "Ein Glas Wasser in Reichweite"],
  ["🧘", "Matte oder Decke, ein Kissen und ein Stuhl in der Nähe"],
  ["🕯️", "Licht gedämpft, Raum angenehm warm"],
  ["🎧", "Lautsprecher oder Kopfhörer für Stimme und Klang"]
];
const ROOM_COUPLE = [
  ["⏳", "Gemeinsam Zeit vereinbaren – etwa 45 bis 90 Minuten"],
  ["🤝", "Grenzen besprechen: Was ist heute willkommen, was nicht?"],
  ["✋", "Ein Stopp-Wort vereinbaren, das jederzeit gilt"],
  ["🧘‍♀️", "Zwei Kissen oder Matten"]
];
