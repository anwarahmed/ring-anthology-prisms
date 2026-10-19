// Scenery that gives levels depth: props scattered on ground surfaces (some in front of
// the characters), a foreground silhouette layer that passes in front of the action,
// pools of light around fires and lamps, and a soft vignette.
//
// Theme fields (src/content/themes.js):
//   props: [{ kind, chance, front, color, glow }]   kinds: grass rocks rubble lamp crystal
//                                                   plant console growth debris
//   foreground: { kind: pillars | ferns | rubble, color, rim, every }
//   decor: [{ kind, chance, color, trim, glow }]   back-wall decorations for interiors:
//          pipes (vertical, flanges, valve), cables (sagging between two points),
//          banners (cloth hanging from the top of a wall), glyphs (glowing panels)

import { render, material, hexRgb } from './raster.js';
import { TILE, VIEW, ART, STYLE } from './config.js';
import { TILES } from './mapparse.js';
import { hexNum } from './textures.js';

function hash(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function shadeHex(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 + k))));
  return `#${((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, '0')}`;
}

// Prop art, drawn with the sprite renderer so it matches the characters.
// Each returns { w, h, shapes, mats, glow? } with the base of the prop at the bottom.
const PROPS = {
  // A dense tuft: fine blades of two tones, each bending over at the tip.
  grass: (c, v) => ({
    w: 20, h: 11,
    shapes: Array.from({ length: 14 }, (_, i) => {
      const x = 1.5 + i * 1.3 + ((i * 7 + v) % 3) * 0.3;
      const h = 4 + ((i * 5 + v * 3) % 7) * 0.9;
      const lean = ((i * 3 + v) % 5) - 2;
      const mid = [x + lean * 0.4, 11 - h * 0.6];
      return [
        { t: 'cap', a: [x, 11], b: mid, r1: 0.65, r2: 0.45, m: i % 3 ? 'a' : 'b', z: i % 2 },
        { t: 'cap', a: mid, b: [x + lean * 1.1, 11 - h], r1: 0.45, r2: 0.15, m: i % 3 ? 'a' : 'b', z: i % 2 },
      ];
    }).flat(),
    mats: { a: material(c.color ?? '#5ab048', { texture: 0.4 }), b: material(shadeHex(c.color ?? '#5ab048', -0.25), { texture: 0.4 }) },
  }),
  plant: (c, v) => ({
    w: 26, h: 20,
    shapes: [0, 1, 2, 3, 4].map((i) => ({ t: 'ell', c: [5 + i * 4, 14 - (i % 2) * 4 - v], rx: 5, ry: 3.4, rot: (i - 2) * 0.35, m: 'a', z: i % 2 })),
    mats: { a: material(c.color ?? '#3e8a3a', { texture: 0.6 }) },
  }),
  rocks: (c, v) => ({
    w: 22, h: 10,
    shapes: [
      { t: 'poly', pts: [[2, 10], [3, 5], [7, 2.5 - v * 0.5], [12, 4], [13, 10]], m: 'a', bevel: 1.6, tilt: [0.1, -0.2] },
      { t: 'poly', pts: [[11, 10], [13, 6], [17, 5], [20, 7], [21, 10]], m: 'a', z: 1, bevel: 1.4, tilt: [-0.1, -0.2] },
      { t: 'cap', a: [6, 5], b: [8, 8], r1: 0.25, r2: 0.25, m: 'b', z: 0.5, noSep: true },
    ],
    mats: { a: material(c.color ?? '#8a7a6a', { texture: 0.7 }), b: material(shadeHex(c.color ?? '#8a7a6a', -0.45)) },
  }),
  rubble: (c, v) => ({
    w: 24, h: 10,
    shapes: [
      { t: 'poly', pts: [[1, 10], [5, 3], [11, 4], [12, 10]], m: 'a', bevel: 1.2 },
      { t: 'poly', pts: [[10, 10], [14, 5 - v], [20, 6], [22, 10]], m: 'a', bevel: 1.2, z: 1 },
    ],
    mats: { a: material(c.color ?? '#6a5a4a', { texture: 0.6 }) },
  }),
  debris: (c) => ({
    w: 24, h: 10,
    shapes: [
      { t: 'poly', pts: [[1, 10], [8, 4], [14, 6], [12, 10]], m: 'a', bevel: 1 },
      { t: 'cap', a: [11, 9], b: [22, 5], r1: 1, r2: 1, m: 'a', z: 1 },
    ],
    mats: { a: material(c.color ?? '#7a8088', { spec: true, texture: 0.3 }) },
  }),
  lamp: (c) => ({
    w: 10, h: 28, glow: c.glow ?? '#ffc23a', glowAt: [5, 4],
    shapes: [
      { t: 'cap', a: [5, 28], b: [5, 6], r1: 1.2, r2: 1, m: 'a' },
      { t: 'ell', c: [5, 4], rx: 3, ry: 3, m: 'g', z: 1, hot: true },
    ],
    mats: { a: material(c.color ?? '#4a3a2a', { spec: true }), g: material(c.glow ?? '#ffc23a', { emissive: true }) },
  }),
  crystal: (c, v) => ({
    w: 16, h: 18, glow: c.glow ?? '#45e6ff', glowAt: [8, 10],
    shapes: [
      { t: 'poly', pts: [[4, 18], [6, 4 + v], [9, 18]], m: 'g', bevel: 1 },
      { t: 'poly', pts: [[8, 18], [11, 7], [13, 18]], m: 'g', bevel: 1, z: 1 },
    ],
    mats: { g: material(c.glow ?? '#45e6ff', { emissive: true }) },
  }),
  console: (c) => ({
    w: 18, h: 16, glow: c.glow ?? '#45e6ff', glowAt: [9, 6],
    shapes: [
      { t: 'poly', pts: [[2, 16], [3, 4], [15, 2], [16, 16]], m: 'a', bevel: 1.4, tilt: [0, -0.2] },
      { t: 'poly', pts: [[5, 9], [5, 5], [13, 4], [13, 8]], m: 'g', z: 1, bevel: 0.5 },
    ],
    mats: { a: material(c.color ?? '#5a6470', { spec: true }), g: material(c.glow ?? '#45e6ff', { emissive: true }) },
  }),
  growth: (c, v) => ({
    w: 22, h: 10,
    shapes: [{ t: 'ell', c: [6, 8], rx: 5, ry: 3.5 + v * 0.5, m: 'a' }, { t: 'ell', c: [14, 8], rx: 6, ry: 4, m: 'a', z: 1 }, { t: 'ell', c: [11, 5], rx: 3, ry: 2.5, m: 'a', z: 2 }],
    mats: { a: material(c.color ?? '#c8c060', { texture: 0.5 }) },
  }),
};

