"use strict";
/* ============ Energie- und Chakra-Reise – App ============ */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const KEY = "chakraReise.v1", HKEY = "chakraReise.history";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

let S = load();
function fresh() {
  return { mode: null, names: ["", ""], intention: "", chips: [], safety: {}, before: { energy: 5, calm: 5, connect: 5, body: 5 }, after: null,
    idx: 0, phase: "welcome", attempt: 0, results: {}, journal: ["", "", "", ""], intStep: 0, started: null, finished: null };
}
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch { return fresh(); } }
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
const journey = () => STATIONS.filter(s => !s.coupleOnly || S.mode === "couple");
const cur = () => journey()[S.idx];
const couple = () => S.mode === "couple";
const colorOf = st => st.chakra ? CHAKRAS[st.chakra].color : st.color;
const flagged = () => Object.keys(S.safety).filter(k => S.safety[k]);

/* Übung inkl. Sicherheits-Alternative auflösen */
function resolveEx(spec) {
  const [id, alt] = spec.split(">");
  const ex = EXERCISES[id];
  const f = flagged();
  if (ex.contra && ex.contra.some(c => f.includes(c))) return { id: alt || ex.safeAlt, swapped: id };
  return { id };
}
function routeFor(st, res) {
  const r = (couple() && st.croutes ? st.croutes : st.routes) || {};
  return (r[res] || []).map(resolveEx);
}

/* ================= Sternenhimmel ================= */
(function sky() {
  const c = $("#sky"), x = c.getContext("2d");
  let W, H, stars = [], t = 0;
  const cols = ["#ffffff", "#ffd9f4", "#d9e6ff", "#fff1c9", "#e0ccff"];
  function size() {
    W = c.width = innerWidth * devicePixelRatio; H = c.height = innerHeight * devicePixelRatio;
    stars = Array.from({ length: Math.min(420, (innerWidth * innerHeight) / 3500) }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: (Math.random() ** 3 * 1.8 + .3) * devicePixelRatio,
      p: Math.random() * 6.28, s: .4 + Math.random() * 1.6, c: cols[(Math.random() * cols.length) | 0], v: (Math.random() - .5) * .04
    }));
  }
  function frame() {
    t += .016; x.clearRect(0, 0, W, H);
    for (const s of stars) {
      const a = .35 + .65 * Math.abs(Math.sin(t * s.s + s.p));
      x.globalAlpha = a; x.fillStyle = s.c; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.28); x.fill();
      s.y -= s.v * devicePixelRatio; if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
    }
    if (!reduced) requestAnimationFrame(frame);
  }
  addEventListener("resize", size); size(); frame();
})();

