// Builds textures at runtime from code: shaded body sheets, arm/weapon overlays, tiles, and the
// shared white textures that projectiles and particles tint.

import { BODIES } from '../content/bodies.js';
import { bodyFrames, armFrames, gunFrame } from './sprites.js';
import { tilesetPixels } from './tileset.js';
import { tilesetPixelsHD } from './tiles3d.js';
import { STYLE, TILE, HD } from './config.js';

// Pixel size of one tile in the tileset texture (pre-rendered tiles are HD).
export const TILE_PX = STYLE === 'prerendered' ? TILE * HD : TILE;

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

// Frame metadata for bodies (shoulder points) and arms (muzzle offsets), by texture key.
export const META = new Map();

function rgbaSheet(scene, key, frames) {
  const { w, h } = frames[0];
  const tex = scene.textures.createCanvas(key, w * frames.length, h);
  const ctx = tex.getContext();
  frames.forEach((f, i) => {
    ctx.putImageData(new ImageData(f.rgba, w, h), i * w, 0);
    tex.add(i, 0, i * w, 0, w, h);
  });
  tex.refresh();
}

// Shaded sprite sheet + animations for a character or unit. Returns the texture key.
export function bodyTexture(scene, id, def) {
  const key = `body-${id}`;
  if (scene.textures.exists(key)) return key;
  const body = BODIES[def.body];
  const frames = bodyFrames(def);
  rgbaSheet(scene, key, frames);
  META.set(key, { shoulders: frames.map((f) => f.shoulder), w: frames[0].w, h: frames[0].h });
  const rates = { idle: 5, run: 14, jump: 1, fall: 1, crouch: 1 };
  for (const [name, list] of Object.entries(body.anims)) {
    scene.anims.create({ key: `${key}-${name}`, frames: list.map((frame) => ({ key, frame })), frameRate: body.flying ? 10 : rates[name], repeat: -1 });
  }
  return key;
}

// The arm-and-weapon overlay at every aim angle for one body + weapon pair.
export function gunTexture(scene, weaponId, weapon) {
  const key = `gun-${weaponId}`;
  if (!scene.textures.exists(key)) rgbaSheet(scene, key, [gunFrame(weapon)]);
  return key;
}

export function armTexture(scene, id, def, weaponId, weapon) {
  const key = `arm-${id}-${weaponId}`;
  if (scene.textures.exists(key)) return key;
  const frames = armFrames(def, weapon);
  rgbaSheet(scene, key, frames);
  META.set(key, { muzzles: frames.map((f) => f.muzzle) });
  return key;
}

// One tileset per theme (layout in src/engine/tileset.js).
export function tilesTexture(scene, themeId, theme) {
  const key = `tiles-${themeId}`;
  if (scene.textures.exists(key)) return key;
  const { rgba, w, h } = STYLE === 'prerendered' ? tilesetPixelsHD(theme) : tilesetPixels(theme);
  const tex = scene.textures.createCanvas(key, w, h);
  tex.getContext().putImageData(new ImageData(rgba, w, h), 0, 0);
  tex.refresh();
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
  mk('shadow', 32, 8, (g) => {
    for (let i = 0; i < 4; i++) g.fillStyle(0x000000, 0.25).fillEllipse(16, 4, 32 - i * 7, 8 - i * 1.6);
  });
  g.destroy();
}
