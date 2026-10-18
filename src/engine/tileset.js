// Tileset layout and tile art. Pure (RGBA output), shared by the game and previews.
//
// Index layout of every theme's tileset:
//   0–15   solid, by exposed-side mask (1 top, 2 right, 4 bottom, 8 left), variant A
//   16–31  the same, variant B          32–34  platform: left end, middle, right end
//   35     hazard                        36–38  background wall (plain, plain, window)

import { hexRgb } from './raster.js';
import { TILE } from './config.js';

export const TILESET = { solid: 0, platform: 32, hazard: 35, back: 36, count: 39 };
export const isSolid = (i) => i >= 0 && i < 32;
export const isPlatform = (i) => i >= 32 && i <= 34;
export const isHazard = (i) => i === 35;
export const COLLIDES = Array.from({ length: 36 }, (_, i) => i);

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16);

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const lit = (c, k) => (k >= 0 ? mix(c, [255, 255, 255], k) : mix(c, [0, 0, 0], -k));

// Paints one tile's pixels into `put(x, y, rgb)`.
function solid(put, t, mask, variant) {
  const S = TILE;
  const base = hexRgb(t.solid);
  const r = rng(91 + mask * 7 + variant * 131);
  const deep = mask === 0 ? -0.18 : 0;
  // Stone blocks: two courses per tile, offset like brickwork.
  const shades = Array.from({ length: 6 }, () => (r() - 0.5) * 0.12);
  for (let y = 0; y < S; y++) {
    const course = y < 8 ? 0 : 1;
    const off = (course + variant) % 2 ? 4 : 0;
    for (let x = 0; x < S; x++) {
      const bx = (x + off) % 8, by = y % 8;
      const brick = Math.floor((x + off) / 8) + course * 3;
      let c = lit(base, shades[brick % 6] + deep);
      if (bx === 0 || by === 0) c = lit(base, -0.38 + deep);
      else if (bx === 1 || by === 1) c = lit(c, 0.1);
      else if (bx === 7 || by === 7) c = lit(c, -0.14);
      if (r() < 0.06) c = lit(c, (r() - 0.5) * 0.3);
      put(x, y, c);
    }
  }
  if (mask & 1) {
    const top = hexRgb(t.top), edge = hexRgb(t.edge);
    for (let x = 0; x < S; x++) {
      put(x, 0, edge);
      put(x, 1, lit(top, 0.15));
      put(x, 2, top);
      put(x, 3, lit(top, -0.25));
      if ((x * 7 + variant * 3) % 5 === 0) put(x, 4, lit(top, -0.35));
      put(x, 4 + ((x + variant) % 3 === 0 ? 1 : 0), lit(base, -0.45));
    }
  }
  if (mask & 4) for (let x = 0; x < S; x++) { put(x, S - 1, lit(base, -0.55)); put(x, S - 2, lit(base, -0.3)); }
  if (mask & 8) for (let y = (mask & 1 ? 1 : 0); y < S; y++) put(0, y, lit(base, 0.22));
  if (mask & 2) for (let y = (mask & 1 ? 1 : 0); y < S; y++) { put(S - 1, y, lit(base, -0.5)); put(S - 2, y, lit(base, -0.2)); }
}

function platform(put, t, part) {
  const S = TILE;
  const c = hexRgb(t.platform), edge = hexRgb(t.edge);
  for (let x = 0; x < S; x++) {
    put(x, 0, edge);
    put(x, 1, lit(c, 0.2));
    put(x, 2, c);
    put(x, 3, c);
    put(x, 4, lit(c, -0.3));
    put(x, 5, lit(c, -0.6));
    if (x % 8 === 3) for (let y = 1; y < 5; y++) put(x, y, lit(c, -0.2));
  }
  const strut = (x0) => { for (let y = 6; y < 11; y++) { put(x0, y, lit(c, -0.35)); put(x0 + 1, y, lit(c, -0.55)); } };
  if (part === 0) strut(2);
  if (part === 2) strut(12);
  if (part === 1) strut(7);
}

function hazard(put, t) {
  const S = TILE;
  const hot = hexRgb(t.hazard);
  const r = rng(7);
  for (let y = 4; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const heat = Math.max(0, 1 - (y - 4) / 12) * 0.7 + r() * 0.3;
      const c = heat > 0.75 ? lit(hot, 0.55) : heat > 0.5 ? hot : heat > 0.3 ? lit(hot, -0.45) : lit(hot, -0.75);
      put(x, y, c);
    }
  }
  for (let x = 0; x < S; x++) if (r() < 0.5) put(x, 3, lit(hot, 0.3));
}

function backwall(put, t, kind) {
  const S = TILE;
  const base = hexRgb(t.back);
  const r = rng(301 + kind * 17);
  // Large, worn stone courses that run across tiles without a visible grid.
  for (let y = 0; y < S; y++) {
    const course = y < 8 ? 0 : 1;
    const off = course ? 6 : 0;
    for (let x = 0; x < S; x++) {
      const bx = (x + off + kind * 5) % 16, by = y % 8;
      let c = lit(base, (r() - 0.5) * 0.06);
      if (by === 0) c = lit(base, -0.28);
      else if (by === 1) c = lit(base, 0.06);
      if (bx === 0) c = lit(base, -0.25);
      if (r() < 0.04) c = lit(c, -0.18);
      put(x, y, c);
    }
  }
  if (kind === 2) {
    // A narrow lit slit window.
    const glow = hexRgb(t.window ?? '#ffb04a');
    for (let y = 3; y < 13; y++) for (let x = 6; x < 10; x++) put(x, y, y < 5 ? lit(glow, -0.3) : x === 6 ? lit(glow, -0.2) : glow);
    for (let x = 5; x < 11; x++) { put(x, 2, lit(base, -0.45)); put(x, 13, lit(base, 0.12)); }
  }
}

// The whole tileset as one RGBA strip (count × TILE wide).
export function tilesetPixels(theme) {
  const t = theme.tiles;
  const W = TILESET.count * TILE;
  const out = new Uint8ClampedArray(W * TILE * 4);
  const at = (i) => (x, y, c) => { const p = (y * W + i * TILE + x) * 4; out[p] = c[0]; out[p + 1] = c[1]; out[p + 2] = c[2]; out[p + 3] = 255; };
  for (let v = 0; v < 2; v++) for (let m = 0; m < 16; m++) solid(at(v * 16 + m), t, m, v);
  for (let p = 0; p < 3; p++) platform(at(32 + p), t, p);
  hazard(at(35), t);
  for (let k = 0; k < 3; k++) backwall(at(36 + k), t, k);
  return { rgba: out, w: W, h: TILE };
}