/* ================= Flowchart-Karte ================= */
const MAP = { nodes: {}, W: 1000, H: 0 };
const cam = { s: 1, x: 0, y: 0, tx: null };
function buildMap() {
  const J = journey(), gap = 250, H = J.length * gap + 260;
  MAP.H = H; MAP.nodes = {};
  let defs = `<defs>
    <linearGradient id="flowGrad" x1="0" y1="1" x2="0" y2="0">${CHAKRA_ORDER.map((c, i) => `<stop offset="${i / 6}" stop-color="${CHAKRAS[c].color}"/>`).join("")}</linearGradient>
    <filter id="mglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="mblur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="14"/></filter>
    <radialGradient id="nodeG"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>`;
  const pts = J.map((st, i) => {
    const y = H - 150 - i * gap, x = 500 + Math.sin(i * 1.15 + .4) * 150;
    MAP.nodes[st.id] = { x, y, ex: {} };
    return [x, y];
  });
  let d = `M${pts[0][0]} ${pts[0][1] + 120} L${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const my = (y0 + y1) / 2; d += ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}`; }
  let g = defs;
  /* Spine / Sushumna-Leuchten */
  g += `<path d="${d}" class="m-path"/><path id="donePath" d="${d}" class="m-path-done"/><path d="${d}" class="m-flow" id="flowPath"/>`;
  /* Zweige */
  J.forEach((st, i) => {
    const n = MAP.nodes[st.id], c = colorOf(st);
    let exs = [];
    if (st.kind === "test") {
      const r = couple() && st.croutes ? st.croutes : st.routes;
      const k = Object.keys(r);
      exs = k.length === 1 ? r[k[0]].map(e => [resolveEx(e).id, k[0]]) : k.map(kk => [resolveEx(r[kk][0]).id, kk]).concat(k.map(kk => [resolveEx(r[kk][1]).id, kk + "2"]));
      if (k.length > 1) exs = [[resolveEx(r[k[0]][0]).id, k[0]], [resolveEx(r[k[0]][1]).id, k[0]], [resolveEx(r[k[1]][0]).id, k[1]], [resolveEx(r[k[1]][1]).id, k[1]]];
    } else if (st.ex) {
      exs = [[couple() && st.cex ? st.cex : st.ex, "ritual"]];
      if (st.kind === "integration" && couple()) exs = [[st.ex, "ritual"], [st.cex, "ritual"]];
    }
    const side = n.x > 500 ? -1 : 1;
    exs.forEach(([eid, tag], j) => {
      const ex = EXERCISES[eid];
      const col = exs.length > 2 ? (j < 2 ? 0 : 1) : 0, rowN = exs.length > 2 ? 2 : exs.length, row = exs.length > 2 ? j % 2 : j;
      const ex_x = n.x + side * (215 + col * 205), ex_y = n.y + (row - (rowN - 1) / 2) * 84;
      n.ex[eid + "|" + j] = { x: ex_x, y: ex_y, id: eid };
      const bx = n.x + side * 60;
      g += `<path d="M${bx} ${n.y} C${n.x + side * 130} ${n.y} ${ex_x - side * 120} ${ex_y} ${ex_x - side * 92} ${ex_y}" class="m-branch" data-b="${st.id}|${eid}|${j}" style="--c:${c}"/>`;
      if (st.kind === "test") g += `<path d="M${ex_x} ${ex_y - 30} C${ex_x} ${ex_y - 90} ${n.x + side * 30} ${n.y - 110} ${n.x + side * 10} ${n.y - 50}" class="m-loop"/>`;
      const title = ex.title.length > 26 ? ex.title.split(/ [–&]/)[0] : ex.title;
      g += `<g class="m-ex" data-ex="${st.id}|${eid}|${j}" style="--c:${c}" transform="translate(${ex_x} ${ex_y})">
        <rect x="-92" y="-28" width="184" height="56" rx="16"/>
        <text y="-6" class="tag">${tag === "over" ? "bei Unruhe" : tag === "under" ? "bei Erschöpfung" : tag === "ritual" ? (ex.couple ? "Paar-Ritual" : "Übung") : (j % 2 ? "Alternative" : "Übung")} · ${ex.minutes} min</text>
        <text y="12">${esc(title)}</text></g>`;
    });
  });
  /* Knoten */
  J.forEach((st, i) => {
    const n = MAP.nodes[st.id], c = colorOf(st), isCh = !!st.chakra;
    const R = isCh ? 46 : 40;
    const sub = isCh ? CHAKRAS[st.chakra].skt : st.kind === "test" ? "Mini-Test" : st.kind === "checkin" ? "Start" : "Ritual";
    const ico = isCh ? CHAKRAS[st.chakra].mantra : st.icon;
    g += `<g class="m-node" data-st="${st.id}" style="--c:${c}" transform="translate(${n.x} ${n.y})">
      <circle r="${R * 2.2}" fill="${c}" opacity=".18" filter="url(#mblur)" class="halo"/>
      ${st.kind === "test" ? `<rect x="-${R * .86}" y="-${R * .86}" width="${R * 1.72}" height="${R * 1.72}" rx="10" transform="rotate(45)" fill="none" stroke="${c}" stroke-opacity=".5" stroke-width="1.5"/>` : ""}
      <circle r="${R}" class="core" fill="rgba(12,6,30,.85)" stroke="${c}" stroke-width="3"/>
      <circle r="${R - 8}" fill="${c}" opacity=".18" class="fillc"/>
      <text class="ico" y="0" style="font-size:${isCh ? 17 : 24}px;font-weight:700">${esc(ico)}</text>
      <text class="lbl" y="${R + 26}">${esc(st.title)}</text>
      <text class="sub" y="${R + 44}">${esc(sub)}</text>
      <g class="stmark"></g>
    </g>`;
  });
  /* Ziel-Aura */
  const top = pts[pts.length - 1];
  g = `<circle cx="${top[0]}" cy="${top[1]}" r="220" fill="#fde68a" opacity=".07" filter="url(#mblur)"/>` + g;
  $("#cam").innerHTML = g;
  const p = $("#donePath"); MAP.len = p.getTotalLength(); p.style.strokeDasharray = MAP.len; p.style.strokeDashoffset = MAP.len;
  MAP.segLen = J.map((_, i) => { if (i === 0) return 120; return null; });
  refreshMap();
}
function lengthAt(i) { /* Pfadlänge bis Knoten i (approx. via Abtasten) */
  const p = $("#donePath"), J = journey(), target = MAP.nodes[J[i].id];
  let best = 0, bd = 1e9; const L = MAP.len;
  for (let l = 0; l <= L; l += 8) { const q = p.getPointAtLength(l); const dd = Math.abs(q.y - target.y); if (dd < bd) { bd = dd; best = l; } }
  return best;
}
function refreshMap() {
  const J = journey();
  J.forEach((st, i) => {
    const el = $(`.m-node[data-st="${st.id}"]`); if (!el) return;
    el.classList.toggle("now", i === S.idx && S.phase !== "welcome");
    const r = S.results[st.id];
    const done = i < S.idx || (r && r.status);
    el.querySelector(".fillc").setAttribute("opacity", done ? .85 : i === S.idx ? .4 : .14);
    const mk = el.querySelector(".stmark");
    mk.innerHTML = r && r.status ? `<circle cx="34" cy="-34" r="13" fill="${r.status === "moving" ? "#ffb347" : r.status === "skipped" ? "#777" : "#3ee08f"}"/><text x="34" y="-34" style="font-size:14px;dominant-baseline:central;fill:#120a2a;font-weight:800">${r.status === "moving" ? "↻" : r.status === "skipped" ? "–" : "✓"}</text>` : "";
    (r && r.path || []).forEach(eid => {
      document.querySelectorAll(`[data-ex^="${st.id}|${eid}|"]`).forEach(e => e.classList.add("done", "on"));
      document.querySelectorAll(`[data-b^="${st.id}|${eid}|"]`).forEach(e => e.classList.add("on"));
    });
  });
  const L = S.phase === "welcome" ? 0 : lengthAt(Math.min(S.idx, J.length - 1));
  const p = $("#donePath"); p.style.transition = "stroke-dashoffset 1.6s ease"; p.style.strokeDashoffset = MAP.len - L;
  /* Fortschritt */
  $("#progress").innerHTML = S.phase === "welcome" ? "" : J.map((st, i) => `<span class="pip ${i < S.idx || (S.results[st.id] && S.results[st.id].status) ? "done" : ""} ${i === S.idx ? "now" : ""}" style="--c:${colorOf(st)}" title="${esc(st.title)}"></span>`).join("") + `<span class="sr-only">Station ${S.idx + 1} von ${J.length}: ${esc(cur().title)}</span>`;
}
/* Kamera */
function viewCenter() {
  const mob = innerWidth <= 900;
  if (mob) { const ph = $("#panel").offsetHeight; return [innerWidth / 2, Math.max(120, (innerHeight - ph) / 2 + 20)]; }
  return [(innerWidth - $("#panel").offsetWidth - 36) / 2, innerHeight / 2 + 20];
}
function camTo(x, y, s, dur = 1400) {
  const [cx, cy] = viewCenter();
  const to = { s, x: cx - x * s, y: cy - y * s };
  if (reduced) dur = 1;
  const from = { s: cam.s, x: cam.x, y: cam.y }, t0 = performance.now();
  cam.tx = to;
  return new Promise(res => {
    const step = now => {
      if (cam.tx !== to) return res();
      let k = Math.min(1, (now - t0) / dur); k = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      cam.s = from.s + (to.s - from.s) * k; cam.x = from.x + (to.x - from.x) * k; cam.y = from.y + (to.y - from.y) * k;
      applyCam(); if (k < 1) requestAnimationFrame(step); else res();
    };
    requestAnimationFrame(step);
  });
}
function applyCam() { $("#cam").setAttribute("transform", `translate(${cam.x} ${cam.y}) scale(${cam.s})`); }
function baseScale() { return innerWidth <= 520 ? .5 : innerWidth <= 900 ? .62 : Math.min(1.05, innerHeight / 900); }
function focusStation(dur) {
  const st = cur(); if (!st) return; const n = MAP.nodes[st.id];
  const side = n.x > 500 ? -1 : 1;
  const offs = st.kind === "test" && S.phase !== "test-intro" ? side * 120 : 0;
  return camTo(n.x + offs, n.y - 20, baseScale(), dur);
}
let overview = false;
function toggleOverview() {
  overview = !overview;
  if (overview) { const [cx] = viewCenter(); const s = Math.min((innerHeight - 120) / MAP.H, (cx * 2 - 40) / 1100); camTo(500, MAP.H / 2, s, 1200); }
  else focusStation(1000);
}
/* Ziehen / Zoomen der Karte */
(function panzoom() {
  const svg = $("#map"); let drag = null;
  svg.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y }; cam.tx = null; svg.setPointerCapture(e.pointerId); });
  svg.addEventListener("pointermove", e => { if (!drag) return; cam.x = drag.cx + e.clientX - drag.x; cam.y = drag.cy + e.clientY - drag.y; applyCam(); });
  svg.addEventListener("pointerup", () => drag = null);
  svg.addEventListener("wheel", e => { e.preventDefault(); cam.tx = null; const k = Math.exp(-e.deltaY * .0012); const ns = Math.max(.15, Math.min(3, cam.s * k));
    cam.x = e.clientX - (e.clientX - cam.x) * ns / cam.s; cam.y = e.clientY - (e.clientY - cam.y) * ns / cam.s; cam.s = ns; applyCam(); }, { passive: false });
})();

