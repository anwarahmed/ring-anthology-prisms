// Builds sprite frames (RGBA) for characters, units and their held weapons. Pure, so
// scripts/preview-sprites.mjs can render sheets without a browser.

import { BODIES, armShapes } from '../content/bodies.js';
import { gunShapes } from '../content/guns.js';
import { render, material } from './raster.js';
import { ART, STYLE } from './config.js';

// Characters render smooth at ART, or (pixel style) outlined at 1× and scaled up.
function draw(shapes, w, h, mats) {
  if (STYLE !== 'pixel') return render(shapes, w * ART, h * ART, mats, { scale: ART, smooth: true });
  const lo = render(shapes, w, h, mats);
  const out = new Uint8ClampedArray(w * ART * h * ART * 4);
  for (let y = 0; y < h * ART; y++) for (let x = 0; x < w * ART; x++) {
    const s = (((y / ART) | 0) * w + ((x / ART) | 0)) * 4;
    out.set(lo.subarray(s, s + 4), (y * w * ART + x) * 4);
  }
  return out;
}

export const AIM_STEPS = 9; // arm frames from straight up (-90°) to straight down (+90°)
export const ARM_SIZE = 80;

function darker(hex, amt = 0.22) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.round(v * (1 - amt));
  return `#${((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, '0')}`;
}

export function materialsFor(def, gun) {
  const p = def.pal;
  const m = {
    armor: material(p.armor, { spec: true, contrast: 1.1, texture: 0.15 }),
    helmet: material(p.helmet ?? p.armor, { spec: true, contrast: 1.1 }),
    trim: material(p.trim, { spec: true }),
    dark: material(p.dark, { contrast: 0.85, texture: 0.6 }),
    visor: material(p.visor ?? p.glow ?? '#7fd8ff', { spec: true, contrast: 1.3 }),
    cape: material(p.cape ?? p.dark, { contrast: 0.9, texture: 0.8 }),
    glow: material(p.glow ?? p.visor ?? '#7fd8ff', { emissive: true }),
    skin: material(p.skin ?? '#b07a50', { contrast: 0.9, texture: 0.4 }),
    skinFar: material(darker(p.skin ?? '#b07a50'), { contrast: 0.85 }),
  };
  m.armorFar = material(darker(p.armor), { contrast: 1 });
  m.darkFar = material(darker(p.dark), { contrast: 0.8 });
  if (gun) {
    m.gunBody = material(gun.body, { spec: true, contrast: 1.1 });
    m.gunDark = material(gun.dark ?? darker(gun.body, 0.4), { contrast: 0.9 });
    m.gunGlow = material(gun.accent, { emissive: true });
  }
  return m;
}

// [{ rgba, w, h, shoulder: [x, y] }] for every animation frame of a body.
export function bodyFrames(def) {
  const body = BODIES[def.body];
  const mats = materialsFor(def);
  const frames = [];
  for (let f = 0; f < body.frames; f++) {
    const { shapes, shoulder } = body.build(f, def);
    frames.push({ rgba: draw(shapes, body.w, body.h, mats), w: body.w * ART, h: body.h * ART, shoulder: [shoulder[0] * ART, shoulder[1] * ART] });
  }
  return frames;
}

// Arm + weapon frames at AIM_STEPS angles, with the muzzle offset from the pivot.
export function armFrames(def, weapon) {
  const body = BODIES[def.body];
  const gun = weapon?.gun ? gunShapes(weapon.gun.kind, weapon.gun.len) : null;
  const mats = materialsFor(def, weapon?.gun);
  const frames = [];
  for (let i = 0; i < AIM_STEPS; i++) {
    const a = -Math.PI / 2 + (i / (AIM_STEPS - 1)) * Math.PI;
    const { shapes, muzzle } = armShapes(body, def, a, gun, ARM_SIZE);
    const S = ARM_SIZE * ART;
    frames.push({ rgba: draw(shapes, ARM_SIZE, ARM_SIZE, mats), w: S, h: S, muzzle: [muzzle[0] * ART, muzzle[1] * ART], angle: a });
  }
  return frames;
}

// Index of the arm frame closest to an aim vector, and whether to mirror it.
export function aimFrame(x, y) {
  const flip = x < -0.01;
  const a = Math.atan2(y, Math.abs(x));
  const i = Math.round(((a + Math.PI / 2) / Math.PI) * (AIM_STEPS - 1));
  return { i: Math.max(0, Math.min(AIM_STEPS - 1, i)), flip };
}

// A weapon on its own (for drops on the ground), centered in its frame.
export function gunFrame(weapon) {
  const g = gunShapes(weapon.gun.kind, weapon.gun.len);
  const w = Math.ceil(weapon.gun.len + 22), h = 18;
  const ox = 10, oy = h / 2;
  const shapes = g.shapes.map((s) => {
    const m = ([x, y]) => [x + ox, y + oy];
    if (s.t === 'cap') return { ...s, a: m(s.a), b: m(s.b) };
    if (s.t === 'ell') return { ...s, c: m(s.c) };
    return { ...s, pts: s.pts.map(m) };
  });
  const mats = materialsFor({ pal: { armor: '#888888', dark: '#333333', trim: '#aaaaaa' } }, weapon.gun);
  return { rgba: draw(shapes, w, h, mats), w: w * ART, h: h * ART };
}