function propTexture(scene, theme, kind, cfg, variant) {
  const key = `prop-${theme}-${kind}-${variant}`;
  if (!scene.textures.exists(key)) {
    const pr = PROPS[kind](cfg, variant);
    const rgba = render(pr.shapes, pr.w * ART, pr.h * ART, pr.mats, STYLE === 'prerendered' ? { scale: ART, smooth: true } : { scale: ART });
    const tex = scene.textures.createCanvas(key, pr.w * ART, pr.h * ART);
    tex.getContext().putImageData(new ImageData(rgba, pr.w * ART, pr.h * ART), 0, 0);
    tex.refresh();
  }
  return key;
}

// Back-wall decorations. Each takes the theme's decor entry, a variant and a length in
// world pixels (pipe height, cable span, banner drop) and returns { w, h, shapes, mats }.
const DECOR = {
  pipes: (c, v, len) => {
    const shapes = [{ t: 'cap', a: [5, 0], b: [5, len], r1: 2.6, r2: 2.6, m: 'p', z: 0 }];
    for (let y = 10 + v * 4; y < len - 4; y += 26) shapes.push({ t: 'ell', c: [5, y], rx: 4.2, ry: 1.6, m: 'f', z: 1 });
    const vy = Math.min(len - 8, 24 + v * 18);
    shapes.push({ t: 'ell', c: [5, vy], rx: 3.6, ry: 3.6, m: 'r', z: 2 }, { t: 'ell', c: [5, vy], rx: 1.4, ry: 1.4, m: 'f', z: 3 });
    return { w: 10, h: len, shapes, mats: { p: material(c.color ?? '#6a737c', { spec: true, texture: 0.4 }), f: material(c.trim ?? '#3a4048', { spec: true }), r: material(c.glow ?? '#c8402e', { spec: true }) } };
  },
  cables: (c, v, len) => {
    const sag = 10 + v * 5, shapes = [];
    for (const [k, off] of [[0, 0], [1, 3]]) {
      let px = 1, py = 2 + off;
      for (let i = 1; i <= 12; i++) {
        const t = i / 12, x = 1 + t * (len - 2), y = 2 + off + 4 * (sag - k * 3) * t * (1 - t);
        shapes.push({ t: 'cap', a: [px, py], b: [x, y], r1: 1.1, r2: 1.1, m: k ? 'b' : 'a', z: k });
        px = x; py = y;
      }
    }
    shapes.push({ t: 'ell', c: [2, 3], rx: 2.2, ry: 2.2, m: 'h', z: 3 }, { t: 'ell', c: [len - 2, 3], rx: 2.2, ry: 2.2, m: 'h', z: 3 });
    return { w: len, h: sag + 10, shapes, mats: { a: material('#22262c', { spec: true }), b: material(c.color ?? '#3a3226', { spec: true }), h: material(c.trim ?? '#7a828c', { spec: true }) } };
  },
  banners: (c, v, len) => {
    const w = 18, cut = v === 1 ? [[2, len - 8], [9, len], [16, len - 8]] : [[2, len], [16, len]];
    const shapes = [
      { t: 'cap', a: [0, 2], b: [w, 2], r1: 1.3, r2: 1.3, m: 'rod', z: 2 },
      { t: 'poly', pts: [[2, 2], [16, 2], ...cut.slice().reverse()], m: 'cloth', z: 0, bevel: 2, tilt: [0.15, 0] },
      { t: 'poly', pts: [[2, 6], [16, 6], [16, 8], [2, 8]], m: 'trim', z: 1, bevel: 0 },
      { t: 'poly', pts: [[9, len * 0.35], [13, len * 0.35 + 6], [9, len * 0.35 + 12], [5, len * 0.35 + 6]], m: 'trim', z: 1, bevel: 1 },
    ];
    return { w, h: len, shapes, mats: { rod: material('#c8a040', { spec: true }), cloth: material(c.color ?? '#7a1e2e', { texture: 0.6 }), trim: material(c.trim ?? '#e8c46a', { spec: true }) } };
  },
  glyphs: (c, v) => {
    const shapes = [
      { t: 'poly', pts: [[0, 0], [16, 0], [16, 26], [0, 26]], m: 'frame', z: 0, bevel: 2 },
      { t: 'poly', pts: [[3, 3], [13, 3], [13, 23], [3, 23]], m: 'panel', z: 1, bevel: 0 },
    ];
    for (let i = 0; i < 4; i++) {
      const y = 6 + i * 4.5, x0 = 5 + ((i + v) % 2) * 2, x1 = 11 - ((i + v + 1) % 3);
      shapes.push({ t: 'cap', a: [x0, y], b: [x1, y], r1: 0.7, r2: 0.7, m: 'glyph', z: 2 });
    }
    return { w: 16, h: 26, shapes, mats: { frame: material(c.color ?? '#3a4a5a', { spec: true }), panel: material('#0a1420'), glyph: material(c.glow ?? '#7fd8ff', { emissive: true }) }, glow: c.glow ?? '#7fd8ff' };
  },
};