/* ================= Panel-Rendering ================= */
const panel = $("#panel");
function show(html, color) {
  panel.classList.remove("anim"); void panel.offsetWidth;
  panel.style.setProperty("--c", color || "#c77dff");
  panel.innerHTML = html; panel.scrollTop = 0; panel.classList.add("anim");
  const h = panel.querySelector("h1,h2"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
}
function render() {
  save(); refreshMap();
  const st = cur();
  if (S.phase === "welcome") return renderWelcome();
  if (S.phase.startsWith("checkin")) return renderCheckin();
  if (S.phase === "summary") return renderSummary();
  if (st.kind === "ritual") return renderRitual(st);
  if (st.kind === "integration") return renderIntegration(st);
  if (st.kind === "test") return renderTest(st);
}

/* ---------- Willkommen ---------- */
function renderWelcome() {
  const hist = JSON.parse(localStorage.getItem(HKEY) || "[]");
  show(`
    <p class="kicker">Eine geführte Reise in deine Mitte</p>
    <h1>Werde wieder heil, energetisiert und verbunden.</h1>
    <p class="lead">Mit kleinen Mini-Tests spürst du, wo deine Energie fließt und wo sie stockt – im Nervensystem, im Geist, im Gefühl und in den sieben Chakren. Wo etwas blockiert ist, öffnet sich die passende Übung. Danach prüfst du erneut.</p>
    <div class="mode-cards">
      <button class="mode" data-mode="solo" style="--c:#c77dff"><span class="glyph">✦</span><b>Allein</b><span>Deine persönliche Reise von der Wurzel bis zur Krone.</span></button>
      <button class="mode" data-mode="couple" style="--c:#ff9ecb"><span class="glyph">❀</span><b>Als Paar</b><span>Gemeinsam in einen offenen, energetisierten Fluss – mit Ritualen nach Margot Anand.</span></button>
    </div>
    ${S.started && S.mode ? `<button class="btn ghost block" id="resume">↻ Begonnene Reise fortsetzen (${esc(cur() ? cur().title : "")})</button>` : ""}
    <ul class="feature-list">
      <li>17 Stationen, über 35 Übungen aus Yoga, Tantra, Schamanismus, Embodiment und Atemforschung</li>
      <li>Jede Übung max. 10 Minuten – mit Timer, Atem-Animation und Klang</li>
      <li>Test → Übung → Re-Test. Höchstens zwei Versuche pro Station, dann geht es liebevoll weiter</li>
      <li>Sicherheits-Check: intensive Techniken werden bei Risiken automatisch ersetzt</li>
      <li>Ganze Reise ca. 45–90 Minuten · dein Fortschritt wird nur lokal auf diesem Gerät gespeichert</li>
    </ul>
    <p class="small">Dieses Tool ist eine Einladung zur Selbsterfahrung. Es ersetzt keine ärztliche, psychotherapeutische oder heilkundliche Behandlung.</p>
    ${hist.length ? `<div class="history"><h3>Deine bisherigen Reisen</h3><ul>${hist.slice(-5).reverse().map(h => `<li>${new Date(h.date).toLocaleDateString("de-DE")} · ${h.mode === "couple" ? "Paar" : "Allein"} · ${esc(h.intention || "ohne Absicht")} · Energie ${h.b} → ${h.a}</li>`).join("")}</ul></div>` : ""}
  `);
  panel.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => { Sound.init(); const m = b.dataset.mode; S = fresh(); S.mode = m; S.phase = "checkin1"; S.started = Date.now(); buildMap(); render(); focusStation(); });
  const r = $("#resume"); if (r) r.onclick = () => { Sound.init(); buildMap(); render(); focusStation(); };
  Narrator.play(["ui_welcome"]);
  camTo(500, MAP.H - 400, baseScale() * .8, 1600);
}

/* ---------- Check-in ---------- */
function slider(id, label, lo, hi, v) {
  return `<div class="slider"><div class="top"><span>${label}</span><b id="${id}V">${v}</b></div>
    <input type="range" min="0" max="10" value="${v}" id="${id}" aria-label="${label}">
    <div class="ends"><span>${lo}</span><span>${hi}</span></div></div>`;
}
function renderCheckin() {
  const c = couple(), st = journey()[0];
  if (S.phase === "checkin1") {
    show(`<p class="kicker">Station 1 · Ankommen</p><h2>${c ? "Willkommen, ihr zwei." : "Willkommen."}</h2>
      <p>Nimm dir einen Moment. Wo bist du gerade – und wohin möchtest du heute?</p>
      ${c ? `<div class="row"><div style="flex:1"><label for="n1">Name A</label><input type="text" id="n1" value="${esc(S.names[0])}" placeholder="z. B. Alex"></div>
             <div style="flex:1"><label for="n2">Name B</label><input type="text" id="n2" value="${esc(S.names[1])}" placeholder="z. B. Mira"></div></div>`
          : `<label for="n1">Dein Name (optional)</label><input type="text" id="n1" value="${esc(S.names[0])}" placeholder="Wie möchtest du genannt werden?">`}
      <label>${c ? "Eure Absicht für diese Reise" : "Deine Absicht für diese Reise"}</label>
      <div class="chips">${INTENTIONS.filter(i => c || !i.includes("Partner")).map(i => `<button class="chip" aria-pressed="${S.chips.includes(i)}">${i}</button>`).join("")}</div>
      <label for="intent">In eigenen Worten (optional)</label>
      <textarea id="intent" placeholder="Ich wünsche mir …">${esc(S.intention)}</textarea>
      <div class="row" style="margin-top:18px"><button class="btn" id="next">Weiter</button></div>`, st.color);
    panel.querySelectorAll(".chip").forEach(b => b.onclick = () => { const v = b.textContent; const on = S.chips.includes(v); S.chips = on ? S.chips.filter(x => x !== v) : [...S.chips, v]; b.setAttribute("aria-pressed", !on); });
    Narrator.play([c ? "ui_checkin1c" : "ui_checkin1"]);
    $("#next").onclick = () => { S.names = [$("#n1").value.trim(), c ? $("#n2").value.trim() : ""]; S.intention = $("#intent").value.trim(); S.phase = "checkin2"; render(); };
  } else if (S.phase === "checkin2") {
    show(`<p class="kicker">Ankommen · Momentaufnahme</p><h2>Wie geht es ${c ? "euch" : "dir"} gerade?</h2>
      <p class="muted">${c ? "Schätzt gemeinsam ein (oder nehmt den Durchschnitt)." : "Spontan, ohne nachzudenken."} Am Ende vergleichen wir.</p>
      ${slider("sEnergy", "Energie", "leer", "sprühend", S.before.energy)}
      ${slider("sCalm", "Innere Ruhe", "aufgewühlt", "still", S.before.calm)}
      ${slider("sBody", "Im Körper sein", "nur im Kopf", "ganz verkörpert", S.before.body)}
      ${slider("sConnect", c ? "Verbindung miteinander" : "Verbindung mit mir selbst", "getrennt", "tief verbunden", S.before.connect)}
      <div class="row" style="margin-top:18px"><button class="btn ghost" id="back">Zurück</button><button class="btn" id="next">Weiter</button></div>`, st.color);
    Narrator.play([c ? "ui_checkin2c" : "ui_checkin2"]);
    [["sEnergy", "energy"], ["sCalm", "calm"], ["sBody", "body"], ["sConnect", "connect"]].forEach(([id, k]) => { const el = $("#" + id); el.oninput = () => { $("#" + id + "V").textContent = el.value; S.before[k] = +el.value; }; });
    $("#back").onclick = () => { S.phase = "checkin1"; render(); };
    $("#next").onclick = () => { S.phase = "checkin3"; render(); };
  } else {
    show(`<p class="kicker">Ankommen · Sicherheit</p><h2>Achtsam mit ${c ? "euch" : "dir"} sein</h2>
      <p>Einige Übungen arbeiten mit kräftigem Atem, Bewegung oder intensiven Gefühlen. Kreuze an, was ${c ? "auf einen von euch" : "auf dich"} zutrifft – das Tool wählt dann automatisch sanfte Alternativen.</p>
      ${SAFETY.map(s => `<label class="check"><input type="checkbox" data-s="${s.id}" ${S.safety[s.id] ? "checked" : ""}> <span>${s.label}</span></label>`).join("")}
      <div class="note warn"><b>Wichtig:</b> Diese Reise ist Selbsterfahrung, keine medizinische oder psychotherapeutische Behandlung. Du bestimmst das Tempo. Augen offen lassen, pausieren oder abbrechen ist jederzeit richtig. Bei Schmerz, Schwindel oder Überwältigung: stoppen, Füße spüren, ruhig atmen.</div>
      <p class="small">In einer akuten Krise: Telefonseelsorge (kostenlos, 24 h) 0800 111 0 111 oder 0800 111 0 222 · Notruf 112.</p>
      <div class="row" style="margin-top:14px"><button class="btn ghost" id="back">Zurück</button><button class="btn" id="next">Reise beginnen ✦</button></div>`, st.color);
    Narrator.play([c ? "ui_checkin3c" : "ui_checkin3"]);
    panel.querySelectorAll("[data-s]").forEach(b => b.onchange = () => { S.safety[b.dataset.s] = b.checked; });
    $("#back").onclick = () => { S.phase = "checkin2"; render(); };
    $("#next").onclick = () => { S.results.checkin = { status: "free", path: [] }; buildMap(); advance(); };
  }
}

