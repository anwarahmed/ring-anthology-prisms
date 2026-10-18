// Painted 16-bit art for the title and menu screens: nebula sky, a ring megastructure,
// a planet horizon, the prism, and gradient logo lettering. Generated once, cached.

import { VIEW, ERAS } from './config.js';
import { hexRgb, render, material } from './raster.js';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16);
const dither = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

function hash(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function noise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x, y, s, oct = 4) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += noise(x * f, y * f, s + i) * amp; f *= 2; amp *= 0.5; }
  return v;
}

function canvasKey(scene, key, w, h, paint) {
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  const img = ctx.createImageData(w, h);
  paint(img.data, w, h, ctx);
  ctx.putImageData(img, 0, 0);
  tex.refresh();
  return key;
}

// Deep space: banded, dithered three-stop gradient, nebula clouds, colored stars.
export function spaceSky(scene) {
  const top = hexRgb('#060424'), mid = hexRgb('#2a0f5e'), bot = hexRgb('#7a1f6e');
  const neb1 = hexRgb('#e0447f'), neb2 = hexRgb('#2fa4d8');
  return canvasKey(scene, 'title-sky', VIEW.w, VIEW.h, (d, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const t = y / h;
        const band = Math.floor(t * 14 + dither(x, y)) / 14;
        let c = band < 0.55 ? mix(top, mid, band / 0.55) : mix(mid, bot, (band - 0.55) / 0.45);
        const n = fbm(x / 70, y / 50, 3);
        const m = fbm(x / 90 + 7, y / 60 + 3, 9);
        if (n > 0.55) c = mix(c, neb1, Math.min(0.55, (n - 0.55) * 2.2) * (dither(x, y) < 0.75 ? 1 : 0.6));
        if (m > 0.58) c = mix(c, neb2, Math.min(0.45, (m - 0.58) * 2) * (dither(x + 1, y) < 0.75 ? 1 : 0.6));
        d.set([...c, 255], (y * w + x) * 4);
      }
    }
    for (let i = 0; i < 260; i++) {
      const x = Math.floor(hash(i, 1, 5) * w), y = Math.floor(hash(i, 2, 5) * h * 0.85);
      const tint = [[255, 255, 255], [180, 220, 255], [255, 220, 180], [255, 180, 230]][i % 4];
      const p = (y * w + x) * 4;
      d.set([...tint, 255], p);
      if (i % 23 === 0) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const q = ((y + dy) * w + x + dx) * 4;
        if (q >= 0 && q < d.length) d.set([...mix(tint, [60, 40, 120], 0.5), 255], q);
      }
    }
  });
}

// A ring megastructure seen at an angle: the far half shows its inner landscape, the
// near half its metal hull. Two textures so things can sit between the halves.
export function ringHalves(scene, R = 230, k = 0.2, band = 0.075, name = 'title-ring') {
  const W = R * 2 + 8, H = Math.ceil(R * k * 2 + 30), cx = W / 2, cy = H / 2;
  const land = [hexRgb('#2a9a6a'), hexRgb('#3fc07a'), hexRgb('#2a6fc8'), hexRgb('#c8b070')];
  const hull = hexRgb('#8a9ab8'), hullDark = hexRgb('#3a4466'), edge = hexRgb('#e8f4ff');
  const paint = (front) => (d, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = (x - cx) / R, v = (y - cy) / (R * k);
        const r = Math.hypot(u, v);
        // The band is thicker on the near side (we see its wall).
        const inner = 1 - band * (front ? 1.6 : 1);
        if (r > 1 || r < inner || (v >= 0) !== front) continue;
        const th = Math.atan2(v, u);
        const radial = (r - inner) / (1 - inner);
        let c;
        if (!front) {
          const n = fbm(th * 18, radial * 3, 11);
          c = n < 0.42 ? land[2] : n < 0.55 ? land[0] : n < 0.7 ? land[1] : land[3];
          if (fbm(th * 30 + 5, radial * 4, 21) > 0.68) c = [240, 248, 255];
          c = mix(c, [10, 10, 40], 0.25 + 0.35 * Math.abs(Math.cos(th)));
        } else {
          const lit = 0.5 - 0.5 * Math.cos(th) * 0.8;
          c = mix(hullDark, hull, lit);
          if (Math.floor(th * 60) % 4 === 0) c = mix(c, hullDark, 0.4);
          if (radial < 0.5 && hash(Math.floor(th * 120), 3, 7) > 0.93) c = [120, 230, 255];
        }
        if (radial > 0.86 || radial < 0.1) c = mix(c, edge, 0.55 * (dither(x, y) < 0.6 ? 1 : 0.5));
        d.set([...c, 255], (y * w + x) * 4);
      }
    }
  };
  return {
    back: canvasKey(scene, `${name}-back`, W, H, paint(false)),
    front: canvasKey(scene, `${name}-front`, W, H, paint(true)),
  };
}

