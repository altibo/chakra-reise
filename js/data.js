/* Energie- und Chakra-Reise – Inhalte
   Quellen: siehe QUELLEN in stations.js und research/summary.md */
"use strict";

const CHAKRAS = {
  root:   { name: "Wurzelchakra", skt: "Muladhara",    color: "#ff3b4e", element: "Erde",  mantra: "LAM", freq: 130.81, theme: "Halt, Sicherheit, Vertrauen ins Leben" },
  sacral: { name: "Sakralchakra", skt: "Svadhisthana", color: "#ff8a2b", element: "Wasser", mantra: "VAM", freq: 146.83, theme: "Fluss, Lust, Kreativität, Gefühl" },
  solar:  { name: "Solarplexus",  skt: "Manipura",     color: "#ffd23f", element: "Feuer",  mantra: "RAM", freq: 164.81, theme: "Kraft, Wille, Selbstwert" },
  heart:  { name: "Herzchakra",   skt: "Anahata",      color: "#3ee08f", element: "Luft",   mantra: "YAM", freq: 174.61, theme: "Liebe, Mitgefühl, Verbindung" },
  throat: { name: "Halschakra",   skt: "Vishuddha",    color: "#2fc6ff", element: "Äther",  mantra: "HAM", freq: 196.00, theme: "Ausdruck, Wahrheit, Stimme" },
  third:  { name: "Stirnchakra",  skt: "Ajna",         color: "#6a6bff", element: "Geist",  mantra: "OM",  freq: 220.00, theme: "Klarheit, Intuition, Einsicht" },
  crown:  { name: "Kronenchakra", skt: "Sahasrara",    color: "#c77dff", element: "Bewusstsein", mantra: "Stille", freq: 246.94, theme: "Weite, Verbundenheit, Dankbarkeit" }
};
const CHAKRA_ORDER = ["root", "sacral", "solar", "heart", "throat", "third", "crown"];

const SAFETY = [
  { id: "pregnancy", label: "Ich bin schwanger" },
  { id: "epilepsy",  label: "Epilepsie / Krampfanfälle" },
  { id: "heart",     label: "Herz-Kreislauf-Erkrankung, Bluthochdruck, Glaukom" },
  { id: "surgery",   label: "Frische Operation, Verletzung oder Bauch-/Rückenbeschwerden" },
  { id: "breath",    label: "Asthma, Atemwegserkrankung oder Neigung zu Schwindel" },
  { id: "psych",     label: "Trauma-Folgen, Panikattacken, Psychose, Dissoziation oder akute psychische Krise" }
];

/* Atem-Muster: [Label, Sekunden, Zielgröße 0..1] */
const BREATH = {
  coherent: [ ["Einatmen", 5.5, 1], ["Ausatmen", 5.5, 0.25] ],
  sigh:     [ ["Einatmen", 3, 0.82], ["Nachatmen", 1, 1], ["Langes Ausatmen", 7, 0.2] ],
  long:     [ ["Einatmen", 4, 1], ["Ausatmen", 8, 0.22] ],
  nadi:     [ ["Links ein", 4, 1], ["Rechts aus", 6, 0.25], ["Rechts ein", 4, 1], ["Links aus", 6, 0.25] ],
  calm:     [ ["Einatmen", 4, 1], ["Ausatmen", 6, 0.25] ],
  hum:      [ ["Tief einatmen", 4, 1], ["Summen …", 9, 0.25] ],
  tone:     [ ["Einatmen", 4, 1], ["Tönen …", 10, 0.25] ],
  fire:     [ ["Kurz aus!", 0.6, 0.45], ["passiv ein", 0.6, 0.8] ],
  sync:     [ ["Gemeinsam ein", 5, 1], ["Gemeinsam aus", 6, 0.25] ],
  circle:   [ ["A ein · B aus", 5, 1], ["A aus · B ein", 5, 0.25] ],
  flute:    [ ["Einatmen – aufsteigen", 6, 1], ["Ausatmen – ausbreiten", 6, 0.3] ]
};

const EXERCISES = {};
