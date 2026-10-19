// Pre-rendered tiles: the same tileset layout as tileset.js, but each tile is built
// from bevelled 3D shapes and shaded smoothly by the sprite renderer at ART resolution.

import { render, material } from './raster.js';
import { TILESET } from './tileset.js';
import { TILE, ART } from './config.js';

const S = TILE * ART;

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function darker(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.round(v * (1 - k));
  return `#${((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, '0')}`;
}

function mats(t) {
  return {
    mortar: material(darker(t.solid, 0.55), { texture: 0.6 }),
    stone: material(t.solid, { texture: 0.9, contrast: 1.1 }),
    stone2: material(darker(t.solid, 0.08), { texture: 0.9, contrast: 0.9 }),
    deep: material(darker(t.solid, 0.25), { texture: 0.9 }),
    top: material(t.top, { spec: true, texture: 0.5, contrast: 1.1 }),
    edge: material(t.edge, { emissive: true }),
    grass: material(t.edge, { texture: 0.7 }),
    plat: material(t.platform, { spec: true, texture: 0.6 }),
    hot: material(t.hazard, { emissive: true }),
    ash: material(darker(t.hazard, 0.7), { texture: 1 }),
    back: material(t.back, { texture: 0.8 }),
    back2: material(darker(t.back, 0.15), { texture: 0.8 }),
    glow: material(t.glow ?? t.window ?? t.edge, { emissive: true }),
    win: material(t.window ?? '#ffc23a', { emissive: true }),
    moss: material(t.moss ?? t.edge, { texture: 0.8 }),
  };
}

const quad = (x0, y0, x1, y1, m, z = 1, bevel = 3, tilt = [0, 0]) => ({ t: 'poly', pts: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], m, z, bevel, tilt });

function solidShapes(t, mask, v, r) {
  const style = t.style ?? 'stone';
  const out = [];
  const inner = mask === 0;
  if (style === 'metal') {
    out.push(quad(0, 0, S, S, 'mortar', 0, 0));
    out.push(quad(1, 1, S - 1, S - 1, inner ? 'deep' : 'stone', 1, 4, [0, -0.1]));
    if (v === 0) out.push(quad(S / 2 - 1, 8, S / 2 + 1, S - 8, 'glow', 2, 0));
    else out.push(quad(4, S / 2 - 1, S - 4, S / 2 + 1, 'mortar', 2, 0));
    for (const [x, y] of [[5, 5], [S - 5, 5], [5, S - 5], [S - 5, S - 5]]) out.push({ t: 'ell', c: [x, y], rx: 1.4, ry: 1.4, m: 'top', z: 3 });
  } else if (style === 'rock') {
    out.push(quad(0, 0, S, S, inner ? 'deep' : 'stone', 0, 0));
    for (let i = 0; i < 2; i++) out.push({ t: 'ell', c: [6 + r() * (S - 12), 10 + r() * (S - 16)], rx: 5 + r() * 4, ry: 3 + r() * 2, rot: r() - 0.5, m: 'stone2', z: 1 });
  } else {
    // Stone brickwork: two courses of bevelled blocks set in mortar.
    out.push(quad(0, 0, S, S, 'mortar', 0, 0));
    for (let row = 0; row < 2; row++) {
      const y0 = row * (S / 2) + 1, y1 = (row + 1) * (S / 2) - 1;
      const off = (row + v) % 2 ? S / 4 : 0;
      for (let k = -1; k < 3; k++) {
        const x0 = Math.max(0, k * (S / 2) + off + 1), x1 = Math.min(S, (k + 1) * (S / 2) + off - 1);
        if (x1 - x0 < 3) continue;
        out.push(quad(x0, y0, x1, y1, inner ? 'deep' : (k + row) % 2 ? 'stone' : 'stone2', 1, 3.5, [(r() - 0.5) * 0.3, -0.15 + (r() - 0.5) * 0.2]));
      }
    }
  }
  if (mask & 1) {
    if (style === 'rock') {
      out.push(quad(0, 0, S, 9, 'top', 4, 3, [0, -0.3]));
      for (let x = 1; x < S; x += 3) out.push({ t: 'cap', a: [x, 4], b: [x + (r() - 0.5) * 3, -2 + r() * 3], r1: 1.1, r2: 0.4, m: 'grass', z: 5, noSep: true });
    } else {
      out.push(quad(0, 0, S, 8, 'top', 4, 3, [0, -0.35]));
      out.push(quad(0, 0, S, 1, 'edge', 5, 0));
      if (style === 'metal') out.push(quad(0, 6, S, 7, 'glow', 5, 0));
      if (t.moss) for (let x = 2; x < S; x += 5) if (r() < 0.6) out.push({ t: 'ell', c: [x, 2], rx: 2.5, ry: 1.6, m: 'moss', z: 6 });
    }
  }
  return out;
}

