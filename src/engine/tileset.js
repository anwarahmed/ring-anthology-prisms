// Tileset layout and tile art. Pure (RGBA output), shared by the game and previews.
//
// Solid tile styles (theme.tiles.style): stone (default), metal, rock.
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
  const deep = mask === 0 ? -0.12 : 0;
  // Stone blocks: two courses per tile, offset like brickwork. Each block is lit from
  // above with a soft gradient, has its own tint, chipped corners and the odd crack.
  const tint = Array.from({ length: 6 }, () => (r() - 0.5) * 0.14);
  const crack = Math.floor(r() * 6);
  for (let y = 0; y < S; y++) {
    const course = y < 8 ? 0 : 1;
    const off = (course + variant) % 2 ? 4 : 0;
    for (let x = 0; x < S; x++) {
      const bx = (x + off) % 8, by = y % 8;
      const brick = Math.floor((x + off) / 8) + course * 3;
      let c = lit(base, tint[brick % 6] + deep + (3.5 - by) * 0.025);
      if (bx === 0 || by === 0) c = lit(base, -0.42 + deep);
      else if (by === 1 || bx === 1) c = lit(c, 0.13);
      else if (by === 7 || bx === 7) c = lit(c, -0.18);
      if ((bx === 1 || bx === 7) && (by === 1 || by === 7) && r() < 0.6) c = lit(base, -0.3 + deep);
      if (brick % 6 === crack && bx > 2 && bx < 6 && Math.abs(bx - 2 - (by * 0.6)) < 0.6) c = lit(base, -0.36 + deep);
      const n = r();
      if (n < 0.07) c = lit(c, -0.12);
      else if (n > 0.95) c = lit(c, 0.1);
      put(x, y, c);
    }
  }
  if (mask & 1) {
    const top = hexRgb(t.top), edge = hexRgb(t.edge), moss = t.moss ? hexRgb(t.moss) : null;
    for (let x = 0; x < S; x++) {
      put(x, 0, edge);
      put(x, 1, lit(top, 0.18));
      put(x, 2, lit(top, 0.05));
      put(x, 3, lit(top, -0.2));
      if ((x * 7 + variant * 3) % 5 === 0) put(x, 4, lit(top, -0.35));
      put(x, 4 + ((x + variant) % 3 === 0 ? 1 : 0), lit(base, -0.5));
      if (moss && r() < 0.55) { put(x, 1, moss); if (r() < 0.5) put(x, 4 + (x % 2), lit(moss, -0.3)); }
    }
  }
  if (mask & 4) for (let x = 0; x < S; x++) { put(x, S - 1, lit(base, -0.6)); put(x, S - 2, lit(base, -0.35)); }
  if (mask & 8) for (let y = (mask & 1 ? 1 : 0); y < S; y++) { put(0, y, lit(base, 0.25)); put(1, y, lit(base, 0.08)); }
  if (mask & 2) for (let y = (mask & 1 ? 1 : 0); y < S; y++) { put(S - 1, y, lit(base, -0.55)); put(S - 2, y, lit(base, -0.25)); }
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
  if (t.style === 'metal') return backwallMetal(put, t, kind);
  if (t.style === 'rock') return backwallRock(put, t, kind);
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

// Interior hull panels with seams; variant 2 is a light strip.
function backwallMetal(put, t, kind) {
  const S = TILE;
  const base = hexRgb(t.back), glow = hexRgb(t.window ?? t.glow ?? '#45e6ff');
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let c = lit(base, y < 2 ? 0.08 : y > 13 ? -0.12 : 0);
      if (y === 0) c = lit(base, -0.3);
      if (kind === 1 && x === 0) c = lit(base, -0.25);
      if (kind === 1 && x === 1) c = lit(base, 0.06);
      if ((x === 2 || x === 13) && (y === 3 || y === 12)) c = lit(base, 0.22);
      put(x, y, c);
    }
  }
  if (kind === 2) for (let x = 3; x < 13; x++) { put(x, 7, glow); put(x, 8, lit(glow, -0.35)); }
}

// Rough rock (cave and crater walls); variant 2 is a glowing crack.
function backwallRock(put, t, kind) {
  const S = TILE;
  const base = hexRgb(t.back);
  const r = rng(401 + kind * 29);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const n = r();
      put(x, y, lit(base, (n - 0.5) * 0.14 + (n > 0.94 ? 0.12 : 0) - (n < 0.06 ? 0.2 : 0)));
    }
  }
  if (kind === 2) {
    const glow = hexRgb(t.window ?? '#ffd27a');
    let x = 7;
    for (let y = 2; y < 14; y++) { put(x, y, glow); x += r() < 0.5 ? -1 : 1; x = Math.max(4, Math.min(11, x)); }
  }
}