// The top of a planet filling the bottom of the screen, with clouds and a bright limb.
export function planetHorizon(scene) {
  const W = VIEW.w, H = 90, R = 620, cx = W / 2, cy = R + 18;
  const ocean = hexRgb('#1a3a8a'), land = hexRgb('#2f8a5a'), cloud = hexRgb('#e8f0ff'), limb = hexRgb('#7ff0ff');
  return canvasKey(scene, 'title-planet', W, H, (d, w, h) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dist = Math.hypot(x - cx, y - cy);
        if (dist > R + 3) continue;
        let c;
        if (dist > R) c = mix(limb, [40, 20, 90], (dist - R) / 3);
        else {
          const depth = (R - dist) / 70;
          const n = fbm(x / 40, y / 14, 31);
          c = n > 0.56 ? land : ocean;
          if (fbm(x / 26 + 9, y / 9, 41) > 0.6) c = mix(c, cloud, 0.85);
          c = mix(c, [6, 4, 30], Math.min(0.8, depth * 0.9 + (x / w) * 0.25));
          if (R - dist < 2.2) c = mix(c, limb, 0.8);
        }
        d.set([...c, 255], (y * w + x) * 4);
      }
    }
  });
}

// The crystal prism (shaded glass) for the logo.
export function prismTexture(scene) {
  const key = 'title-prism';
  if (scene.textures.exists(key)) return key;
  const S = 56;
  const rgba = render([
    { t: 'poly', pts: [[28, 3], [53, 50], [3, 50]], m: 'glass', bevel: 4, tilt: [0, -0.1] },
    { t: 'poly', pts: [[28, 10], [44, 44], [28, 44]], m: 'glassLit', z: 1, bevel: 2, noSep: true },
  ], S, S, { glass: material('#7ab8ff', { spec: true, contrast: 1.4 }), glassLit: material('#bfe6ff', { spec: true }) });
  return canvasKey(scene, key, S, S, (d) => d.set(rgba));
}

// Big logo lettering: vertical gradient fill, hard outline, drop shadow, top shine.
export function logoText(scene, key, text, size, stops) {
  if (scene.textures.exists(key)) return key;
  const font = `${size}px "Press Start 2P"`;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = font;
  const tw = Math.ceil(probe.measureText(text).width);
  const W = tw + 10, H = size + 12;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.font = font;
  g.textBaseline = 'top';
  g.fillStyle = '#fff';
  g.fillText(text, 4, 4);
  const mask = g.getImageData(0, 0, W, H).data;
  const on = (x, y) => x >= 0 && y >= 0 && x < W && y < H && mask[(y * W + x) * 4 + 3] > 128;
  const cols = stops.map(hexRgb);
  return canvasKey(scene, key, W, H, (d) => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const p = (y * W + x) * 4;
        if (on(x, y)) {
          const t = Math.max(0, Math.min(1, (y - 4) / size)) * (cols.length - 1);
          const i = Math.min(cols.length - 2, Math.floor(t + dither(x, y) * 0.5));
          let col = mix(cols[i], cols[i + 1], t - i);
          if (!on(x, y - 1)) col = mix(col, [255, 255, 255], 0.7);
          if (!on(x, y + 1)) col = mix(col, [0, 0, 0], 0.3);
          d.set([...col, 255], p);
        } else if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1) || on(x - 1, y - 1) || on(x + 1, y + 1) || on(x - 1, y + 1) || on(x + 1, y - 1)) {
          d.set([12, 6, 40, 255], p);
        } else if (on(x - 3, y - 3) || on(x - 2, y - 2)) {
          d.set([30, 10, 60, 200], p);
        }
      }
    }
  });
}

export const ERA_COLORS = Object.values(ERAS).map((e) => e.color);
