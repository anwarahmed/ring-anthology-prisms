// Body rigs: each body builds its sprite frames from shapes (src/engine/raster.js),
// posed by a shared animation set, so one rig serves many characters via palettes.
//
// A rig: { w, h, frames, hit: [w, h], build(frame, def) -> { shapes, shoulder } }
//   shoulder: where the arm-and-weapon overlay attaches (frame pixels), or the
//   muzzle for bodies without arms.
// Walking rigs use FRAMES; hovering rigs loop 4 hover frames.
// Palette keys used: armor, helmet, trim, visor, dark, cape, glow, skin.
// Humanoid styles: spartan, soldier, ancient-lord, primitive, sanshyuum. Forerunner: infected.
// Sprites face right; the engine mirrors them.

import { FRAMES, HOVER, pose, add, dirDown } from './rig.js';
import { COVENANT_BODIES } from './bodies-covenant.js';
import { VEHICLE_BODIES } from './vehicles.js';

export { FRAMES, HOVER };

// detail: armored plates and seams (Spartans), or kneepads and laced boots (soldiers).
function legShapes(hip, [t, k], L, near, m, detail = null) {
  const knee = add(hip, dirDown(t, L.thigh));
  const ankle = add(knee, dirDown(t - k, L.shin));
  const z = near ? 6 : 1;
  const f = near ? '' : 'Far';
  const out = [
    { t: 'cap', a: hip, b: knee, r1: L.thighR, r2: L.thighR * 0.8, m: `dark${f}`, z },
    { t: 'cap', a: hip, b: add(hip, dirDown(t, L.thigh * 0.7)), r1: L.thighR * 0.85, r2: L.thighR * 0.7, m: `${m}${f}`, z: z + 0.2 },
    { t: 'cap', a: knee, b: ankle, r1: L.shinR, r2: L.shinR * 0.85, m: `${m}${f}`, z: z + 0.1 },
    { t: 'ell', c: add(knee, [0.6, 0]), rx: L.shinR * 0.95, ry: L.shinR * 0.9, m: `${m}${f}`, z: z + 0.3 },
    { t: 'ell', c: add(ankle, [1.6, 1.2]), rx: L.foot, ry: 2.1, m: `dark${f}`, z: z + 0.25 },
  ];
  const along = (a, b, s) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
  if (detail === 'spartan') {
    // Thigh plate, shin ridge and seam, boot toe cap and sole.
    out.push({ t: 'cap', a: along(hip, knee, 0.18), b: along(hip, knee, 0.72), r1: L.thighR * 0.98, r2: L.thighR * 0.86, m: `${m}${f}`, z: z + 0.25 });
    out.push({ t: 'cap', a: along(hip, knee, 0.3), b: along(hip, knee, 0.62), r1: 0.22, r2: 0.22, m: 'seam', z: z + 0.35, noSep: true });
    out.push({ t: 'cap', a: along(knee, ankle, 0.35), b: along(knee, ankle, 0.75), r1: 0.22, r2: 0.22, m: 'seam', z: z + 0.35, noSep: true });
    out.push({ t: 'cap', a: add(ankle, [-1.6, 2.8]), b: add(ankle, [4.8, 2.8]), r1: 0.55, r2: 0.55, m: 'seam', z: z + 0.32, noSep: true });
  } else if (detail === 'soldier') {
    // Kneepad, boot laces, sole.
    out.push({ t: 'ell', c: add(knee, [1.2, 0]), rx: L.shinR * 0.8, ry: L.shinR, m: near ? 'trim' : 'trimFar', z: z + 0.35 });
    out.push({ t: 'cap', a: add(ankle, [0.6, -2.2]), b: add(ankle, [1.6, 0]), r1: 0.3, r2: 0.3, m: 'seam', z: z + 0.36, noSep: true });
    out.push({ t: 'cap', a: add(ankle, [-1.6, 2.8]), b: add(ankle, [4.6, 2.8]), r1: 0.5, r2: 0.5, m: 'seam', z: z + 0.32, noSep: true });
  }
  if (L.glow) out.push({ t: 'cap', a: add(knee, [0.8, 1.5]), b: add(ankle, [0.8, -1]), r1: 0.55, r2: 0.55, m: `glow`, z: z + 0.4, noSep: true });
  return { shapes: out, ankle };
}