// Forerunner and starship hulls: smooth beveled plates, seams, glowing inlay lines.
function solidMetal(put, t, mask, variant) {
  const S = TILE;
  const base = hexRgb(t.solid), glow = hexRgb(t.glow ?? t.edge);
  const deep = mask === 0 ? -0.15 : 0;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let c = lit(base, deep + (y < 8 ? 0.04 : -0.03));
      if (x === 0 || y === 0) c = lit(base, 0.16 + deep);
      if (x === S - 1 || y === S - 1) c = lit(base, -0.32 + deep);
      if (variant === 1 && y === 8) c = lit(base, -0.22 + deep);
      if (variant === 0 && x === 8 && y > 3 && y < 13) c = mix(c, glow, 0.55);
      if ((x === 3 || x === 12) && (y === 3 || y === 12)) c = lit(base, 0.3);
      put(x, y, c);
    }
  }
  if (mask & 1) {
    const top = hexRgb(t.top), edge = hexRgb(t.edge);
    for (let x = 0; x < S; x++) {
      put(x, 0, edge);
      put(x, 1, lit(top, 0.2));
      put(x, 2, top);
      put(x, 3, glow.map((v) => Math.round(v * 0.85)));
      put(x, 4, lit(base, -0.4));
    }
  }
  if (mask & 4) for (let x = 0; x < S; x++) put(x, S - 1, lit(base, -0.6));
  if (mask & 8) for (let y = 0; y < S; y++) put(0, y, lit(base, 0.3));
  if (mask & 2) for (let y = 0; y < S; y++) put(S - 1, y, lit(base, -0.55));
}

// Natural ground: packed earth and rock, with a grassy or sandy top.
function solidRock(put, t, mask, variant) {
  const S = TILE;
  const base = hexRgb(t.solid);
  const r = rng(53 + mask * 11 + variant * 97);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const n = r();
      let c = lit(base, (n - 0.5) * 0.16 + (mask === 0 ? -0.14 : 0));
      if (n > 0.93) c = lit(base, 0.22);
      if (n < 0.05) c = lit(base, -0.3);
      put(x, y, c);
    }
  }
  // A few embedded stones.
  for (let k = 0; k < 2; k++) {
    const cx = 2 + Math.floor(r() * 11), cy = 6 + Math.floor(r() * 8);
    for (let y = -1; y <= 1; y++) for (let x = -2; x <= 2; x++) if (Math.abs(x) + Math.abs(y) < 3) put(cx + x, cy + y, lit(base, y < 0 ? 0.25 : y > 0 ? -0.25 : 0.08));
  }
  if (mask & 1) {
    const top = hexRgb(t.top), edge = hexRgb(t.edge);
    for (let x = 0; x < S; x++) {
      const tuft = (x * 5 + variant * 3) % 7 === 0;
      if (tuft) put(x, 0, edge);
      put(x, 1, edge);
      put(x, 2, lit(top, 0.15));
      put(x, 3, top);
      put(x, 4, lit(top, -0.25));
      if ((x + variant) % 3 === 0) put(x, 5, lit(top, -0.4));
    }
  }
  if (mask & 4) for (let x = 0; x < S; x++) put(x, S - 1, lit(base, -0.5));
  if (mask & 8) for (let y = 2; y < S; y++) put(0, y, lit(base, 0.18));
  if (mask & 2) for (let y = 2; y < S; y++) put(S - 1, y, lit(base, -0.4));
}

const SOLIDS = { stone: solid, metal: solidMetal, rock: solidRock };

// The whole tileset as one RGBA strip (count × TILE wide).
export function tilesetPixels(theme) {
  const t = theme.tiles;
  const W = TILESET.count * TILE;
  const out = new Uint8ClampedArray(W * TILE * 4);
  const at = (i) => (x, y, c) => { const p = (y * W + i * TILE + x) * 4; out[p] = c[0]; out[p + 1] = c[1]; out[p + 2] = c[2]; out[p + 3] = 255; };
  const paint = SOLIDS[t.style ?? 'stone'];
  for (let v = 0; v < 2; v++) for (let m = 0; m < 16; m++) paint(at(v * 16 + m), t, m, v);
  for (let p = 0; p < 3; p++) platform(at(32 + p), t, p);
  hazard(at(35), t);
  for (let k = 0; k < 3; k++) backwall(at(36 + k), t, k);
  return { rgba: out, w: W, h: TILE };
}