/* ---------- Ritual-Station (Erdung, Herzgruß, Fluss) ---------- */
function renderRitual(st) {
  const eid = couple() && st.cex ? st.cex : st.ex, ex = EXERCISES[eid], c = colorOf(st);
  const done = S.results[st.id] && S.results[st.id].status;
  show(`<div class="st-head"><div class="st-orb" style="--c:${c}">${esc(st.icon)}</div><div><p class="kicker">Station ${S.idx + 1} · ${st.kind === "ritual" ? "Ritual" : ""}</p><h2>${esc(st.title)}</h2></div></div>
    <p class="lead">${esc(st.note || "")}</p>
    ${routeCard(eid, c)}
    ${done ? `<p><span class="result-badge rb-free">✓ abgeschlossen</span></p><button class="btn block" id="go">Weiter zur nächsten Station</button>`
      : `<button class="btn block" id="open">Übung öffnen</button><button class="linkish" id="skip">Station überspringen</button>`}`, c);
  if (!done) Narrator.play(["st_" + st.id + "_note"]); else Narrator.stop();
  if (done) $("#go").onclick = advance;
  else { $("#open").onclick = () => openExercise(st, eid, () => { S.results[st.id] = { status: "free", path: [eid] }; save(); render(); }); $("#skip").onclick = () => skipStation(st); }
}
function routeCard(eid, c, swapped) {
  const ex = EXERCISES[eid];
  return `<div class="route-card" style="--c:${c}"><div class="illu-mini">${Illu.render(ex)}</div>
    <div><p class="kicker" style="margin:0">${ex.couple ? "Paar-Übung" : "Übung"} · ${ex.minutes} min · ${ex.intensity}</p><h3 style="margin:4px 0">${esc(ex.title)}</h3>
    <p class="small" style="margin:0">${esc(ex.intro)}</p>
    ${swapped ? `<p class="small" style="margin:6px 0 0;color:#ffd59a">Sanfte Alternative zu „${esc(EXERCISES[swapped].title)}“ – wegen deines Sicherheits-Checks.</p>` : ""}</div></div>`;
}
function skipStation(st) { S.results[st.id] = { status: "skipped", path: [] }; advance(); }

