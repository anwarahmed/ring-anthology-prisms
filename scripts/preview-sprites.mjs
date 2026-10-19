// Renders every character and unit (all frames, plus arm overlays composited at three
// aim angles) into test-results/sprites.png, for reviewing art. --idle shows only the
// standing frame and the three aim composites (a compact gallery of many units).
//   node scripts/preview-sprites.mjs [--idle] [id ...]

import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { CHARACTERS } from '../src/content/characters.js';
import { UNITS } from '../src/content/units.js';
import { WEAPONS } from '../src/content/weapons.js';
import { bodyFrames, armFrames } from '../src/engine/sprites.js';
import { BODIES } from '../src/content/bodies.js';

const SCALE = 2;
const args = process.argv.slice(2);
const idleOnly = args.includes('--idle');
const only = args.filter((a) => a !== '--idle');
const defs = [...Object.entries(CHARACTERS), ...Object.entries(UNITS)].filter(([id]) => !only.length || only.includes(id));

const rows = defs.map(([id, def]) => {
  const frames = bodyFrames(def);
  const weapon = WEAPONS[def.weapon ?? def.weapons?.[0]];
  const arms = BODIES[def.body].reach ? armFrames(def, weapon) : null;
  return { id, frames, arms };
});

// Cells fit the largest frame (art is drawn at ART density, config.js).
const cellW = Math.max(...rows.flatMap((r) => r.frames.map((f) => f.w))) + 12;
const cellH = Math.max(...rows.flatMap((r) => r.frames.map((f) => f.h))) + 12;
const nFrames = idleOnly ? 1 : 15;
const cols = nFrames + 3;
const W = cols * cellW, H = rows.length * cellH;
const img = new Uint8ClampedArray(W * H * 4);
for (let i = 0; i < W * H; i++) img.set([22, 26, 38, 255], i * 4);

function blit(src, sw, sh, dx, dy, flip = false) {
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const s = (y * sw + (flip ? sw - 1 - x : x)) * 4;
      if (src[s + 3] === 0) continue;
      const X = dx + x, Y = dy + y;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      img.set(src.subarray(s, s + 4), (Y * W + X) * 4);
    }
  }
}

rows.forEach((r, ri) => {
  r.frames.slice(0, nFrames).forEach((f, fi) => blit(f.rgba, f.w, f.h, fi * cellW + (cellW - f.w) / 2 | 0, ri * cellH + cellH - f.h - 4));
  // Composite: idle frame with the arm at up / level / down.
  if (r.arms) {
    [2, 4, 6].forEach((ai, k) => {
      const f = r.frames[0];
      const ox = (nFrames + k) * cellW + ((cellW - f.w) / 2 | 0), oy = ri * cellH + cellH - f.h - 4;
      blit(f.rgba, f.w, f.h, ox, oy);
      const a = r.arms[ai];
      blit(a.rgba, a.w, a.h, Math.round(ox + f.shoulder[0] - a.w / 2), Math.round(oy + f.shoulder[1] - a.h / 2));
    });
  }
});

// Scale up and encode PNG.
const SW = W * SCALE, SH = H * SCALE;
const raw = Buffer.alloc((SW * 4 + 1) * SH);
for (let y = 0; y < SH; y++) {
  raw[y * (SW * 4 + 1)] = 0;
  for (let x = 0; x < SW; x++) {
    const s = (((y / SCALE) | 0) * W + ((x / SCALE) | 0)) * 4;
    raw.set(img.subarray(s, s + 4), y * (SW * 4 + 1) + 1 + x * 4);
  }
}
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SW, 0); ihdr.writeUInt32BE(SH, 4); ihdr[8] = 8; ihdr[9] = 6;
mkdirSync('test-results', { recursive: true });
writeFileSync('test-results/sprites.png', Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
]));
console.log(`test-results/sprites.png: ${rows.map((r) => r.id).join(', ')}`);
