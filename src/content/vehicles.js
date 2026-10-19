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
//   seatAt: { driver: [x, y, crop], gunner: [x, y, crop] } where each rider shows (the rider's
//   center in rig pixels; crop: how much of the rider shows from the top, default 0.5).
//   sit, except a gunner on a vehicle with gunnerStands (the Warthog's turret)

import { add, HOVER } from './rig.js';

function wheel(c, r, f, z) {
  const a = (f / 4) * Math.PI;
  return [
    { t: 'ell', c, rx: r, ry: r, m: 'dark', z },
    { t: 'ell', c, rx: r * 0.5, ry: r * 0.5, m: 'trim', z: z + 0.1 },
    { t: 'cap', a: add(c, [Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75]), b: add(c, [-Math.cos(a) * r * 0.75, -Math.sin(a) * r * 0.75]), r1: 0.8, r2: 0.8, m: 'darkFar', z: z + 0.2, noSep: true },
  ];
}

// UNSC Warthog (our own drawing of the classic shape): big off-road tires under
// angular wheel arches, a long low hood with a push-bar snout, an open cab with a roll
// bar, and a raised three-barrel chaingun turret at the back firing over the cab.
function warthog(f) {
  const W = 88, H = 46;
  const bob = f % 2 ? 0.5 : 0;
  const tire = (c) => [
    { t: 'ell', c, rx: 9.5, ry: 9.5, m: 'dark', z: 4 },
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
      const a = (k / 8) * Math.PI * 2 + (f / 4) * Math.PI;
      return { t: 'ell', c: add(c, [Math.cos(a) * 8.6, Math.sin(a) * 8.6]), rx: 1.6, ry: 1.6, m: 'darkFar', z: 4.05 };
    }),
    ...wheel(c, 5.2, f, 4.1),
  ];
  const y = (v) => v + bob;
  const shapes = [
    ...tire([20, 36]),
    ...tire([70, 36]),
    // Chassis and side panels.
    { t: 'poly', pts: [[6, y(31)], [9, y(23)], [80, y(23)], [86, y(28)], [84, y(33)], [8, y(33)]], m: 'armor', z: 2, bevel: 2, tilt: [0, -0.15] },
    { t: 'poly', pts: [[30, y(24)], [32, y(18)], [50, y(18)], [52, y(24)]], m: 'armor', z: 5, bevel: 1.6, tilt: [0, -0.2] },
    // Wheel arches.
    { t: 'poly', pts: [[7, y(27)], [11, y(18)], [29, y(18)], [33, y(27)]], m: 'armor', z: 5.2, bevel: 2, tilt: [0, -0.3] },
    { t: 'poly', pts: [[57, y(27)], [61, y(17)], [80, y(18)], [84, y(27)]], m: 'armor', z: 5.2, bevel: 2, tilt: [0, -0.3] },
    // The long hood, sloping down to the snout.
    { t: 'poly', pts: [[50, y(18)], [62, y(15)], [80, y(17)], [86, y(22)], [84, y(24)], [52, y(22)]], m: 'armor', z: 5.4, bevel: 2, tilt: [0, -0.35] },
    { t: 'poly', pts: [[64, y(16)], [78, y(17.5)], [77, y(19)], [64, y(18)]], m: 'trim', z: 5.6, bevel: 0.8 },
    // Push-bar snout and grill.
    { t: 'poly', pts: [[84, y(19)], [90, y(21)], [90, y(30)], [84, y(31)]], m: 'dark', z: 5.5, bevel: 1.2 },
    ...[22.5, 25.5, 28.5].map((gy) => ({ t: 'cap', a: [85, y(gy)], b: [89, y(gy)], r1: 0.6, r2: 0.6, m: 'trim', z: 5.7 })),
    { t: 'ell', c: [85, y(21)], rx: 1.4, ry: 1.2, m: 'glow', z: 5.8, hot: true },
    // Windshield frame and roll bar.
    { t: 'cap', a: [50, y(18)], b: [47, y(10)], r1: 0.9, r2: 0.8, m: 'dark', z: 5.3 },
    { t: 'cap', a: [31, y(18)], b: [33, y(7)], r1: 1.1, r2: 1, m: 'dark', z: 5.3 },
    { t: 'cap', a: [33, y(7)], b: [40, y(7)], r1: 1.1, r2: 1, m: 'dark', z: 5.3 },
    // Turret: pedestal, gun body and three barrels.
    { t: 'cap', a: [16, y(22)], b: [16, y(12)], r1: 1.6, r2: 1.4, m: 'dark', z: 1.5 },
    { t: 'poly', pts: [[11, y(13)], [22, y(10)], [24, y(15)], [12, y(16)]], m: 'trim', z: 1.6, bevel: 1.2 },
    ...[11, 12.6, 14.2].map((by) => ({ t: 'cap', a: [22, y(by)], b: [36, y(by - 1)], r1: 0.7, r2: 0.6, m: 'dark', z: 1.7 })),
    { t: 'ell', c: [7, y(26)], rx: 1, ry: 1.3, m: 'glow', z: 3, hot: true },
  ];
  return { shapes, shoulder: [37, y(11.5)], w: W, h: H };
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