/* ---------- Test-Station ---------- */
function renderTest(st) {
  const c = colorOf(st), t = st.test, ch = st.chakra ? CHAKRAS[st.chakra] : null;
  const head = `<div class="st-head"><div class="st-orb" style="--c:${c}">${esc(ch ? ch.mantra : st.icon)}</div><div><p class="kicker">Station ${S.idx + 1}${ch ? " · " + ch.skt + " · " + ch.element : ""}</p><h2>${esc(st.title)}</h2></div></div>`;
  const R = S.results[st.id] || {};
  if (S.phase === "test-intro" || S.phase === "retest") {
    const re = S.phase === "retest";
    show(`${head}
      ${re ? `<p class="kicker" style="color:#9fe7ff">Re-Test ${S.attempt}/2</p><p>Spür noch einmal nach – genauso wie vorhin. Was hat sich verändert?</p>` : `<p class="lead">${esc(t.intro)}</p>${ch ? `<p class="small">Thema: ${esc(ch.theme)}</p>` : ""}`}
      <h3>Mini-Test${couple() ? " – macht ihn beide, jede*r für sich" : ""}</h3>
      <ol class="steps-do">${t.do.map(x => `<li>${esc(x)}</li>`).join("")}</ol>
      ${t.dot ? `<div class="dot-target" aria-hidden="true"><i></i></div>` : ""}
      <div class="mini-timer"><svg class="ring" viewBox="0 0 80 80"><circle class="bg" cx="40" cy="40" r="34"/><circle class="fg" id="mtFg" cx="40" cy="40" r="34" stroke-dasharray="213.6" stroke-dashoffset="0"/><text x="40" y="41" id="mtT">${t.timer}s</text></svg>
        <div><button class="btn" id="mtGo">▶ Test starten</button><div class="small" style="margin-top:6px">Oder direkt antworten, wenn du schon fertig bist.</div></div></div>
      <h3 style="margin-top:18px">${esc(couple() ? t.qc : t.q)}</h3>
      <div class="opts">${t.opts.map((o, i) => `<button class="opt" data-i="${i}">${esc(couple() && o.lc ? o.lc : o.l)}</button>`).join("")}</div>
      <button class="linkish" id="skip">Station überspringen</button>`, c);
    let timer = null, started = false;
    const cc = couple() ? "c" : "";
    const startTimer = (manual) => {
      if (started) return; started = true;
      if (manual) Narrator.stop();
      Sound.bell(CHAKRAS[st.chakra || "heart"].freq * 2, .15);
      let left = t.timer; const fg = $("#mtFg"), tt = $("#mtT"); $("#mtGo").disabled = true; $("#mtGo").textContent = "… Test läuft";
      timer = setInterval(() => { if (!document.body.contains(fg)) return clearInterval(timer); left--; tt.textContent = left + "s"; fg.style.strokeDashoffset = 213.6 * (1 - left / t.timer);
        if (left <= 0) { clearInterval(timer); Sound.bell(CHAKRAS[st.chakra || "heart"].freq * 2, .2); tt.textContent = "✓"; panel.querySelector(".opts").scrollIntoView({ behavior: "smooth", block: "center" });
          Narrator.play([`st_${st.id}_q${cc}`]); } }, 1000);
    };
    $("#mtGo").onclick = () => startTimer(true);
    Narrator.play([re ? "ui_retest" : `st_${st.id}_intro`, `st_${st.id}_do${cc}`], { onEnd: () => { const btn = $("#mtGo"); if (btn) setTimeout(() => { if (document.body.contains(btn)) startTimer(false); }, 1200); } });
    panel.querySelectorAll(".opt").forEach(b => b.onclick = () => { clearInterval(timer); answer(st, t.opts[+b.dataset.i].r); });
    $("#skip").onclick = () => { clearInterval(timer); skipStation(st); };
  } else if (S.phase === "route") {
    const route = routeFor(st, R.first), step = route[S.attempt];
    const second = S.attempt === 1;
    show(`${head}
      <p><span class="result-badge rb-moving">${R.first === "over" ? "Übererregt" : R.first === "under" ? "Untererregt" : "Hier stockt es"}</span></p>
      <p>${second ? "Es hat sich noch nicht ganz gelöst. Das ist völlig in Ordnung – Energie braucht manchmal einen anderen Zugang. Probier diese Alternative:" : couple() ? "Euer Weg führt euch hierhin:" : "Dein Weg führt dich hierhin:"}</p>
      ${routeCard(step.id, c, step.swapped)}
      <button class="btn block" id="open">Übung beginnen</button>
      <button class="linkish" id="skip">Übung auslassen und weitergehen</button>`, c);
    Narrator.play([second ? "ui_route2" : couple() ? "ui_routec" : "ui_route", "ex_" + step.id + "_intro"]);
    focusExNode(st, step.id, S.attempt);
    $("#open").onclick = () => openExercise(st, step.id, () => { R.path = [...(R.path || []), step.id]; S.results[st.id] = R; S.attempt++; S.phase = "retest"; render(); }, S.attempt);
    $("#skip").onclick = () => { R.status = "moving"; S.results[st.id] = R; advance(); };
  } else if (S.phase === "stdone") {
    const msg = { free: couple() ? "Hier fließt es bei euch. Wunderbar!" : "Hier fließt es. Wunderbar!", resolved: RETEST_OK, moving: RETEST_MOVING }[R.status];
    show(`${head}
      <p><span class="result-badge rb-${R.status}">${{ free: "✓ frei", resolved: "✓ gelöst", moving: "↻ in Bewegung" }[R.status]}</span></p>
      <p class="lead">${esc(msg)}</p>
      ${R.path && R.path.length ? `<p class="small">Deine Übungen hier: ${R.path.map(e => esc(EXERCISES[e].title)).join(" · ")}</p>` : ""}
      <button class="btn block" id="go">Weiter ↑</button>`, c);
    Narrator.play([R.status === "free" ? (couple() ? "ui_freec" : "ui_free") : "ui_" + R.status]);
    $("#go").onclick = advance;
    if (R.status !== "moving") Sound.bell(CHAKRAS[st.chakra || "heart"].freq * 2, .14);
  }
}
const RETEST_OK = "Spürst du es? Etwas hat sich gelöst. Nimm dir einen Atemzug, um diese Veränderung bewusst zu würdigen.";
const RETEST_MOVING = "Manches braucht mehr Zeit als eine Übung. Das ist kein Scheitern: Du hast Energie in Bewegung gebracht, und sie arbeitet weiter. Wir gehen sanft weiter – vielleicht nimmst du diese Übung in den nächsten Tagen mit.";
function answer(st, r) {
  const R = S.results[st.id] || { path: [] };
  if (S.phase === "test-intro") {
    if (r === "free") { R.status = "free"; R.first = "free"; S.results[st.id] = R; S.phase = "stdone"; return render(); }
    R.first = r; S.results[st.id] = R; S.attempt = 0; S.phase = "route"; return render();
  }
  /* Re-Test */
  if (r === "free") { R.status = "resolved"; S.phase = "stdone"; }
  else if (S.attempt >= 2 || !routeFor(st, R.first)[S.attempt]) { R.status = "moving"; S.phase = "stdone"; }
  else { if (r !== "blocked" && r !== R.first && routeFor(st, r).length) R.first = r; S.phase = "route"; }
  S.results[st.id] = R; render();
}
function focusExNode(st, eid, j) {
  const n = MAP.nodes[st.id]; if (!n) return;
  const key = Object.keys(n.ex).find(k => k.startsWith(eid + "|")); if (!key) return;
  const e = n.ex[key];
  document.querySelectorAll(".m-ex.cur").forEach(x => x.classList.remove("cur"));
  const el = $(`[data-ex="${st.id}|${key}"]`); if (el) el.classList.add("cur", "on");
  const b = $(`[data-b="${st.id}|${key}"]`); if (b) b.classList.add("on");
  camTo((n.x + e.x) / 2, (n.y + e.y) / 2, baseScale(), 1200);
}

/* ---------- Integration ---------- */
function renderIntegration(st) {
  const c = colorOf(st), list = couple() ? [st.ex, st.cex] : [st.ex];
  if (S.intStep < list.length) {
    const eid = list[S.intStep];
    show(`<div class="st-head"><div class="st-orb" style="--c:${c}">${st.icon}</div><div><p class="kicker">Letzte Station</p><h2>Integration</h2></div></div>
      <p class="lead">${S.intStep === 0 ? "Du bist durch alle Zentren gereist. Jetzt darf sich alles setzen – Stille ist der Ort, an dem Veränderung Wurzeln schlägt." : "Was ihr erlebt habt, darf gesehen und geteilt werden."}</p>
      ${routeCard(eid, c)}<button class="btn block" id="open">Übung öffnen</button><button class="linkish" id="skip">Überspringen</button>`, c);
    Narrator.play([S.intStep === 0 ? "ui_int1" : "ui_int2"]);
    const nx = () => { S.intStep++; S.results[st.id] = { status: "free", path: list.slice(0, S.intStep) }; render(); };
    $("#open").onclick = () => openExercise(st, eid, nx, S.intStep);
    $("#skip").onclick = () => { S.intStep++; render(); };
    return;
  }
  if (!S.after) S.after = { ...S.before };
  show(`<p class="kicker">Integration · Reflexion</p><h2>Was nimmst du mit?</h2>
    <p class="muted">Schreib frei, ohne zu korrigieren. Deine Antworten bleiben nur auf diesem Gerät.</p>
    ${JOURNAL.map((q, i) => `<label for="j${i}">${esc(q)}</label><textarea id="j${i}">${esc(S.journal[i])}</textarea>`).join("")}
    <h3 style="margin-top:20px">Und jetzt – wie geht es ${couple() ? "euch" : "dir"}?</h3>
    ${slider("aEnergy", "Energie", "leer", "sprühend", S.after.energy)}
    ${slider("aCalm", "Innere Ruhe", "aufgewühlt", "still", S.after.calm)}
    ${slider("aBody", "Im Körper sein", "nur im Kopf", "ganz verkörpert", S.after.body)}
    ${slider("aConnect", couple() ? "Verbindung miteinander" : "Verbindung mit mir selbst", "getrennt", "tief verbunden", S.after.connect)}
    <button class="btn block" id="fin" style="margin-top:12px">Meine Reise abschließen ❂</button>`, c);
  Narrator.play(["ui_reflect"]);
  JOURNAL.forEach((_, i) => $("#j" + i).oninput = e => { S.journal[i] = e.target.value; save(); });
  [["aEnergy", "energy"], ["aCalm", "calm"], ["aBody", "body"], ["aConnect", "connect"]].forEach(([id, k]) => { const el = $("#" + id); el.oninput = () => { $("#" + id + "V").textContent = el.value; S.after[k] = +el.value; }; });
  $("#fin").onclick = () => {
    S.results[st.id] = { status: "free", path: list }; S.finished = Date.now(); S.phase = "summary";
    const h = JSON.parse(localStorage.getItem(HKEY) || "[]");
    h.push({ date: S.finished, mode: S.mode, intention: S.chips.concat(S.intention ? [S.intention] : []).join(", "), b: S.before.energy, a: S.after.energy });
    localStorage.setItem(HKEY, JSON.stringify(h.slice(-20)));
    Sound.bell(396, .2, 5); setTimeout(() => Sound.bell(528, .18, 5), 700); setTimeout(() => Sound.bell(792, .14, 6), 1400);
    render(); toggleOverviewTo(true);
  };
}
function toggleOverviewTo(v) { overview = !v; toggleOverview(); }

