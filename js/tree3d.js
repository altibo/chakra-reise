/* ============ 3D-Lebensbaum (Three.js) ============
   Liest die gleiche Baum-Struktur wie die 2D-Karte (Stamm, Chakra-Äste, Unteräste, Übungen)
   und ordnet alles automatisch räumlich an (goldener Winkel) – neue Äste/Bereiche finden von selbst Platz. */
import * as THREE from "./vendor/three.module.min.js";

const T3 = window.T3 = { ok: false, active: false };
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0), GOLD = 137.508 * Math.PI / 180;
const dirAz = a => V(Math.cos(a), 0, Math.sin(a));
const mob = () => innerWidth <= 900 || innerHeight <= 520;
const reducedM = matchMedia("(prefers-reduced-motion: reduce)").matches;
let renderer, scene, camera, root, canvas, labelsEl, glowTex, leafGeo, leafMesh, raycaster = new THREE.Raycaster();
let N = {}, parts = [], leafInst = [], clusters = {}, pickables = [], labels = [], marker, sun, frameRing;
const camS = { target: V(0, 4, 0), radius: 22, theta: .6, phi: 1.2 };
let fly = null, tweens = [], vel = { t: 0, p: 0 }, idleSpin = false, needs = true;

function webglOK() { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch { return false; } }