// Jiralhanae Chopper: one huge bladed front wheel, the rider sitting behind it.
function chopper(f) {
  const W = 70, H = 40;
  const bob = f % 2 ? 0.5 : 0;
  const shapes = [
    ...wheel([54, 26], 12, f, 4),
    { t: 'poly', pts: [[44, 14], [66, 14], [68, 18], [42, 18]], m: 'trim', z: 4.5, bevel: 1 },
    ...wheel([10, 33], 5, f, 2),
    { t: 'poly', pts: [[4, 24 + bob], [12, 17 + bob], [42, 16 + bob], [48, 22 + bob], [40, 30 + bob], [10, 30 + bob]], m: 'armor', z: 2, bevel: 2, tilt: [0, -0.15] },
    { t: 'poly', pts: [[14, 17 + bob], [22, 11 + bob], [30, 12 + bob], [26, 17 + bob]], m: 'trim', z: 2.4, bevel: 1.2 },
    { t: 'cap', a: [40, 20 + bob], b: [66, 20 + bob], r1: 1.4, r2: 1.2, m: 'dark', z: 5 },
    { t: 'cap', a: [40, 24 + bob], b: [66, 24 + bob], r1: 1.4, r2: 1.2, m: 'dark', z: 5 },
    { t: 'ell', c: [6, 24 + bob], rx: 1.6, ry: 2.4, m: 'glow', z: 3, hot: f % 2 === 0 },
  ];
  return { shapes, shoulder: [66, 22 + bob], w: W, h: H };
}

// UNSC Scorpion: a tank on two treads with a long main cannon.
function scorpion(f) {
  const W = 92, H = 46;
  const tread = (x0, x1, y, z, m) => [
    { t: 'cap', a: [x0, y], b: [x1, y], r1: 6.5, r2: 6.5, m, z },
    ...[0, 1, 2, 3, 4].map((i) => ({ t: 'ell', c: [x0 + 2 + i * (x1 - x0 - 4) / 4 + (f % 2) * 1.5, y], rx: 2.6, ry: 2.6, m: 'trim', z: z + 0.1 })),
  ];
  const shapes = [
    ...tread(12, 80, 37, 1, 'darkFar'),
    { t: 'poly', pts: [[6, 30], [16, 22], [76, 22], [88, 30], [80, 34], [12, 34]], m: 'armor', z: 2, bevel: 2.4, tilt: [0, -0.2] },
    ...tread(14, 82, 39, 3, 'dark'),
    { t: 'poly', pts: [[28, 22], [34, 12], [58, 12], [64, 22]], m: 'armor', z: 2.6, bevel: 2, tilt: [0, -0.25] },
    { t: 'cap', a: [58, 16], b: [90, 16], r1: 2.6, r2: 2.2, m: 'dark', z: 2.8 },
    { t: 'cap', a: [86, 16], b: [91, 16], r1: 3, r2: 3, m: 'trim', z: 2.9 },
    { t: 'ell', c: [40, 13], rx: 3, ry: 1.4, m: 'glow', z: 2.7, hot: true },
  ];
  return { shapes, shoulder: [91, 16], w: W, h: H };
}