/* ---------- Zusammenfassung ---------- */
function renderSummary() {
  const J = journey(), res = {};
  CHAKRA_ORDER.forEach(c => res[c] = S.results[c]);
  const lab = { free: "frei", resolved: "gelöst", moving: "in Bewegung", skipped: "übersprungen" };
  const helpful = [], keep = [];
  J.forEach(st => { const r = S.results[st.id]; if (!r || st.kind !== "test") return;
    if (r.status === "resolved") helpful.push(r.path[r.path.length - 1]);
    if (r.status === "moving") keep.push(...r.path); });
  const names = couple() ? S.names.filter(Boolean).join(" & ") : S.names[0];
  const bars = [["Energie", "energy"], ["Innere Ruhe", "calm"], ["Im Körper sein", "body"], [couple() ? "Verbindung miteinander" : "Verbindung mit mir", "connect"]];
  show(`<p class="kicker">Deine Reise ist vollendet</p>
    <h2>${names ? esc(names) + ", " : ""}${couple() ? "ihr seid" : "du bist"} in ${couple() ? "eurer" : "deiner"} Mitte angekommen.</h2>
    ${Illu.mandala(res)}
    <p class="lead">Energie, die in Bewegung gekommen ist, wirkt weiter – in den nächsten Stunden und Tagen. Trink etwas Wasser, bleib noch einen Moment bei dir und nimm die Stille mit in deinen Alltag.</p>
    ${S.chips.length || S.intention ? `<div class="note">Deine Absicht: <b>${esc(S.chips.concat(S.intention ? [S.intention] : []).join(" · "))}</b></div>` : ""}
    <h3>Vorher → Nachher</h3>
    <div class="bars">${bars.map(([l, k]) => `<div class="bar"><div class="lab"><span>${l}</span><span>${S.before[k]} → <b>${S.after[k]}</b></span></div><div class="track"><div class="b0" style="width:${S.before[k] * 10}%"></div><div class="b1" style="width:${S.after[k] * 10}%"></div></div></div>`).join("")}</div>
    <h3>Deine Stationen</h3>
    <ul class="sum-list">${J.filter(s => s.kind === "test").map(st => { const r = S.results[st.id] || {}; return `<li style="--c:${colorOf(st)}"><span><i class="dot"></i>${esc(st.title)}</span><span class="result-badge rb-${r.status || "skipped"}">${lab[r.status] || "–"}</span></li>`; }).join("")}</ul>
    ${helpful.length ? `<h3>Was dir heute geholfen hat</h3><p>${helpful.map(e => esc(EXERCISES[e].title)).join(" · ")}</p>` : ""}
    ${keep.length ? `<h3>Deine Übungen für die nächsten 7 Tage</h3><p>Diese Bereiche sind in Bewegung. Täglich 5–10 Minuten wirken mehr als eine lange Sitzung: <b>${[...new Set(keep)].map(e => esc(EXERCISES[e].title)).join(" · ")}</b></p>` : `<div class="note">Alltags-Tipp: ${couple() ? "Schenkt euch täglich eine dreiminütige Schmelz-Umarmung (nach Margot Anand)." : "5 Minuten Herz-Kohärenz-Atem am Morgen halten den Fluss lebendig."}</div>`}
    ${S.journal.some(Boolean) ? `<h3>Dein Journal</h3>${JOURNAL.map((q, i) => S.journal[i] ? `<p class="small" style="margin:8px 0 2px">${esc(q)}</p><p>${esc(S.journal[i])}</p>` : "").join("")}` : ""}
    <div class="row noprint" style="margin-top:18px"><button class="btn" id="print">Als PDF / drucken</button><button class="btn ghost" id="dl">Als Text speichern</button><button class="btn ghost" id="again">Neue Reise</button></div>`, "#fde68a");
  Narrator.play([couple() ? "ui_summaryc" : "ui_summary"]);
  $("#print").onclick = () => print();
  $("#again").onclick = () => { S = fresh(); buildMap(); render(); };
  $("#dl").onclick = () => {
    const lines = [`Energie- und Chakra-Reise – ${new Date(S.finished).toLocaleString("de-DE")}`, couple() ? `Paar: ${names}` : `Name: ${names || "-"}`, `Absicht: ${S.chips.concat(S.intention ? [S.intention] : []).join(", ")}`, "",
      ...bars.map(([l, k]) => `${l}: ${S.before[k]} → ${S.after[k]}`), "", ...J.filter(s => s.kind === "test").map(st => { const r = S.results[st.id] || {}; return `${st.title}: ${lab[r.status] || "-"}${r.path && r.path.length ? " (" + r.path.map(e => EXERCISES[e].title).join(", ") + ")" : ""}`; }),
      "", ...JOURNAL.map((q, i) => `${q}\n${S.journal[i] || "-"}`)];
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" })); a.download = "chakra-reise.txt"; a.click();
  };
}

/* ---------- Navigation ---------- */
function advance() {
  const J = journey();
  document.querySelectorAll(".m-ex.cur").forEach(x => x.classList.remove("cur"));
  if (S.idx < J.length - 1) { S.idx++; S.attempt = 0; S.intStep = 0; S.phase = cur().kind === "test" ? "test-intro" : "station"; }
  render(); focusStation();
}