function decorTexture(scene, theme, kind, cfg, variant, len) {
  const key = `decor-${theme}-${kind}-${variant}-${len}`;
  if (!scene.textures.exists(key)) {
    const d = DECOR[kind](cfg, variant, len);
    const rgba = render(d.shapes, d.w * ART, d.h * ART, d.mats, STYLE === 'prerendered' ? { scale: ART, smooth: true } : { scale: ART });
    const tex = scene.textures.createCanvas(key, d.w * ART, d.h * ART);
    tex.getContext().putImageData(new ImageData(rgba, d.w * ART, d.h * ART), 0, 0);
    tex.refresh();
  }
  return key;
}

// Places decorations on back-wall areas (the map's ':' cells): on each vertical run
// of back wall, at most one decoration every few columns.
function buildDecor(scene, themeId, decor, map, at) {
  const lastAt = new Map();
  for (let x = 2; x < map.width - 2; x++) {
    for (let y = 0; y < map.height; y++) {
      if (at(x, y) !== TILES.back || at(x, y - 1) === TILES.back) continue;
      let y1 = y;
      while (at(x, y1 + 1) === TILES.back) y1++;
      const run = y1 - y + 1;
      if (x - (lastAt.get(y) ?? -99) < 4) continue;
      decor.forEach((d, i) => {
        if (x - (lastAt.get(y) ?? -99) < 4 || hash(x, y, i + 61) > (d.chance ?? 0.12)) return;
        const v = Math.floor(hash(x, y, i + 67) * 3);
        const px = x * TILE + 8, top = y * TILE;
        if (d.kind === 'pipes' && run >= 4) {
          scene.add.image(px, top, decorTexture(scene, themeId, 'pipes', d, v, run * TILE)).setOrigin(0.5, 0).setScale(1 / ART).setDepth(6);
        } else if (d.kind === 'banners' && run >= 4) {
          scene.add.image(px, top, decorTexture(scene, themeId, 'banners', d, v, Math.min(64, Math.round(run * TILE * 0.55)))).setOrigin(0.5, 0).setScale(1 / ART).setDepth(6);
        } else if (d.kind === 'glyphs' && run >= 3) {
          const cy = Math.round((y + y1 + 1) / 2 * TILE);
          scene.add.image(px, cy, decorTexture(scene, themeId, 'glyphs', d, v, 26)).setScale(1 / ART).setDepth(6);
          lightPool(scene, px, cy, hexNum(d.glow ?? '#7fd8ff'), 1.1, 6.5);
        } else if (d.kind === 'cables') {
          let span = 4 + v * 2;
          while (span > 2 && ![...Array(span + 1).keys()].every((k) => at(x + k, y) === TILES.back && at(x + k, y - 1) !== TILES.back)) span--;
          if (span <= 2) return;
          scene.add.image(x * TILE + 4, top + 1, decorTexture(scene, themeId, 'cables', d, v, span * TILE)).setOrigin(0, 0).setScale(1 / ART).setDepth(6);
        } else return;
        lastAt.set(y, x);
      });
    }
  }
}