/* ---------- Hilfen ---------- */
function makeGlowTex() {
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.25, "rgba(255,255,255,.55)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function glow(color, size, opacity = .6) {
  const m = new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
  const s = new THREE.Sprite(m); s.scale.setScalar(size); return s;
}
/* konisches Rohr entlang einer Kurve (Stamm, Äste, Wurzeln) */
function taperTube(curve, segs, rad, r0, r1) {
  const pos = [], idx = [], fr = curve.computeFrenetFrames(segs, false), p = V(), v = V();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, r = r0 + (r1 - r0) * Math.pow(t, .9);
    curve.getPointAt(t, p);
    for (let j = 0; j <= rad; j++) {
      const a = j / rad * Math.PI * 2;
      v.copy(fr.normals[i]).multiplyScalar(Math.cos(a) * r).addScaledVector(fr.binormals[i], Math.sin(a) * r).add(p);
      pos.push(v.x, v.y, v.z);
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < rad; j++) {
    const a = i * (rad + 1) + j, b = a + rad + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function arc(a, b, lift = .5, out = null) {
  const d = a.distanceTo(b), o = out || V().subVectors(b, a).setY(0).normalize();
  return new THREE.CubicBezierCurve3(a.clone(), a.clone().addScaledVector(UP, d * lift), b.clone().addScaledVector(o, -d * .35).addScaledVector(UP, -d * .05), b.clone());
}
function rng(seed) { let h = 2166136261 >>> 0; for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => { h = (h + 0x6D2B79F5) | 0; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;

/* ---------- Layout ---------- */
function layout() {
  N = {};
  const T = [...trunkIds(), "hub"], gap = 1.35;
  T.forEach((id, i) => N[id] = { p: V(Math.sin(i * 1.3) * .14, i * gap, Math.cos(i * 1.7) * .1), kind: "trunk", i });
  const H = N.hub.p, nonCrown = CHAKRA_ORDER.filter(c => c !== "crown");
  nonCrown.forEach((c, j) => {
    const az = j * GOLD + .35, o = V(0, H.y + .15 + j * .55, 0), d = dirAz(az), reach = 3.1 - j * .12;
    N[c] = { p: o.clone().addScaledVector(d, reach).addScaledVector(UP, 1.0 + j * .3), kind: "chakra", az, o };
  });
  N.crown = { p: V(0, H.y + 4.6, 0), kind: "chakra", az: 0, o: V(0, H.y + 3.0, 0), up: true };
  N.integration = { p: V(0, H.y + 8.2, 0), kind: "top" };
  CHAKRA_ORDER.forEach(c => {
    const C = N[c], A = areasOf(c), n = A.length;
    A.forEach((ar, k) => {
      let az, p;
      if (C.up) { az = k * (Math.PI * 2 / n) + .5; p = C.p.clone().addScaledVector(dirAz(az), 1.7).addScaledVector(UP, 1.1 + (k % 2) * .35); }
      else { const spread = Math.min(.55, 1.4 / Math.max(1, n - 1)); az = C.az + (k - (n - 1) / 2) * spread; p = C.p.clone().addScaledVector(dirAz(az), 1.9).addScaledVector(UP, .55 + (k % 2) * .45); }
      const id = `a:${c}:${ar.id}`; N[id] = { p, kind: "area", c, az };
      const Ls = leavesOf(c, ar);
      Ls.forEach((L, l) => {
        const la = az + (l - (Ls.length - 1) / 2) * .38;
        N[`L:${c}:${L.id}`] = { p: p.clone().addScaledVector(dirAz(la), 1.25).addScaledVector(UP, .35 + l * .12), kind: "leaf", owner: c, eid: L.id, area: id, az: la, parent: id };
      });
    });
  });
  trunkIds().forEach((id, i) => {
    trunkLeaves(ST[id]).forEach((L, j) => {
      const az = j * GOLD + i * .9;
      N[`L:${id}:${L.id}`] = { p: N[id].p.clone().addScaledVector(dirAz(az), 1.15).addScaledVector(UP, .3 + (j % 2) * .25), kind: "leaf", owner: id, eid: L.id, az, parent: id };
    });
  });
}

/* ---------- Szene aufbauen ---------- */
function mat(color, ghost = true) {
  return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: ghost ? 0 : .5, roughness: .7, metalness: .05, transparent: true, opacity: ghost ? .2 : 1 });
}
function addPart(key, geo, color, kind) {
  const m = new THREE.Mesh(geo, mat(color)); m.userData = { key, kind, on: 0 }; root.add(m); parts.push(m); return m;
}
function build() {
  if (!T3.ok) return;
  if (root) { scene.remove(root); root.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.dispose) o.material.dispose(); }); }
  root = new THREE.Group(); scene.add(root);
  parts = []; leafInst = []; clusters = {}; pickables = []; labelsEl.innerHTML = ""; labels = [];
  layout();
  const lowPoly = mob();
  const RAD = lowPoly ? 7 : 10;
  const T = [...trunkIds(), "hub"];
  /* Wurzeln */
  const rr = rng("roots3d");
  for (let i = 0; i < 9; i++) {
    const az = i * GOLD, d = dirAz(az), len = 2.2 + rr() * 1.6;
    const end = d.clone().multiplyScalar(len).add(V(0, -1.4 - rr() * 1.2, 0));
    const cv = new THREE.CubicBezierCurve3(V(0, .1, 0), d.clone().multiplyScalar(.5).add(V(0, -.5, 0)), end.clone().add(V(0, .8, 0)).addScaledVector(d, -.6), end);
    addPart("root", taperTube(cv, 14, RAD - 2, .3, .02), "#c97a45", "root");
  }
  /* Stamm-Segmente */
  for (let i = 0; i < T.length - 1; i++) {
    const a = N[T[i]].p, b = N[T[i + 1]].p;
    const cv = new THREE.CubicBezierCurve3(a.clone().add(V(0, -.05, 0)), a.clone().add(V(0, .45, 0)), b.clone().add(V(0, -.45, 0)), b.clone().add(V(0, .05, 0)));
    const r0 = .55 - i * .055 + (i === 0 ? .1 : 0), r1 = .55 - (i + 1) * .055;
    addPart("t:" + T[i], taperTube(cv, 8, RAD + 2, Math.max(.18, r0), Math.max(.16, r1)), "#d99257", "trunk");
  }
  /* Mitteltrieb zur Krone */
  const H = N.hub.p;
  addPart("leader", taperTube(new THREE.CubicBezierCurve3(H.clone(), H.clone().add(V(.15, 1.5, 0)), N.crown.p.clone().add(V(-.1, -1.5, 0)), N.crown.p.clone()), 14, RAD, .2, .08), "#c77dff", "leader");
  addPart("top", taperTube(new THREE.LineCurve3(N.crown.p.clone(), N.integration.p.clone().add(V(0, -.6, 0))), 6, 6, .04, .02), "#ffe08a", "top");
  /* Chakra-Äste, Unteräste, Zweige */
  CHAKRA_ORDER.forEach(c => {
    const C = N[c], col = CHAKRAS[c].color;
    if (!C.up) addPart("b:" + c, taperTube(arc(C.o, C.p, .45), 16, RAD, .2, .085), col, "branch");
    areasOf(c).forEach(a => {
      const id = `a:${c}:${a.id}`, A = N[id];
      addPart("ar:" + c + ":" + a.id, taperTube(arc(C.p, A.p, .4), 10, RAD - 3, .08, .04), col, "twig");
    });
  });
  /* Blätter-Büschel (instanziert) */
  const R = rng("leaves3d"), tmp = new THREE.Object3D();
  const leafSpecs = [];
  Object.entries(N).filter(([, n]) => n.kind === "leaf").forEach(([k, n]) => {
    const from = N[n.parent].p, cv = arc(from, n.p, .35);
    const col = isChakra(n.owner) ? CHAKRAS[n.owner].color : ST[n.owner].color;
    const tw = new THREE.Mesh(taperTube(cv, 6, 5, .035, .012), mat("#8fcf86")); tw.userData = { key: "lf:" + n.owner + ":" + n.eid, kind: "stem", on: 0 }; root.add(tw); parts.push(tw);
    const cnt = 6 + Math.floor(R() * 4), list = [];
    for (let i = 0; i < cnt; i++) {
      const t = .35 + .65 * i / (cnt - 1), p = cv.getPointAt(t);
      p.add(V((R() - .5) * .35, (R() - .5) * .25, (R() - .5) * .35));
      list.push(leafSpecs.length); leafSpecs.push({ p, rot: [R() * Math.PI, R() * Math.PI * 2, R() * Math.PI], s: .75 + R() * .5, key: k, light: R() < .35 });
    }
    clusters[k] = { list, done: 0, glow: glow("#3ee08f", 1.6, 0) };
    clusters[k].glow.position.copy(cv.getPointAt(.7)); root.add(clusters[k].glow);
    const pick = new THREE.Mesh(new THREE.SphereGeometry(.55, 8, 6), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }));
    pick.position.copy(cv.getPointAt(.75)); pick.userData = { node: k }; root.add(pick); pickables.push(pick);
    n.center = pick.position.clone();
  });
  /* dekorative Blätter an den Ästen */
  CHAKRA_ORDER.filter(c => !N[c].up).forEach(c => {
    const cv = arc(N[c].o, N[c].p, .45);
    for (let i = 0; i < 10; i++) {
      const p = cv.getPointAt(.25 + .7 * i / 9).add(V((R() - .5) * .5, (R() - .2) * .4, (R() - .5) * .5));
      leafSpecs.push({ p, rot: [R() * Math.PI, R() * Math.PI * 2, R() * Math.PI], s: .6 + R() * .4, key: "sp:" + c, light: R() < .4 });
    }
  });
  leafMesh = new THREE.InstancedMesh(leafGeo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, opacity: .95 }), leafSpecs.length);
  leafSpecs.forEach((L, i) => { L.cur = .45; L.to = .45; tmp.position.copy(L.p); tmp.rotation.set(...L.rot); tmp.scale.setScalar(L.s * L.cur); tmp.updateMatrix(); leafMesh.setMatrixAt(i, tmp.matrix); leafMesh.setColorAt(i, new THREE.Color("#3a3466")); });
  leafInst = leafSpecs; root.add(leafMesh);
  /* Knoten */
  const nodeGeo = new THREE.IcosahedronGeometry(1, lowPoly ? 1 : 2);
  const addNode = (id, col, r, lbl, sub) => {
    const n = N[id];
    const m = new THREE.Mesh(nodeGeo, new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: .15, roughness: .4, transparent: true, opacity: .55 }));
    m.scale.setScalar(r); m.position.copy(n.p); m.userData = { node: id }; root.add(m); pickables.push(m);
    const gl = glow(col, r * 7, .12); gl.position.copy(n.p); root.add(gl);
    n.mesh = m; n.glow = gl; n.r = r;
    addLabel(id, lbl, sub, n.kind);
  };
  trunkIds().forEach(id => addNode(id, ST[id].color, .2, id === "checkin" ? "Check-in" : ST[id].title, id === "checkin" ? "Samen" : "Stamm"));
  addNode("hub", "#ffe08a", .26, "Verzweigung", "Baumkrone");
  CHAKRA_ORDER.forEach(c => addNode(c, CHAKRAS[c].color, .3, CHAKRAS[c].name, CHAKRAS[c].skt));
  addNode("integration", "#fde68a", .36, "Integration", "Wipfel · Mitte");
  CHAKRA_ORDER.forEach(c => areasOf(c).forEach(a => addNode(`a:${c}:${a.id}`, CHAKRAS[c].color, .11, a.title, "")));
  Object.entries(N).filter(([, n]) => n.kind === "leaf").forEach(([k, n]) => addLabel(k, EXERCISES[n.eid].title, EXERCISES[n.eid].minutes + " min", "leaf"));
  /* Sonne, Rahmen-Ring, Erdglühen, Markierung */
  sun = glow("#ffe08a", 5, .25); sun.position.copy(N.integration.p); root.add(sun);
  frameRing = new THREE.Mesh(new THREE.TorusGeometry(7.5, .03, 6, 120), new THREE.MeshBasicMaterial({ color: "#ffe08a", transparent: true, opacity: .12 }));
  frameRing.rotation.x = Math.PI / 2; frameRing.position.y = -.2; root.add(frameRing);
  const earth = glow("#ff8a4a", 9, .22); earth.position.set(0, -.6, 0); root.add(earth);
  marker = glow("#ffffff", 1.4, .0); root.add(marker);
  needs = true;
}
function addLabel(id, text, sub, kind) {
  const b = document.createElement("button");
  b.className = "l3 l3-" + kind; b.dataset.node = id; b.tabIndex = -1;
  b.innerHTML = `<b>${esc(text)}</b>${sub && kind !== "area" ? `<small>${esc(sub)}</small>` : ""}`;
  b.addEventListener("click", e => { e.stopPropagation(); if (!dragMoved) clickNode(id); });
  labelsEl.appendChild(b); labels.push({ el: b, id, kind, vis: null });
}