/* ================= Übungs-Ansicht (Zoom) ================= */
let EXR = null;
function openExercise(st, eid, onDone, j = 0) {
  const ex = EXERCISES[eid], c = CHAKRAS[ex.chakra].color;
  const n = MAP.nodes[st.id];
  const key = n && Object.keys(n.ex).find(k => k.startsWith(eid + "|"));
  const node = key ? n.ex[key] : n;
  const go = () => {
    const sx = node.x * cam.s + cam.x, sy = node.y * cam.s + cam.y;
    const ov = $("#exercise");
    const steps = ex.steps; const total = steps.reduce((a, s) => a + s[0], 0);
    let acc = 0; const starts = steps.map(s => { const v = acc; acc += s[0]; return v; });
    const f = flagged();
    const pattern = ex.breath ? BREATH[ex.breath] : null;
    ov.style.setProperty("--c", c);
    ov.innerHTML = `<article class="ex-card" style="--c:${c};--tox:${sx}px;--toy:${sy}px">
      <header class="ex-hero">
        <button class="icon-btn ex-close" id="exClose" aria-label="Übung schließen">✕</button>
        <p class="kicker" style="color:${c}">${esc(st.title)} · ${ex.couple ? "Paar-Übung" : "Übung"}</p>
        <h2 id="exTitle" style="font-size:2.3rem">${esc(ex.title)}</h2>
        <div class="ex-badges"><span class="badge">⏱ ${Math.round(total / 60)} min</span><span class="badge int-${ex.intensity}">${ex.intensity}</span>
          ${ex.origin.map(o => `<span class="badge ${/Anand/.test(o) ? "anand" : ""}">${esc(o)}</span>`).join("")}</div>
        <p class="lead" style="margin-top:10px">${esc(ex.intro)}</p>
        ${ex.credit ? `<div class="note" style="--c:#ff9ecb">${esc(ex.credit)}</div>` : ""}
        ${f.includes("psych") ? `<div class="note warn">Du darfst die Augen offen lassen, kleiner machen, pausieren. Wenn es zu viel wird: Füße spüren, Umgebung anschauen, langsam ausatmen.</div>` : ""}
      </header>
      <div class="ex-body">
        <div class="ex-visual">
          ${ex.showFlame ? `<div class="flame-wrap">${Illu.flame()}</div>` : Illu.render(ex)}
          ${pattern ? `<div class="breath-orb" aria-hidden="true"><div class="orb2"></div><div class="orb" id="orb"></div><div class="lbl" id="orbL">bereit</div></div>` : ""}
        </div>
        <div>
          <ol class="ex-steps" id="exSteps">${steps.map((s, i) => `<li data-i="${i}"><span class="n">${i + 1}</span><span>${esc(s[1])}</span><span class="t">${fmt(s[0])}</span></li>`).join("")}</ol>
          <div class="ex-controls">
            <svg class="ring" viewBox="0 0 80 80"><circle class="bg" cx="40" cy="40" r="34"/><circle class="fg" id="exFg" cx="40" cy="40" r="34" stroke-dasharray="213.6" stroke-dashoffset="213.6"/><text x="40" y="41" id="exT">${fmt(total)}</text></svg>
            <div class="stack" style="flex:1;min-width:200px">
              <div class="row"><button class="btn" id="exPlay">▶ Start</button><button class="btn ghost" id="exNext" title="Nächster Schritt">⏭</button><button class="btn ghost" id="exSnd" aria-label="Klang">${Sound.enabled ? "♪ Klang an" : "♪ Klang aus"}</button></div>
              <button class="btn block" id="exDone" style="--c:#3ee08f">✓ Fertig – weiter</button>
            </div>
          </div>
          <details class="why"><summary>Warum das wirkt · Quellen</summary><p>${esc(ex.why)}</p></details>
        </div>
      </div></article>`;
    ov.style.setProperty("--ox", sx + "px"); ov.style.setProperty("--oy", sy + "px");
    ov.hidden = false; ov.classList.remove("closing");
    $("#exClose").focus({ preventScroll: true });
    EXR = { id: eid, ex, total, starts, t: 0, running: false, last: null, stepI: -1, pattern, raf: 0, onDone };
    setStep(0, true);
    Narrator.play(["ex_" + eid + "_intro"], { delay: 900 });
    $("#exPlay").onclick = togglePlay;
    $("#exNext").onclick = () => { const i = Math.min(steps.length - 1, EXR.stepI + 1); EXR.t = starts[i]; setStep(i); tickUI(); };
    $("#exSnd").onclick = e => { const on = Sound.toggle(); e.target.textContent = on ? "♪ Klang an" : "♪ Klang aus"; $("#soundBtn").classList.toggle("off", !on); if (on && EXR.running) startSound(); };
    $("#exDone").onclick = () => closeExercise(true);
    $("#exClose").onclick = () => closeExercise(false);
  };
  if (key && !reduced) camTo(node.x, node.y, 2.4, 650).then(go); else go();
}
const fmt = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
function startSound() {
  const ex = EXR.ex;
  if (ex.tone === "drum") Sound.startDrum(126);
  else if (ex.tone === "chakra") Sound.startDrone(CHAKRAS[ex.chakra].freq);
  else if (ex.tone === "chakras") Sound.startDrone(CHAKRAS[CHAKRA_ORDER[Math.max(0, Math.min(6, EXR.stepI - 1))]].freq);
}
function togglePlay() {
  Sound.init();
  EXR.running = !EXR.running;
  $("#exPlay").textContent = EXR.running ? "❚❚ Pause" : "▶ Weiter";
  const ns = Narrator.state();
  if (EXR.running) { EXR.last = performance.now(); if (EXR.t === 0) { Sound.bell(CHAKRAS[EXR.ex.chakra].freq * 2, .2); narrateStep(0); } else if (ns.paused) Narrator.toggle(); startSound(); loop(); }
  else { cancelAnimationFrame(EXR.raf); Sound.stopAll(); if (ns.playing) Narrator.toggle(); }
}
function loop() {
  if (!EXR || !EXR.running) return;
  const now = performance.now(); EXR.t += (now - EXR.last) / 1000; EXR.last = now;
  if (EXR.t >= EXR.total) { EXR.t = EXR.total; EXR.running = false; tickUI(); finishEx(); return; }
  let i = EXR.starts.length - 1; while (i > 0 && EXR.starts[i] > EXR.t) i--;
  if (i !== EXR.stepI) setStep(i);
  tickUI();
  EXR.raf = requestAnimationFrame(loop);
}
let lastPhase = -1;
function tickUI() {
  const fg = $("#exFg"); if (!fg) return;
  fg.style.strokeDashoffset = 213.6 * (1 - EXR.t / EXR.total);
  $("#exT").textContent = fmt(EXR.total - EXR.t);
  if (EXR.pattern) {
    const P = EXR.pattern, cyc = P.reduce((a, p) => a + p[1], 0);
    let x = EXR.t % cyc, k = 0; while (x > P[k][1]) { x -= P[k][1]; k++; }
    const prev = P[(k - 1 + P.length) % P.length][2], target = P[k][2];
    const e = .5 - Math.cos(Math.PI * Math.min(1, x / P[k][1])) / 2;
    const sc = .3 + .7 * (prev + (target - prev) * e);
    $("#orb").style.transform = `scale(${sc})`;
    $("#orbL").textContent = EXR.running || EXR.t > 0 ? P[k][0] : "bereit";
    if (EXR.running && k !== lastPhase && P[k][1] >= 2) { Sound.tick(target > prev); }
    lastPhase = k;
  }
}
function setStep(i, silent) {
  const prev = EXR.stepI; EXR.stepI = i;
  document.querySelectorAll("#exSteps li").forEach((li, k) => { li.classList.toggle("cur", k === i); li.classList.toggle("past", k < i); });
  const li = $(`#exSteps li[data-i="${i}"]`); if (li && !silent) li.scrollIntoView({ behavior: "smooth", block: "nearest" });
  if (!silent && prev !== i) narrateStep(i);
  if (!silent && prev !== i && EXR.running) { Sound.bell(CHAKRAS[EXR.ex.chakra].freq * 2, .12, 2.5); if (EXR.ex.tone === "chakras") Sound.setDrone(CHAKRAS[CHAKRA_ORDER[Math.max(0, Math.min(6, i - 1))]].freq); }
}
function narrateStep(i) {
  if (!EXR) return;
  document.querySelectorAll("#exSteps li").forEach((li, k) => li.classList.toggle("speaking", k === i));
  Narrator.play([`ex_${EXR.id}_s${i}`], { delay: 600, onEnd: () => document.querySelectorAll("#exSteps li.speaking").forEach(li => li.classList.remove("speaking")) });
}
function finishEx() {
  Sound.stopAll();
  setTimeout(() => { if (EXR) Narrator.play(["ui_exdone"]); }, 2600);
  [0, 900, 1800].forEach(d => setTimeout(() => Sound.bell(CHAKRAS[EXR.ex.chakra].freq * 2, .18, 3), d));
  $("#exPlay").textContent = "↺ Nochmal"; $("#exPlay").onclick = () => { EXR.t = 0; setStep(0, true); $("#exPlay").onclick = togglePlay; togglePlay(); };
  const d = $("#exDone"); d.textContent = "✓ Übung vollendet – weiter"; d.focus();
}
function closeExercise(done) {
  if (!EXR) return;
  cancelAnimationFrame(EXR.raf); Sound.stopAll(); Narrator.stop();
  const cb = EXR.onDone; EXR = null;
  const ov = $("#exercise"); ov.classList.add("closing");
  setTimeout(() => { ov.hidden = true; ov.innerHTML = ""; if (done && cb) cb(); focusStation(900); }, reduced ? 1 : 420);
}

