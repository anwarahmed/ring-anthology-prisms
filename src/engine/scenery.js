// Scenery that gives levels depth: props scattered on ground surfaces (some in front of
// the characters), a foreground silhouette layer that passes in front of the action,
// pools of light around fires and lamps, and a soft vignette.
//
// Theme fields (src/content/themes.js):
//   props: [{ kind, chance, front, color, glow }]   kinds: grass rocks rubble lamp crystal
//                                                   plant console growth debris
//   foreground: { kind: pillars | ferns | rubble, color, rim, every }

import { render, material, hexRgb } from './raster.js';
import { TILE, VIEW, HD, STYLE } from './config.js';
import { TILES } from './mapparse.js';
import { hexNum } from './textures.js';

function hash(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Prop art, drawn with the sprite renderer so it matches the characters.
// Each returns { w, h, shapes, mats, glow? } with the base of the prop at the bottom.
const PROPS = {
  grass: (c, v) => ({
    w: 18, h: 10,
    shapes: Array.from({ length: 6 }, (_, i) => ({ t: 'cap', a: [2 + i * 2.8, 10], b: [1 + i * 2.8 + (i % 2 ? 2 : -1), 2 + ((i + v) % 3) * 1.5], r1: 1, r2: 0.4, m: 'a', z: i % 2 })),
    mats: { a: material(c.color ?? '#5ab048', { texture: 0.4 }) },
  }),
  plant: (c, v) => ({
    w: 26, h: 20,
    shapes: [0, 1, 2, 3, 4].map((i) => ({ t: 'ell', c: [5 + i * 4, 14 - (i % 2) * 4 - v], rx: 5, ry: 3.4, rot: (i - 2) * 0.35, m: 'a', z: i % 2 })),
    mats: { a: material(c.color ?? '#3e8a3a', { texture: 0.6 }) },
  }),
  rocks: (c, v) => ({
    w: 22, h: 10,
    shapes: [{ t: 'ell', c: [8, 7], rx: 6 + v, ry: 4, m: 'a' }, { t: 'ell', c: [15, 8], rx: 4, ry: 3, m: 'a', z: 1 }],
    mats: { a: material(c.color ?? '#8a7a6a', { texture: 0.7 }) },
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
    const rgba = render(pr.shapes, pr.w * HD, pr.h * HD, pr.mats, STYLE === 'prerendered' ? { scale: HD, smooth: true } : { scale: HD });
    const tex = scene.textures.createCanvas(key, pr.w * HD, pr.h * HD);
    tex.getContext().putImageData(new ImageData(rgba, pr.w * HD, pr.h * HD), 0, 0);
    tex.refresh();
  }
  return key;
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
        const img = scene.add.image(px, y * TILE + 1, key).setOrigin(0.5, 1).setScale(1 / HD).setDepth(p.front ? 24 : 12)
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
  if (theme.foreground) buildForeground(scene, theme.foreground, map.width * TILE);
  vignette(scene);
}

// Big dark silhouettes in front of the action, moving faster than the camera.
function buildForeground(scene, fg, worldW) {
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
    scene.add.image(x, VIEW.h + 4, key).setOrigin(0.5, 1).setScrollFactor(scroll, 0).setDepth(60).setAlpha(fg.alpha ?? 0.55).setScale(0.8);
  }
}

function vignette(scene) {
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
  scene.add.image(0, 0, 'vignette').setOrigin(0).setScrollFactor(0).setDepth(58);
}