/* ---------- Zustand → Optik ---------- */
function refresh() {
  if (!root) return;
  const reached = id => !!(S.visited[id] || statusOf(id));
  const onKey = {};
  [...trunkIds()].forEach(id => onKey["t:" + id] = !!statusOf(id));
  onKey.root = !!(S.started && S.phase !== "welcome") || !!statusOf("checkin");
  onKey.leader = !!S.scan; onKey.top = !!S.finished;
  CHAKRA_ORDER.forEach(c => {
    onKey["b:" + c] = reached(c);
    const any = areasOf(c).some(a => leavesOf(c, a).some(L => leafDone(c, L.id)));
    onKey["sp:" + c] = reached(c) && (!!statusOf(c) || any);
    areasOf(c).forEach(a => { onKey["ar:" + c + ":" + a.id] = leavesOf(c, a).some(L => leafDone(c, L.id)) || S.node === `a:${c}:${a.id}`; });
  });
  Object.values(N).filter(n => n.kind === "leaf").forEach(n => onKey["lf:" + n.owner + ":" + n.eid] = leafDone(n.owner, n.eid));
  parts.forEach(m => {
    const on = onKey[m.userData.key] ? 1 : 0;
    if (on !== m.userData.on) { m.userData.on = on; tween(m.material, { opacity: on ? 1 : .2, emissiveIntensity: on ? (m.userData.kind === "trunk" || m.userData.kind === "root" ? .35 : .7) : 0 }, 1400); }
  });
  /* Blätter */
  const green = [new THREE.Color("#3ee08f"), new THREE.Color("#9af5be")], ghost = new THREE.Color("#3a3466");
  let delay = 0;
  leafInst.forEach((L, i) => {
    const k = L.key, done = k.startsWith("sp:") ? !!onKey[k] : leafDone(N[k].owner, N[k].eid);
    const to = done ? 1 : .45;
    if (to !== L.to) { L.to = to; L.t0 = performance.now() + (reducedM ? 0 : (delay += 25) % 600); L.from = L.cur; leafMesh.setColorAt(i, done ? green[L.light ? 1 : 0] : ghost); }
  });
  leafMesh.instanceColor.needsUpdate = true;
  Object.entries(clusters).forEach(([k, cl]) => { const d = leafDone(N[k].owner, N[k].eid); tween(cl.glow.material, { opacity: d ? .55 : 0 }, 1200); });
  /* Knoten */
  const rec = S.scan ? recommended().all : [];
  Object.entries(N).forEach(([id, n]) => {
    if (!n.mesh) return;
    const st = statusOf(id), r = reached(id) || (id === "hub" && !!S.scan) || (id === "integration" && !!S.finished) || (n.kind === "area" && onKey["ar:" + n.c + ":" + id.split(":")[2]]);
    const bloom = st === "free" || st === "resolved";
    tween(n.mesh.material, { opacity: r ? 1 : .5, emissiveIntensity: bloom ? 1.1 : r ? .55 : .12 }, 900);
    tween(n.glow.material, { opacity: bloom ? .7 : r ? .4 : rec.includes(id) ? .3 : .1 }, 900);
    n.mesh.scale.setScalar(n.r * (bloom ? 1.25 : 1));
  });
  const lbM = {}; labels.forEach(l => { const st = statusOf(l.id); l.el.classList.toggle("now", l.id === S.node); l.el.classList.toggle("done", l.kind === "leaf" ? !!S.leaves[l.id.slice(2)] : st === "free" || st === "resolved"); l.el.classList.toggle("rec", rec.includes(l.id) && !st); });
  tween(sun.material, { opacity: S.finished ? .9 : .25 }, 1500);
  tween(frameRing.material, { opacity: S.finished ? .8 : .12 }, 1500);
  needs = true;
}
function tween(obj, props, dur) {
  tweens = tweens.filter(t => t.obj !== obj);
  const from = {}; Object.keys(props).forEach(k => from[k] = obj[k]);
  if (reducedM) { Object.assign(obj, props); needs = true; return; }
  tweens.push({ obj, from, to: props, t0: performance.now(), dur });
}

