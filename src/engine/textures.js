// Builds textures at runtime from code: body sprite sheets, held guns, tiles, and the
// shared white textures that projectiles and particles tint.

import { BODIES, FRAMES } from '../content/bodies.js';
import { TILE } from './config.js';

function painter(ctx, ox, oy) {
  return {
    r(x, y, w, h, c) {
      if (w <= 0 || h <= 0) return;
      ctx.fillStyle = c;
      ctx.fillRect(ox + x, oy + y, w, h);
    },
  };
}

export function sheet(scene, key, fw, fh, frames, draw) {
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, fw * frames, fh);
  const ctx = tex.getContext();
  for (let f = 0; f < frames; f++) draw(painter(ctx, f * fw, 0), f);
  for (let f = 0; f < frames; f++) tex.add(f, 0, f * fw, 0, fw, fh);
  tex.refresh();
  return key;
}

// Sprite sheet + animations for a character or unit definition. Returns the texture key.
export function bodyTexture(scene, id, def) {
  const body = BODIES[def.body];
  const key = `body-${id}`;
  if (scene.textures.exists(key)) return key;
  sheet(scene, key, body.w, body.h, body.frames, (p, f) => body.draw(p, f, def));
  if (body.frames >= 8) {
    for (const [name, frames] of Object.entries(FRAMES)) {
      scene.anims.create({
        key: `${key}-${name}`,
        frames: frames.map((frame) => ({ key, frame })),
        frameRate: name === 'run' ? 11 : 3,
        repeat: -1,
      });
    }
  } else {
    scene.anims.create({ key: `${key}-idle`, frames: [{ key, frame: 0 }, { key, frame: 1 }], frameRate: 8, repeat: -1 });
  }
  return key;
}

export function gunTexture(scene, id, gun) {
  const key = `gun-${id}`;
  if (!gun || scene.textures.exists(key)) return key;
  sheet(scene, key, gun.len + 2, 5, 1, (p) => {
    p.r(0, 1, gun.len, 3, gun.body);
    p.r(2, 0, gun.len - 5, 1, gun.body);
    p.r(gun.len - 3, 1, 3, 1, gun.accent);
    p.r(3, 3, 2, 2, gun.body);
    p.r(4, 2, gun.len - 7, 1, gun.accent);
  });
  return key;
}

// One tileset per theme: 0 solid, 1 solid with exposed top, 2 platform, 3 hazard, 4 back wall.
export function tilesTexture(scene, themeId, t) {
  const key = `tiles-${themeId}`;
  if (scene.textures.exists(key)) return key;
  const S = TILE;
  sheet(scene, key, S, S, 5, (p, f) => {
    if (f === 0 || f === 1) {
      p.r(0, 0, S, S, t.solid);
      p.r(1, 1, 6, 6, shade(t.solid, 0.08));
      p.r(9, 8, 6, 6, shade(t.solid, -0.08));
      p.r(0, 15, S, 1, shade(t.solid, -0.2));
      if (f === 1) {
        p.r(0, 0, S, 4, t.top);
        p.r(0, 0, S, 1, t.edge);
        p.r(0, 4, S, 1, shade(t.top, -0.3));
      }
    } else if (f === 2) {
      p.r(0, 0, S, 4, t.platform);
      p.r(0, 0, S, 1, t.edge);
      p.r(2, 4, 2, 3, shade(t.platform, -0.2));
      p.r(12, 4, 2, 3, shade(t.platform, -0.2));
    } else if (f === 3) {
      p.r(0, 6, S, 10, shade(t.hazard, -0.3));
      for (let x = 0; x < S; x += 4) p.r(x + 1, 2 + (x % 8 ? 1 : 0), 2, 6, t.hazard);
      p.r(0, 6, S, 1, '#ffffff');
    } else {
      p.r(0, 0, S, S, t.back);
      p.r(0, 0, S, 1, shade(t.back, 0.1));
      p.r(7, 2, 2, 12, shade(t.back, 0.06));
    }
  });
  return key;
}

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + (amt > 0 ? (255 - v) * amt : v * amt))));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function hexNum(hex) {
  return parseInt(hex.slice(1), 16);
}

// Shared white textures, tinted at use.
export function baseTextures(scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const mk = (key, w, h, fn) => {
    if (scene.textures.exists(key)) return;
    g.clear();
    fn(g);
    g.generateTexture(key, w, h);
  };
  mk('px', 2, 2, (g) => g.fillStyle(0xffffff).fillRect(0, 0, 2, 2));
  mk('spark', 4, 1, (g) => g.fillStyle(0xffffff).fillRect(0, 0, 4, 1));
  mk('pj-bullet', 5, 1, (g) => g.fillStyle(0xffffff).fillRect(0, 0, 5, 1));
  mk('pj-bolt', 6, 3, (g) => g.fillStyle(0xffffff).fillRoundedRect(0, 0, 6, 3, 1));
  mk('pj-beam', 10, 2, (g) => g.fillStyle(0xffffff).fillRect(0, 0, 10, 2));
  mk('pj-orb', 6, 6, (g) => g.fillStyle(0xffffff).fillCircle(3, 3, 3));
  mk('grenade', 4, 4, (g) => g.fillStyle(0xffffff).fillCircle(2, 2, 2));
  mk('glow', 32, 32, (g) => {
    for (let r = 16; r > 0; r--) g.fillStyle(0xffffff, 0.06).fillCircle(16, 16, r);
  });
  mk('ring', 64, 64, (g) => g.lineStyle(3, 0xffffff).strokeCircle(32, 32, 30));
  mk('hook', 4, 4, (g) => g.fillStyle(0xffffff).fillRect(0, 0, 4, 4));
  g.destroy();
}
