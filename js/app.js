"use strict";
/* ============ Energie- und Chakra-Reise – Lebensbaum ============ */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const KEY = "chakraReise.v2", HKEY = "chakraReise.history";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MAP = { nodes: {}, W: 2400, H: 0 };
const cam = { s: 1, x: 0, y: 0, tx: null };
const ST = Object.fromEntries(STATIONS.map(s => [s.id, s]));

let S = load();
function fresh() {
  return { mode: null, names: ["", ""], intention: "", chips: [], safety: {}, before: { energy: 5, calm: 5, connect: 5, body: 5 }, after: null,
    node: null, phase: "welcome", results: {}, leaves: {}, scan: null, visited: {}, journal: ["", "", "", ""], intStep: 0, started: null, finished: null };
}
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.results ? s : fresh(); } catch { return fresh(); } }
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
const couple = () => S.mode === "couple";
const flagged = () => Object.keys(S.safety).filter(k => S.safety[k]);
const colorOf = st => st.chakra ? CHAKRAS[st.chakra].color : st.color;
const isChakra = id => !!CHAKRAS[id];

/* ---------- Baum-Struktur ---------- */
const trunkIds = () => ["checkin", ...(couple() ? ["sacred"] : []), "ankommen", "nervous", "mind", "energy", "body"];
const areasOf = c => BRANCHES[c].areas;
const leavesOf = (c, a) => (couple() && a.cleaves ? a.cleaves : a.leaves).map(resolveEx);
const areaById = (c, aid) => areasOf(c).find(a => a.id === aid);
function trunkLeaves(st) {
  if (st.kind === "ritual") return [{ id: couple() && st.cex ? st.cex : st.ex }];
  if (st.kind !== "test") return [];
  const r = (couple() && st.croutes ? st.croutes : st.routes) || {};
  const seen = new Set(), out = [];
  Object.entries(r).forEach(([k, list]) => list.forEach(spec => { const x = resolveEx(spec); if (!seen.has(x.id)) { seen.add(x.id); out.push({ ...x, tag: k }); } }));
  return out;
}
/* Lineare Reihenfolge für Vor/Zurück */
function ORDER() {
  const o = [...trunkIds(), "hub"];
  CHAKRA_ORDER.forEach(c => { o.push(c); areasOf(c).forEach(a => o.push(`a:${c}:${a.id}`)); });
  o.push("integration");
  return o;
}
function nodeTitle(id) {
  if (id === "hub") return "Verzweigung · Baumkrone";
  if (id === "integration") return "Integration";
  if (id.startsWith("a:")) { const [, c, a] = id.split(":"); return `${CHAKRAS[c].name} · ${areaById(c, a).title}`; }
  if (id.startsWith("x:")) { const [, s, e] = id.split(":"); return EXERCISES[e].title; }
  return ST[id] ? ST[id].title : id;
}

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
const R = id => (S.results[id] = S.results[id] || { path: [] });
const statusOf = id => (S.results[id] || {}).status;
const leafDone = (owner, eid) => !!S.leaves[owner + ":" + eid];
function markLeaf(owner, eid) { S.leaves[owner + ":" + eid] = true; const r = R(owner); r.path = [...(r.path || []), eid]; }
function trunkDone() { return trunkIds().every(id => statusOf(id)); }
function recommended() {
  const scan = CHAKRA_ORDER.filter(c => S.scan && S.scan[c]);
  const hint = new Set();
  Object.entries(TRUNK_HINTS).forEach(([sid, m]) => { const f = (S.results[sid] || {}).first; (m[f] || []).forEach(c => hint.add(c)); });
  const hinted = CHAKRA_ORDER.filter(c => hint.has(c) && !scan.includes(c));
  return { scan, hinted, all: [...scan, ...hinted] };
}

/* ================= Sternenhimmel ================= */
(function sky() {
  const c = $("#sky"), x = c.getContext("2d");
  let W, H, stars = [], t = 0;
  const cols = ["#ffffff", "#ffd9f4", "#d9e6ff", "#fff1c9", "#e0ccff"];
  function size() {
    W = c.width = innerWidth * devicePixelRatio; H = c.height = innerHeight * devicePixelRatio;
    stars = Array.from({ length: Math.min(420, (innerWidth * innerHeight) / 3500) }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: (Math.random() ** 3 * 1.8 + .3) * devicePixelRatio, d: Math.random() * .8 + .2,
      p: Math.random() * 6.28, s: .4 + Math.random() * 1.6, c: cols[(Math.random() * cols.length) | 0], v: (Math.random() - .5) * .04
    }));
  }
  function frame() {
    t += .016; x.clearRect(0, 0, W, H);
    const px = (cam.x || 0) * .03, py = (cam.y || 0) * .03;
    for (const s of stars) {
      const a = .35 + .65 * Math.abs(Math.sin(t * s.s + s.p));
      x.globalAlpha = a; x.fillStyle = s.c; x.beginPath();
      x.arc(((s.x + px * s.d * devicePixelRatio) % W + W) % W, ((s.y + py * s.d * devicePixelRatio) % H + H) % H, s.r, 0, 6.28); x.fill();
      s.y -= s.v * devicePixelRatio; if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
    }
    if (!reduced) requestAnimationFrame(frame);
  }
  addEventListener("resize", size); size(); frame();
})();