// Places the hip so the lowest foot rests on the ground line.
function hipFor(p, L, groundY) {
  const ay = (leg) => L.thigh * Math.cos(leg[0]) + L.shin * Math.cos(leg[0] - leg[1]);
  return groundY - 2.6 - Math.max(ay(p.front), ay(p.back));
}

const HUMAN = {
  spartan: { thigh: 10, shin: 10.5, thighR: 3.3, shinR: 2.9, foot: 3.6, torso: 13, chest: [6.8, 7.4], head: [5, 5.3], pack: true, pauldron: 4.4 },
  soldier: { thigh: 9.6, shin: 10, thighR: 2.9, shinR: 2.5, foot: 3.3, torso: 12.5, chest: [6, 6.8], head: [4.6, 5], pack: false, pauldron: 3.6 },
};

function humanoid(f, def) {
  const st = def.style ?? 'soldier';
  const L = HUMAN[st === 'spartan' ? 'spartan' : 'soldier'];
  const p = pose(f);
  const W = 40, H = 52;
  const ground = H - 1;
  const hipY = hipFor(p, L, ground) + (p.air ? -1 : 0);
  const hip = [17, hipY];
  const lean = p.lean;
  const up = (len, extra = 0) => [Math.sin(lean + extra) * len, -Math.cos(lean + extra) * len];
  const chestC = add(hip, up(L.torso * 0.62 - p.breathe * 0.4));
  const neck = add(hip, up(L.torso + 1 - p.breathe * 0.5));
  const headC = add(neck, [1.2, -L.head[1] + 0.8]);
  const shapes = [];

  if (def.style === 'ancient-lord') {
    // Cape: hangs from the shoulders, sways with the stride.
    const sway = f >= 4 && f < 12 ? Math.sin(((f - 4) / 8) * Math.PI * 2) * 1.5 : 0;
    shapes.push({ t: 'poly', pts: [add(neck, [-2, 1]), add(neck, [-5, 2]), [hip[0] - 9 - sway, hip[1] + 13], [hip[0] - 2, hip[1] + 10], add(chestC, [-1, 0])], m: 'cape', z: 0, bevel: 2 });
  }
  const detail = st === 'spartan' || st === 'soldier' ? st : null;
  shapes.push(...legShapes([hip[0] - 1, hip[1]], p.back, L, false, 'armor', detail).shapes);
  shapes.push({ t: 'cap', a: hip, b: chestC, r1: 4.2, r2: 4.6, m: 'dark', z: 2 });
  if (L.pack) shapes.push({ t: 'poly', pts: [add(chestC, [-8, -4]), add(chestC, [-3, -6]), add(chestC, [-3, 5]), add(chestC, [-8, 4])], m: 'armorFar', z: 2.5 });
  shapes.push({ t: 'ell', c: chestC, rx: L.chest[0], ry: L.chest[1], rot: lean, m: 'armor', z: 3 });
  shapes.push({ t: 'poly', pts: [add(chestC, [-1, -3]), add(chestC, [5.5, -2.5]), add(chestC, [5, 2.5]), add(chestC, [0, 3])], m: 'trim', z: 3.4, bevel: 1.2, tilt: [0.15, -0.1] });
  shapes.push({ t: 'poly', pts: [[hip[0] - 4.5, hip[1] - 3], [hip[0] + 4.5, hip[1] - 3], [hip[0] + 4.8, hip[1] + 0.5], [hip[0] - 4.8, hip[1] + 0.5]], m: 'trim', z: 3.6, bevel: 1 });
  shapes.push(...legShapes(hip, p.front, L, true, 'armor', detail).shapes);
  if (st === 'spartan') {
    // Mjolnir: an upper chest plate with a center seam, a collar ring, abdomen
    // segments, belt pouches and a thigh holster on the hip.
    shapes.push({ t: 'poly', pts: [add(chestC, [-3.2, -4.2]), add(chestC, [4.6, -4.4]), add(chestC, [6.6, -1.2]), add(chestC, [5.2, 2.2]), add(chestC, [-1.8, 2.4])], m: 'armor', z: 3.35, bevel: 1.6, tilt: [0.12, -0.18] });
    shapes.push({ t: 'ell', c: add(neck, [0.6, 2.4]), rx: 3.6, ry: 1.5, rot: lean, m: 'armorFar', z: 4.1 });
    shapes.push({ t: 'cap', a: add(chestC, [1.4, -3.6]), b: add(chestC, [2, 2]), r1: 0.26, r2: 0.26, m: 'seam', z: 3.5, noSep: true });
    shapes.push({ t: 'cap', a: add(chestC, [-2.8, -1.4]), b: add(chestC, [6, -1.6]), r1: 0.26, r2: 0.26, m: 'seam', z: 3.5, noSep: true });
    for (const k of [0.25, 0.45]) {
      const c = [hip[0] + (chestC[0] - hip[0]) * k, hip[1] + (chestC[1] - hip[1]) * k];
      shapes.push({ t: 'cap', a: add(c, [-3.4, 0]), b: add(c, [3.6, -0.2]), r1: 0.35, r2: 0.35, m: 'seam', z: 2.2, noSep: true });
    }
    shapes.push({ t: 'poly', pts: [[hip[0] + 1.5, hip[1] - 2.4], [hip[0] + 4.2, hip[1] - 2.4], [hip[0] + 4.4, hip[1] + 0.8], [hip[0] + 1.3, hip[1] + 0.8]], m: 'dark', z: 3.7, bevel: 0.8 });
    shapes.push({ t: 'cap', a: [hip[0] - 3.8, hip[1] - 1.2], b: [hip[0] - 1.6, hip[1] - 1.2], r1: 0.55, r2: 0.55, m: 'metal', z: 3.8 });
  } else if (st === 'soldier' && def.faction !== 'ancient-humans') {
    // A tactical vest with pouches and a buckle.
    shapes.push({ t: 'poly', pts: [add(chestC, [-2.6, 1]), add(chestC, [1.4, 1]), add(chestC, [1.4, 4.4]), add(chestC, [-2.6, 4.4])], m: 'dark', z: 3.5, bevel: 0.8 });
    shapes.push({ t: 'poly', pts: [add(chestC, [2, 1]), add(chestC, [5.6, 0.6]), add(chestC, [5.6, 4]), add(chestC, [2, 4.4])], m: 'dark', z: 3.5, bevel: 0.8 });
    shapes.push({ t: 'cap', a: add(chestC, [-2, -5]), b: add(chestC, [4.5, 3]), r1: 0.45, r2: 0.45, m: 'seam', z: 3.45, noSep: true });
    shapes.push({ t: 'cap', a: [hip[0] - 0.6, hip[1] - 1.2], b: [hip[0] + 1.2, hip[1] - 1.2], r1: 0.6, r2: 0.6, m: 'metal', z: 3.8 });
  }
  shapes.push({ t: 'cap', a: add(neck, [0, 2]), b: neck, r1: 2.6, r2: 2.4, m: 'dark', z: 4 });

  if (st === 'primitive') {
    // Unarmored ancient human (e.g. Chakas): bare head, hair, simple tunic.
    shapes.push({ t: 'ell', c: headC, rx: L.head[0] * 0.9, ry: L.head[1] * 0.92, m: 'skin', z: 7 });
    shapes.push({ t: 'ell', c: add(headC, [-1.2, -2]), rx: L.head[0] * 0.95, ry: L.head[1] * 0.6, m: 'dark', z: 7.2 });
    shapes.push({ t: 'cap', a: add(headC, [2.6, -0.6]), b: add(headC, [3.4, -0.6]), r1: 0.6, r2: 0.6, m: 'dark', z: 7.4, noSep: true });
    shapes.push({ t: 'poly', pts: [add(chestC, [-5, 3]), add(chestC, [5, 3]), [hip[0] + 6.5, hip[1] + 5], [hip[0] + 2, hip[1] + 7], [hip[0] - 3, hip[1] + 6], [hip[0] - 6.5, hip[1] + 5]], m: 'armor', z: 6.5, bevel: 2.2, tilt: [0.15, 0] });
    return { shapes, shoulder: add(neck, [1.5, 3.2]), w: W, h: H };
  }
  if (st === 'sanshyuum') {
    // San'Shyuum: long head and neck, flowing robe over the legs.
    const hc = add(neck, [2.4, -6.5]);
    shapes.push({ t: 'cap', a: neck, b: add(neck, [1.6, -3]), r1: 2.2, r2: 2, m: 'skin', z: 6.8 });
    shapes.push({ t: 'ell', c: hc, rx: 4, ry: 6.2, rot: 0.45, m: 'skin', z: 7 });
    shapes.push({ t: 'cap', a: add(hc, [1.8, -0.6]), b: add(hc, [3, -0.2]), r1: 0.7, r2: 0.6, m: 'dark', z: 7.4, noSep: true });
    shapes.push({ t: 'poly', pts: [add(chestC, [-5, -5]), add(chestC, [5.5, -5]), [hip[0] + 7, hip[1] + 8], [hip[0] + 8.5, hip[1] + 13], [hip[0] - 1, hip[1] + 14], [hip[0] - 8, hip[1] + 13], [hip[0] - 6.5, hip[1] + 7]], m: 'cape', z: 6.5, bevel: 2.6, tilt: [0.2, 0] });
    shapes.push({ t: 'cap', a: add(chestC, [1, -3]), b: [hip[0] + 1.5, hip[1] + 13], r1: 0.9, r2: 1.1, m: 'trim', z: 6.6, noSep: true });
    shapes.push({ t: 'poly', pts: [add(chestC, [-4, -6.5]), add(chestC, [5, -6.5]), add(chestC, [4, -3.5]), add(chestC, [-3, -3.5])], m: 'trim', z: 6.7, bevel: 1 });
    return { shapes, shoulder: add(neck, [1.5, 3.2]), w: W, h: H };
  }
  const hel = 'helmet';
  shapes.push({ t: 'ell', c: headC, rx: L.head[0], ry: L.head[1], m: hel, z: 7 });
  if (st === 'spartan') {
    // Helmet ridge and ear piece, a large visor with a reflection streak, chin guard.
    shapes.push({ t: 'cap', a: add(headC, [-3.6, -3.2]), b: add(headC, [2.4, -4.6]), r1: 1, r2: 0.8, m: hel, z: 7.25 });
    shapes.push({ t: 'poly', pts: [add(headC, [-3.4, -0.4]), add(headC, [-1, -0.6]), add(headC, [-0.8, 3]), add(headC, [-3.2, 2.6])], m: 'armorFar', z: 7.4, bevel: 0.8 });
    shapes.push({ t: 'poly', pts: [add(headC, [0.2, -2.2]), add(headC, [5.4, -1.6]), add(headC, [5.5, 1.6]), add(headC, [0.8, 2.2])], m: 'visor', z: 8, bevel: 1.4, tilt: [0.3, -0.2] });
    shapes.push({ t: 'cap', a: add(headC, [1.4, -1.4]), b: add(headC, [4.4, -1]), r1: 0.35, r2: 0.25, m: 'shine', z: 8.2, noSep: true });
    shapes.push({ t: 'poly', pts: [add(headC, [1, 2.4]), add(headC, [4.6, 1.9]), add(headC, [3.6, 4.4]), add(headC, [1, 4.6])], m: hel, z: 7.6, bevel: 1 });
  } else if (st === 'soldier' && def.faction === 'unsc') {
    // A Marine's helmet brim.
    shapes.push({ t: 'cap', a: add(headC, [-4, -1.6]), b: add(headC, [4.6, -1.8]), r1: 0.9, r2: 0.8, m: hel, z: 7.3 });
  }
  if (st !== 'spartan') {
    // Ancient human helm: cheek guard and a glowing eye slit.
    shapes.push({ t: 'poly', pts: [add(headC, [0, 0.5]), add(headC, [4.6, 0.6]), add(headC, [3.6, 4.6]), add(headC, [0.2, 4.4])], m: 'trim', z: 7.5, bevel: 1.2 });
    shapes.push({ t: 'cap', a: add(headC, [1.2, -1]), b: add(headC, [4.8, -0.9]), r1: 0.9, r2: 0.8, m: 'visor', z: 8 });
  }
  if (st === 'ancient-lord') {
    shapes.push({ t: 'poly', pts: [add(headC, [-5, -2]), add(headC, [-2, -7.5]), add(headC, [3, -7]), add(headC, [-1, -4.5])], m: 'trim', z: 7.8, bevel: 1.3 });
    shapes.push({ t: 'cap', a: add(headC, [-2, -7]), b: add(headC, [-8, -3]), r1: 1.6, r2: 0.8, m: 'cape', z: 6.5 });
  }
  if (def.infected) {
    // A Flood combat form: lumpy growths and a drooping tendril (goofy, not scary).
    shapes.push({ t: 'ell', c: add(chestC, [-3, -4]), rx: 4.4, ry: 3.6, m: 'cape', z: 8 });
    shapes.push({ t: 'ell', c: add(headC, [-3, -1]), rx: 3.2, ry: 2.6, m: 'cape', z: 8 });
    shapes.push({ t: 'cap', a: add(chestC, [3, 4]), b: add(chestC, [6, 12 + (f % 4)]), r1: 1.4, r2: 0.5, m: 'cape', z: 8 });
  }
  const shoulder = add(neck, [1.5, 3.2]);
  return { shapes, shoulder, w: W, h: H };
}

