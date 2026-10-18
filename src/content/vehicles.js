// Vehicles: rigs (shapes, posed per frame) and driving stats. Players drive vehicles
// (press SWAP next to one to get in or out); enemy vehicles are units in units.js that
// use the same body.
//
// A vehicle body is a rig in the BODIES format (see bodies.js), registered from here:
//   { w, h, frames, anims, hit, build(frame, def) -> { shapes, shoulder } }
//   shoulder: where shots come out.
// A drivable vehicle (VEHICLES):
//   kind: ground | hover | air
//   seats: ['driver'] or ['driver', 'gunner'] (the gunner aims freely)
//   speed, accel, jump (ground hop), health, weapon, splatter (run-over damage)

import { add, HOVER } from './rig.js';

function wheel(c, r, f, z) {
  const a = (f / 4) * Math.PI;
  return [
    { t: 'ell', c, rx: r, ry: r, m: 'dark', z },
    { t: 'ell', c, rx: r * 0.5, ry: r * 0.5, m: 'trim', z: z + 0.1 },
    { t: 'cap', a: add(c, [Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75]), b: add(c, [-Math.cos(a) * r * 0.75, -Math.sin(a) * r * 0.75]), r1: 0.8, r2: 0.8, m: 'darkFar', z: z + 0.2, noSep: true },
  ];
}

// UNSC Warthog: a four-wheeled light vehicle with a rear chaingun.
function warthog(f) {
  const W = 76, H = 40;
  const bob = f % 2 ? 0.5 : 0;
  const shapes = [
    ...wheel([16, 31], 7, f, 4),
    ...wheel([58, 31], 7, f, 4),
    { t: 'poly', pts: [[4, 24 + bob], [12, 15 + bob], [44, 14 + bob], [56, 17 + bob], [72, 20 + bob], [72, 27 + bob], [60, 29 + bob], [8, 29 + bob]], m: 'armor', z: 2, bevel: 2.2, tilt: [0, -0.15] },
    { t: 'poly', pts: [[52, 17 + bob], [72, 20 + bob], [72, 23 + bob], [54, 21 + bob]], m: 'trim', z: 2.5, bevel: 1 },
    { t: 'cap', a: [38, 15 + bob], b: [46, 5 + bob], r1: 1, r2: 1, m: 'dark', z: 1.5 },
    { t: 'cap', a: [24, 15 + bob], b: [30, 6 + bob], r1: 1, r2: 1, m: 'dark', z: 1.5 },
    { t: 'cap', a: [30, 6 + bob], b: [46, 5 + bob], r1: 1, r2: 1, m: 'dark', z: 1.5 },
    // Rear chaingun turret.
    { t: 'poly', pts: [[6, 15 + bob], [14, 13 + bob], [16, 6 + bob], [8, 6 + bob]], m: 'trim', z: 3, bevel: 1.2 },
    { t: 'cap', a: [14, 8 + bob], b: [30, 8 + bob], r1: 1.6, r2: 1.4, m: 'dark', z: 3.2 },
    { t: 'ell', c: [71, 22 + bob], rx: 1.2, ry: 1.4, m: 'glow', z: 3, hot: true },
  ];
  return { shapes, shoulder: [31, 8 + bob], w: W, h: H };
}

