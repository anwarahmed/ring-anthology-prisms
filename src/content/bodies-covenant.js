// Covenant species rigs: Sangheili (Elite), Unggoy (Grunt), Kig-Yar (Jackal), Mgalekgolo
// (Hunter). Same format as bodies.js. Palettes set rank colors.
//   Elite pal: armor (rank color), trim, dark (undersuit), skin (mandibles), glow (eyes)
//   Grunt pal: armor, trim, dark, skin, glow (methane tank)
//   Jackal pal: armor, trim, dark, skin, glow (energy shield)
//   Hunter pal: armor (plates), trim, dark, skin (worm core), glow (cannon)

import { pose, add, dirDown, FRAMES, HOVER } from './rig.js';

// Digitigrade leg (Elites, Jackals): thigh forward, shin back, then a long foot.
function digiLeg(hip, [t, k], L, near) {
  const f = near ? '' : 'Far';
  const z = near ? 6 : 1;
  const knee = add(hip, dirDown(t + 0.55, L.thigh));
  const ankle = add(knee, dirDown(t - 0.55 - k * 0.6, L.shin));
  const toe = add(ankle, dirDown(t + 0.25, L.foot));
  return {
    toe,
    shapes: [
      { t: 'cap', a: hip, b: knee, r1: L.r * 1.15, r2: L.r, m: `dark${f}`, z },
      { t: 'cap', a: hip, b: add(hip, dirDown(t + 0.55, L.thigh * 0.75)), r1: L.r, r2: L.r * 0.8, m: `armor${f}`, z: z + 0.2 },
      { t: 'cap', a: knee, b: ankle, r1: L.r * 0.9, r2: L.r * 0.7, m: `armor${f}`, z: z + 0.1 },
      { t: 'cap', a: ankle, b: toe, r1: L.r * 0.7, r2: L.r * 0.5, m: `dark${f}`, z: z + 0.15 },
      { t: 'ell', c: add(toe, [1.5, 0.5]), rx: L.r * 1.2, ry: 1.5, m: `dark${f}`, z: z + 0.2 },
    ],
  };
}

function digiHip(p, L, ground) {
  const y = (leg) => {
    const [t, k] = leg;
    return L.thigh * Math.cos(t + 0.55) + L.shin * Math.cos(t - 0.55 - k * 0.6) + L.foot * Math.cos(t + 0.25);
  };
  return ground - 2 - Math.max(y(p.front), y(p.back));
}