// Forerunner warrior-servants: tall, slender, angular plates, glowing seams.
function forerunner(f, def) {
  const L = { thigh: 12.5, shin: 13.5, thighR: 3.5, shinR: 3.1, foot: 4, glow: true };
  const p = pose(f);
  const W = 44, H = 62;
  const ground = H - 1;
  const hip = [19, hipFor(p, L, ground) + (p.air ? -1 : 0)];
  const lean = p.lean * 0.8;
  const up = (len) => [Math.sin(lean) * len, -Math.cos(lean) * len];
  const chestC = add(hip, up(11 - p.breathe * 0.4));
  const neck = add(hip, up(17.5 - p.breathe * 0.5));
  const headC = add(neck, [1.5, -4]);
  const shapes = [];
  shapes.push(...legShapes([hip[0] - 1, hip[1]], p.back, L, false, 'armor').shapes);
  shapes.push({ t: 'cap', a: hip, b: chestC, r1: 4.2, r2: 4.8, m: 'dark', z: 2 });
  shapes.push({ t: 'poly', pts: [add(chestC, [-7, -7.5]), add(chestC, [8, -6.5]), add(chestC, [6.5, 4]), add(chestC, [0, 8]), add(chestC, [-7, 4])], m: 'armor', z: 3, bevel: 2.2, tilt: [0.1, -0.15] });
  shapes.push({ t: 'poly', pts: [add(chestC, [-4, 6]), add(chestC, [4, 6]), add(chestC, [3, 11]), add(chestC, [-3, 11])], m: 'trim', z: 3.1, bevel: 1.2 });
  shapes.push({ t: 'cap', a: add(chestC, [0.5, 6]), b: add(chestC, [1.5, -5]), r1: 0.6, r2: 0.6, m: 'glow', z: 3.5, noSep: true });
  shapes.push({ t: 'poly', pts: [add(chestC, [-6, -7]), add(chestC, [-9.5, -8]), add(chestC, [-9, -3]), add(chestC, [-6, -2])], m: 'trim', z: 2.8, bevel: 1.2 });
  shapes.push({ t: 'poly', pts: [[hip[0] - 4, hip[1] - 2.5], [hip[0] + 4.5, hip[1] - 2.5], [hip[0] + 3.5, hip[1] + 3], [hip[0] - 3.5, hip[1] + 3]], m: 'trim', z: 3.6, bevel: 1.2 });
  shapes.push(...legShapes(hip, p.front, L, true, 'armor').shapes);
  shapes.push({ t: 'cap', a: add(neck, [0, 2]), b: neck, r1: 2.6, r2: 2.4, m: 'dark', z: 4 });
  // Swept-back crested helm with an eye slit.
  shapes.push({ t: 'poly', pts: [add(headC, [4.5, -1]), add(headC, [3.5, -4]), add(headC, [-3, -5]), add(headC, [-11, -7.5]), add(headC, [-5, -1.5]), add(headC, [-3, 3.5]), add(headC, [3.5, 3.2])], m: 'armor', z: 7, bevel: 1.8, tilt: [0.1, -0.2] });
  shapes.push({ t: 'cap', a: add(headC, [-1, -4.6]), b: add(headC, [-10, -7]), r1: 0.7, r2: 0.4, m: 'glow', z: 7.5, noSep: true });
  shapes.push({ t: 'cap', a: add(headC, [0.5, 0]), b: add(headC, [4.3, 0.2]), r1: 0.8, r2: 0.7, m: 'glow', z: 8, hot: true, noSep: true });
  if (def.style === 'knight') {
    // Promethean Knight: heavy shoulder plates and glowing spines on the back.
    shapes.push({ t: 'ell', c: add(chestC, [-1, -6]), rx: 7, ry: 4.4, rot: -0.2, m: 'trim', z: 8.2 });
    for (let k = 0; k < 3; k++) shapes.push({ t: 'cap', a: add(chestC, [-5 + k, -6 - k]), b: add(chestC, [-12 + k * 2, -15 - k * 2]), r1: 1.2, r2: 0.4, m: 'glow', z: 2.5, hot: k === 1 });
  }
  if (def.style === 'infected') {
    // A Flood-taken warrior-servant: lumpy growths and a drooping tendril.
    shapes.push({ t: 'ell', c: add(chestC, [-4, -5]), rx: 5, ry: 4.2, m: 'cape', z: 8 });
    shapes.push({ t: 'ell', c: add(chestC, [2, 3]), rx: 3.4, ry: 3, m: 'cape', z: 8 });
    shapes.push({ t: 'ell', c: add(headC, [-4, -2]), rx: 3.6, ry: 3, m: 'cape', z: 8 });
    shapes.push({ t: 'cap', a: add(chestC, [3, 5]), b: add(chestC, [7, 13 + (f % 4)]), r1: 1.5, r2: 0.6, m: 'cape', z: 8 });
  }
  const shoulder = add(neck, [1.5, 3.5]);
  return { shapes, shoulder, w: W, h: H };
}

