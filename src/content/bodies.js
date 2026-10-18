// Pixel-art body painters. Each body draws its animation frames from a palette, so one
// body serves many characters. Pure code against a tiny painter API:
//   p.r(x, y, w, h, color)   filled rectangle
// Frames for walking bodies: 0-1 idle, 2-5 run, 6 jump, 7 crouch.
// Sprites face right; the engine flips them for left.

export const FRAMES = { idle: [0, 1], run: [2, 3, 4, 5], jump: [6], crouch: [7] };

// Foot positions [backX, frontX, backLift, frontLift] per frame.
const STRIDE = [
  [5, 9, 0, 0], [5, 9, 0, 0],
  [3, 11, 0, 1], [5, 9, 1, 0], [7, 7, 0, 0], [10, 4, 1, 0],
  [4, 10, 2, 3], [4, 10, 0, 0],
];

function legs(p, f, hip, foot, w, c, dark) {
  const [bx, fx, bl, fl] = STRIDE[f];
  p.r(bx, hip, w, foot - hip - bl, dark);
  p.r(bx, foot - bl - 1, w + 1, 1, dark);
  p.r(fx, hip, w, foot - hip - fl, c);
  p.r(fx, foot - fl - 1, w + 2, 1, c);
}

// Humans, Spartans, Marines, ancient humans: 16x24.
function humanoid(p, f, d) {
  const c = d.pal;
  const bob = f === 1 || f === 3 || f === 5 ? 1 : 0;
  const crouch = f === 7 ? 4 : 0;
  const t = 1 + bob + crouch;
  legs(p, f, 15 + crouch, 24, 3, c.armor, c.dark);
  if (c.cape) p.r(3, t + 7, 3, 9, c.cape);
  p.r(4, t + 7, 9, 8, c.armor); // torso
  p.r(5, t + 9, 7, 2, c.trim); // chest band
  p.r(3, t + 6, 11, 2, c.trim); // shoulders
  p.r(5, t + 15 - 1, 7, 1, c.dark); // belt
  // head / helmet
  p.r(5, t, 7, 6, c.helmet ?? c.armor);
  if (d.style === 'ancient-lord') {
    p.r(4, t - 1, 3, 2, c.trim);
    p.r(6, t - 2, 4, 1, c.trim); // crest
  }
  if (d.style === 'spartan') p.r(4, t + 1, 1, 4, c.dark);
  p.r(8, t + 2, 4, 2, c.visor); // visor
  p.r(11, t + 2, 1, 1, '#ffffff');
}

// Forerunner warrior-servants and Prometheans: tall and slender, glowing seams. 18x28.
function forerunner(p, f, d) {
  const c = d.pal;
  const bob = f === 1 || f === 3 || f === 5 ? 1 : 0;
  const crouch = f === 7 ? 5 : 0;
  const t = 1 + bob + crouch;
  legs(p, f + 0, 17 + crouch, 28, 3, c.armor, c.dark);
  p.r(5, t + 7, 9, 10, c.armor);
  p.r(9, t + 8, 1, 8, c.glow); // spine light
  p.r(3, t + 6, 13, 2, c.trim);
  p.r(2, t + 6, 2, 1, c.glow);
  p.r(15, t + 6, 2, 1, c.glow);
  p.r(6, t + 1, 6, 6, c.armor); // helm
  p.r(3, t - 1, 5, 2, c.trim); // swept crest
  p.r(2, t - 2, 3, 1, c.glow);
  p.r(9, t + 3, 4, 1, c.glow); // eye slit
}

// Sentinels: floating drones. 16x12, frames 0-1 hover.
function sentinel(p, f, d) {
  const c = d.pal;
  const w = f % 2 ? 1 : 0;
  p.r(3, 3, 10, 6, c.armor);
  p.r(1, 2 - w, 3, 2, c.trim);
  p.r(12, 2 - w, 3, 2, c.trim);
  p.r(1, 8 + w, 3, 2, c.trim);
  p.r(12, 8 + w, 3, 2, c.trim);
  p.r(5, 4, 6, 4, c.dark);
  p.r(7, 5, 3, 2, c.glow); // eye
}

export const BODIES = {
  humanoid: { w: 16, h: 24, frames: 8, draw: humanoid, muzzle: { x: 4, y: -2 } },
  forerunner: { w: 18, h: 28, frames: 8, draw: forerunner, muzzle: { x: 5, y: -4 } },
  sentinel: { w: 16, h: 12, frames: 2, draw: sentinel, muzzle: { x: 6, y: 0 }, flying: true },
};