/* ---------- Kamera ---------- */
function viewRect() { return typeof mapRect === "function" ? mapRect() : { x0: 0, y0: 0, x1: innerWidth, y1: innerHeight }; }
function applyCam3() {
  const W = innerWidth, H = innerHeight, r = viewRect(), cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2;
  camS.phi = Math.max(.2, Math.min(2.2, camS.phi)); camS.radius = Math.max(1.6, Math.min(48, camS.radius));
  const sp = new THREE.Spherical(camS.radius, camS.phi, camS.theta);
  camera.position.setFromSpherical(sp).add(camS.target);
  camera.lookAt(camS.target);
  camera.setViewOffset(W, H, W / 2 - cx, H / 2 - cy, W, H);
  /* Seitenverhältnis der freien Fläche berücksichtigen: auf schmalen Flächen etwas weiter weg */
  needs = true;
}
function fitRadius(size) {
  const r = viewRect(), w = Math.max(120, r.x1 - r.x0), h = Math.max(110, r.y1 - r.y0);
  const vfov = camera.fov * Math.PI / 180, aspect = w / h;
  const fh = h / innerHeight; /* Anteil der Höhe */
  const distV = size / 2 / Math.tan(vfov / 2) / fh;
  const distH = size / 2 / (Math.tan(vfov / 2) * aspect) / fh;
  return Math.max(distV, distH) * 1.1;
}
function flyTo(target, radius, theta = null, phi = null, dur = 1100) {
  idleSpin = false;
  let th = theta === null ? camS.theta : theta;
  while (th - camS.theta > Math.PI) th -= Math.PI * 2; while (camS.theta - th > Math.PI) th += Math.PI * 2;
  const to = { target: target.clone(), radius, theta: th, phi: phi === null ? camS.phi : phi };
  if (reducedM || dur <= 1) { camS.target.copy(to.target); camS.radius = radius; camS.theta = th; camS.phi = to.phi; applyCam3(); return Promise.resolve(); }
  return new Promise(res => { fly = { from: { target: camS.target.clone(), radius: camS.radius, theta: camS.theta, phi: camS.phi }, to, t0: performance.now(), dur, res }; });
}
function focus(id, dur = 1100) {
  if (!root || !id) return Promise.resolve();
  const key = id.startsWith("x:") ? "L:" + id.slice(2) : id, n = N[key]; if (!n) return Promise.resolve();
  if (n.kind === "trunk" && key !== "hub") return flyTo(n.p.clone().add(V(0, .6, 0)), fitRadius(6), null, 1.12, dur);
  if (key === "hub") return flyTo(V(0, N.hub.p.y + 3.2, 0), fitRadius(11.5), null, 1.25, dur);
  if (n.kind === "top") return flyTo(N.integration.p.clone().add(V(0, -2, 0)), fitRadius(7), null, 1.3, dur);
  const outward = a => Math.atan2(Math.sin(a), Math.cos(a));
  if (n.kind === "chakra") {
    const pts = [n.p, ...Object.values(N).filter(m => (m.c === key) || (m.owner === key)).map(m => m.p)];
    const c = pts.reduce((a, p) => a.add(p), V()).multiplyScalar(1 / pts.length);
    const sz = Math.max(...pts.map(p => p.distanceTo(c))) * 2 + 1;
    return flyTo(c, fitRadius(sz), n.up ? null : outward(n.az), n.up ? .7 : 1.2, dur);
  }
  if (n.kind === "area") {
    const pts = [n.p, ...Object.values(N).filter(m => m.area === key).map(m => m.p)];
    const c = pts.reduce((a, p) => a.add(p), V()).multiplyScalar(1 / pts.length);
    return flyTo(c, fitRadius(Math.max(2.6, Math.max(...pts.map(p => p.distanceTo(c))) * 2 + 1.2)), outward(n.az), 1.15, dur);
  }
  if (n.kind === "leaf") return flyTo((n.center || n.p).clone(), fitRadius(2.4), outward(n.az), 1.2, dur);
  return Promise.resolve();
}
function overview(dur = 1200) { return flyTo(V(0, (N.integration ? N.integration.p.y : 14) / 2 - .8, 0), fitRadius((N.integration ? N.integration.p.y : 14) + 4.5), null, 1.45, dur); }
function zoom(f) { const r = camS.radius / f; flyTo(camS.target, r, null, null, 300); }
function screenOf(id) {
  const key = id.startsWith("x:") ? "L:" + id.slice(2) : id, n = N[key]; if (!n) return [innerWidth / 2, innerHeight / 2];
  const v = (n.center || n.p).clone().project(camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight];
}