// Sentinels: floating Forerunner drones with flexing arms and a single eye.
function sentinel(f) {
  const W = 36, H = 28;
  const c = [17, 13 + [0, -0.6, -1, -0.6][f]];
  const flex = [0, 0.15, 0.3, 0.15][f];
  const shapes = [
    { t: 'ell', c: add(c, [0, 2.5]), rx: 9.5, ry: 4.2, m: 'dark', z: 1 },
    { t: 'ell', c, rx: 11, ry: 6.4, m: 'armor', z: 2 },
    { t: 'poly', pts: [add(c, [-7, -5]), add(c, [2, -9]), add(c, [6, -5])], m: 'trim', z: 1.5, bevel: 1.2 },
    { t: 'ell', c: add(c, [8, 0.5]), rx: 3.4, ry: 3, m: 'dark', z: 3 },
    { t: 'ell', c: add(c, [9, 0.5]), rx: 2.3, ry: 2.1, m: 'glow', z: 4, hot: true },
  ];
  for (const [sx, sy, dir] of [[-6, 3, -1], [3, 3, 1]]) {
    const base = add(c, [sx, sy]);
    const tip = add(base, [dir * (5 + flex * 4), 6 - flex * 6]);
    shapes.push({ t: 'cap', a: base, b: tip, r1: 1.6, r2: 1, m: 'trim', z: 0.5 });
  }
  return { shapes, shoulder: add(c, [11, 0.5]), w: W, h: H };
}