// Sangheili: tall, hunched, armored, with a long head and split mandibles.
function elite(f, def) {
  const L = { thigh: 11, shin: 11, foot: 7, r: 3.1 };
  const p = pose(f);
  const W = 46, H = 60;
  const hip = [19, digiHip(p, L, H - 1) + (p.air ? -1 : 0)];
  const lean = 0.32 + p.lean * 0.5;
  const up = (len) => [Math.sin(lean) * len, -Math.cos(lean) * len];
  const chestC = add(hip, up(11 - p.breathe * 0.4));
  const neck = add(hip, up(18 - p.breathe * 0.5));
  const headC = add(neck, [4.5, -1.5]);
  const shapes = [];
  shapes.push(...digiLeg([hip[0] - 1, hip[1]], p.back, L, false).shapes);
  shapes.push({ t: 'cap', a: hip, b: chestC, r1: 4.4, r2: 5, m: 'dark', z: 2 });
  shapes.push({ t: 'ell', c: chestC, rx: 7.5, ry: 8, rot: lean, m: 'armor', z: 3 });
  shapes.push({ t: 'poly', pts: [add(chestC, [-8, -6]), add(chestC, [-12, -11]), add(chestC, [-4, -9])], m: 'trim', z: 2.6, bevel: 1.2 });
  shapes.push({ t: 'poly', pts: [[hip[0] - 5, hip[1] - 2], [hip[0] + 5, hip[1] - 2], [hip[0] + 4, hip[1] + 5], [hip[0] - 4, hip[1] + 5]], m: 'trim', z: 3.5, bevel: 1.2 });
  shapes.push(...digiLeg(hip, p.front, L, true).shapes);
  shapes.push({ t: 'cap', a: neck, b: add(neck, [3, -1]), r1: 2.6, r2: 2.4, m: 'dark', z: 4 });
  // Head: helmet over a long skull, mandibles below.
  shapes.push({ t: 'ell', c: headC, rx: 5.6, ry: 3.6, rot: 0.15, m: 'armor', z: 7 });
  shapes.push({ t: 'poly', pts: [add(headC, [-4, -3]), add(headC, [3, -4.5]), add(headC, [6, -2]), add(headC, [-2, -1])], m: 'trim', z: 7.3, bevel: 1 });
  const jaw = f % 4 < 2 ? 0 : 0.6;
  for (const [dy, zz] of [[1.5, 6.8], [3, 7.5]]) {
    shapes.push({ t: 'cap', a: add(headC, [2, dy]), b: add(headC, [8, dy + 1.5 + jaw]), r1: 1, r2: 0.6, m: 'skin', z: zz });
  }
  shapes.push({ t: 'ell', c: add(headC, [2.8, -0.6]), rx: 0.8, ry: 0.7, m: 'glow', z: 7.6, hot: true });
  if (def.infected) {
    shapes.push({ t: 'ell', c: add(chestC, [-4, -5]), rx: 5, ry: 4, m: 'cape', z: 8 });
    shapes.push({ t: 'ell', c: add(headC, [-4, -2]), rx: 3.4, ry: 2.8, m: 'cape', z: 8 });
    shapes.push({ t: 'cap', a: add(chestC, [3, 4]), b: add(chestC, [7, 13 + (f % 4)]), r1: 1.5, r2: 0.6, m: 'cape', z: 8 });
  }
  return { shapes, shoulder: add(neck, [2, 3.5]), w: W, h: H };
}

// Unggoy: short and wide, with a methane tank and breathing mask.
function grunt(f) {
  const L = { thigh: 5.5, shin: 5, thighR: 2.6, shinR: 2.4, foot: 3 };
  const p = pose(f);
  const W = 32, H = 34;
  const ay = (leg) => L.thigh * Math.cos(leg[0]) + L.shin * Math.cos(leg[0] - leg[1]);
  const hip = [14, H - 3 - Math.max(ay(p.front), ay(p.back))];
  const leg = (h, [t, k], near) => {
    const knee = add(h, dirDown(t, L.thigh));
    const ankle = add(knee, dirDown(t - k, L.shin));
    const fs = near ? '' : 'Far';
    return [
      { t: 'cap', a: h, b: knee, r1: L.thighR, r2: L.thighR * 0.9, m: `dark${fs}`, z: near ? 6 : 1 },
      { t: 'cap', a: knee, b: ankle, r1: L.shinR, r2: L.shinR * 0.9, m: `skin${fs}`, z: near ? 6.1 : 1.1 },
      { t: 'ell', c: add(ankle, [1.4, 1]), rx: L.foot, ry: 1.8, m: `skin${fs}`, z: near ? 6.2 : 1.2 },
    ];
  };
  const shapes = [];
  const chestC = add(hip, [1.5, -7 + p.breathe * 0.3]);
  shapes.push(...leg([hip[0] - 1, hip[1]], p.back, false));
  // Methane tank on the back.
  shapes.push({ t: 'poly', pts: [add(chestC, [-6, -11]), add(chestC, [-1, -9]), add(chestC, [-2, 4]), add(chestC, [-9, 2])], m: 'trim', z: 1.5, bevel: 2 });
  shapes.push({ t: 'ell', c: add(chestC, [-4.5, -6]), rx: 1.6, ry: 2.4, m: 'glow', z: 1.8, hot: f % 2 === 0 });
  shapes.push({ t: 'ell', c: chestC, rx: 7, ry: 7.2, m: 'armor', z: 3 });
  shapes.push(...leg(hip, p.front, true));
  const headC = add(chestC, [5, -6]);
  shapes.push({ t: 'ell', c: headC, rx: 4.2, ry: 3.6, m: 'skin', z: 7 });
  shapes.push({ t: 'poly', pts: [add(headC, [1, -1]), add(headC, [6, 0]), add(headC, [5.5, 3.5]), add(headC, [1.5, 3])], m: 'dark', z: 7.5, bevel: 1 });
  shapes.push({ t: 'ell', c: add(headC, [1.5, -1.5]), rx: 1, ry: 0.9, m: 'glow', z: 7.6, hot: true });
  return { shapes, shoulder: add(chestC, [3, -2]), w: W, h: H };
}