/* ================= Lebensbaum-Karte ================= */
const CX = 1200;
const leafShape = (len = 46, w = 15) => `M0 0 C${len * .25} ${-w} ${len * .75} ${-w} ${len} 0 C${len * .75} ${w} ${len * .25} ${w} 0 0Z`;
function curve(x0, y0, x1, y1, bend = .5, vertical = false) {
  if (vertical) { const my = y0 + (y1 - y0) * bend; return `M${x0} ${y0} C${x0} ${my} ${x1} ${my} ${x1} ${y1}`; }
  const mx = x0 + (x1 - x0) * bend; return `M${x0} ${y0} C${mx} ${y0} ${x0 + (x1 - x0) * .6} ${y1} ${x1} ${y1}`;
}
/* Ein „Teil“ des Baums: Geisterlinie + wachsende Lichtlinie */
function part(d, key, cls, c, w) {
  return `<path d="${d}" class="gh ${cls}" style="stroke-width:${Math.max(1.2, w * .35)}px"/>
    <path d="${d}" class="gr ${cls}" data-p="${key}" pathLength="1" style="--c:${c};stroke-width:${w}px"/>`;
}
function buildMap() {
  const T = [...trunkIds(), "hub"], gap = 175, N = MAP.nodes = {};
  /* Koordinaten (y nach unten, Hub bei 0) */
  T.forEach((id, i) => N[id] = { x: CX + Math.sin(i * 1.3) * 18, y: (T.length - 1 - i) * gap, kind: "trunk" });
  N.hub.x = CX;
  const BP = {};
  CHAKRA_ORDER.forEach((c, i) => {
    if (c === "crown") { N.crown = { x: CX, y: -150 - 6 * 150 - 120, kind: "chakra" }; BP.crown = { x: CX, y: N.crown.y }; }
    else { const side = i % 2 ? 1 : -1, by = -150 - i * 150; BP[c] = { x: CX, y: by, side }; N[c] = { x: CX + side * 470, y: by - 190, kind: "chakra", side }; }
    const n = N[c], A = areasOf(c);
    A.forEach((a, k) => {
      const id = `a:${c}:${a.id}`;
      let ax, ay;
      if (c === "crown") { ax = CX + (k - (A.length - 1) / 2) * 330; ay = n.y - 210 - (k === 1 ? 80 : 0); }
      else { ax = n.x + n.side * 270; ay = n.y + (k - (A.length - 1) / 2) * 125 - 40; }
      N[id] = { x: ax, y: ay, kind: "area", c, a: a.id, side: n.side || 0 };
      leavesOf(c, a).forEach((L, j, arr) => {
        const lx = c === "crown" ? ax + (j - (arr.length - 1) / 2) * 70 : ax + n.side * 160;
        const ly = c === "crown" ? ay - 125 : ay + (j - (arr.length - 1) / 2) * 52;
        N[`L:${c}:${L.id}`] = { x: lx, y: ly, kind: "leaf", owner: c, eid: L.id, area: id, swapped: L.swapped, side: n.side || 0 };
      });
    });
  });
  N.integration = { x: CX, y: N.crown.y - 470, kind: "top" };
  /* Stamm-Blätter */
  trunkIds().forEach(id => {
    const st = ST[id], n = N[id], Ls = trunkLeaves(st);
    Ls.forEach((L, j) => {
      const side = j % 2 ? 1 : -1, row = Math.floor(j / 2), rows = Math.ceil(Ls.length / 2);
      N[`L:${id}:${L.id}`] = { x: n.x + side * 165, y: n.y - 30 + (row - (rows - 1) / 2) * 62, kind: "leaf", owner: id, eid: L.id, tag: L.tag, side, swapped: L.swapped };
    });
  });
  /* Verschieben, sodass alles positiv ist */
  const minY = Math.min(...Object.values(N).map(n => n.y)) - 260, maxY = Math.max(...Object.values(N).map(n => n.y)) + 330;
  Object.values(N).forEach(n => n.y -= minY);
  MAP.H = maxY - minY;
  Object.values(BP).forEach(b => b.y -= minY);

  let g = `<defs>
    <linearGradient id="trunkGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffb070"/><stop offset=".5" stop-color="#ffe6a8"/><stop offset="1" stop-color="#fff6d8"/></linearGradient>
    <filter id="mglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="uglow" filterUnits="userSpaceOnUse" x="${CX - 160}" y="-3000" width="320" height="12000"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="mblur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="16"/></filter>
    <radialGradient id="seedG"><stop offset="0" stop-color="#fff3d6"/><stop offset=".5" stop-color="#ff9a5a" stop-opacity=".5"/><stop offset="1" stop-color="#ff5a3a" stop-opacity="0"/></radialGradient>
    <radialGradient id="sunG"><stop offset="0" stop-color="#fffbe8"/><stop offset=".35" stop-color="#ffe08a" stop-opacity=".8"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
  </defs>`;
  const ck = N.checkin;
  const midY = (N.hub.y + N.crown.y) / 2;
  g += `<radialGradient id="canG"><stop offset="0" stop-color="#fff3c8" stop-opacity=".5"/><stop offset=".45" stop-color="#3ee08f" stop-opacity=".25"/><stop offset=".75" stop-color="#c77dff" stop-opacity=".15"/><stop offset="1" stop-color="#6a6bff" stop-opacity="0"/></radialGradient><ellipse id="canopy" cx="${CX}" cy="${midY - 80}" rx="1150" ry="${(N.hub.y - N.crown.y) / 2 + 420}" fill="url(#canG)" opacity="0"/>`;
  /* Erd-Glühen & Wurzeln */
  g += `<ellipse cx="${ck.x}" cy="${ck.y + 120}" rx="420" ry="90" fill="#ff7a3a" opacity=".07" filter="url(#mblur)" class="earth"/>`;
  [[-260, 150], [-170, 210], [-80, 240], [70, 235], [165, 205], [255, 150], [-330, 90], [330, 95]].forEach(([dx, dy], i) => {
    g += part(`M${ck.x} ${ck.y + 20} C${ck.x + dx * .2} ${ck.y + dy * .6} ${ck.x + dx * .7} ${ck.y + dy * .7} ${ck.x + dx} ${ck.y + dy}`, "root" + i, "root-line", "#ffb070", 5 - Math.abs(dx) / 110);
  });
  /* Stamm */
  for (let i = 0; i < T.length - 1; i++) {
    const a = N[T[i]], b = N[T[i + 1]];
    g += part(curve(a.x, a.y, b.x, b.y, .5, true), "t:" + T[i], "trunk", "url(#trunkGrad)", 22 - i * 1.4);
  }
  /* oberer Stamm (Mitteltrieb) */
  const ups = [N.hub, ...CHAKRA_ORDER.slice(0, 6).map(c => BP[c]), N.crown];
  for (let i = 0; i < ups.length - 1; i++) g += part(curve(ups[i].x, ups[i].y, ups[i + 1].x, ups[i + 1].y, .5, true), "u:" + i, "trunk upper", "#ffe6a8", 9 - i * .8);
  g += part(curve(N.crown.x, N.crown.y, N.integration.x, N.integration.y, .5, true), "top", "trunk upper", "#ffe08a", 4);
  /* Äste */
  CHAKRA_ORDER.forEach(c => {
    const col = CHAKRAS[c].color, n = N[c];
    if (c !== "crown") g += part(`M${BP[c].x} ${BP[c].y} C${BP[c].x + n.side * 130} ${BP[c].y - 30} ${n.x - n.side * 230} ${n.y + 80} ${n.x} ${n.y}`, "b:" + c, "branch", col, 10);
    areasOf(c).forEach(a => {
      const an = N[`a:${c}:${a.id}`];
      g += part(c === "crown" ? curve(n.x, n.y, an.x, an.y, .55, true) : curve(n.x, n.y, an.x, an.y, .45), "ar:" + c + ":" + a.id, "twig", col, 5);
      leavesOf(c, a).forEach(L => { const ln = N[`L:${c}:${L.id}`]; g += part(c === "crown" ? curve(an.x, an.y, ln.x, ln.y + 22, .5, true) : curve(an.x, an.y, ln.x - n.side * 2, ln.y, .5), "lf:" + c + ":" + L.id, "stem", col, 2.5); });
    });
  });
  trunkIds().forEach(id => { const n = N[id]; Object.entries(N).filter(([k, v]) => v.kind === "leaf" && v.owner === id).forEach(([k, v]) => {
    g += part(`M${n.x + v.side * 26} ${n.y - 6} C${n.x + v.side * 80} ${n.y - 20} ${v.x - v.side * 60} ${v.y} ${v.x} ${v.y}`, "lf:" + id + ":" + v.eid, "stem", ST[id].color, 2.5); }); });
  /* Blätter */
  Object.entries(N).filter(([, v]) => v.kind === "leaf").forEach(([k, v]) => {
    const ex = EXERCISES[v.eid], col = isChakra(v.owner) ? CHAKRAS[v.owner].color : ST[v.owner].color;
    const up = v.owner === "crown", rot = up ? -90 : v.side < 0 ? 180 : 0;
    const t = ex.title.length > 24 ? ex.title.split(/ [–&(]/)[0] : ex.title;
    const tx = up ? 0 : v.side * 58, ty = up ? -62 : 0, anchor = up ? "middle" : v.side < 0 ? "end" : "start";
    g += `<g class="m-leaf" data-node="${k}" data-key="${v.owner}:${v.eid}" style="--c:${col}" transform="translate(${v.x} ${v.y})" tabindex="0" role="button" aria-label="Übung: ${esc(ex.title)}">
      <path d="${leafShape()}" transform="rotate(${rot})" class="leaf"/>
      <path d="M0 0 L40 0" transform="rotate(${rot})" class="vein"/>
      <text x="${tx}" y="${ty - 4}" text-anchor="${anchor}" class="lt">${esc(t)}</text>
      <text x="${tx}" y="${ty + 13}" text-anchor="${anchor}" class="ls">${ex.minutes} min${v.tag === "over" ? " · bei Unruhe" : v.tag === "under" ? " · bei Erschöpfung" : ""}</text></g>`;
  });
  /* Unteräste (Bereiche) */
  CHAKRA_ORDER.forEach(c => areasOf(c).forEach(a => {
    const id = `a:${c}:${a.id}`, n = N[id], col = CHAKRAS[c].color;
    const up = c === "crown";
    g += `<g class="m-area" data-node="${id}" style="--c:${col}" transform="translate(${n.x} ${n.y})" tabindex="0" role="button" aria-label="Unterast ${esc(a.title)}">
      <circle r="13" class="ac"/><text y="${up ? 34 : -22}" class="at">${esc(a.title)}</text></g>`;
  }));
  /* Knoten */
  const nodeSvg = (id, n, col, R, ico, lbl, sub, extra = "") => `<g class="m-node ${n.kind}" data-node="${id}" style="--c:${col}" transform="translate(${n.x} ${n.y})" tabindex="0" role="button" aria-label="${esc(lbl)}">
      <circle r="${R * 2.3}" fill="${col}" opacity=".16" filter="url(#mblur)" class="halo"/>${extra}
      <circle r="${R}" class="core" stroke="${col}"/>
      <circle r="${R - 7}" fill="${col}" class="fillc"/>
      <text class="ico" style="font-size:${ico.length > 2 ? 15 : 22}px">${esc(ico)}</text>
      <text class="lbl" y="${R + 25}">${esc(lbl)}</text>${sub ? `<text class="sub" y="${R + 42}">${esc(sub)}</text>` : ""}
      <g class="stmark"></g></g>`;
  trunkIds().forEach(id => { const st = ST[id]; g += nodeSvg(id, N[id], st.color, id === "checkin" ? 34 : 38, st.icon, id === "checkin" ? "Check-in" : st.title, id === "checkin" ? "Samen" : "Stamm"); });
  g += nodeSvg("hub", N.hub, "#ffe08a", 46, "✺", "Verzweigung", "Baumkrone", `<circle r="78" class="hub-ring"/>`);
  CHAKRA_ORDER.forEach(c => {
    const ch = CHAKRAS[c];
    const petals = Array.from({ length: 8 }, (_, i) => `<ellipse rx="13" ry="30" cy="-46" transform="rotate(${i * 45})" class="petal"/>`).join("");
    g += nodeSvg(c, N[c], ch.color, 40, ch.mantra, ch.name, ch.skt, `<g class="blossom">${petals}</g><circle r="60" class="rec-ring"/>`);
  });
  g += `<circle cx="${N.integration.x}" cy="${N.integration.y}" r="260" fill="url(#sunG)" class="sun" opacity=".18"/>`;
  g += nodeSvg("integration", N.integration, "#fde68a", 50, "❂", "Integration", "Wipfel · Mitte");
  $("#cam").innerHTML = g;
  $$("#cam [data-node]").forEach(el => {
    el.addEventListener("click", e => { if (MAP.dragged) return; e.stopPropagation(); clickNode(el.dataset.node); });
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); clickNode(el.dataset.node); } });
  });
  refreshMap(true);
}
function clickNode(id) {
  const n = MAP.nodes[id]; if (!n) return;
  if (!S.mode) { Sound.init(); S.mode = "solo"; S.started = Date.now(); }
  if (n.kind === "leaf") {
    if (isChakra(n.owner)) return go(n.area);
    return go(`x:${n.owner}:${n.eid}`);
  }
  go(id);
}
function refreshMap(initial) {
  const on = (key, v) => { const el = $(`[data-p="${CSS.escape(key)}"]`); if (el) el.classList.toggle("on", !!v); };
  const T = [...trunkIds(), "hub"];
  const reached = id => !!(S.visited[id] || statusOf(id));
  T.slice(0, -1).forEach((id, i) => on("t:" + id, statusOf(id)));
  for (let i = 0; i < 8; i++) on("root" + i, S.started && S.phase !== "welcome" || statusOf("checkin"));
  const hubOn = !!S.scan;
  for (let i = 0; i < 7; i++) on("u:" + i, hubOn);
  on("top", S.finished);
  CHAKRA_ORDER.forEach(c => {
    on("b:" + c, reached(c));
    areasOf(c).forEach(a => {
      const Ls = leavesOf(c, a);
      on("ar:" + c + ":" + a.id, Ls.some(L => leafDone(c, L.id)) || S.node === `a:${c}:${a.id}`);
      Ls.forEach(L => on("lf:" + c + ":" + L.id, leafDone(c, L.id)));
    });
  });
  trunkIds().forEach(id => trunkLeaves(ST[id]).forEach(L => on("lf:" + id + ":" + L.id, leafDone(id, L.id))));
  $$(".m-leaf").forEach(el => el.classList.toggle("done", !!S.leaves[el.dataset.key]));
  const rec = S.scan ? recommended().all : [];
  $$(".m-node, .m-area").forEach(el => {
    const id = el.dataset.node, st = statusOf(id);
    el.classList.toggle("now", id === S.node && S.phase !== "welcome");
    el.classList.toggle("reached", reached(id) || (id === "hub" && hubOn) || (id === "integration" && !!S.finished));
    el.classList.toggle("bloom", st === "free" || st === "resolved");
    el.classList.toggle("moving", st === "moving");
    el.classList.toggle("rec", rec.includes(id) && !st);
    if (el.classList.contains("m-area")) { const [, c, a] = id.split(":"); el.classList.toggle("reached", leavesOf(c, areaById(c, a)).some(L => leafDone(c, L.id))); }
    const mk = el.querySelector(".stmark");
    if (mk) mk.innerHTML = st ? `<circle cx="32" cy="-32" r="12" fill="${st === "moving" ? "#ffb347" : st === "skipped" ? "#777" : "#3ee08f"}"/><text x="32" y="-32" class="mk">${st === "moving" ? "↻" : st === "skipped" ? "–" : "✓"}</text>` : "";
  });
  $$(".m-leaf.cur").forEach(x => x.classList.remove("cur"));
  const cnp = $("#canopy"); if (cnp) cnp.setAttribute("opacity", (S.scan ? .06 : 0) + CHAKRA_ORDER.filter(c => ["free", "resolved"].includes(statusOf(c))).length * .05 + Object.keys(S.leaves).length * .006);
  /* Fortschritt in der Kopfzeile */
  const tDone = trunkIds().filter(id => statusOf(id)).length, tAll = trunkIds().length;
  const leavesAll = Object.keys(S.leaves).length;
  const bloom = CHAKRA_ORDER.filter(c => ["free", "resolved"].includes(statusOf(c))).length;
  $("#progress").innerHTML = S.phase === "welcome" ? "" : `<span class="prog-item" title="Stamm"><i class="pi-trunk"></i>Stamm ${tDone}/${tAll}</span><span class="prog-item" title="Leuchtende Blätter"><i class="pi-leaf"></i>${leavesAll} Blätter</span><span class="prog-item" title="Blühende Äste"><i class="pi-bloom"></i>${bloom}/7 Äste</span>
    <span class="sr-only">Aktuell: ${esc(S.node ? nodeTitle(S.node) : "")}</span>`;
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
function baseScale() { return innerWidth <= 520 ? .5 : innerWidth <= 900 ? .6 : Math.min(1, innerHeight / 950); }
function focusNode(dur = 1300) {
  const id = S.node; if (!id) return;
  let n = MAP.nodes[id.startsWith("x:") ? "L:" + id.slice(2) : id]; if (!n) return;
  let x = n.x, y = n.y, s = baseScale();
  if (n.kind === "chakra" && n.side) x += n.side * 190;
  if (n.kind === "area" && n.side) x += n.side * 60;
  if (id === "hub") { const top = MAP.nodes.crown.y - 200, [cx] = viewCenter(); y = (n.y + top) / 2; s = Math.min((innerHeight - 150) / (n.y - top + 120), (cx * 2 - 40) / 1900); }
  if (n.kind === "trunk") s *= 1.05;
  return camTo(x, y, s, dur);
}
let overview = false;
function showWholeTree(dur = 1200) {
  const [cx] = viewCenter(); const s = Math.min((innerHeight - 110) / MAP.H, (cx * 2 - 30) / MAP.W);
  return camTo(MAP.W / 2, MAP.H / 2, s, dur);
}
function toggleOverview() { overview = !overview; if (overview) showWholeTree(); else focusNode(1000); }
/* Ziehen / Zoomen der Karte */
(function panzoom() {
  const svg = $("#map"); let drag = null;
  svg.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y }; MAP.dragged = false; cam.tx = null; });
  svg.addEventListener("pointermove", e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 6) MAP.dragged = true;
    if (MAP.dragged) { cam.x = drag.cx + dx; cam.y = drag.cy + dy; applyCam(); } });
  addEventListener("pointerup", () => { drag = null; setTimeout(() => MAP.dragged = false, 0); });
  svg.addEventListener("wheel", e => { e.preventDefault(); cam.tx = null; const k = Math.exp(-e.deltaY * .0012); const ns = Math.max(.12, Math.min(3, cam.s * k));
    cam.x = e.clientX - (e.clientX - cam.x) * ns / cam.s; cam.y = e.clientY - (e.clientY - cam.y) * ns / cam.s; cam.s = ns; applyCam(); }, { passive: false });
})();