// Monitors (e.g. 343 Guilty Spark): a floating metal sphere with a glowing eye.
function monitor(f) {
  const W = 26, H = 26;
  const c = [13, 13 + [0, -0.6, -1, -0.6][f]];
  const shapes = [
    { t: 'ell', c, rx: 9, ry: 9, m: 'armor', z: 1 },
    { t: 'cap', a: add(c, [-9, 0]), b: add(c, [9, 0]), r1: 1.6, r2: 1.6, m: 'trim', z: 2 },
    { t: 'ell', c: add(c, [4.5, 0]), rx: 4.4, ry: 4.4, m: 'dark', z: 3 },
    { t: 'ell', c: add(c, [5.5, 0]), rx: 3, ry: 3, m: 'glow', z: 4, hot: true },
  ];
  return { shapes, shoulder: add(c, [9, 0]), w: W, h: H };
}

// Flood infection form: a bouncing sac on wriggling tendrils (goofy, not scary).
function infection(f) {
  const W = 22, H = 18;
  const squash = [0, 0.6, 1, 0.6][f];
  const c = [11, 9 + squash];
  const shapes = [
    { t: 'ell', c, rx: 6.2 + squash * 0.6, ry: 5.2 - squash * 0.6, m: 'armor', z: 2 },
    { t: 'ell', c: add(c, [-1.6, -1.8]), rx: 2.2, ry: 1.6, m: 'trim', z: 3, noSep: true },
  ];
  for (let i = 0; i < 4; i++) {
    const bx = c[0] - 4 + i * 2.6;
    const wig = Math.sin((f + i) * 1.6) * 1.8;
    shapes.push({ t: 'cap', a: [bx, c[1] + 3], b: [bx + wig, H - 2], r1: 1.1, r2: 0.5, m: 'dark', z: 1 });
  }
  return { shapes, shoulder: c, w: W, h: H };
}

