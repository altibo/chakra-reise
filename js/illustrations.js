"use strict";
/* Lichtkörper-Illustrationen als SVG (eigene Grafik, keine Fremdbilder) */
const Illu = (() => {
  const CH = ["root", "sacral", "solar", "heart", "throat", "third", "crown"];
  const POSES = {
    sit: {
      head: [120, 52, 17],
      torso: "M95 86 Q120 76 145 86 L139 150 Q120 162 101 150 Z",
      limbs: ["M96 88 Q76 118 72 148 Q74 166 90 170", "M144 88 Q164 118 168 148 Q166 166 150 170",
              "M120 160 Q82 160 48 182 Q88 198 120 186 Q152 198 192 182 Q158 160 120 160"],
      ch: [[120,168],[120,152],[120,131],[120,107],[120,79],[120,49],[120,28]], feet: [[70,190],[170,190]]
    },
    stand: {
      head: [120, 36, 15],
      torso: "M100 62 Q120 55 140 62 L136 128 Q120 140 104 128 Z",
      limbs: ["M100 64 Q86 100 86 138", "M140 64 Q154 100 154 138", "M111 132 L107 190 L105 242", "M129 132 L133 190 L135 242"],
      ch: [[120,138],[120,124],[120,106],[120,84],[120,58],[120,33],[120,15]], feet: [[105,246],[135,246]]
    },
    wide: {
      head: [120, 40, 15],
      torso: "M100 66 Q120 59 140 66 L136 132 Q120 144 104 132 Z",
      limbs: ["M100 68 L54 74", "M140 68 L186 74", "M110 136 Q82 162 74 198 L70 242", "M130 136 Q158 162 166 198 L170 242"],
      ch: [[120,142],[120,128],[120,110],[120,88],[120,62],[120,37],[120,19]], feet: [[70,246],[170,246]]
    },
    lie: {
      head: [38, 170, 15],
      torso: "M58 158 Q60 154 66 154 L146 157 Q152 170 146 184 L66 186 Q58 186 58 182 Z",
      limbs: ["M66 152 L140 150", "M66 190 L140 192", "M148 164 L228 166", "M148 178 L228 180"],
      ch: [[148,171],[132,171],[112,171],[90,171],[64,171],[40,170],[18,170]], feet: [[232,166],[232,180]]
    }
  };

  function figure(pose, tf, id) {
    const p = POSES[pose];
    const [hx, hy, hr] = p.head;
    let s = `<g transform="${tf || ""}" class="lb">`;
    s += `<path d="${p.torso}" class="lb-torso" fill="url(#bodyG${id})"/>`;
    p.limbs.forEach(d => s += `<path d="${d}" class="lb-limb"/>`);
    s += `<circle cx="${hx}" cy="${hy}" r="${hr}" class="lb-head" fill="url(#bodyG${id})"/>`;
    s += `</g>`;
    return s;
  }
  function apply(tf, pt) {
    if (!tf) return pt;
    const m = /translate\(([-\d.]+)[ ,]([-\d.]+)\)\s*scale\(([-\d.]+)\)/.exec(tf);
    if (!m) return pt;
    return [pt[0] * +m[3] + +m[1], pt[1] * +m[3] + +m[2]];
  }
  function chakraDots(pose, tf, hi, small) {
    const p = POSES[pose];
    let s = "";
    p.ch.forEach((pt, i) => {
      const [x, y] = apply(tf, pt);
      const c = CHAKRAS[CH[i]].color;
      const isHi = hi === CH[i] || hi === "all";
      const r = (small ? 3 : 4.2) * (isHi ? 1.6 : 1);
      if (isHi) s += `<circle cx="${x}" cy="${y}" r="${r * 4}" fill="${c}" opacity=".35" class="pulse" filter="url(#blur6)"/>`;
      s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" filter="url(#glow2)"/>`;
    });
    return s;
  }
  const P = (pose, tf, i) => apply(tf, POSES[pose].ch[i]);

  function fx(list, pose, tfs, color) {
    let s = "";
    const tf = tfs[0];
    const ch = n => P(pose, tf, CH.indexOf(n));
    list.forEach(f => {
      if (f === "roots") {
        POSES[pose].feet.forEach(ft => {
          const [x, y] = apply(tf, ft);
          for (let k = -2; k <= 2; k++) {
            s += `<path d="M${x} ${y} q${k * 6} 12 ${k * 14} 22 t${k * 8} 18" class="fx-root" stroke="${CHAKRAS.root.color}"/>`;
          }
        });
      }
      if (f === "breath") {
        const [x, y] = ch("heart");
        s += `<circle cx="${x}" cy="${y}" r="30" class="fx-ring" stroke="${color}"/><circle cx="${x}" cy="${y}" r="30" class="fx-ring d2" stroke="${color}"/>`;
      }
      if (f === "heart") {
        tfs.forEach(t => { const [x, y] = P(pose, t, 3);
          s += `<circle cx="${x}" cy="${y}" r="16" class="fx-ring" stroke="${CHAKRAS.heart.color}"/><circle cx="${x}" cy="${y}" r="16" class="fx-ring d2" stroke="${CHAKRAS.heart.color}"/>`; });
      }
      if (f === "sound" || f === "hum") {
        tfs.forEach(t => { const [x, y] = P(pose, t, 4);
          for (let k = 1; k <= 3; k++) s += `<path d="M${x + 10 + k * 8} ${y - 8 - k * 3} q${6 + k * 2} ${8 + k * 3} 0 ${16 + k * 6}" class="fx-wave d${k}" stroke="${CHAKRAS.throat.color}"/>
            <path d="M${x - 10 - k * 8} ${y - 8 - k * 3} q${-6 - k * 2} ${8 + k * 3} 0 ${16 + k * 6}" class="fx-wave d${k}" stroke="${CHAKRAS.throat.color}"/>`; });
      }
      if (f === "eye" || f === "eyes") {
        tfs.forEach(t => { const [x, y] = P(pose, t, 5);
          for (let a = -60; a <= 60; a += 30) { const r = a * Math.PI / 180;
            s += `<line x1="${x}" y1="${y}" x2="${x + Math.sin(r) * 40}" y2="${y - Math.cos(r) * 40}" class="fx-ray" stroke="${CHAKRAS.third.color}"/>`; } });
      }
      if (f === "nadi") {
        const top = ch("third"), bot = ch("root");
        const h = bot[1] - top[1];
        let d1 = `M${bot[0]} ${bot[1]}`, d2 = d1;
        for (let k = 1; k <= 6; k++) { const y = bot[1] - h * k / 6; const sgn = k % 2 ? 1 : -1;
          d1 += ` Q${bot[0] + sgn * 26} ${y + h / 12} ${bot[0]} ${y}`; d2 += ` Q${bot[0] - sgn * 26} ${y + h / 12} ${bot[0]} ${y}`; }
        s += `<path d="${d1}" class="fx-nadi" stroke="#dfe7ff"/><path d="${d2}" class="fx-nadi d2" stroke="#ffd36b"/>`;
      }
      if (f === "shake") {
        const [x, y] = ch("solar");
        [-1, 1].forEach(sg => { for (let k = 0; k < 3; k++) s += `<path d="M${x + sg * (50 + k * 10)} ${y - 30 + k * 22} q${sg * 6} 6 0 12 q${-sg * 6} 6 0 12" class="fx-wave d${k + 1}" stroke="${color}"/>`; });
      }
      if (f === "fire") {
        tfs.forEach(t => { const [x, y] = P(pose, t, 2);
          s += `<path d="M${x} ${y - 26} C${x + 16} ${y - 6} ${x + 12} ${y + 12} ${x} ${y + 14} C${x - 12} ${y + 12} ${x - 16} ${y - 6} ${x} ${y - 26}Z" fill="${CHAKRAS.solar.color}" class="fx-flame" filter="url(#blur3)"/>`; });
      }
      if (f === "tap") {
        const pts = [[96, 110], [148, 100], [110, 170], [132, 200], [120, 40], [90, 140]];
        pts.forEach((pt, k) => { const [x, y] = apply(tf, pt); s += `<circle cx="${x}" cy="${y}" r="5" class="fx-tap" style="animation-delay:${k * .25}s" fill="${color}"/>`; });
      }
      if (f === "release") {
        for (let k = 0; k < 3; k++) s += `<path d="M${50 + k * 60} 140 q10 -10 20 0 t20 0" class="fx-wave d${k + 1}" stroke="${color}"/>`;
      }
      if (f === "waves") {
        tfs.forEach(t => { const [x, y] = P(pose, t, 1);
          for (let k = 0; k < 3; k++) s += `<path d="M${x - 46} ${y + k * 7 - 4} q11.5 -8 23 0 t23 0 t23 0 t23 0" class="fx-water d${k + 1}" stroke="${CHAKRAS.sacral.color}"/>`; });
      }
      if (f === "light") {
        const xs = tfs.map(t => P(pose, t, 6));
        xs.forEach(([x, y]) => s += `<rect x="${x - 14}" y="0" width="28" height="260" fill="url(#lightCol)" class="fx-light"/><circle cx="${x}" cy="${y - 4}" r="20" fill="${CHAKRAS.crown.color}" opacity=".5" filter="url(#blur6)" class="pulse"/>`);
        if (xs.length === 2) s += `<path d="M${xs[0][0]} ${xs[0][1]} Q120 -30 ${xs[1][0]} ${xs[1][1]}" class="fx-arc" stroke="${CHAKRAS.crown.color}"/>`;
      }
      if (f === "flow") {
        tfs.forEach(t => { const pts = CH.map((_, i) => P(pose, t, i));
          const d = "M" + pts.map(p => p.join(" ")).join(" L");
          s += `<path id="flowPath${t ? t.length : 0}" d="${d}" class="fx-channel"/>`;
          CH.forEach((c, i) => s += `<circle r="3.5" fill="${CHAKRAS[c].color}" filter="url(#glow2)"><animateMotion dur="4s" begin="${i * .55}s" repeatCount="indefinite" path="${d}"/></circle>`);
          const top = pts[6]; s += `<path d="M${top[0]} ${top[1]} q-40 -20 -50 40 M${top[0]} ${top[1]} q40 -20 50 40" class="fx-arc" stroke="#fff"/>`; });
      }
      if (f === "glow") {
        const [x, y] = ch("heart");
        s += `<ellipse cx="${pose === "lie" ? 130 : x}" cy="${pose === "lie" ? 170 : y + 10}" rx="${pose === "lie" ? 120 : 70}" ry="${pose === "lie" ? 40 : 110}" fill="${color}" opacity=".18" filter="url(#blur6)" class="pulse"/>`;
      }
      if (f === "sync" && tfs.length === 2) {
        tfs.forEach(t => { const [x, y] = P(pose, t, 3); s += `<circle cx="${x}" cy="${y}" r="20" class="fx-ring" stroke="${color}"/>`; });
      }
      if (f === "circle" && tfs.length === 2) {
        const a = P(pose, tfs[0], 3), b = P(pose, tfs[1], 3), ra = P(pose, tfs[0], 0), rb = P(pose, tfs[1], 0);
        const d = `M${a[0]} ${a[1]} Q120 ${a[1] - 40} ${b[0]} ${b[1]} L${rb[0]} ${rb[1]} Q120 ${rb[1] + 40} ${ra[0]} ${ra[1]} Z`;
        s += `<path d="${d}" class="fx-channel"/>`;
        for (let k = 0; k < 6; k++) s += `<circle r="3.5" fill="${k % 2 ? CHAKRAS.heart.color : "#ff9ecb"}" filter="url(#glow2)"><animateMotion dur="6s" begin="${k}s" repeatCount="indefinite" path="${d}"/></circle>`;
      }
    });
    return s;
  }

  let uid = 0;
  /* Generierte Bilder (img/pose-*.webp) ersetzen die Vektorfiguren */
  function poseImg(ex) { return "pose-" + (ex.pose || "sit"); }
  function render(ex) {
    const color = CHAKRAS[ex.chakra].color;
    return `<div class="illu-img ${ex.fx && ex.fx.includes("shake") ? "shaking" : ""}" style="--c:${color}" role="img" aria-label="Bild: ${ex.title}">
      <img src="img/${poseImg(ex)}.webp" alt="" loading="lazy"><span class="illu-glow"></span></div>`;
  }
  function thumb(ex) {
    return `<span class="illu-thumb" style="--c:${CHAKRAS[ex.chakra].color};background-image:url(img/${poseImg(ex)}.webp)"></span>`;
  }
  function renderSvg(ex, opts = {}) {
    const id = ++uid;
    const color = CHAKRAS[ex.chakra].color;
    let pose = ex.pose, tfs = [""], basePose = pose;
    if (pose === "c-face") { basePose = "sit"; tfs = ["translate(-8 40) scale(0.62)", "translate(98 40) scale(0.62)"]; }
    if (pose === "c-back") { basePose = "sit"; tfs = ["translate(10 40) scale(0.62)", "translate(82 40) scale(0.62)"]; }
    if (pose === "c-side") { basePose = "sit"; tfs = ["translate(0 40) scale(0.62)", "translate(90 40) scale(0.62)"]; }
    if (pose === "c-hug") { basePose = "stand"; tfs = ["translate(10 20) scale(0.85)", "translate(44 20) scale(0.85)"]; }
    let s = `<svg viewBox="0 0 240 260" class="illu ${ex.fx.includes("shake") ? "shaking" : ""}" role="img" aria-label="Illustration: ${ex.title}">
      <defs>
        <radialGradient id="bodyG${id}" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="${color}" stop-opacity=".12"/></radialGradient>
        <linearGradient id="lightCol" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#c77dff" stop-opacity="0"/></linearGradient>
        <filter id="glow2" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="blur6" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6"/></filter>
        <filter id="blur3" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.5"/></filter>
      </defs>
      <circle cx="120" cy="125" r="110" fill="${color}" opacity=".07"/>`;
    s += `<g class="fx-back">${fx(ex.fx.filter(f => ["light", "glow", "roots"].includes(f)), basePose, tfs, color)}</g>`;
    tfs.forEach(t => s += figure(basePose, t, id));
    if (pose === "c-hug") s += `<circle cx="120" cy="${apply(tfs[0], POSES.stand.ch[3])[1]}" r="26" fill="${CHAKRAS.heart.color}" opacity=".35" filter="url(#blur6)" class="pulse"/>`;
    tfs.forEach(t => s += chakraDots(basePose, t, opts.allChakras ? "all" : ex.chakra, tfs.length > 1));
    s += `<g class="fx-front">${fx(ex.fx.filter(f => !["light", "glow", "roots"].includes(f)), basePose, tfs, color)}</g>`;
    s += `</svg>`;
    return s;
  }

  function flame() {
    return `<svg viewBox="0 0 120 240" class="flame-svg" role="img" aria-label="Kerzenflamme zum Betrachten">
      <defs><radialGradient id="fl1" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ffe7a3"/><stop offset=".7" stop-color="#ff9a3c"/><stop offset="1" stop-color="#ff5e3a" stop-opacity="0"/></radialGradient>
      <filter id="flb"><feGaussianBlur stdDeviation="3"/></filter></defs>
      <circle cx="60" cy="110" r="55" fill="#ffb347" opacity=".18" filter="url(#flb)"/>
      <path class="flame-core" d="M60 40 C80 80 82 110 60 140 C38 110 40 80 60 40Z" fill="url(#fl1)" filter="url(#flb)"/>
      <path d="M60 85 C68 100 68 115 60 128 C52 115 52 100 60 85Z" fill="#9fd3ff" opacity=".55"/>
      <line x1="60" y1="138" x2="60" y2="150" stroke="#333" stroke-width="2"/>
      <rect x="44" y="150" width="32" height="80" rx="4" fill="#f4ead8" opacity=".9"/></svg>`;
  }

  /* Chakra-Mandala für Ergebnis */
  function mandala(results) {
    let s = `<svg viewBox="0 0 300 300" class="mandala" role="img" aria-label="Chakra-Mandala deiner Reise">
      <defs><filter id="mg"><feGaussianBlur stdDeviation="4"/></filter></defs>`;
    for (let k = 0; k < 24; k++) { const a = k * 15 * Math.PI / 180;
      s += `<ellipse cx="${150 + Math.cos(a) * 70}" cy="${150 + Math.sin(a) * 70}" rx="64" ry="18" transform="rotate(${k * 15} ${150 + Math.cos(a) * 70} ${150 + Math.sin(a) * 70})" fill="none" stroke="rgba(255,255,255,.08)"/>`; }
    CH.forEach((c, i) => {
      const r = 128 - i * 17; const st = results[c] ? results[c].status : "open";
      const col = CHAKRAS[c].color;
      const op = st === "moving" ? .45 : st === "skipped" || st === "open" ? .15 : 1;
      s += `<circle cx="150" cy="150" r="${r}" fill="none" stroke="${col}" stroke-width="7" opacity="${op}" ${st === "moving" ? 'stroke-dasharray="6 6"' : ""}/>`;
    });
    s += `<circle cx="150" cy="150" r="22" fill="#fff" opacity=".9" filter="url(#mg)"/><circle cx="150" cy="150" r="10" fill="#fff"/></svg>`;
    return s;
  }
  return { render, renderSvg, thumb, poseImg, flame, mandala };
})();