/* ================= Navigation ================= */
function defaultPhase(id) {
  if (id === "checkin") return statusOf("checkin") ? "checkin3" : "checkin1";
  if (id === "hub") return S.scan ? "hub" : "scan";
  if (id.startsWith("a:")) return "area";
  if (id.startsWith("x:")) return "leaf";
  if (id === "integration") return S.finished ? "summary" : "int";
  const st = ST[id]; if (!st) return "station";
  if (st.kind === "ritual") return "station";
  const r = S.results[id] || {};
  if (r.status) return "stdone";
  if (r.first && r.first !== "free") return st.chakra ? "areas" : "route";
  return "test-intro";
}
function go(id, phase, opts = {}) {
  if (EXR) closeExercise(false, true);
  S.node = id; S.phase = phase || defaultPhase(id);
  if (id === "integration" && S.phase === "int" && !opts.keepInt) S.intStep = S.intStep || 0;
  if (!opts.fromHistory) { const h = "#/" + id; if (location.hash !== h) history.pushState({ id }, "", h); }
  overview = false;
  render(); focusNode();
}
addEventListener("popstate", () => {
  const id = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
  if (!id) { S.phase = "welcome"; render(); return; }
  if (validNode(id) && S.mode) go(id, null, { fromHistory: true });
});
function validNode(id) { return ORDER().includes(id) || (id.startsWith("x:") && !!MAP.nodes["L:" + id.slice(2)]); }
function step(dir) {
  const O = ORDER(); let cur = S.node || O[0];
  if (cur.startsWith("x:")) cur = cur.split(":")[1];
  const i = O.indexOf(cur); const j = Math.max(0, Math.min(O.length - 1, i + dir));
  if (j !== i || S.phase === "welcome") go(O[j]);
}
function nextAfter(id) { const T = trunkIds(); const i = T.indexOf(id); return i >= 0 && i < T.length - 1 ? T[i + 1] : "hub"; }
function updateNav() {
  const inApp = S.phase !== "welcome" && S.mode;
  $("#navBar").hidden = !inApp;
  if (!inApp) return;
  const O = ORDER(); let cur = S.node || ""; if (cur.startsWith("x:")) cur = cur.split(":")[1];
  const i = O.indexOf(cur);
  $("#prevBtn").disabled = i <= 0; $("#nextBtn").disabled = i >= O.length - 1;
  $("#prevBtn").title = i > 0 ? "Zurück: " + nodeTitle(O[i - 1]) : "";
  $("#nextBtn").title = i < O.length - 1 ? "Weiter: " + nodeTitle(O[i + 1]) : "";
  const inBranch = isChakra(cur) || cur.startsWith("a:");
  $("#treeBtn").classList.toggle("glow", inBranch);
  $("#navWhere").textContent = nodeTitle(S.node || "");
}