// Kig-Yar: thin and bird-like, with head quills and a glowing energy shield.
function jackal(f, def) {
  const L = { thigh: 9.5, shin: 9.5, foot: 6, r: 2.3 };
  const p = pose(f);
  const W = 40, H = 52;
  const hip = [17, digiHip(p, L, H - 1)];
  const lean = 0.35;
  const up = (len) => [Math.sin(lean) * len, -Math.cos(lean) * len];
  const chestC = add(hip, up(9 - p.breathe * 0.4));
  const neck = add(hip, up(15));
  const headC = add(neck, [3.5, -2.5]);
  const shapes = [];
  shapes.push(...digiLeg([hip[0] - 1, hip[1]], p.back, L, false).shapes);
  shapes.push({ t: 'cap', a: hip, b: chestC, r1: 3.2, r2: 3.8, m: 'dark', z: 2 });
  shapes.push({ t: 'ell', c: chestC, rx: 5, ry: 6, rot: lean, m: 'armor', z: 3 });
  shapes.push(...digiLeg(hip, p.front, L, true).shapes);
  shapes.push({ t: 'cap', a: neck, b: add(neck, [2, -2]), r1: 1.8, r2: 1.6, m: 'skin', z: 4 });
  shapes.push({ t: 'ell', c: headC, rx: 4.2, ry: 3, rot: 0.2, m: 'skin', z: 7 });
  shapes.push({ t: 'poly', pts: [add(headC, [3, -1]), add(headC, [8, 0.5]), add(headC, [3, 1.5])], m: 'skin', z: 7.2, bevel: 0.8 });
  for (let q = 0; q < 3; q++) shapes.push({ t: 'cap', a: add(headC, [-2, -1 + q]), b: add(headC, [-8, -5 + q * 2]), r1: 0.9, r2: 0.4, m: 'trim', z: 6.5 });
  shapes.push({ t: 'ell', c: add(headC, [1.5, -0.8]), rx: 0.8, ry: 0.7, m: 'glow', z: 7.5, hot: true });
  // The energy shield, held out in front.
  if (!def.noShield) shapes.push({ t: 'ell', c: add(chestC, [9, 2]), rx: 3.4, ry: 10, m: 'glow', z: 9, noSep: true });
  return { shapes, shoulder: add(neck, [2, 3]), w: W, h: H };
}