/* ---------- Eingabe: Drehen, Pinch, Pan, Doppeltipp ---------- */
let dragMoved = false;
function bindInput() {
  const pts = new Map(); let g = null, lastTap = null, hoverT = 0;
  const pick = (x, y) => {
    const m = new THREE.Vector2(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1);
    raycaster.setFromCamera(m, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    return hit ? hit.object.userData.node : null;
  };
  const begin = () => {
    const P = [...pts.values()];
    if (P.length === 1) g = { mode: "rot", x: P[0].x, y: P[0].y, lx: P[0].x, ly: P[0].y, moved: false, pan: P[0].pan };
    else { const [a, b] = P; g = { mode: "pinch", d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, r: camS.radius }; dragMoved = true; gesture(); }
  };
  const gesture = () => { idleSpin = false; fly = null; if (typeof setSheet === "function" && mob() && !(innerHeight <= 520) && sheet !== "min") setSheet("min", false); if (typeof hideTip === "function") hideTip(); };
  const panBy = (dx, dy) => {
    const f = camS.radius * 0.0016 * (900 / innerHeight);
    const right = V().setFromMatrixColumn(camera.matrix, 0), up = V().setFromMatrixColumn(camera.matrix, 1);
    camS.target.addScaledVector(right, -dx * f).addScaledVector(up, dy * f);
  };
  canvas.addEventListener("pointerdown", e => {
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey });
    if (pts.size === 1) dragMoved = false; vel = { t: 0, p: 0 }; begin();
  });
  canvas.addEventListener("contextmenu", e => e.preventDefault());
  addEventListener("pointermove", e => {
    if (!pts.has(e.pointerId)) {
      if (e.pointerType === "mouse" && e.target === canvas && T3.active && performance.now() - hoverT > 60) {
        hoverT = performance.now(); const id = pick(e.clientX, e.clientY);
        canvas.style.cursor = id ? "pointer" : "grab";
        if (id && typeof showTip === "function") showTip(id, e); else if (typeof hideTip === "function") hideTip();
      }
      return;
    }
    pts.set(e.pointerId, { ...pts.get(e.pointerId), x: e.clientX, y: e.clientY });
    if (!g) return;
    if (g.mode === "rot") {
      const dx = e.clientX - g.lx, dy = e.clientY - g.ly;
      if (!g.moved && Math.hypot(e.clientX - g.x, e.clientY - g.y) > (e.pointerType === "mouse" ? 5 : 10)) { g.moved = true; dragMoved = true; gesture(); }
      if (g.moved) {
        if (g.pan) panBy(dx, dy); else { camS.theta -= dx * .006; camS.phi -= dy * .005; vel = { t: -dx * .006, p: -dy * .005 }; }
        applyCam3();
      }
      g.lx = e.clientX; g.ly = e.clientY;
    } else {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      camS.radius = g.r * g.d / d; panBy(mx - g.mx, my - g.my); g.mx = mx; g.my = my; applyCam3();
    }
  }, { passive: true });
  const end = e => {
    if (!pts.has(e.pointerId)) return; pts.delete(e.pointerId);
    if (g && g.mode === "rot" && pts.size === 0 && !g.moved && e.type === "pointerup") {
      const id = pick(e.clientX, e.clientY), now = performance.now();
      const dbl = e.pointerType !== "mouse" && lastTap && now - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 36;
      if (dbl) { lastTap = null; gesture(); if (lastTap === null && id) { focus(id); } else zoom(1.8); }
      else { lastTap = { t: now, x: e.clientX, y: e.clientY }; if (id) clickNode(id); }
    }
    if (pts.size > 0) { begin(); if (g) g.moved = true; } else { g = null; setTimeout(() => dragMoved = false, 0); }
  };
  addEventListener("pointerup", end); addEventListener("pointercancel", end);
  canvas.addEventListener("dblclick", e => { const id = pick(e.clientX, e.clientY); if (id) focus(id); else zoom(1.8); });
  canvas.addEventListener("wheel", e => { e.preventDefault(); fly = null; idleSpin = false; camS.radius *= Math.exp(e.deltaY * (e.ctrlKey ? .01 : .0012)); applyCam3(); }, { passive: false });
  ["gesturestart", "gesturechange"].forEach(t => canvas.addEventListener(t, e => e.preventDefault()));
}