/* ================= Panel-Rendering ================= */
const panel = $("#panel");
function show(html, color) {
  panel.classList.remove("anim"); void panel.offsetWidth;
  panel.style.setProperty("--c", color || "#c77dff");
  panel.innerHTML = html; panel.scrollTop = 0; panel.classList.add("anim");
  const h = panel.querySelector("h1,h2"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
}
function render() {
  if (S.node) S.visited[S.node] = true;
  save(); refreshMap(); updateNav();
  if (S.phase === "welcome" || !S.mode) return renderWelcome();
  const id = S.node;
  if (id === "checkin") return renderCheckin();
  if (id === "hub") return S.phase === "scan" ? renderScan() : renderHub();
  if (id.startsWith("a:")) return renderArea(id);
  if (id.startsWith("x:")) return renderLeaf(id);
  if (id === "integration") return S.phase === "summary" ? renderSummary() : renderIntegration();
  const st = ST[id];
  if (st.kind === "ritual") return renderRitual(st);
  return renderTest(st);
}
const banner = (img, c) => img ? `<div class="st-banner" style="--c:${c};background-image:url(img/${img}.webp)"></div>` : "";
const treeBack = () => `<button class="btn ghost tree-back" data-go="hub">🌳 Zurück zum Baum</button>`;
function bindGo() { $$("[data-go]", panel).forEach(b => b.onclick = () => go(b.dataset.go)); }

/* ---------- Willkommen ---------- */
function renderWelcome() {
  const hist = JSON.parse(localStorage.getItem(HKEY) || "[]");
  show(`<div class="hero-img" style="background-image:url(img/tree-hero.webp)"></div>
    <p class="kicker">Eine geführte Reise in deine Mitte</p>
    <h1>Lass deinen Lebensbaum leuchten.</h1>
    <p class="lead">Zuerst wächst der <b>Stamm</b> – für alle gleich: ankommen und erden, Nervensystem regulieren, Geist beruhigen, energetisieren, entspannen. Von dort wachsen die sieben <b>Chakren als Äste</b>. Du gehst gezielt in die, die dich heute rufen. Jede Übung ist ein <b>Blatt</b>, das grün aufleuchtet, wenn du es geschafft hast.</p>
    <div class="mode-cards">
      <button class="mode" data-mode="solo" style="--c:#c77dff"><span class="glyph">✦</span><b>Allein</b><span>Dein persönlicher Baum – von der Wurzel bis zur Krone.</span></button>
      <button class="mode" data-mode="couple" style="--c:#ff9ecb"><span class="glyph">❀</span><b>Als Paar</b><span>Ein gemeinsamer Baum – mit Ritualen nach Margot Anand.</span></button>
    </div>
    ${S.started && S.mode && S.node ? `<button class="btn ghost block" id="resume">↻ Begonnene Reise fortsetzen (${esc(nodeTitle(S.node))})</button>` : ""}
    <ul class="feature-list">
      <li>Stamm mit 5 Stationen, 7 Äste mit 20 Unterästen, über 40 Übungen aus Yoga, Tantra, Schamanismus, Embodiment und Atemforschung</li>
      <li>Mini-Test → passende Übung → Re-Test. Jede Übung max. 10 Minuten, mit Stimme, Timer, Atem-Animation und Klang</li>
      <li>Frei navigieren: jeden Punkt im Baum anklicken, mit ◀ ▶ oder den Pfeiltasten vor und zurück</li>
      <li>Sicherheits-Check: intensive Techniken werden bei Risiken automatisch ersetzt</li>
      <li>Dein Fortschritt wird nur lokal auf diesem Gerät gespeichert</li>
    </ul>
    <p class="small">Dieses Tool ist eine Einladung zur Selbsterfahrung. Es ersetzt keine ärztliche, psychotherapeutische oder heilkundliche Behandlung.</p>
    ${hist.length ? `<div class="history"><h3>Deine bisherigen Reisen</h3><ul>${hist.slice(-5).reverse().map(h => `<li>${new Date(h.date).toLocaleDateString("de-DE")} · ${h.mode === "couple" ? "Paar" : "Allein"} · ${esc(h.intention || "ohne Absicht")} · Energie ${h.b} → ${h.a}${h.leaves ? " · " + h.leaves + " Blätter" : ""}</li>`).join("")}</ul></div>` : ""}`);
  $$("[data-mode]", panel).forEach(b => b.onclick = () => { Sound.init(); const m = b.dataset.mode; S = fresh(); S.mode = m; S.started = Date.now(); buildMap(); go("checkin"); });
  const r = $("#resume"); if (r) r.onclick = () => { Sound.init(); buildMap(); go(S.node); };
  Narrator.play(["ui_welcome"]);
  setTimeout(() => showWholeTree(1800), 50);
}

/* ---------- Check-in ---------- */
function slider(id, label, lo, hi, v) {
  return `<div class="slider"><div class="top"><span>${label}</span><b id="${id}V">${v}</b></div>
    <input type="range" min="0" max="10" value="${v}" id="${id}" aria-label="${label}">
    <div class="ends"><span>${lo}</span><span>${hi}</span></div></div>`;
}
function renderCheckin() {
  const c = couple(), col = ST.checkin.color;
  if (S.phase === "checkin1") {
    show(`<p class="kicker">Der Samen · Check-in</p><h2>${c ? "Willkommen, ihr zwei." : "Willkommen."}</h2>
      <p>Nimm dir einen Moment. Wo bist du gerade – und wohin möchtest du heute?</p>
      ${c ? `<div class="row"><div style="flex:1"><label for="n1">Name A</label><input type="text" id="n1" value="${esc(S.names[0])}" placeholder="z. B. Alex"></div>
             <div style="flex:1"><label for="n2">Name B</label><input type="text" id="n2" value="${esc(S.names[1])}" placeholder="z. B. Mira"></div></div>`
          : `<label for="n1">Dein Name (optional)</label><input type="text" id="n1" value="${esc(S.names[0])}" placeholder="Wie möchtest du genannt werden?">`}
      <label>${c ? "Eure Absicht für diese Reise" : "Deine Absicht für diese Reise"}</label>
      <div class="chips">${INTENTIONS.filter(i => c || !i.includes("Partner")).map(i => `<button class="chip" aria-pressed="${S.chips.includes(i)}">${i}</button>`).join("")}</div>
      <label for="intent">In eigenen Worten (optional)</label>
      <textarea id="intent" placeholder="Ich wünsche mir …">${esc(S.intention)}</textarea>
      <div class="row" style="margin-top:18px"><button class="btn" id="next">Weiter</button></div>`, col);
    $$(".chip", panel).forEach(b => b.onclick = () => { const v = b.textContent; const on = S.chips.includes(v); S.chips = on ? S.chips.filter(x => x !== v) : [...S.chips, v]; b.setAttribute("aria-pressed", !on); });
    Narrator.play([c ? "ui_checkin1c" : "ui_checkin1"]);
    $("#next").onclick = () => { S.names = [$("#n1").value.trim(), c ? $("#n2").value.trim() : ""]; S.intention = $("#intent").value.trim(); S.phase = "checkin2"; render(); };
  } else if (S.phase === "checkin2") {
    show(`<p class="kicker">Check-in · Momentaufnahme</p><h2>Wie geht es ${c ? "euch" : "dir"} gerade?</h2>
      <p class="muted">${c ? "Schätzt gemeinsam ein (oder nehmt den Durchschnitt)." : "Spontan, ohne nachzudenken."} Am Ende vergleichen wir.</p>
      ${slider("sEnergy", "Energie", "leer", "sprühend", S.before.energy)}
      ${slider("sCalm", "Innere Ruhe", "aufgewühlt", "still", S.before.calm)}
      ${slider("sBody", "Im Körper sein", "nur im Kopf", "ganz verkörpert", S.before.body)}
      ${slider("sConnect", c ? "Verbindung miteinander" : "Verbindung mit mir selbst", "getrennt", "tief verbunden", S.before.connect)}
      <div class="row" style="margin-top:18px"><button class="btn ghost" id="back">Zurück</button><button class="btn" id="next">Weiter</button></div>`, col);
    Narrator.play([c ? "ui_checkin2c" : "ui_checkin2"]);
    [["sEnergy", "energy"], ["sCalm", "calm"], ["sBody", "body"], ["sConnect", "connect"]].forEach(([id, k]) => { const el = $("#" + id); el.oninput = () => { $("#" + id + "V").textContent = el.value; S.before[k] = +el.value; }; });
    $("#back").onclick = () => { S.phase = "checkin1"; render(); };
    $("#next").onclick = () => { S.phase = "checkin3"; render(); };
  } else {
    show(`<p class="kicker">Check-in · Sicherheit</p><h2>Achtsam mit ${c ? "euch" : "dir"} sein</h2>
      <p>Einige Übungen arbeiten mit kräftigem Atem, Bewegung oder intensiven Gefühlen. Kreuze an, was ${c ? "auf einen von euch" : "auf dich"} zutrifft – das Tool wählt dann automatisch sanfte Alternativen.</p>
      ${SAFETY.map(s => `<label class="check"><input type="checkbox" data-s="${s.id}" ${S.safety[s.id] ? "checked" : ""}> <span>${s.label}</span></label>`).join("")}
      <div class="note warn"><b>Wichtig:</b> Diese Reise ist Selbsterfahrung, keine medizinische oder psychotherapeutische Behandlung. Du bestimmst das Tempo. Augen offen lassen, pausieren oder abbrechen ist jederzeit richtig. Bei Schmerz, Schwindel oder Überwältigung: stoppen, Füße spüren, ruhig atmen.</div>
      <p class="small">In einer akuten Krise: Telefonseelsorge (kostenlos, 24 h) 0800 111 0 111 oder 0800 111 0 222 · Notruf 112.</p>
      <div class="row" style="margin-top:14px"><button class="btn ghost" id="back">Zurück</button><button class="btn" id="next">Den Baum wachsen lassen ✦</button></div>`, col);
    Narrator.play([c ? "ui_checkin3c" : "ui_checkin3"]);
    $$("[data-s]", panel).forEach(b => b.onchange = () => { S.safety[b.dataset.s] = b.checked; });
    $("#back").onclick = () => { S.phase = "checkin2"; render(); };
    $("#next").onclick = () => { S.results.checkin = { status: "free", path: [] }; buildMap(); go(nextAfter("checkin")); };
  }
}

/* ---------- Ritual-Station (Ankommen, Heiliger Raum) ---------- */
function renderRitual(st) {
  const eid = couple() && st.cex ? st.cex : st.ex, c = colorOf(st);
  const done = statusOf(st.id);
  show(`${banner(st.img || (st.id === "sacred" ? "pose-c-face" : ""), c)}
    <div class="st-head"><div class="st-orb" style="--c:${c}">${esc(st.icon)}</div><div><p class="kicker">Stamm · ${st.id === "sacred" ? "Paar-Ritual" : "Wurzelboden"}</p><h2>${esc(st.title)}</h2></div></div>
    <p class="lead">${esc(st.note || "")}</p>
    ${routeCard(eid, c)}
    ${done ? `<p><span class="result-badge rb-free">✓ Blatt leuchtet</span></p><button class="btn block" id="go">Weiter den Stamm hinauf ↑</button><button class="linkish" id="again">Übung noch einmal</button>`
      : `<button class="btn block" id="open">Übung beginnen</button><button class="linkish" id="skip">Station überspringen</button>`}`, c);
  Narrator.play(done ? [] : ["st_" + st.id + "_note"]);
  const run = () => openExercise(st.id, eid, () => { markLeaf(st.id, eid); S.results[st.id].status = "free"; save(); render(); });
  if (done) { $("#go").onclick = () => go(nextAfter(st.id)); $("#again").onclick = run; }
  else { $("#open").onclick = run; $("#skip").onclick = () => { R(st.id).status = "skipped"; go(nextAfter(st.id)); }; }
}
function routeCard(eid, c, swapped, extra = "") {
  const ex = EXERCISES[eid];
  return `<div class="route-card ${extra}" style="--c:${c}"><div class="illu-mini">${Illu.thumb(ex)}</div>
    <div><p class="kicker" style="margin:0">${ex.couple ? "Paar-Übung" : "Übung"} · ${ex.minutes} min · ${ex.intensity}</p><h3 style="margin:4px 0">${esc(ex.title)}</h3>
    <p class="small" style="margin:0">${esc(ex.intro)}</p>
    ${swapped ? `<p class="small" style="margin:6px 0 0;color:#ffd59a">Sanfte Alternative zu „${esc(EXERCISES[swapped].title)}“ – wegen deines Sicherheits-Checks.</p>` : ""}</div></div>`;
}

/* ---------- Test-Station (Stamm & Äste) ---------- */
const RETEST_OK = "Spürst du es? Etwas hat sich gelöst. Nimm dir einen Atemzug, um diese Veränderung bewusst zu würdigen.";
const RETEST_MOVING = "Manches braucht mehr Zeit als eine Übung. Das ist kein Scheitern: Du hast Energie in Bewegung gebracht, und sie arbeitet weiter. Vielleicht nimmst du diese Übung in den nächsten Tagen mit.";
function renderTest(st) {
  const c = colorOf(st), t = st.test, ch = st.chakra ? CHAKRAS[st.chakra] : null, r = R(st.id);
  const where = ch ? `Ast · ${ch.skt} · ${ch.element}` : "Stamm";
  const head = `${banner(ch ? "chakra-" + st.chakra : st.img, c)}<div class="st-head"><div class="st-orb" style="--c:${c}">${esc(ch ? ch.mantra : st.icon)}</div><div><p class="kicker">${where}</p><h2>${esc(st.title)}</h2></div></div>`;
  const back = ch ? treeBack() : "";
  if (S.phase === "test-intro" || S.phase === "retest") {
    const re = S.phase === "retest";
    show(`${head}
      ${re ? `<p class="kicker" style="color:#9fe7ff">Re-Test</p><p>Spür noch einmal nach – genauso wie vorhin. Was hat sich verändert?</p>` : `<p class="lead">${esc(t.intro)}</p>${ch ? `<p class="small">Thema: ${esc(ch.theme)}</p>` : ""}`}
      <h3>Mini-Test${couple() ? " – macht ihn beide, jede*r für sich" : ""}</h3>
      <ol class="steps-do">${t.do.map(x => `<li>${esc(x)}</li>`).join("")}</ol>
      ${t.dot ? `<div class="dot-target" aria-hidden="true"><i></i></div>` : ""}
      <div class="mini-timer"><svg class="ring" viewBox="0 0 80 80"><circle class="bg" cx="40" cy="40" r="34"/><circle class="fg" id="mtFg" cx="40" cy="40" r="34" stroke-dasharray="213.6" stroke-dashoffset="0"/><text x="40" y="41" id="mtT">${t.timer}s</text></svg>
        <div><button class="btn" id="mtGo">▶ Test starten</button><div class="small" style="margin-top:6px">Oder direkt antworten, wenn du schon fertig bist.</div></div></div>
      <h3 style="margin-top:18px">${esc(couple() ? t.qc : t.q)}</h3>
      <div class="opts">${t.opts.map((o, i) => `<button class="opt" data-i="${i}">${esc(couple() && o.lc ? o.lc : o.l)}</button>`).join("")}</div>
      <div class="row"><button class="linkish" id="skip">${ch ? "Diesen Ast auslassen" : "Station überspringen"}</button>${back}</div>`, c);
    bindGo();
    let timer = null, started = false;
    const cc = couple() ? "c" : "";
    const freq = CHAKRAS[st.chakra || "heart"].freq * 2;
    const startTimer = manual => {
      if (started) return; started = true;
      if (manual) Narrator.stop();
      Sound.bell(freq, .15);
      let left = t.timer; const fg = $("#mtFg"), tt = $("#mtT"); $("#mtGo").disabled = true; $("#mtGo").textContent = "… Test läuft";
      timer = setInterval(() => { if (!document.body.contains(fg)) return clearInterval(timer); left--; tt.textContent = left + "s"; fg.style.strokeDashoffset = 213.6 * (1 - left / t.timer);
        if (left <= 0) { clearInterval(timer); Sound.bell(freq, .2); tt.textContent = "✓"; panel.querySelector(".opts").scrollIntoView({ behavior: "smooth", block: "center" });
          Narrator.play([`st_${st.id}_q${cc}`]); } }, 1000);
    };
    $("#mtGo").onclick = () => startTimer(true);
    Narrator.play([re ? "ui_retest" : `st_${st.id}_intro`, `st_${st.id}_do${cc}`], { onEnd: () => { const btn = $("#mtGo"); if (btn) setTimeout(() => { if (document.body.contains(btn)) startTimer(false); }, 1200); } });
    $$(".opt", panel).forEach(b => b.onclick = () => { clearInterval(timer); answer(st, t.opts[+b.dataset.i].r); });
    $("#skip").onclick = () => { clearInterval(timer); r.status = "skipped"; ch ? go("hub") : go(nextAfter(st.id)); };
  } else if (S.phase === "route") {
    const route = routeFor(st, r.first), att = Math.min(r.attempt || 0, route.length - 1), stp = route[att];
    const second = att >= 1;
    show(`${head}
      <p><span class="result-badge rb-moving">${r.first === "over" ? "Übererregt" : r.first === "under" ? "Untererregt" : "Hier stockt es"}</span></p>
      <p>${second ? "Es hat sich noch nicht ganz gelöst. Das ist völlig in Ordnung – Energie braucht manchmal einen anderen Zugang. Probier diese Alternative:" : couple() ? "Euer Weg führt euch zu diesem Blatt:" : "Dein Weg führt dich zu diesem Blatt:"}</p>
      ${routeCard(stp.id, c, stp.swapped)}
      <button class="btn block" id="open">Übung beginnen</button>
      ${route.length > 1 ? `<p class="small">Andere Blätter an dieser Station: ${route.filter(x => x.id !== stp.id).map(x => `<button class="linkish inline" data-leaf="${x.id}">${esc(EXERCISES[x.id].title)}</button>`).join(" · ")}</p>` : ""}
      <button class="linkish" id="skip">Übung auslassen und weitergehen</button>`, c);
    Narrator.play([second ? "ui_route2" : couple() ? "ui_routec" : "ui_route", "ex_" + stp.id + "_intro"]);
    highlightLeaf(st.id, stp.id);
    const doEx = eid => openExercise(st.id, eid, () => { markLeaf(st.id, eid); r.attempt = (r.attempt || 0) + 1; S.phase = "retest"; render(); });
    $("#open").onclick = () => doEx(stp.id);
    $$("[data-leaf]", panel).forEach(b => b.onclick = () => doEx(b.dataset.leaf));
    $("#skip").onclick = () => { r.status = "moving"; go(nextAfter(st.id)); };
  } else if (S.phase === "areas") {
    renderAreas(st);
  } else { /* stdone */
    const msg = { free: couple() ? "Hier fließt es bei euch. Wunderbar!" : "Hier fließt es. Wunderbar!", resolved: RETEST_OK, moving: RETEST_MOVING, skipped: "Diese Station hast du ausgelassen. Du kannst jederzeit zurückkommen." }[r.status];
    show(`${head}
      <p><span class="result-badge rb-${r.status}">${{ free: "✓ frei", resolved: "✓ gelöst", moving: "↻ in Bewegung", skipped: "– ausgelassen" }[r.status]}</span></p>
      <p class="lead">${esc(msg)}</p>
      ${r.path && r.path.length ? `<p class="small">Deine Blätter hier: ${r.path.map(e => esc(EXERCISES[e].title)).join(" · ")}</p>` : ""}
      ${ch ? `${r.status === "free" || r.status === "resolved" ? `<p class="small">Dein Ast blüht jetzt in seiner Farbe.</p>` : ""}
             <button class="btn block" data-go="hub">🌳 Zurück zum Baum – nächsten Ast wählen</button>
             <button class="linkish" id="more">Weitere Blätter an diesem Ast</button>`
        : `<button class="btn block" id="go">${nextAfter(st.id) === "hub" ? "Zur Baumkrone ↑" : "Weiter den Stamm hinauf ↑"}</button>`}
      <button class="linkish" id="redo">Test wiederholen</button>`, c);
    bindGo();
    Narrator.play(r.status === "free" ? [couple() ? "ui_freec" : "ui_free"].concat(ch ? ["ui_branchdone"] : []) : r.status === "skipped" ? [] : ["ui_" + r.status].concat(ch ? ["ui_branchdone"] : []));
    if (!ch) $("#go").onclick = () => go(nextAfter(st.id));
    else $("#more").onclick = () => { S.phase = "areas"; render(); };
    $("#redo").onclick = () => { delete r.status; S.phase = "test-intro"; render(); };
    if (r.status === "free" || r.status === "resolved") Sound.bell(CHAKRAS[st.chakra || "heart"].freq * 2, .14);
  }
}
function answer(st, res) {
  const r = R(st.id);
  if (S.phase === "test-intro") {
    r.first = res; r.attempt = 0;
    if (res === "free") { r.status = "free"; S.phase = "stdone"; }
    else S.phase = st.chakra ? "areas" : "route";
    return render();
  }
  /* Re-Test */
  const max = st.chakra ? 2 : routeFor(st, r.first || res).length;
  if (res === "free") { r.status = "resolved"; S.phase = "stdone"; }
  else if ((r.attempt || 0) >= Math.min(2, max)) { r.status = "moving"; S.phase = "stdone"; }
  else { if (!st.chakra && res !== "blocked" && res !== r.first && routeFor(st, res).length) r.first = res; if (!r.first || r.first === "free") r.first = res; S.phase = st.chakra ? "areas" : "route"; }
  render();
}
/* Unteräste eines Chakra-Astes zur Auswahl */
function renderAreas(st) {
  const c = st.chakra, ch = CHAKRAS[c], r = R(c), col = ch.color;
  const A = areasOf(c);
  const recA = A.find(a => !leavesOf(c, a).every(L => leafDone(c, L.id))) || A[0];
  const second = (r.attempt || 0) >= 1;
  show(`${banner("chakra-" + c, col)}<div class="st-head"><div class="st-orb" style="--c:${col}">${esc(ch.mantra)}</div><div><p class="kicker">Ast · ${ch.skt}</p><h2>${esc(ch.name)}</h2></div></div>
    ${r.first && r.first !== "free" ? `<p><span class="result-badge rb-moving">${second ? "↻ noch in Bewegung" : "Hier stockt es"}</span></p>` : ""}
    <p>${second ? "Es hat sich noch nicht ganz gelöst. Vielleicht ruft dich ein anderer Zweig dieses Astes:" : "Dieser Ast teilt sich in Zweige – verschiedene Lebensbereiche dieses Zentrums. Welcher spricht dich an?"}</p>
    <div class="area-list">${A.map(a => { const Ls = leavesOf(c, a), done = Ls.every(L => leafDone(c, L.id));
      return `<div class="area-card ${a === recA ? "recommended" : ""} ${done ? "done" : ""}" style="--c:${col}">
        <div class="area-top"><b>${esc(a.title)}</b>${a === recA ? `<span class="tag-rec">empfohlen</span>` : ""}${done ? `<span class="tag-done">✓ Blatt leuchtet</span>` : ""}</div>
        <p class="small">${esc(a.desc)}</p>
        ${Ls.map(L => `<button class="leaf-btn" data-ex="${L.id}"><span class="leaf-ico"></span><span><b>${esc(EXERCISES[L.id].title)}</b><small>${EXERCISES[L.id].minutes} min · ${EXERCISES[L.id].intensity}${L.swapped ? " · sanfte Alternative" : ""}</small></span><span class="go">▶</span></button>`).join("")}
      </div>`; }).join("")}</div>
    <div class="row">${treeBack()}${r.first && r.first !== "free" ? `<button class="linkish" id="retest">Direkt zum Re-Test</button>` : `<button class="linkish" id="test">Mini-Test machen</button>`}</div>`, col);
  bindGo();
  Narrator.play([second ? "ui_areas2" : "ui_areas"]);
  $$(".leaf-btn", panel).forEach(b => b.onclick = () => runBranchLeaf(c, b.dataset.ex));
  const rt = $("#retest"); if (rt) rt.onclick = () => { S.phase = "retest"; render(); };
  const tt = $("#test"); if (tt) tt.onclick = () => { S.phase = "test-intro"; render(); };
}
function runBranchLeaf(c, eid) {
  openExercise(c, eid, () => {
    markLeaf(c, eid); const r = R(c); r.attempt = (r.attempt || 0) + 1; delete r.status;
    S.node = c; S.phase = "retest"; if (location.hash !== "#/" + c) history.pushState({ id: c }, "", "#/" + c);
    render(); focusNode();
  });
}
/* Unterast-Seite (frei angesteuert) */
function renderArea(id) {
  const [, c, aid] = id.split(":"), a = areaById(c, aid), ch = CHAKRAS[c], col = ch.color, Ls = leavesOf(c, a);
  show(`${banner("chakra-" + c, col)}<div class="st-head"><div class="st-orb" style="--c:${col}">${esc(ch.mantra)}</div><div><p class="kicker">${esc(ch.name)} · Zweig</p><h2>${esc(a.title)}</h2></div></div>
    <p class="lead">${esc(a.desc)}</p>
    ${Ls.map(L => routeCard(L.id, col, L.swapped, leafDone(c, L.id) ? "done" : "") + `<button class="btn block" data-ex="${L.id}">${leafDone(c, L.id) ? "Noch einmal üben" : "Übung beginnen"}</button>`).join("")}
    <p class="small">Nach der Übung spürst du mit einem kurzen Re-Test nach, wie es deinem ${esc(ch.name)} geht.</p>
    <div class="row">${treeBack()}<button class="linkish" data-go="${c}">Zum Ast ${esc(ch.name)}</button></div>`, col);
  bindGo();
  Narrator.play(["ex_" + Ls[0].id + "_intro"]);
  $$("[data-ex]", panel).forEach(b => b.onclick = () => runBranchLeaf(c, b.dataset.ex));
}
/* Stamm-Blatt (frei angesteuert) */
function renderLeaf(id) {
  const [, sid, eid] = id.split(":"), st = ST[sid], col = st.color, done = leafDone(sid, eid);
  show(`${banner(st.img, col)}<div class="st-head"><div class="st-orb" style="--c:${col}">${esc(st.icon)}</div><div><p class="kicker">Stamm · ${esc(st.title)} · Blatt</p><h2>${esc(EXERCISES[eid].title)}</h2></div></div>
    ${routeCard(eid, col, null, done ? "done" : "")}
    <button class="btn block" id="open">${done ? "Noch einmal üben" : "Übung beginnen"}</button>
    <div class="row"><button class="linkish" data-go="${sid}">Zur Station ${esc(st.title)}</button></div>`, col);
  bindGo();
  Narrator.play(["ex_" + eid + "_intro"]);
  $("#open").onclick = () => openExercise(sid, eid, () => {
    markLeaf(sid, eid); const r = R(sid);
    if (st.kind === "ritual") { r.status = "free"; return go(sid); }
    r.attempt = (r.attempt || 0) + 1; delete r.status; if (!r.first) r.first = Object.keys(st.routes)[0];
    go(sid, "retest");
  });
}

/* ---------- Baumkrone: Chakra-Scan & Verzweigung ---------- */
function renderScan() {
  const c = couple();
  show(`${banner("tree-hero", "#ffe08a")}<p class="kicker">Der Stamm steht · Blick in die Krone</p><h2>Welche Äste rufen ${c ? "euch" : "dich"} heute?</h2>
    <p>Spür bei jedem Satz kurz nach: Trifft das ${c ? "auf einen von euch" : "auf dich"} gerade zu? Wähle alles, was sich wahr anfühlt.</p>
    <div class="scan-list">${CHAKRA_ORDER.map(k => `<label class="scan-item" style="--c:${CHAKRAS[k].color}"><input type="checkbox" data-c="${k}" ${S.scan && S.scan[k] ? "checked" : ""}><span class="dot"></span><span><small>${esc(CHAKRAS[k].name)}</small>${esc(BRANCHES[k].scan)}</span></label>`).join("")}</div>
    <button class="btn block" id="next">Meine Äste zeigen ✺</button>`, "#ffe08a");
  Narrator.play([c ? "ui_scanc" : "ui_scan"]);
  $("#next").onclick = () => { S.scan = {}; $$("[data-c]", panel).forEach(b => S.scan[b.dataset.c] = b.checked); R("hub").status = "free"; S.phase = "hub"; render(); focusNode(); };
}
function renderHub() {
  const rec = recommended(), recAll = rec.all.length ? rec.all : ["heart", "crown"];
  const lab = { free: "✓ frei · blüht", resolved: "✓ gelöst · blüht", moving: "↻ in Bewegung", skipped: "– ausgelassen" };
  const card = (c, isRec) => { const ch = CHAKRAS[c], st = statusOf(c), n = areasOf(c).reduce((a, x) => a + leavesOf(c, x).filter(L => leafDone(c, L.id)).length, 0);
    const tot = areasOf(c).reduce((a, x) => a + leavesOf(c, x).length, 0);
    return `<button class="branch-card ${st ? "st-" + st : ""} ${isRec ? "rec" : ""}" data-go="${c}" style="--c:${ch.color}">
      <span class="bc-img" style="background-image:url(img/chakra-${c}.webp)"></span>
      <span class="bc-txt"><b>${esc(ch.name)}</b><small>${esc(ch.theme)}</small>
      <span class="bc-meta">${st ? `<i class="badge-st">${lab[st]}</i>` : isRec ? `<i class="badge-rec">${rec.scan.includes(c) ? "empfohlen" : rec.hinted.includes(c) ? "Hinweis aus dem Stamm" : "zum Vertiefen"}</i>` : ""}<i class="leafs">🍃 ${n}/${tot}</i></span></span></button>`; };
  const others = CHAKRA_ORDER.filter(c => !recAll.includes(c));
  const anyDone = CHAKRA_ORDER.some(c => statusOf(c));
  show(`${banner("tree-hero", "#ffe08a")}<p class="kicker">Baumkrone · Verzweigung</p><h2>${couple() ? "Euer" : "Dein"} Baum verzweigt sich</h2>
    <p>${rec.all.length ? "Diese Äste rufen dich gerade – am besten von unten nach oben:" : "Dein Scan zeigt keine deutliche Blockade. Wunderbar! Zum Vertiefen eignen sich Herz und Krone:"}</p>
    <div class="branch-list">${recAll.map(c => card(c, true)).join("")}</div>
    ${others.length ? `<h3>Alle weiteren Äste</h3><div class="branch-list small-cards">${others.map(c => card(c, false)).join("")}</div>` : ""}
    <p class="small">Du kannst so viele Äste besuchen, wie du möchtest, und jederzeit hierher zurückkehren. Jeder Ast hat mehrere Zweige mit Blättern.</p>
    <button class="btn block ${anyDone ? "" : "ghost"}" data-go="integration" style="--c:#fde68a">Reise abschließen · Integration ❂</button>
    <button class="linkish" id="rescan">Scan wiederholen</button>`, "#ffe08a");
  bindGo();
  Narrator.play(["ui_hub"]);
  $("#rescan").onclick = () => { S.phase = "scan"; render(); };
}

/* ---------- Integration (Wipfel) ---------- */
function renderIntegration() {
  const st = ST.integration, c = colorOf(st), list = couple() ? [st.ex, st.cex] : [st.ex];
  if (S.intStep < list.length) {
    const eid = list[S.intStep];
    show(`${banner("integrate", c)}<div class="st-head"><div class="st-orb" style="--c:${c}">${st.icon}</div><div><p class="kicker">Wipfel · Integration</p><h2>Integration</h2></div></div>
      <p class="lead">${S.intStep === 0 ? "Dein Baum leuchtet. Jetzt darf sich alles setzen – Stille ist der Ort, an dem Veränderung Wurzeln schlägt." : "Was ihr erlebt habt, darf gesehen und geteilt werden."}</p>
      ${routeCard(eid, c)}<button class="btn block" id="open">Übung beginnen</button><button class="linkish" id="skip">Überspringen</button>
      <div class="row">${treeBack()}</div>`, c);
    bindGo();
    Narrator.play([S.intStep === 0 ? "ui_int1" : "ui_int2"]);
    const nx = () => { markLeaf("integration", eid); S.intStep++; render(); };
    $("#open").onclick = () => openExercise("integration", eid, nx);
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
    S.results.integration = { status: "free", path: list }; S.finished = Date.now(); S.phase = "summary";
    const h = JSON.parse(localStorage.getItem(HKEY) || "[]");
    h.push({ date: S.finished, mode: S.mode, intention: S.chips.concat(S.intention ? [S.intention] : []).join(", "), b: S.before.energy, a: S.after.energy, leaves: Object.keys(S.leaves).length });
    localStorage.setItem(HKEY, JSON.stringify(h.slice(-20)));
    Sound.bell(396, .2, 5); setTimeout(() => Sound.bell(528, .18, 5), 700); setTimeout(() => Sound.bell(792, .14, 6), 1400);
    render(); setTimeout(() => showWholeTree(2200), 300);
  };
}

/* ---------- Zusammenfassung ---------- */
function renderSummary() {
  const res = {};
  CHAKRA_ORDER.forEach(c => res[c] = S.results[c]);
  const lab = { free: "frei", resolved: "gelöst", moving: "in Bewegung", skipped: "ausgelassen" };
  const helpful = [], keep = [];
  [...trunkIds(), ...CHAKRA_ORDER].forEach(id => { const r = S.results[id]; if (!r || !r.path || !r.path.length) return;
    if (r.status === "resolved") helpful.push(r.path[r.path.length - 1]);
    if (r.status === "moving") keep.push(...r.path); });
  const names = couple() ? S.names.filter(Boolean).join(" & ") : S.names[0];
  const bars = [["Energie", "energy"], ["Innere Ruhe", "calm"], ["Im Körper sein", "body"], [couple() ? "Verbindung miteinander" : "Verbindung mit mir", "connect"]];
  const visited = [...trunkIds().filter(id => id !== "checkin"), ...CHAKRA_ORDER].filter(id => statusOf(id));
  show(`<p class="kicker">Dein Lebensbaum leuchtet</p>
    <h2>${names ? esc(names) + ", " + (couple() ? "ihr seid" : "du bist") : couple() ? "Ihr seid" : "Du bist"} in ${couple() ? "eurer" : "deiner"} Mitte angekommen.</h2>
    ${Illu.mandala(res)}
    <p class="lead">Energie, die in Bewegung gekommen ist, wirkt weiter – in den nächsten Stunden und Tagen. Trink etwas Wasser, bleib noch einen Moment bei dir und nimm die Stille mit in deinen Alltag.</p>
    <div class="note">🍃 <b>${Object.keys(S.leaves).length} Blätter</b> leuchten an deinem Baum · <b>${CHAKRA_ORDER.filter(c => ["free", "resolved"].includes(statusOf(c))).length} Äste</b> blühen.</div>
    ${S.chips.length || S.intention ? `<div class="note">Deine Absicht: <b>${esc(S.chips.concat(S.intention ? [S.intention] : []).join(" · "))}</b></div>` : ""}
    <h3>Vorher → Nachher</h3>
    <div class="bars">${bars.map(([l, k]) => `<div class="bar"><div class="lab"><span>${l}</span><span>${S.before[k]} → <b>${S.after[k]}</b></span></div><div class="track"><div class="b0" style="width:${S.before[k] * 10}%"></div><div class="b1" style="width:${S.after[k] * 10}%"></div></div></div>`).join("")}</div>
    <h3>Deine Stationen & Äste</h3>
    <ul class="sum-list">${visited.map(id => { const st = ST[id], r = S.results[id] || {}; return `<li style="--c:${colorOf(st)}"><span><i class="dot"></i>${esc(st.title)}</span><span class="result-badge rb-${r.status || "skipped"}">${lab[r.status] || "–"}</span></li>`; }).join("")}</ul>
    ${helpful.length ? `<h3>Was dir heute geholfen hat</h3><p>${helpful.map(e => esc(EXERCISES[e].title)).join(" · ")}</p>` : ""}
    ${keep.length ? `<h3>Deine Übungen für die nächsten 7 Tage</h3><p>Diese Bereiche sind in Bewegung. Täglich 5–10 Minuten wirken mehr als eine lange Sitzung: <b>${[...new Set(keep)].map(e => esc(EXERCISES[e].title)).join(" · ")}</b></p>` : `<div class="note">Alltags-Tipp: ${couple() ? "Schenkt euch täglich eine dreiminütige Schmelz-Umarmung (nach Margot Anand)." : "5 Minuten Herz-Kohärenz-Atem am Morgen halten den Fluss lebendig."}</div>`}
    ${S.journal.some(Boolean) ? `<h3>Dein Journal</h3>${JOURNAL.map((q, i) => S.journal[i] ? `<p class="small" style="margin:8px 0 2px">${esc(q)}</p><p>${esc(S.journal[i])}</p>` : "").join("")}` : ""}
    <div class="row noprint" style="margin-top:18px"><button class="btn" id="print">Als PDF / drucken</button><button class="btn ghost" id="dl">Als Text speichern</button><button class="btn ghost" data-go="hub">🌳 Zurück zum Baum</button><button class="btn ghost" id="again">Neue Reise</button></div>`, "#fde68a");
  bindGo();
  Narrator.play([couple() ? "ui_summaryc" : "ui_summary"]);
  $("#print").onclick = () => print();
  $("#again").onclick = () => { S = fresh(); history.pushState({}, "", "#"); buildMap(); render(); };
  $("#dl").onclick = () => {
    const lines = [`Energie- und Chakra-Reise – ${new Date(S.finished).toLocaleString("de-DE")}`, couple() ? `Paar: ${names}` : `Name: ${names || "-"}`, `Absicht: ${S.chips.concat(S.intention ? [S.intention] : []).join(", ")}`, "",
      ...bars.map(([l, k]) => `${l}: ${S.before[k]} → ${S.after[k]}`), "", ...visited.map(id => { const r = S.results[id] || {}; return `${ST[id].title}: ${lab[r.status] || "-"}${r.path && r.path.length ? " (" + r.path.map(e => EXERCISES[e].title).join(", ") + ")" : ""}`; }),
      "", ...JOURNAL.map((q, i) => `${q}\n${S.journal[i] || "-"}`)];
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" })); a.download = "chakra-reise.txt"; a.click();
  };
}

/* ================= Übungs-Ansicht (Zoom aus dem Blatt) ================= */
function highlightLeaf(owner, eid) {
  $$(".m-leaf.cur").forEach(x => x.classList.remove("cur"));
  const el = $(`.m-leaf[data-key="${owner}:${eid}"]`); if (el) el.classList.add("cur");
  const n = MAP.nodes[`L:${owner}:${eid}`], o = MAP.nodes[owner];
  if (n && o) camTo((n.x + o.x) / 2, (n.y + o.y) / 2, baseScale() * 1.1, 1200);
}
let EXR = null;
function openExercise(owner, eid, onDone) {
  const ex = EXERCISES[eid], c = CHAKRAS[ex.chakra].color;
  const node = MAP.nodes[`L:${owner}:${eid}`] || MAP.nodes[owner] || { x: MAP.W / 2, y: MAP.H / 2 };
  const ownerTitle = ST[owner] ? ST[owner].title : nodeTitle(owner);
  const go_ = () => {
    const sx = node.x * cam.s + cam.x, sy = node.y * cam.s + cam.y;
    const ov = $("#exercise");
    const steps = ex.steps; const total = steps.reduce((a, s) => a + s[0], 0);
    let acc = 0; const starts = steps.map(s => { const v = acc; acc += s[0]; return v; });
    const f = flagged();
    const pattern = ex.breath ? BREATH[ex.breath] : null;
    ov.style.setProperty("--c", c);
    ov.innerHTML = `<article class="ex-card" style="--c:${c};--tox:${sx}px;--toy:${sy}px">
      <header class="ex-hero" style="--bgimg:url(${new URL("img/" + Illu.poseImg(ex) + ".webp", location.href).href})">
        <button class="icon-btn ex-close" id="exClose" aria-label="Übung schließen">✕</button>
        <p class="kicker" style="color:${c}">${esc(ownerTitle)} · ${ex.couple ? "Paar-Übung" : "Blatt"}</p>
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
              <div class="row"><button class="btn" id="exPlay">▶ Start</button><button class="btn ghost" id="exPrev" title="Vorheriger Schritt" aria-label="Vorheriger Schritt">⏮</button><button class="btn ghost" id="exNext" title="Nächster Schritt" aria-label="Nächster Schritt">⏭</button><button class="btn ghost" id="exSnd" aria-label="Klang">${Sound.enabled ? "♪ Klang an" : "♪ Klang aus"}</button></div>
              <button class="btn block" id="exDone" style="--c:#3ee08f">✓ Fertig – Blatt leuchten lassen</button>
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
    const jump = d => { const i = Math.max(0, Math.min(steps.length - 1, EXR.stepI + d)); EXR.t = starts[i]; setStep(i); tickUI(); };
    $("#exNext").onclick = () => jump(1);
    $("#exPrev").onclick = () => jump(-1);
    $("#exSnd").onclick = e => { const on = Sound.toggle(); e.target.textContent = on ? "♪ Klang an" : "♪ Klang aus"; $("#soundBtn").classList.toggle("off", !on); if (on && EXR.running) startSound(); };
    $("#exDone").onclick = () => closeExercise(true);
    $("#exClose").onclick = () => closeExercise(false);
  };
  if (MAP.nodes[`L:${owner}:${eid}`] && !reduced) camTo(node.x, node.y, 2.2, 650).then(go_); else go_();
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
  $$("#exSteps li").forEach((li, k) => { li.classList.toggle("cur", k === i); li.classList.toggle("past", k < i); });
  const li = $(`#exSteps li[data-i="${i}"]`); if (li && !silent) li.scrollIntoView({ behavior: "smooth", block: "nearest" });
  if (!silent && prev !== i) narrateStep(i);
  if (!silent && prev !== i && EXR.running) { Sound.bell(CHAKRAS[EXR.ex.chakra].freq * 2, .12, 2.5); if (EXR.ex.tone === "chakras") Sound.setDrone(CHAKRAS[CHAKRA_ORDER[Math.max(0, Math.min(6, i - 1))]].freq); }
}
function narrateStep(i) {
  if (!EXR) return;
  $$("#exSteps li").forEach((li, k) => li.classList.toggle("speaking", k === i));
  Narrator.play([`ex_${EXR.id}_s${i}`], { delay: 600, onEnd: () => $$("#exSteps li.speaking").forEach(li => li.classList.remove("speaking")) });
}
function finishEx() {
  Sound.stopAll();
  setTimeout(() => { if (EXR) Narrator.play(["ui_exdone"]); }, 2600);
  [0, 900, 1800].forEach(d => setTimeout(() => EXR && Sound.bell(CHAKRAS[EXR.ex.chakra].freq * 2, .18, 3), d));
  $("#exPlay").textContent = "↺ Nochmal"; $("#exPlay").onclick = () => { EXR.t = 0; setStep(0, true); $("#exPlay").onclick = togglePlay; togglePlay(); };
  const d = $("#exDone"); d.textContent = "✓ Übung vollendet – Blatt leuchten lassen"; d.focus();
}
function closeExercise(done, instant) {
  if (!EXR) return;
  cancelAnimationFrame(EXR.raf); Sound.stopAll(); Narrator.stop();
  const cb = EXR.onDone; EXR = null;
  const ov = $("#exercise");
  if (instant) { ov.hidden = true; ov.innerHTML = ""; return; }
  ov.classList.add("closing");
  setTimeout(() => { ov.hidden = true; ov.innerHTML = ""; if (done && cb) { cb(); Sound.bell(528, .12, 3); } focusNode(900); }, reduced ? 1 : 420);
}

/* ================= Übersicht (Index aller Stationen und Blätter) ================= */
function openIndex() {
  if (!S.mode) { S.mode = "solo"; S.started = Date.now(); buildMap(); }
  const m = $("#modal");
  const stIcon = id => { const s = statusOf(id); return s === "free" || s === "resolved" ? "✓" : s === "moving" ? "↻" : s === "skipped" ? "–" : "○"; };
  const leafBtn = (go, owner, eid) => `<button class="ix-leaf ${leafDone(owner, eid) ? "done" : ""}" data-ix="${go}"><span class="leaf-ico"></span>${esc(EXERCISES[eid].title)} <small>${EXERCISES[eid].minutes} min</small></button>`;
  m.innerHTML = `<div class="modal-card index-card"><button class="icon-btn" style="float:right" id="mClose" aria-label="Schließen">✕</button>
    <p class="kicker">Übersicht</p><h2>Dein Lebensbaum</h2>
    <p class="small">Spring direkt zu jeder Station, jedem Ast, jedem Zweig und jeder Übung – auch zu denen, die noch vor dir liegen.</p>
    <div class="row"><button class="btn ghost" id="ixWhole">⌖ Ganzen Baum zeigen</button><button class="btn ghost" data-ix="hub">✺ Baumkrone / Verzweigung</button><button class="btn ghost" data-ix="integration">❂ Integration</button></div>
    <h3>Stamm</h3><div class="ix-grid">${trunkIds().map(id => { const st = ST[id];
      return `<div class="ix-item" style="--c:${st.color}"><button class="ix-st" data-ix="${id}"><i>${stIcon(id)}</i>${esc(id === "checkin" ? "Check-in" : st.title)}</button>
        ${trunkLeaves(st).map(L => leafBtn(`x:${id}:${L.id}`, id, L.id)).join("")}</div>`; }).join("")}</div>
    <h3>Äste</h3><div class="ix-grid">${CHAKRA_ORDER.map(c => { const ch = CHAKRAS[c];
      return `<div class="ix-item" style="--c:${ch.color}"><button class="ix-st" data-ix="${c}"><i>${stIcon(c)}</i>${esc(ch.name)}</button>
        ${areasOf(c).map(a => `<button class="ix-area" data-ix="a:${c}:${a.id}">${esc(a.title)}</button>${leavesOf(c, a).map(L => leafBtn(`a:${c}:${a.id}`, c, L.id)).join("")}`).join("")}</div>`; }).join("")}</div></div>`;
  m.hidden = false; $("#mClose").focus();
  const close = () => m.hidden = true;
  $("#mClose").onclick = close;
  m.onclick = e => { if (e.target === m) close(); };
  $("#ixWhole").onclick = () => { close(); overview = true; showWholeTree(); };
  $$("[data-ix]", m).forEach(b => b.onclick = () => { close(); go(b.dataset.ix); });
}

/* ================= Info / Quellen ================= */
function openInfo() {
  const m = $("#modal");
  const groups = {}; QUELLEN.forEach(([g, t, u]) => (groups[g] = groups[g] || []).push([t, u]));
  m.innerHTML = `<div class="modal-card"><button class="icon-btn" style="float:right" id="mClose" aria-label="Schließen">✕</button>
    <p class="kicker">Über diese Reise</p><h2>Tradition · Wissenschaft · Erfahrung</h2>
    <p>Der Lebensbaum folgt einer bewährten Reihenfolge: Erst erden und ankommen, dann das Nervensystem regulieren, den Geist beruhigen, Energie wecken und entspannen. Erst auf diesem Stamm öffnen sich die Chakren als Äste – gezielt dort, wo es gerade stockt.</p>
    <p>Die Chakren sind eine erfahrungsbasierte Landkarte der tantrischen und yogischen Tradition. Die Mini-Tests sind Wahrnehmungsübungen, keine Diagnose. Die Klänge nutzen eine moderne Zuordnung der Chakren zu den Tönen C–H.</p>
    <div class="note" style="--c:#ff9ecb"><b>Dank an Margot Anand.</b> Herzgruß, Heiliger Raum, Schmelzende Umarmung, Herzsegen, harmonisierender Atem, die „Innere Flöte“ und der Kreislauf-Atem gehen auf Margot Anands SkyDancing Tantra zurück („The Art of Sexual Ecstasy“, „The Art of Everyday Ecstasy“). Sie werden hier in eigenen Worten und in einer nicht-sexuellen Form für ein breites Publikum beschrieben. Für die vollständige Lehre: ihre Bücher und <a href="https://margotanand.com/" target="_blank" rel="noopener">margotanand.com</a>.</div>
    <div class="note warn">Kein Ersatz für ärztliche oder psychotherapeutische Behandlung. Bei Schwangerschaft, Epilepsie, Herz-Kreislauf-Erkrankungen, psychischen Erkrankungen oder frischen Verletzungen werden intensive Techniken automatisch ersetzt. Krisenhilfe: Telefonseelsorge 0800 111 0 111 · Notruf 112.</div>
    ${Object.entries(groups).map(([g, l]) => `<p class="src-group">${esc(g)}</p><ul class="src-list">${l.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join("")}</ul>`).join("")}
    <p class="small" style="margin-top:18px">Bilder: eigens KI-generierte Illustrationen. Stimme: Microsoft Neural TTS (Seraphina). Deine Eingaben werden ausschließlich lokal in deinem Browser gespeichert.</p>
    <div class="row"><button class="btn ghost" id="mReset">Fortschritt löschen & neu beginnen</button></div></div>`;
  m.hidden = false; $("#mClose").focus();
  $("#mClose").onclick = () => m.hidden = true;
  m.onclick = e => { if (e.target === m) m.hidden = true; };
  $("#mReset").onclick = () => { if (confirm("Aktuelle Reise wirklich löschen?")) { S = fresh(); save(); m.hidden = true; history.pushState({}, "", "#"); buildMap(); render(); } };
}

/* ================= Init ================= */
$("#infoBtn").onclick = openInfo;
$("#overviewBtn").onclick = toggleOverview;
$("#indexBtn").onclick = openIndex;
$("#prevBtn").onclick = () => step(-1);
$("#nextBtn").onclick = () => step(1);
$("#treeBtn").onclick = () => go(trunkDone() || S.scan ? "hub" : (trunkIds().find(id => !statusOf(id)) || "hub"));
$("#homeBtn").onclick = () => { if (EXR) closeExercise(false, true); S.phase = "welcome"; render(); };
$("#soundBtn").classList.toggle("off", !Sound.enabled);
$("#soundBtn").onclick = () => { const on = Sound.toggle(); $("#soundBtn").classList.toggle("off", !on); };
addEventListener("keydown", e => {
  const tag = (document.activeElement || {}).tagName;
  if (e.key === "Escape") { if (!$("#modal").hidden) $("#modal").hidden = true; else if (EXR) closeExercise(false); return; }
  if (e.key === " " && EXR && tag !== "BUTTON") { e.preventDefault(); togglePlay(); return; }
  if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || e.altKey || e.ctrlKey || e.metaKey) return;
  if (EXR && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { e.preventDefault(); (e.key === "ArrowRight" ? $("#exNext") : $("#exPrev")).click(); return; }
  if (!$("#modal").hidden || !S.mode) return;
  if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
});
addEventListener("resize", () => { if (!EXR) focusNode(300); });
buildMap();
(function start() {
  const id = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
  if (S.mode && id && validNode(id)) { S.node = id; S.phase = defaultPhase(id); render(); focusNode(1); return; }
  S.phase = "welcome"; render();
})();