// Mgalekgolo: a hulking armored colony with a shield arm and an assault cannon.
function hunter(f) {
  const L = { thigh: 9, shin: 9, thighR: 5, shinR: 4.4, foot: 6 };
  const p = pose(f);
  const W = 66, H = 68;
  const ay = (leg) => L.thigh * Math.cos(leg[0] * 0.6) + L.shin * Math.cos(leg[0] * 0.6 - leg[1] * 0.6);
  const hip = [28, H - 4 - Math.max(ay(p.front), ay(p.back))];
  const leg = (h, [t, k], near) => {
    const knee = add(h, dirDown(t * 0.6, L.thigh));
    const ankle = add(knee, dirDown(t * 0.6 - k * 0.6, L.shin));
    const fs = near ? '' : 'Far';
    return [
      { t: 'cap', a: h, b: knee, r1: L.thighR, r2: L.thighR * 0.9, m: `armor${fs}`, z: near ? 6 : 1 },
      { t: 'cap', a: knee, b: ankle, r1: L.shinR, r2: L.shinR * 0.9, m: `armor${fs}`, z: near ? 6.1 : 1.1 },
      { t: 'ell', c: add(ankle, [2, 2]), rx: L.foot, ry: 2.6, m: `dark${fs}`, z: near ? 6.2 : 1.2 },
    ];
  };
  const shapes = [];
  const back = add(hip, [-4, -22 + p.breathe * 0.4]);
  shapes.push(...leg([hip[0] - 3, hip[1]], p.back, false));
  shapes.push({ t: 'poly', pts: [add(hip, [-12, -4]), add(back, [-10, 0]), add(back, [6, -8]), add(back, [20, 2]), add(hip, [12, -2])], m: 'armor', z: 3, bevel: 3, tilt: [0, -0.2] });
  for (let s = 0; s < 4; s++) shapes.push({ t: 'cap', a: add(back, [-4 + s * 4, -2]), b: add(back, [-8 + s * 4, -11 - s]), r1: 1.4, r2: 0.5, m: 'trim', z: 2.5 });
  shapes.push({ t: 'ell', c: add(back, [12, 6]), rx: 4, ry: 3, m: 'skin', z: 3.5, hot: true });
  shapes.push(...leg(hip, p.front, true));
  // Shield arm in front.
  shapes.push({ t: 'poly', pts: [add(hip, [10, -26]), add(hip, [24, -22]), add(hip, [26, 2]), add(hip, [14, 4])], m: 'trim', z: 8, bevel: 3, tilt: [0.3, 0] });
  // Assault cannon arm.
  shapes.push({ t: 'cap', a: add(back, [14, 4]), b: add(back, [32, 6]), r1: 4, r2: 3.4, m: 'dark', z: 7 });
  shapes.push({ t: 'ell', c: add(back, [33, 6]), rx: 2, ry: 2.8, m: 'glow', z: 7.5, hot: true });
  return { shapes, shoulder: add(back, [34, 6]), w: W, h: H };
}

// Jiralhanae: huge, hunched and shaggy, with heavy plate on the shoulders and chest.
function brute(f, def) {
  const L = { thigh: 10, shin: 10, thighR: 4.4, shinR: 3.8, foot: 5 };
  const p = pose(f);
  const W = 54, H = 66;
  const ay = (leg) => L.thigh * Math.cos(leg[0]) + L.shin * Math.cos(leg[0] - leg[1]);
  const hip = [24, H - 3 - Math.max(ay(p.front), ay(p.back))];
  const leg = (h, [t, k], near) => {
    const knee = add(h, dirDown(t, L.thigh));
    const ankle = add(knee, dirDown(t - k, L.shin));
    const fs = near ? '' : 'Far';
    return [
      { t: 'cap', a: h, b: knee, r1: L.thighR, r2: L.thighR * 0.9, m: `dark${fs}`, z: near ? 6 : 1 },
      { t: 'cap', a: knee, b: ankle, r1: L.shinR, r2: L.shinR * 0.85, m: `armor${fs}`, z: near ? 6.1 : 1.1 },
      { t: 'ell', c: add(ankle, [2, 1.5]), rx: L.foot, ry: 2.4, m: `dark${fs}`, z: near ? 6.2 : 1.2 },
    ];
  };
  const shapes = [];
  const lean = 0.28 + p.lean * 0.4;
  const up = (len) => [Math.sin(lean) * len, -Math.cos(lean) * len];
  const chestC = add(hip, up(14 - p.breathe * 0.4));
  const neck = add(hip, up(24 - p.breathe * 0.5));
  const headC = add(neck, [6, 0]);
  shapes.push(...leg([hip[0] - 2, hip[1]], p.back, false));
  shapes.push({ t: 'cap', a: hip, b: chestC, r1: 7, r2: 8, m: 'dark', z: 2 });
  shapes.push({ t: 'ell', c: chestC, rx: 11, ry: 12, rot: lean, m: 'armor', z: 3 });
  shapes.push({ t: 'poly', pts: [add(chestC, [-4, -9]), add(chestC, [8, -6]), add(chestC, [9, 4]), add(chestC, [-2, 6])], m: 'trim', z: 3.4, bevel: 2 });
  shapes.push({ t: 'poly', pts: [[hip[0] - 7, hip[1] - 2], [hip[0] + 7, hip[1] - 2], [hip[0] + 6, hip[1] + 6], [hip[0] - 6, hip[1] + 6]], m: 'armor', z: 3.5, bevel: 1.5 });
  shapes.push(...leg(hip, p.front, true));
  // Shoulder plate on the near side and a mane of fur behind the head.
  shapes.push({ t: 'ell', c: add(neck, [-2, 4]), rx: 7, ry: 5, rot: -0.3, m: 'armor', z: 8.5 });
  shapes.push({ t: 'ell', c: add(neck, [-5, 1]), rx: 7, ry: 6, m: 'dark', z: 4 });
  // Head: heavy brow, beard and small glowing eyes.
  shapes.push({ t: 'ell', c: headC, rx: 6, ry: 5.4, m: 'skin', z: 7 });
  shapes.push({ t: 'poly', pts: [add(headC, [-3, 2]), add(headC, [6, 2.5]), add(headC, [4, 8]), add(headC, [-2, 7])], m: 'dark', z: 7.2, bevel: 1.2 });
  shapes.push({ t: 'cap', a: add(headC, [0, -2]), b: add(headC, [6, -1.4]), r1: 1.6, r2: 1.2, m: 'skin', z: 7.4 });
  shapes.push({ t: 'ell', c: add(headC, [3.6, -0.4]), rx: 0.9, ry: 0.7, m: 'glow', z: 7.6, hot: true });
  if (!def.bare) shapes.push({ t: 'poly', pts: [add(headC, [-6, -1]), add(headC, [-2, -6.5]), add(headC, [5, -6]), add(headC, [6, -2.5]), add(headC, [-1, -2])], m: 'armor', z: 7.8, bevel: 1.4 });
  if (def.chieftain) shapes.push({ t: 'poly', pts: [add(headC, [-3, -6]), add(headC, [-1, -14]), add(headC, [3, -6])], m: 'trim', z: 7.9, bevel: 1 });
  return { shapes, shoulder: add(neck, [3, 6]), w: W, h: H };
}