// Glowing halos (light pools) for lamps, crystals and fires: a gentle flicker.
function lightPool(scene, x, y, color, size = 1.6, depth = 13) {
  const g = scene.add.image(x, y, 'glow').setTint(color).setBlendMode('ADD').setAlpha(0.4).setScale(size).setDepth(depth);
  scene.tweens.add({ targets: g, alpha: 0.22, scale: size * 0.9, duration: 500 + Math.random() * 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  return g;
}

export function buildScenery(scene, themeId, theme, map) {
  const props = theme.props ?? [];
  const at = (x, y) => (y < 0 ? TILES.air : map.grid[y]?.[x] ?? TILES.solid);
  for (let y = 1; y < map.height; y++) {
    for (let x = 1; x < map.width - 1; x++) {
      if (at(x, y) !== TILES.solid || at(x, y - 1) === TILES.solid || at(x, y - 1) === TILES.platform) continue;
      props.forEach((p, i) => {
        if (hash(x, y, i + 3) > (p.chance ?? 0.15)) return;
        const variant = Math.floor(hash(x, y, i + 17) * 3);
        const key = propTexture(scene, themeId, p.kind, p, variant);
        const px = x * TILE + 8 + (hash(x, y, i + 29) - 0.5) * 10;
        const img = scene.add.image(px, y * TILE + 1, key).setOrigin(0.5, 1).setScale(1 / ART).setDepth(p.front ? 24 : 12)
          .setFlipX(hash(x, y, i + 41) > 0.5);
        const pr = PROPS[p.kind](p, variant);
        if (pr.glow) lightPool(scene, px - pr.w / 2 + pr.glowAt[0], y * TILE + 1 - pr.h + pr.glowAt[1], hexNum(pr.glow), 1.2);
        if (p.front) img.setAlpha(0.95);
      });
    }
  }
  // Fires and hazards cast light.
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (at(x, y) === TILES.hazard && at(x - 1, y) !== TILES.hazard) lightPool(scene, x * TILE + 16, y * TILE + 4, hexNum(theme.tiles.hazard), 2.4, 9);
    }
  }
  if (theme.decor) buildDecor(scene, themeId, theme.decor, map, at);
  if (theme.foreground) buildForeground(scene, theme.foreground, map.width * TILE, at, map);
  vignette(scene);
}