/* ---------- Schleife ---------- */
const tmpO = new THREE.Object3D(), tv = V();
function loop(now) {
  requestAnimationFrame(loop);
  if (!T3.active || document.hidden || (document.getElementById("exercise") && !document.getElementById("exercise").hidden)) return;
  let busy = false;
  if (fly) {
    const k = Math.min(1, (now - fly.t0) / fly.dur), e = ease(k);
    camS.target.lerpVectors(fly.from.target, fly.to.target, e);
    camS.radius = fly.from.radius + (fly.to.radius - fly.from.radius) * e;
    camS.theta = fly.from.theta + (fly.to.theta - fly.from.theta) * e;
    camS.phi = fly.from.phi + (fly.to.phi - fly.from.phi) * e;
    applyCam3(); busy = true;
    if (k >= 1) { const r = fly.res; fly = null; r(); }
  } else if (Math.abs(vel.t) + Math.abs(vel.p) > .0004 && !reducedM) {
    camS.theta += vel.t; camS.phi += vel.p; vel.t *= .92; vel.p *= .92; applyCam3(); busy = true;
  } else if (idleSpin && !reducedM) { camS.theta += .0012; applyCam3(); busy = true; }
  if (tweens.length) {
    tweens = tweens.filter(t => { const k = Math.min(1, (now - t.t0) / t.dur), e = ease(k); Object.keys(t.to).forEach(p => t.obj[p] = t.from[p] + (t.to[p] - t.from[p]) * e); return k < 1; });
    busy = true;
  }
  /* Blätter entfalten */
  let lc = false;
  for (let i = 0; i < leafInst.length; i++) {
    const L = leafInst[i]; if (L.cur === L.to) continue;
    const k = Math.max(0, Math.min(1, (now - L.t0) / 900));
    L.cur = k >= 1 ? L.to : L.from + (L.to - L.from) * (1 - Math.pow(1 - k, 3)) * (k < 1 ? 1 + Math.sin(k * Math.PI) * .15 : 1);
    tmpO.position.copy(L.p); tmpO.rotation.set(...L.rot); tmpO.scale.setScalar(L.s * L.cur); tmpO.updateMatrix(); leafMesh.setMatrixAt(i, tmpO.matrix); lc = true;
  }
  if (lc) { leafMesh.instanceMatrix.needsUpdate = true; busy = true; }
  /* Markierung der aktuellen Station pulsiert */
  const cur = S.node && N[S.node.startsWith("x:") ? "L:" + S.node.slice(2) : S.node];
  if (cur && S.phase !== "welcome") { marker.position.copy(cur.center || cur.p); marker.material.opacity = .35 + Math.sin(now / 400) * .2; marker.scale.setScalar(1.2 + Math.sin(now / 400) * .2); busy = true; }
  else marker.material.opacity = 0;
  if (busy || needs) { renderer.render(scene, camera); placeLabels(); needs = false; }
}
const PRIO = { top: 1, chakra: 2, trunk: 3, area: 4, leaf: 5 };
function placeLabels() {
  const W = innerWidth, H = innerHeight, focusKey = S.node ? (S.node.startsWith("x:") ? "L:" + S.node.slice(2) : S.node) : "";
  const fn = N[focusKey] || {}, cand = [];
  labelsEl.classList.toggle("far", camS.radius > (mob() ? 11 : 16));
  for (const l of labels) {
    const n = N[l.id]; if (!n) continue;
    tv.copy(n.center || n.p); const dist = tv.distanceTo(camera.position); tv.project(camera);
    let show = tv.z < 1 && tv.x > -1.05 && tv.x < 1.05 && tv.y > -1.05 && tv.y < 1.05;
    if (show && l.kind === "leaf") show = dist < 6.5 || n.owner === focusKey || n.area === focusKey || l.id === focusKey || (fn.c && n.owner === fn.c);
    if (show && l.kind === "area") show = dist < 10 || n.c === focusKey || l.id === focusKey || (fn.c && n.c === fn.c);
    if (show) cand.push({ l, x: (tv.x + 1) / 2 * W, y: (1 - tv.y) / 2 * H, dist, pr: l.id === focusKey ? 0 : PRIO[l.kind] || 6 });
    else if (l.vis !== false) { l.el.style.display = "none"; l.vis = false; }
  }
  /* einfache Kollisionsvermeidung: Wichtiges zuerst, Überlappendes ausblenden */
  cand.sort((a, b) => a.pr - b.pr || a.dist - b.dist);
  const placed = [];
  for (const c of cand) {
    const l = c.l;
    if (l.vis !== true) { l.el.style.display = ""; l.vis = true; }
    if (!l.w || l.far !== labelsEl.classList.contains("far")) { l.w = l.el.offsetWidth; l.h = l.el.offsetHeight; l.far = labelsEl.classList.contains("far"); }
    const top = l.kind === "leaf" ? c.y - l.h * 1.3 : c.y + l.h * .4, box = [c.x - l.w / 2, top, c.x + l.w / 2, top + l.h];
    if (c.pr > 0 && placed.some(p => box[0] < p[2] + 2 && box[2] > p[0] - 2 && box[1] < p[3] + 2 && box[3] > p[1] - 2)) { l.el.style.display = "none"; l.vis = false; continue; }
    placed.push(box);
    l.el.style.transform = `translate(${box[0].toFixed(1)}px,${box[1].toFixed(1)}px)`;
  }
}
function resize() { if (!renderer) return; renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); applyCam3(); }