// A pop-up training target on a post (Spartan training courses).
function target(f) {
  const shapes = [
    { t: 'cap', a: [14, 40], b: [14, 22], r1: 1.6, r2: 1.4, m: 'dark', z: 0 },
    { t: 'poly', pts: [[6, 41], [22, 41], [20, 37], [8, 37]], m: 'dark', z: 0.5, bevel: 1 },
    { t: 'ell', c: [14, 14], rx: 10, ry: 10, m: 'armor', z: 1 },
    { t: 'ell', c: [14, 14], rx: 6.5, ry: 6.5, m: 'trim', z: 1.2 },
    { t: 'ell', c: [14, 14], rx: 3, ry: 3, m: 'armor', z: 1.4 },
    { t: 'ell', c: [14, 14], rx: 1.2, ry: 1.2, m: 'glow', z: 1.6, hot: f % 2 === 0 },
  ];
  return { shapes, shoulder: [14, 14], w: 28, h: 42 };
}

export const COVENANT_BODIES = {
  elite: { w: 46, h: 60, frames: 15, anims: FRAMES, hit: [16, 46], build: elite, reach: 10, arm: [3.2, 2.8] },
  grunt: { w: 32, h: 34, frames: 15, anims: FRAMES, hit: [14, 24], build: grunt, reach: 6, arm: [2.4, 2.2] },
  jackal: { w: 40, h: 52, frames: 15, anims: FRAMES, hit: [12, 40], build: jackal, reach: 8, arm: [2.2, 2], frontShield: true },
  hunter: { w: 66, h: 68, frames: 15, anims: FRAMES, hit: [32, 56], build: hunter, frontShield: true },
  brute: { w: 54, h: 66, frames: 15, anims: FRAMES, hit: [20, 52], build: brute, reach: 11, arm: [4, 3.4] },
  target: { w: 28, h: 42, frames: 4, anims: HOVER, hit: [20, 40], build: target },
};
