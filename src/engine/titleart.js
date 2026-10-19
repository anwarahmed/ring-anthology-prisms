// Painted 16-bit art for the title and menu screens: nebula sky, a ring megastructure,
// a planet horizon, the prism, and gradient logo lettering. Generated once, cached.

import { VIEW, ERAS, HD } from './config.js';
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
// A Halo ring seen from off the ring, drawn in 3D: not a flat disc but a thin ribbon
// (a Bishop-ring band) whose width runs along the ring's axis. Canon proportions:
// 10,000 km across, 318 km wide, a 22.3 km deep hull. The far half shows the concave
// inner habitat (land, sea, cloud) lit across its width; the near half shows the flat
// metal outer hull with panel seams; bright lines mark the atmosphere walls on both
// edges. R is the radius in world pixels; k is how open the ring looks (the ratio of
// its apparent height to its width). Drawn at HD resolution: show the halves at
// scale 1 / HD. `back` goes behind whatever sits inside the ring, `front` in front.
export function ringHalves(scene, R = 230, k = 0.2, _band, name = 'title-ring') {
  const S = HD;
  const Rp = R * S;
  const wp = Math.max(3 * S, R * 2 * (318 / 10000) * S);
  const hullDepth = Math.max(1, R * 2 * (22.3 / 10000) * S);
  const sinA = Math.sqrt(1 - k * k);
  const W = Math.ceil(Rp * 2 + 16), H = Math.ceil((Rp * k + wp) * 2 + 16), cx = W / 2, cy = H / 2;
  // A point on the ribbon at angle t around the ring, s across its width (-0.5..0.5).
  const P = (t, s) => [cx + Rp * Math.cos(t), cy + Rp * Math.sin(t) * k - s * wp * sinA];
  const land = [hexRgb('#2f7a4e'), hexRgb('#4a9a5a'), hexRgb('#2a5f9a'), hexRgb('#a8946a'), hexRgb('#6a8a4a')];
  const hull = hexRgb('#8a93a3'), hullDark = hexRgb('#2e3440'), wall = hexRgb('#eaf4ff'), haze = hexRgb('#9ec8f0');
  const css = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const N = 900;
  const draw = (far) => (ctx) => {
    for (let i = 0; i < N; i++) {
      const t0 = (i / N) * Math.PI * 2, t1 = ((i + 1) / N) * Math.PI * 2, tm = (t0 + t1) / 2;
      if ((Math.sin(tm) < 0) !== far) continue;
      const lit = 0.55 + 0.45 * Math.cos(tm + 2.3);
      const strips = far ? 4 : 1;
      for (let j = 0; j < strips; j++) {
        const s0 = -0.5 + j / strips, s1 = -0.5 + (j + 1) / strips;
        let c;
        if (far) {
          // Inner habitat: continents and seas along the ring, cloud streaks, haze
          // toward the walls, and darker toward the shadowed side.
          const n = fbm(tm * 22, j * 0.9, 11);
          c = n < 0.4 ? land[2] : n < 0.52 ? land[0] : n < 0.64 ? land[1] : n < 0.74 ? land[4] : land[3];
          if (fbm(tm * 40 + 7, j * 1.3, 21) > 0.66) c = mix(c, [236, 242, 248], 0.75);
          if (j === 0 || j === strips - 1) c = mix(c, haze, 0.35);
          c = mix([8, 12, 28], c, 0.35 + 0.65 * lit);
        } else {
          // Outer hull: flat metal plating with seams.
          c = mix(hullDark, hull, lit);
          if (i % 9 === 0) c = mix(c, hullDark, 0.5);
        }
        const a = P(t0, s0), b = P(t1, s0), d = P(t1, s1), e = P(t0, s1);
        ctx.fillStyle = css(c);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d[0], d[1]); ctx.lineTo(e[0], e[1]);
        ctx.closePath();
        ctx.fill();
        // Overdraw a hair so neighboring quads leave no seams.
        ctx.strokeStyle = css(c);
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
    // The atmosphere walls along both edges, and on the near half the hull's depth.
    const edge = (s, color, width, alpha) => {
      ctx.strokeStyle = css(color, alpha);
      ctx.lineWidth = width;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * Math.PI * 2;
        if ((Math.sin(t) < 0) !== far) { started = false; continue; }
        const [x, y] = P(t, s);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    if (far) {
      edge(-0.5, haze, 3 * S, 0.25);
      edge(0.5, haze, 3 * S, 0.25);
    }
    edge(-0.5, wall, 0.9 * S, far ? 0.9 : 0.6);
    edge(0.5, wall, 0.9 * S, far ? 0.9 : 0.6);
    if (!far) edge(-0.5, hullDark, hullDepth, 0.9);
  };
  const make = (key, far) => {
    if (!scene.textures.exists(key)) {
      const tex = scene.textures.createCanvas(key, W, H);
      draw(far)(tex.getContext());
      tex.refresh();
    }
    return key;
  };
  return { back: make(`${name}-back`, true), front: make(`${name}-front`, false), scale: 1 / S };
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