/* ---------- Öffentliche API ---------- */
function init() {
  if (!webglOK()) return;
  canvas = document.createElement("canvas"); canvas.id = "map3d"; canvas.setAttribute("aria-label", "3D-Lebensbaum – ziehen zum Drehen, zwei Finger zum Zoomen");
  labelsEl = document.createElement("div"); labelsEl.id = "labels3d";
  const main = document.querySelector("main"); main.insertBefore(labelsEl, main.firstChild); main.insertBefore(canvas, main.firstChild);
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !mob(), alpha: true, powerPreference: "high-performance" }); } catch { canvas.remove(); labelsEl.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mob() ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x0a0620, .018);
  camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 300);
  scene.add(new THREE.HemisphereLight(0xcdb8ff, 0x2a1030, 1.1));
  const dl = new THREE.DirectionalLight(0xfff0d8, 1.4); dl.position.set(5, 12, 7); scene.add(dl);
  glowTex = makeGlowTex();
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(.08, .1, .22, .12, .36, 0); sh.bezierCurveTo(.22, -.12, .08, -.1, 0, 0);
  leafGeo = new THREE.ShapeGeometry(sh, 4);
  /* Sterne */
  const sp = [], sr = rng("stars");
  for (let i = 0; i < (mob() ? 500 : 1100); i++) { const v = V(sr() - .5, sr() - .5, sr() - .5).normalize().multiplyScalar(60 + sr() * 60); sp.push(v.x, v.y + 10, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xe8dcff, size: .35, sizeAttenuation: true, transparent: true, opacity: .8, fog: false })));
  bindInput();
  addEventListener("resize", resize);
  T3.ok = true; resize();
  requestAnimationFrame(loop);
}
Object.assign(T3, {
  build, refresh, focus, overview, zoom, screenOf,
  activate(on) { T3.active = on && T3.ok; document.body.classList.toggle("v3d", T3.active); if (T3.active) { resize(); needs = true; } },
  spin(on) { idleSpin = on && !reducedM; },
  flyToLeaf(key) { const n = N[key]; if (!n) return Promise.resolve(); return flyTo((n.center || n.p).clone(), fitRadius(1.3), Math.atan2(Math.sin(n.az), Math.cos(n.az)), 1.2, 650); },
  relayout() { applyCam3(); }
});
init();
if (typeof window.onT3Ready === "function") window.onT3Ready();