export const BODIES = {
  humanoid: { w: 40, h: 52, frames: 15, anims: FRAMES, hit: [13, 40], build: humanoid, reach: 8.5, arm: [2.9, 2.5] },
  forerunner: { w: 44, h: 62, frames: 15, anims: FRAMES, hit: [14, 48], build: forerunner, reach: 10.5, arm: [3, 2.7] },
  sentinel: { w: 36, h: 28, frames: 4, anims: HOVER, hit: [22, 14], build: sentinel, flying: true },
  infection: { w: 22, h: 18, frames: 4, anims: HOVER, hit: [12, 12], build: infection },
  monitor: { w: 26, h: 26, frames: 4, anims: HOVER, hit: [16, 16], build: monitor, flying: true },
  ...COVENANT_BODIES,
  ...VEHICLE_BODIES,
};

// The front arm, support hand and weapon at aim angle `a` (radians, -π/2 up … π/2 down),
// around a pivot at the frame center. gun: { shapes, grip, muzzle } from src/content/guns.js.
export function armShapes(body, def, a, gun, S) {
  const C = [S / 2, S / 2];
  const d = [Math.cos(a), Math.sin(a)];
  const perp = [-d[1], d[0]];
  const H = add(add(C, [d[0] * body.reach, d[1] * body.reach]), [0, 2]);
  const E = add([(C[0] + H[0]) / 2, (C[1] + H[1]) / 2], [perp[0] * 2.4, perp[1] * 2.4 + 1]);
  const rot = ([x, y]) => [H[0] + x * d[0] - y * d[1], H[1] + x * d[1] + y * d[0]];
  const shapes = [];
  if (gun) {
    for (const s of gun.shapes) {
      if (s.t === 'cap') shapes.push({ ...s, a: rot(s.a), b: rot(s.b), z: 7 + (s.z ?? 0) });
      else if (s.t === 'ell') shapes.push({ ...s, c: rot(s.c), rot: (s.rot ?? 0) + a, z: 7 + (s.z ?? 0) });
      else shapes.push({ ...s, pts: s.pts.map(rot), z: 7 + (s.z ?? 0) });
    }
    const F = rot([gun.grip, 1]);
    shapes.push({ t: 'cap', a: add(C, [-1.5, 5.5]), b: F, r1: body.arm[1], r2: body.arm[1] * 0.9, m: 'armorFar', z: 3 });
    shapes.push({ t: 'ell', c: F, rx: 1.9, ry: 1.9, m: 'darkFar', z: 8.5 });
  }
  const [r1, r2] = body.arm;
  shapes.push({ t: 'cap', a: C, b: E, r1, r2, m: 'armor', z: 5 });
  shapes.push({ t: 'cap', a: E, b: H, r1: r2, r2: r2 * 0.9, m: 'armor', z: 6 });
  shapes.push({ t: 'ell', c: H, rx: 2.1, ry: 2.1, m: 'dark', z: 8 });
  if (def.body === 'forerunner') {
    shapes.push({ t: 'cap', a: add(E, [d[0], d[1]]), b: add(H, [-d[0] * 2, -d[1] * 2]), r1: 0.5, r2: 0.5, m: 'glow', z: 6.5, noSep: true });
    shapes.push({ t: 'poly', pts: [add(C, [-5.5, -2.5]), add(C, [4, -5]), add(C, [5.5, 1.5]), add(C, [-4, 4])], m: 'trim', z: 9, bevel: 1.6 });
  } else {
    const r = def.style === 'spartan' ? 4.4 : 3.7;
    shapes.push({ t: 'ell', c: add(C, [0.2, -0.6]), rx: r, ry: r * 0.85, m: def.style === 'ancient-lord' ? 'trim' : 'armor', z: 9 });
  }
  const muzzle = gun ? rot(gun.muzzle) : H;
  return { shapes, muzzle: [muzzle[0] - C[0], muzzle[1] - C[1]] };
}