// UNSC Mongoose: a light two-seat quad bike.
function mongoose(f) {
  const W = 50, H = 32;
  const bob = f % 2 ? 0.4 : 0;
  const shapes = [
    ...wheel([10, 25], 6, f, 4),
    ...wheel([40, 25], 6, f, 4),
    { t: 'poly', pts: [[4, 18 + bob], [12, 12 + bob], [36, 12 + bob], [48, 17 + bob], [42, 21 + bob], [8, 21 + bob]], m: 'armor', z: 2, bevel: 1.8, tilt: [0, -0.15] },
    { t: 'cap', a: [34, 12 + bob], b: [40, 6 + bob], r1: 0.9, r2: 0.9, m: 'dark', z: 2.5 },
    { t: 'ell', c: [47, 17 + bob], rx: 1, ry: 1.2, m: 'glow', z: 3, hot: true },
  ];
  return { shapes, shoulder: [44, 12 + bob], w: W, h: H };
}

// UNSC Hornet: a small VTOL gunship with twin rotors.
function hornet(f) {
  const W = 70, H = 40;
  const bob = [0, -0.6, -1, -0.6][f];
  const spin = f % 2 ? 1 : -1;
  const shapes = [
    { t: 'poly', pts: [[8, 20 + bob], [20, 12 + bob], [50, 12 + bob], [64, 20 + bob], [54, 28 + bob], [16, 28 + bob]], m: 'armor', z: 2, bevel: 2.2, tilt: [0, -0.2] },
    { t: 'poly', pts: [[44, 13 + bob], [56, 16 + bob], [52, 20 + bob], [42, 18 + bob]], m: 'trim', z: 2.5, bevel: 1 },
    { t: 'cap', a: [12, 10 + bob], b: [12, 16 + bob], r1: 1, r2: 1, m: 'dark', z: 1.5 },
    { t: 'cap', a: [58, 10 + bob], b: [58, 16 + bob], r1: 1, r2: 1, m: 'dark', z: 1.5 },
    { t: 'ell', c: [12, 9 + bob], rx: 12, ry: 1.2 + spin * 0.3, m: 'darkFar', z: 1 },
    { t: 'ell', c: [58, 9 + bob], rx: 12, ry: 1.2 - spin * 0.3, m: 'darkFar', z: 1 },
    { t: 'cap', a: [56, 26 + bob], b: [68, 27 + bob], r1: 1.2, r2: 1, m: 'dark', z: 3 },
  ];
  return { shapes, shoulder: [68, 27 + bob], w: W, h: H };
}

// UNSC Broadsword: a single-seat space fighter.
function broadsword(f) {
  const W = 80, H = 34;
  const bob = [0, -0.6, -1, -0.6][f];
  const shapes = [
    { t: 'poly', pts: [[4, 18 + bob], [20, 12 + bob], [60, 13 + bob], [78, 18 + bob], [60, 23 + bob], [18, 24 + bob]], m: 'armor', z: 2, bevel: 2.2, tilt: [0, -0.2] },
    { t: 'poly', pts: [[26, 13 + bob], [40, 4 + bob], [50, 4 + bob], [44, 13 + bob]], m: 'armorFar', z: 1, bevel: 1.6 },
    { t: 'poly', pts: [[26, 23 + bob], [40, 32 + bob], [50, 32 + bob], [44, 23 + bob]], m: 'armor', z: 3, bevel: 1.6 },
    { t: 'poly', pts: [[52, 14 + bob], [64, 15 + bob], [60, 18 + bob], [50, 17 + bob]], m: 'trim', z: 2.5, bevel: 1 },
    { t: 'ell', c: [5, 18 + bob], rx: 2.4, ry: 3, m: 'glow', z: 3, hot: f % 2 === 0 },
  ];
  return { shapes, shoulder: [78, 19 + bob], w: W, h: H };
}