// Covenant Ghost: a single-seat hover bike with twin plasma cannons.
function ghost(f) {
  const W = 58, H = 30;
  const bob = [0, -0.6, -1, -0.6][f];
  const shapes = [
    { t: 'poly', pts: [[4, 14 + bob], [18, 8 + bob], [40, 9 + bob], [54, 15 + bob], [44, 20 + bob], [12, 20 + bob]], m: 'armor', z: 2, bevel: 2.4, tilt: [0, -0.2] },
    { t: 'poly', pts: [[10, 18 + bob], [24, 22 + bob], [16, 24 + bob], [6, 21 + bob]], m: 'armorFar', z: 1, bevel: 1.5 },
    { t: 'poly', pts: [[40, 18 + bob], [52, 21 + bob], [46, 24 + bob], [36, 22 + bob]], m: 'armorFar', z: 1, bevel: 1.5 },
    { t: 'poly', pts: [[22, 9 + bob], [30, 5 + bob], [36, 9 + bob]], m: 'trim', z: 2.5, bevel: 1 },
    { t: 'cap', a: [46, 16 + bob], b: [56, 16 + bob], r1: 1.2, r2: 1, m: 'dark', z: 3 },
    { t: 'ell', c: [28, 23 + bob], rx: 12, ry: 1.6, m: 'glow', z: 0.5, hot: f % 2 === 0 },
  ];
  return { shapes, shoulder: [56, 16 + bob], w: W, h: H };
}

// Covenant Banshee: a flying attack craft with wing pods.
function banshee(f) {
  const W = 72, H = 34;
  const bob = [0, -0.6, -1, -0.6][f];
  const shapes = [
    { t: 'poly', pts: [[6, 16 + bob], [22, 10 + bob], [50, 11 + bob], [66, 17 + bob], [50, 21 + bob], [20, 21 + bob]], m: 'armor', z: 2, bevel: 2.6, tilt: [0, -0.2] },
    { t: 'poly', pts: [[20, 12 + bob], [30, 2 + bob], [38, 2 + bob], [34, 12 + bob]], m: 'armorFar', z: 1, bevel: 1.8 },
    { t: 'poly', pts: [[20, 20 + bob], [32, 31 + bob], [40, 31 + bob], [36, 20 + bob]], m: 'armor', z: 3, bevel: 1.8 },
    { t: 'ell', c: [36, 3 + bob], rx: 4, ry: 2, m: 'trim', z: 1.2 },
    { t: 'ell', c: [38, 31 + bob], rx: 4, ry: 2, m: 'trim', z: 3.2 },
    { t: 'cap', a: [52, 17 + bob], b: [68, 17 + bob], r1: 1.1, r2: 0.9, m: 'dark', z: 3 },
    { t: 'ell', c: [8, 16 + bob], rx: 2, ry: 3, m: 'glow', z: 3, hot: f % 2 === 0 },
  ];
  return { shapes, shoulder: [68, 17 + bob], w: W, h: H };
}

export const VEHICLE_BODIES = {
  warthog: { w: 76, h: 40, frames: 4, anims: HOVER, hit: [60, 24], build: warthog, vehicle: true },
  ghost: { w: 58, h: 30, frames: 4, anims: HOVER, hit: [44, 18], build: ghost, vehicle: true },
  banshee: { w: 72, h: 34, frames: 4, anims: HOVER, hit: [52, 20], build: banshee, vehicle: true, flying: true },
};

export const VEHICLES = {
  warthog: {
    name: 'Warthog', body: 'warthog', kind: 'ground', seats: ['driver', 'gunner'],
    pal: { armor: '#56663a', trim: '#a8a890', dark: '#24241e', glow: '#fff4c0' },
    speed: 250, accel: 520, jump: 300, health: 450, weapon: 'warthog-chaingun', splatter: 90,
  },
  ghost: {
    name: 'Ghost', body: 'ghost', kind: 'hover', seats: ['driver'],
    pal: { armor: '#8a5ac8', trim: '#c8a8f0', dark: '#3a2a5a', glow: '#7ad8ff' },
    speed: 230, accel: 600, jump: 260, health: 300, weapon: 'ghost-plasma', splatter: 70,
  },
  banshee: {
    name: 'Banshee', body: 'banshee', kind: 'air', seats: ['driver'],
    pal: { armor: '#8a5ac8', trim: '#c8a8f0', dark: '#3a2a5a', glow: '#7ad8ff' },
    speed: 220, accel: 500, jump: 0, health: 280, weapon: 'banshee-plasma', splatter: 0,
  },
};