function tileShapes(t, index, r) {
  if (index < 32) return solidShapes(t, index % 16, Math.floor(index / 16), r);
  if (index <= 34) {
    const part = index - 32;
    const out = [quad(0, 1, S, 10, 'plat', 1, 2.5, [0, -0.3]), quad(0, 0, S, 1, 'edge', 2, 0)];
    const sx = part === 0 ? 5 : part === 2 ? S - 7 : S / 2 - 1;
    out.push(quad(sx, 10, sx + 3, 22, 'plat', 0, 1));
    return out;
  }
  if (index === 35) {
    const out = [quad(0, 10, S, S, 'ash', 0, 2)];
    for (let i = 0; i < 6; i++) out.push({ t: 'ell', c: [3 + r() * (S - 6), 10 + r() * 8], rx: 2 + r() * 3, ry: 1.5 + r() * 2, m: 'hot', z: 2, hot: r() > 0.5 });
    return out;
  }
  // Background walls: plain, plain, lit window, then detail variants.
  const kind = index - TILESET.back;
  const style = t.style ?? 'stone';
  const out = [quad(0, 0, S, S, 'back2', 0, 0)];
  if (style === 'metal') {
    out.push(quad(1, 1, S - 1, S - 1, 'back', 1, 3));
    if (kind === 1) out.push(quad(0, S / 2 - 3, S, S / 2 + 3, 'back2', 2, 2, [0, -0.4]));
  } else if (style === 'rock') {
    for (let i = 0; i < 4; i++) out.push({ t: 'ell', c: [r() * S, r() * S], rx: 5 + r() * 6, ry: 4 + r() * 4, rot: r(), m: 'back', z: 1 });
  } else {
    out.push(quad(1, 1, S / 2 - 1, S / 2 - 1, 'back', 1, 3), quad(S / 2 + 1, 1, S - 1, S / 2 - 1, 'back', 1, 3));
    const off = kind === 1 ? S / 4 : 0;
    out.push(quad(1 + off, S / 2 + 1, S / 2 - 1 + off, S - 1, 'back', 1, 3), quad(Math.max(1, off - S / 2 + 1), S / 2 + 1, Math.max(2, off - 1), S - 1, 'back', 1, 3));
  }
  if (kind === 2) out.push(quad(S / 2 - 4, 6, S / 2 + 4, S - 6, 'win', 3, 0));
  return out;
}

export function tilesetPixelsHD(theme) {
  const t = theme.tiles;
  const m = mats(t);
  const W = TILESET.count * S;
  const out = new Uint8ClampedArray(W * S * 4);
  for (let i = 0; i < TILESET.count; i++) {
    const rgba = render(tileShapes(t, i, rng(7 + i * 31)), S, S, m, { smooth: true });
    for (let y = 0; y < S; y++) out.set(rgba.subarray(y * S * 4, (y + 1) * S * 4), (y * W + i * S) * 4);
  }
  return { rgba: out, w: W, h: S, size: S };
}
