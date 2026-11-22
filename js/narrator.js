"use strict";
/* Erzählstimme: spielt vorproduzierte MP3s (audio/<key>.mp3) nacheinander ab */
const Narrator = (() => {
  const a = new Audio(); a.preload = "auto";
  let enabled = localStorage.getItem("chakraReise.voice") !== "off";
  let vol = +(localStorage.getItem("chakraReise.voiceVol") || 1);
  let token = 0, keys = [], queue = [], cur = null, playing = false, blocked = false, unlocked = false, gapT = null, onEnd = null, paused = false;
  const listeners = [];
  const emit = () => listeners.forEach(f => f(state()));
  const state = () => ({ enabled, playing, blocked, paused, cur, hasKeys: keys.length > 0, vol });
  function play(list, opts = {}) {
    stop(true);
    keys = list.filter(k => k && NARR[k] !== undefined);
    queue = [...keys]; onEnd = opts.onEnd || null; paused = false;
    if (!enabled || !keys.length) { emit(); if (!enabled && onEnd) { /* ohne Stimme: kein Auto-Ablauf */ } return; }
    gapT = setTimeout(next, opts.delay ?? 350);
    emit();
  }
  function next() {
    const k = queue.shift();
    if (!k) { cur = null; playing = false; Sound.duck(false); emit(); const f = onEnd; onEnd = null; if (f) f(); return; }
    cur = k; a.src = `audio/${k}.mp3`; a.volume = vol;
    Sound.duck(true);
    const tok = ++token;
    a.play().then(() => { if (tok !== token) return; playing = true; blocked = false; emit(); })
      .catch(err => { if (tok !== token || (err && err.name === "AbortError")) return; queue.unshift(k); playing = false; blocked = true; Sound.duck(false); emit(); });
  }
  a.addEventListener("ended", () => { playing = false; emit(); gapT = setTimeout(next, 800); });
  a.addEventListener("error", () => { playing = false; gapT = setTimeout(next, 200); });
  function stop(silent) { token++; clearTimeout(gapT); a.pause(); queue = []; cur = null; playing = false; paused = false; Sound.duck(false); if (!silent) { onEnd = null; emit(); } }
  function toggle() {
    if (blocked) { blocked = false; next(); return; }
    if (playing) { a.pause(); playing = false; paused = true; Sound.duck(false); emit(); }
    else if (paused) { paused = false; Sound.duck(true); a.play().then(() => { playing = true; emit(); }).catch(() => {}); }
    else replay();
  }
  function replay() { const f = onEnd; play(keys, { delay: 50 }); onEnd = f; }
  function setEnabled(v) { enabled = v; localStorage.setItem("chakraReise.voice", v ? "on" : "off"); if (!v) stop(); else replay(); emit(); }
  function setVol(v) { vol = v; a.volume = v; localStorage.setItem("chakraReise.voiceVol", v); emit(); }
  function unlock() { if (unlocked) return; unlocked = true; if (blocked) { blocked = false; next(); } }
  addEventListener("pointerdown", unlock, { capture: true }); addEventListener("keydown", unlock, { capture: true });
  return { play, stop, toggle, replay, setEnabled, setVol, on: f => listeners.push(f), get enabled() { return enabled; }, get busy() { return playing || queue.length > 0 || blocked; }, state };
})();

/* Bedienleiste */
(function narratorUI() {
  const bar = document.createElement("div");
  bar.className = "narr"; bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "Erzählstimme");
  bar.innerHTML = `<span class="narr-ico" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="narr-lbl">Stimme</span>
    <button class="narr-b" id="narrPlay" aria-label="Stimme abspielen oder pausieren">▶</button>
    <button class="narr-b" id="narrReplay" aria-label="Noch einmal anhören" title="Noch einmal">↺</button>
    <input type="range" id="narrVol" min="0" max="1" step="0.05" aria-label="Lautstärke der Stimme" title="Lautstärke Stimme">
    <button class="narr-b narr-toggle" id="narrOn" aria-pressed="true" title="Stimme an/aus">An</button>`;
  document.body.appendChild(bar);
  const $p = bar.querySelector("#narrPlay"), $on = bar.querySelector("#narrOn"), $v = bar.querySelector("#narrVol");
  $v.value = Narrator.state().vol;
  $p.onclick = () => Narrator.toggle();
  bar.querySelector("#narrReplay").onclick = () => Narrator.replay();
  $on.onclick = () => Narrator.setEnabled(!Narrator.enabled);
  $v.oninput = () => Narrator.setVol(+$v.value);
  const upd = s => {
    bar.classList.toggle("speaking", s.playing); bar.classList.toggle("blocked", s.blocked); bar.classList.toggle("off", !s.enabled);
    $p.textContent = s.blocked ? "▶ Anhören" : s.playing ? "❚❚" : "▶";
    $p.classList.toggle("wide", s.blocked);
    $on.textContent = s.enabled ? "An" : "Aus"; $on.setAttribute("aria-pressed", s.enabled);
  };
  Narrator.on(upd); upd(Narrator.state());
})();