// Ferns and rubble: big dark silhouettes along the bottom of the screen, in front of
// the action, moving faster than the camera. Pillars: broken columns standing on the
// floor behind the action (in front of the screen they looked like holes in the
// ground).
function buildForeground(scene, fg, worldW, at, map) {
  const scroll = fg.scroll ?? 1.35;
  const every = (fg.every ?? 900) * 1.6;
  const color = hexRgb(fg.color ?? '#0a0812'), rim = hexRgb(fg.rim ?? '#3a2a4a');
  for (let i = 0, x = 260; x < worldW * scroll; i++, x += every * (0.7 + hash(i, 1, 9) * 0.6)) {
    const key = `fg-${fg.kind}-${i % 3}`;
    if (!scene.textures.exists(key)) {
      const w = fg.kind === 'pillars' ? 30 : 70, h = fg.kind === 'pillars' ? VIEW.h : 70;
      const tex = scene.textures.createCanvas(key, w, h);
      const ctx = tex.getContext();
      const img = ctx.createImageData(w, h);
      const put = (px, py, c) => { if (px >= 0 && py >= 0 && px < w && py < h) img.data.set([...c, 255], (py * w + px) * 4); };
      if (fg.kind === 'pillars') {
        // A broken, fluted column: jagged top, flutes catching the light, a base block.
        const top = Math.round(h * (0.48 + (i % 3) * 0.08));
        for (let px = 6; px < w - 6; px++) {
          const jag = top + Math.round(hash(px, i % 3, 21) * 10 + Math.abs(px - w / 2) * 0.4);
          for (let py = jag; py < h; py++) {
            const flute = (px - 6) % 6 === 0;
            put(px, py, py - jag < 2 || px < 8 ? rim : flute ? [color[0] + 10, color[1] + 8, color[2] + 14] : color);
          }
        }
        for (let py = h - 16; py < h; py++) for (let px = 1; px < w - 1; px++) put(px, py, py - (h - 16) < 2 ? rim : color);
      } else {
        // Ferns or rubble piles: a mound with fronds or chunks on top.
        for (let px = 0; px < w; px++) {
          const top = Math.round(h - 18 - Math.sin((px / w) * Math.PI) * 22 - hash(px, i % 3, 5) * (fg.kind === 'ferns' ? 26 : 8));
          for (let py = Math.max(0, top); py < h; py++) put(px, py, py - top < 2 ? rim : color);
        }
      }
      ctx.putImageData(img, 0, 0);
      tex.refresh();
    }
    if (fg.kind === 'pillars') {
      const ground = pillarGround(at, map, Math.floor(x / scroll / TILE));
      if (ground !== null) scene.add.image(x / scroll, ground * TILE + 1, key).setOrigin(0.5, 1).setDepth(9).setScale(0.8);
      continue;
    }
    scene.add.image(x, VIEW.h + 4, key).setOrigin(0.5, 1).setScrollFactor(scroll, 0).setDepth(60).setAlpha(fg.alpha ?? 0.55).setScale(0.8);
  }
}

// The floor row a pillar can stand on at column cx: the highest open floor whose two
// neighbouring columns are level with it and clear for the pillar's height. Null if
// there's no such spot (walls, ledges, pits).
function pillarGround(at, map, cx) {
  const open = (x, y) => at(x, y) !== TILES.solid && at(x, y) !== TILES.platform;
  for (let y = 1; y < map.height; y++) {
    if (at(cx, y) !== TILES.solid || !open(cx, y - 1)) continue;
    let fits = true;
    for (const x of [cx - 1, cx, cx + 1]) {
      if (at(x, y) !== TILES.solid) fits = false;
      for (let k = 1; k <= 7 && fits; k++) if (!open(x, y - k)) fits = false;
    }
    if (fits) return y;
  }
  return null;
}

export function vignette(scene) {
  if (!scene.textures.exists('vignette')) {
    const w = VIEW.w, h = VIEW.h;
    const tex = scene.textures.createCanvas('vignette', w, h);
    const ctx = tex.getContext();
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.6);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.6, 'rgba(0,0,0,0.18)');
    g.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    tex.refresh();
  }
  return scene.add.image(0, 0, 'vignette').setOrigin(0).setScrollFactor(0).setDepth(58);
}