export const VEHICLE_BODIES = {
  warthog: { w: 88, h: 46, frames: 4, anims: HOVER, hit: [66, 26], build: warthog, vehicle: true },
  ghost: { w: 58, h: 30, frames: 4, anims: HOVER, hit: [44, 18], build: ghost, vehicle: true },
  banshee: { w: 72, h: 34, frames: 4, anims: HOVER, hit: [52, 20], build: banshee, vehicle: true, flying: true },
  chopper: { w: 70, h: 40, frames: 4, anims: HOVER, hit: [56, 26], build: chopper, vehicle: true },
  scorpion: { w: 92, h: 46, frames: 4, anims: HOVER, hit: [80, 30], build: scorpion, vehicle: true },
  mongoose: { w: 50, h: 32, frames: 4, anims: HOVER, hit: [40, 20], build: mongoose, vehicle: true },
  hornet: { w: 70, h: 40, frames: 4, anims: HOVER, hit: [56, 24], build: hornet, vehicle: true, flying: true },
  broadsword: { w: 80, h: 34, frames: 4, anims: HOVER, hit: [64, 20], build: broadsword, vehicle: true, flying: true },
};

export const VEHICLES = {
  warthog: {
    name: 'Warthog', body: 'warthog', kind: 'ground', seats: ['driver', 'gunner'],
    pal: { armor: '#56663a', trim: '#a8a890', dark: '#24241e', glow: '#fff4c0' },
    speed: 250, accel: 520, jump: 300, health: 450, weapon: 'warthog-chaingun', splatter: 90,
    seatAt: { driver: [41, 6, 0.6], gunner: [15, 12, 0.62] }, gunnerStands: true,
  },
  ghost: {
    name: 'Ghost', body: 'ghost', kind: 'hover', seats: ['driver'],
    pal: { armor: '#8a5ac8', trim: '#c8a8f0', dark: '#3a2a5a', glow: '#7ad8ff' },
    speed: 230, accel: 600, jump: 260, health: 300, weapon: 'ghost-plasma', splatter: 70,
    seatAt: { driver: [27, 2] },
  },
  banshee: {
    name: 'Banshee', body: 'banshee', kind: 'air', seats: ['driver'],
    pal: { armor: '#8a5ac8', trim: '#c8a8f0', dark: '#3a2a5a', glow: '#7ad8ff' },
    speed: 220, accel: 500, jump: 0, health: 280, weapon: 'banshee-plasma', splatter: 0,
    seatAt: { driver: [36, 2] },
  },
  chopper: {
    name: 'Chopper', body: 'chopper', kind: 'ground', seats: ['driver'],
    pal: { armor: '#5a4a3a', trim: '#a89070', dark: '#2a221a', glow: '#ff8a3a' },
    speed: 260, accel: 640, jump: 280, health: 420, weapon: 'chopper-cannons', splatter: 120,
    seatAt: { driver: [24, 4] },
  },
  scorpion: {
    name: 'Scorpion', body: 'scorpion', kind: 'ground', seats: ['driver'],
    pal: { armor: '#56663a', trim: '#8a8a70', dark: '#24241e', glow: '#fff4c0' },
    speed: 150, accel: 300, jump: 0, health: 900, weapon: 'scorpion-cannon', splatter: 140,
    seatAt: { driver: [44, 2] },
  },
  mongoose: {
    name: 'Mongoose', body: 'mongoose', kind: 'ground', seats: ['driver', 'gunner'],
    pal: { armor: '#56663a', trim: '#a8a890', dark: '#24241e', glow: '#fff4c0' },
    speed: 290, accel: 700, jump: 320, health: 260, weapon: 'warthog-chaingun', splatter: 60,
    seatAt: { driver: [28, 0], gunner: [16, 0] },
  },
  hornet: {
    name: 'Hornet', body: 'hornet', kind: 'air', seats: ['driver'],
    pal: { armor: '#56663a', trim: '#a8a890', dark: '#24241e', glow: '#fff4c0' },
    speed: 220, accel: 520, jump: 0, health: 320, weapon: 'warthog-chaingun', splatter: 0,
    seatAt: { driver: [46, 6] },
  },
  broadsword: {
    name: 'Broadsword', body: 'broadsword', kind: 'air', seats: ['driver'],
    pal: { armor: '#7a828a', trim: '#c8d0d8', dark: '#2a2e34', glow: '#9ad8ff' },
    speed: 280, accel: 640, jump: 0, health: 360, weapon: 'warthog-chaingun', splatter: 0,
    seatAt: { driver: [54, 7] },
  },
};