/* ================= Info / Quellen ================= */
function openInfo() {
  const m = $("#modal");
  const groups = {}; QUELLEN.forEach(([g, t, u]) => (groups[g] = groups[g] || []).push([t, u]));
  m.innerHTML = `<div class="modal-card"><button class="icon-btn" style="float:right" id="mClose" aria-label="Schließen">✕</button>
    <p class="kicker">Über diese Reise</p><h2>Tradition · Wissenschaft · Erfahrung</h2>
    <p>Die Reise folgt einem klaren Prinzip: <b>erst erden, dann regulieren, dann öffnen, dann verbinden, dann integrieren.</b> Zuerst prüfst du Nervensystem, Geist, Lebensenergie, Gefühl und Körperspannung – danach die sieben Chakren von der Wurzel bis zur Krone. Jede Station hat einen konkreten, selbst beobachtbaren Mini-Test. Ist etwas blockiert, führt der Weg zu einer Übung (max. 10 Minuten) und danach zum Re-Test. Nach höchstens zwei Übungen geht es freundlich weiter – Heilung ist kein Leistungssport.</p>
    <p>Die Chakren sind eine erfahrungsbasierte Landkarte der tantrischen und yogischen Tradition. Die Mini-Tests sind Wahrnehmungsübungen, keine Diagnose. Die Klänge nutzen eine moderne Zuordnung der Chakren zu den Tönen C–H.</p>
    <div class="note" style="--c:#ff9ecb"><b>Dank an Margot Anand.</b> Herzgruß, Heiliger Raum, Schmelzende Umarmung, Herzsegen, harmonisierender Atem, die „Innere Flöte“ und der Kreislauf-Atem gehen auf Margot Anands SkyDancing Tantra zurück („The Art of Sexual Ecstasy“, „The Art of Everyday Ecstasy“). Sie werden hier in eigenen Worten und in einer nicht-sexuellen Form für ein breites Publikum beschrieben. Für die vollständige Lehre: ihre Bücher und <a href="https://margotanand.com/" target="_blank" rel="noopener">margotanand.com</a>.</div>
    <div class="note warn">Kein Ersatz für ärztliche oder psychotherapeutische Behandlung. Bei Schwangerschaft, Epilepsie, Herz-Kreislauf-Erkrankungen, psychischen Erkrankungen oder frischen Verletzungen werden intensive Techniken automatisch ersetzt. Krisenhilfe: Telefonseelsorge 0800 111 0 111 · Notruf 112.</div>
    ${Object.entries(groups).map(([g, l]) => `<p class="src-group">${esc(g)}</p><ul class="src-list">${l.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join("")}</ul>`).join("")}
    <p class="small" style="margin-top:18px">Alle Illustrationen sind eigens erstellte Vektorgrafiken. Deine Eingaben werden ausschließlich lokal in deinem Browser gespeichert.</p>
    <div class="row"><button class="btn ghost" id="mReset">Fortschritt löschen & neu beginnen</button></div></div>`;
  m.hidden = false; $("#mClose").focus();
  $("#mClose").onclick = () => m.hidden = true;
  m.onclick = e => { if (e.target === m) m.hidden = true; };
  $("#mReset").onclick = () => { if (confirm("Aktuelle Reise wirklich löschen?")) { S = fresh(); save(); m.hidden = true; buildMap(); render(); } };
}

/* ================= Init ================= */
$("#infoBtn").onclick = openInfo;
$("#overviewBtn").onclick = toggleOverview;
$("#homeBtn").onclick = () => { if (S.phase !== "welcome") { S._back = S.phase; } S.phase = "welcome"; render(); };
$("#soundBtn").classList.toggle("off", !Sound.enabled);
$("#soundBtn").onclick = () => { const on = Sound.toggle(); $("#soundBtn").classList.toggle("off", !on); };
addEventListener("keydown", e => {
  if (e.key === "Escape") { if (!$("#modal").hidden) $("#modal").hidden = true; else if (EXR) closeExercise(false); }
  if (e.key === " " && EXR && document.activeElement.tagName !== "BUTTON") { e.preventDefault(); togglePlay(); }
});
addEventListener("resize", () => { if (!EXR) focusStation(300); });
/* Fortsetzen-Logik für "Startseite" */
const _rw = renderWelcome;
renderWelcome = function () { if (S._back) { const b = S._back; delete S._back; S.phase = b; save(); S.phase = "welcome"; S._resumePhase = b; } _rw(); const r = $("#resume"); if (r && S._resumePhase) r.onclick = () => { S.phase = S._resumePhase; delete S._resumePhase; buildMap(); render(); focusStation(); }; };
if (S.phase === "station" && cur() && cur().kind === "test") S.phase = "test-intro";
buildMap();
if (S.phase !== "welcome" && S.mode) { S._resumePhase = S.phase; S.phase = "welcome"; }
render();
applyCam();
