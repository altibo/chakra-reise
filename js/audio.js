"use strict";
/* Klang mit Web Audio: Glocke, Drohnenton (Chakra-Frequenzen), Trommelpuls, Atem-Hinweise */
const Sound = (() => {
  let ctx = null, master = null, drone = null, drum = null;
  let enabled = localStorage.getItem("chakraReise.sound") !== "off";
  function init() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp); comp.connect(ctx.destination);
  }
  function bell(freq = 528, vol = 0.22, dur = 3.2) {
    if (!enabled) return; init(); if (!ctx) return;
    const t = ctx.currentTime;
    [1, 2.76, 5.4].forEach((m, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol / (i * 2.2 + 1), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur / (i + 1));
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur);
    });
  }
  function tick(up) { if (!enabled) return; bell(up ? 660 : 440, 0.05, 0.8); }
  function startDrone(freq) {
    if (!enabled) return; init(); if (!ctx) return;
    if (drone) { setDrone(freq); return; }
    const g = ctx.createGain(); g.gain.value = 0;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    const oscs = [[1, 0], [2, 3], [1.5, -4], [0.5, 2]].map(([m, det]) => {
      const o = ctx.createOscillator(); o.type = m === 0.5 ? "sine" : "triangle";
      o.frequency.value = freq * m; o.detune.value = det;
      const og = ctx.createGain(); og.gain.value = m === 1 ? 0.5 : 0.18;
      o.connect(og); og.connect(lp); o.start(); return [o, m];
    });
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.12; lg.gain.value = 0.03;
    lfo.connect(lg); lg.connect(g.gain); lfo.start();
    lp.connect(g); g.connect(master);
    g.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 3);
    drone = { g, oscs, lfo };
  }
  function setDrone(freq) {
    if (!drone) return startDrone(freq);
    drone.oscs.forEach(([o, m]) => o.frequency.linearRampToValueAtTime(freq * m, ctx.currentTime + 2));
  }
  function stopDrone() {
    if (!drone || !ctx) return;
    const d = drone; drone = null;
    d.g.gain.cancelScheduledValues(ctx.currentTime);
    d.g.gain.setValueAtTime(d.g.gain.value, ctx.currentTime);
    d.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    setTimeout(() => { d.oscs.forEach(([o]) => o.stop()); d.lfo.stop(); }, 1700);
  }
  function startDrum(bpm = 120) {
    if (!enabled) return; init(); if (!ctx || drum) return;
    const iv = 60 / bpm * 1000;
    const hit = () => {
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.25);
      g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.4);
    };
    hit(); drum = setInterval(hit, iv);
  }
  function stopDrum() { if (drum) { clearInterval(drum); drum = null; } }
  function stopAll() { stopDrone(); stopDrum(); }
  function toggle() {
    enabled = !enabled; localStorage.setItem("chakraReise.sound", enabled ? "on" : "off");
    if (!enabled) stopAll(); else { init(); bell(528, 0.12, 2); }
    return enabled;
  }
  return { init, bell, tick, startDrone, setDrone, stopDrone, startDrum, stopDrum, stopAll, toggle, get enabled() { return enabled; } };
})();
