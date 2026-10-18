// Parallax backdrops built from a theme's layer list (src/content/themes.js), painted
// pixel by pixel in a 16-bit style: dithered skies, lit planets, detailed ships, city
// silhouettes with rim light and lit windows, drifting smoke.

import Phaser from 'phaser';
import { VIEW } from './config.js';
import { audio } from './audio.js';
import { hexNum } from './textures.js';
import { render, material, hexRgb } from './raster.js';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16);
let uid = 0;

function canvasTex(scene, w, h, paint) {
  const key = `bd-${uid++}`;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  const img = ctx.createImageData(w, h);
  paint(img.data, w, h);
  ctx.putImageData(img, 0, 0);
  tex.refresh();
  return key;
}

function rgbaTex(scene, rgba, w, h) {
  return canvasTex(scene, w, h, (d) => d.set(rgba));
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

export function buildBackdrop(scene, theme, worldW) {
  const rnd = new Phaser.Math.RandomDataGenerator([theme.seed ?? 'prisms']);
  let depth = -100;
  for (const L of theme.backdrop) {
    depth += 1;
    const sf = L.scroll ?? 0;
    const width = Math.min(4096, VIEW.w + Math.ceil(sf * Math.max(0, worldW - VIEW.w)) + 40);
    switch (L.type) {
      case 'gradient': {
        // Banded sky with ordered dithering between bands.
        const top = hexRgb(L.top), bot = hexRgb(L.bottom), bands = 12;
        const key = canvasTex(scene, VIEW.w, VIEW.h, (d, w, h) => {
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const t = (y / h) * bands;
              const b = Math.floor(t + BAYER[(y & 3) * 4 + (x & 3)] - 0.5 + 0.5);
              const c = mix(top, bot, Math.min(bands, Math.max(0, b)) / bands);
              d.set([...c, 255], (y * w + x) * 4);
            }
          }
        });
        scene.add.image(0, 0, key).setOrigin(0).setScrollFactor(0).setDepth(depth);
        break;
      }
      case 'stars': {
        const g = scene.add.graphics().setScrollFactor(0.01).setDepth(depth);
        for (let i = 0; i < L.count; i++) {
          const x = rnd.between(0, VIEW.w + 20), y = rnd.between(0, VIEW.h * 0.7);
          const big = rnd.frac() < 0.08;
          g.fillStyle(0xffffff, rnd.realInRange(0.35, 1)).fillRect(x, y, 1, 1);
          if (big) {
            g.fillStyle(0xbfd8ff, 0.5).fillRect(x - 1, y, 3, 1).fillRect(x, y - 1, 1, 3);
          }
        }
        break;
      }
      case 'planet': {
        const r = L.r, S = r * 2 + 8;
        const c = S / 2;
        const shapes = [{ t: 'ell', c: [c, c], rx: r, ry: r, m: 'body', z: 0 }];
        for (let i = 0; i < 14; i++) {
          const a = rnd.realInRange(0, Math.PI * 2), d = rnd.realInRange(0, r * 0.8), cr = rnd.realInRange(1.2, r * 0.09);
          shapes.push({ t: 'ell', c: [c + Math.cos(a) * d, c + Math.sin(a) * d], rx: cr, ry: cr * 0.8, m: 'crater', z: 1, noSep: true });
        }
        const rgba = render(shapes, S, S, { body: material(L.color, { contrast: 1.2 }), crater: material(L.shade, { contrast: 1.1 }) }, { outline: false, light: [-0.75, -0.35, 0.56] });
        // Night side: darken pixels facing away from the light.
        for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
          const p = (y * S + x) * 4;
          if (!rgba[p + 3]) continue;
          const nx = (x - c) / r, ny = (y - c) / r;
          const lightAmt = -nx * 0.8 - ny * 0.35 + 0.2;
          if (lightAmt < -0.15 + BAYER[(y & 3) * 4 + (x & 3)] * 0.25) { rgba[p] *= 0.35; rgba[p + 1] *= 0.3; rgba[p + 2] *= 0.45; }
        }
        const key = rgbaTex(scene, rgba, S, S);
        const x = L.x * VIEW.w, y = L.y * VIEW.h;
        scene.add.image(x, y, 'glow').setTint(hexNum(L.color)).setAlpha(0.35).setScale((r * 2.6) / 32).setScrollFactor(0.02).setDepth(depth).setBlendMode('ADD');
        scene.add.image(x, y, key).setScrollFactor(0.02).setDepth(depth);
        break;
      }
      case 'halo': {
        const c = scene.add.container(L.x * VIEW.w, L.y * VIEW.h).setScrollFactor(0.02).setDepth(depth);
        const g = scene.add.graphics();
        g.lineStyle(10, hexNum(L.color), 0.15).strokeEllipse(0, 0, L.rx * 2 + 6, L.ry * 2 + 6);
        g.lineStyle(5, hexNum(L.color), 0.9).strokeEllipse(0, 0, L.rx * 2, L.ry * 2);
        g.lineStyle(1, 0xffffff, 0.6).strokeEllipse(0, 0, L.rx * 2 - 3, L.ry * 2 - 3);
        c.add(g);
        c.rotation = L.tilt ?? 0;
        break;
      }
      case 'ships': {
        const mats = { hull: material(L.color, { spec: true, contrast: 1.3 }), dark: material(L.color, { contrast: 0.6 }), light: material(L.beams, { emissive: true }) };
        for (let i = 0; i < L.count; i++) {
          const len = rnd.between(60, 130), h = Math.round(len * 0.22);
          const S = [len + 8, h + 10];
          const shapes = [
            { t: 'poly', pts: [[2, h * 0.55], [len * 0.25, 2], [len * 0.9, h * 0.25], [len + 4, h * 0.5], [len * 0.85, h * 0.85], [len * 0.2, h + 4]], m: 'hull', bevel: 3, tilt: [0, -0.2] },
            { t: 'poly', pts: [[len * 0.35, h * 0.3], [len * 0.7, h * 0.15], [len * 0.75, h * 0.45], [len * 0.4, h * 0.55]], m: 'dark', z: 1, bevel: 1.5 },
            { t: 'cap', a: [len * 0.3, h * 0.62], b: [len * 0.82, h * 0.6], r1: 0.7, r2: 0.7, m: 'light', z: 2, noSep: true },
            { t: 'ell', c: [5, h * 0.55], rx: 2, ry: h * 0.25, m: 'light', z: 2, hot: true },
          ];
          const key = rgbaTex(scene, render(shapes, S[0], S[1], mats), S[0], S[1]);
          const x = rnd.between(0, width), y = rnd.between(12, VIEW.h * 0.32);
          const ship = scene.add.image(x, y, key).setScrollFactor(L.scroll).setDepth(depth).setFlipX(true);
          scene.tweens.add({ targets: ship, x: x - rnd.between(30, 80), duration: rnd.between(40000, 70000), yoyo: true, repeat: -1 });
          if (L.beams) {
            scene.time.addEvent({
              delay: rnd.between(4000, 9000), loop: true,
              callback: () => {
                const bx = ship.x + rnd.between(-len / 4, len / 4);
                const beam = scene.add.rectangle(bx, ship.y + h / 2, 3, VIEW.h, hexNum(L.beams), 0.95)
                  .setOrigin(0.5, 0).setScrollFactor(L.scroll).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
                const core = scene.add.rectangle(bx, ship.y + h / 2, 1, VIEW.h, 0xffffff, 1)
                  .setOrigin(0.5, 0).setScrollFactor(L.scroll).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
                scene.tweens.add({ targets: [beam, core], alpha: 0, scaleX: 5, duration: 500, onComplete: () => { beam.destroy(); core.destroy(); } });
                audio.noise({ dur: 0.8, vol: 0.05, freq: 300, type: 'lowpass', at: 0.3 });
              },
            });
          }
        }
        break;
      }
      case 'spires': {
        // City silhouettes: tiered towers, rim light from the left, lit windows.
        const H = VIEW.h;
        const base = hexRgb(L.color), glow = hexRgb(L.glow);
        const rim = mix(base, glow, 0.35), shadow = mix(base, [0, 0, 0], 0.35);
        const key = canvasTex(scene, width, H, (d, w) => {
          const put = (x, y, c, a = 255) => { if (x >= 0 && x < w && y >= 0 && y < H) d.set([...c, a], (y * w + x) * 4); };
          let x = -10;
          while (x < w) {
            const tw = rnd.between(12, 36);
            let top = Math.round(H - H * L.height * rnd.realInRange(0.35, 1));
            let left = x, right = x + tw;
            // Tiers narrowing toward the top.
            const tiers = rnd.between(1, 3);
            for (let t = 0; t < tiers; t++) {
              const tierTop = t === tiers - 1 ? top : Math.round(H - (H - top) * ((t + 1) / tiers));
              const tierBottom = t === 0 ? H : Math.round(H - (H - top) * (t / tiers));
              for (let y = tierTop; y < tierBottom; y++) {
                for (let px = left; px < right; px++) put(px, y, px === left ? rim : px >= right - 2 ? shadow : base);
              }
              for (let px = left - 1; px <= right; px++) put(px, tierTop, rim);
              for (let y = tierTop + 4; y < tierBottom - 3; y += 5) {
                for (let px = left + 2; px < right - 3; px += 4) {
                  if (rnd.frac() < 0.3) { put(px, y, glow); put(px + 1, y, glow); put(px, y + 1, mix(glow, base, 0.5)); }
                }
              }
              const inset = Math.max(2, Math.round((right - left) * 0.18));
              left += inset;
              right -= inset;
            }
            // Spire tip and antenna.
            const mid = Math.round((left + right) / 2);
            for (let y = 0; y < (right - left) * 1.2; y++) {
              const half = Math.round(((right - left) / 2) * (1 - y / ((right - left) * 1.2)));
              for (let px = mid - half; px <= mid + half; px++) put(px, top - y, px === mid - half ? rim : base);
            }
            if (rnd.frac() < 0.5) {
              const tip = top - Math.round((right - left) * 1.2);
              for (let y = 0; y < 8; y++) put(mid, tip - y, base);
              put(mid, tip - 8, glow);
            }
            x += tw + rnd.between(0, Math.round(26 / L.density));
          }
        });
        scene.add.image(0, 0, key).setOrigin(0).setScrollFactor(L.scroll, 0).setDepth(depth);
        break;
      }
      case 'smoke': {
        // Soft drifting smoke banks, dithered at the edges.
        const W = 512, Hh = Math.round(VIEW.h * (L.height ?? 0.35));
        const c = hexRgb(L.color), hi = mix(c, [255, 255, 255], 0.12);
        const blobs = Array.from({ length: 40 }, () => ({ x: rnd.between(0, W), y: rnd.between(Hh * 0.35, Hh), r: rnd.between(18, 46) }));
        const key = canvasTex(scene, W, Hh, (d, w, h) => {
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            let v = 0;
            for (const b of blobs) for (const dx of [-W, 0, W]) {
              const q = 1 - Math.hypot((x - b.x - dx) / 2.4, (y - b.y) * 1.4) / b.r;
              if (q > 0) v = Math.min(1, v + q * 0.6);
            }
            const th = BAYER[(y & 3) * 4 + (x & 3)];
            if (v > 0.05 + th * 0.25) d.set([...(v > 0.55 ? hi : c), Math.round(255 * (L.alpha ?? 0.6))], (y * w + x) * 4);
          }
        });
        const ts = scene.add.tileSprite(0, VIEW.h * (L.y ?? 0.5), VIEW.w, Hh, key).setOrigin(0).setScrollFactor(0).setDepth(depth);
        ts.scrollRate = L.scroll ?? 0.3;
        const drift = (_t, dt) => {
          ts.tilePositionX = scene.cameras.main.scrollX * ts.scrollRate + (ts.drift = (ts.drift ?? 0) + dt * 0.006);
        };
        scene.events.on('update', drift);
        scene.events.once('shutdown', () => scene.events.off('update', drift));
        break;
      }
      case 'haze': {
        scene.add.rectangle(0, 0, VIEW.w, VIEW.h, hexNum(L.color), L.alpha)
          .setOrigin(0).setScrollFactor(0).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
        break;
      }
      case 'embers': {
        scene.add.particles(0, VIEW.h, 'px', {
          x: { min: 0, max: VIEW.w }, speedY: { min: -40, max: -12 }, speedX: { min: -8, max: 14 },
          lifespan: 5000, frequency: 120, scale: { min: 0.5, max: 1 }, alpha: { start: 0.9, end: 0 },
          tint: hexNum(L.color), blendMode: 'ADD',
        }).setScrollFactor(0).setDepth(50);
        break;
      }
      default:
        break;
    }
  }
}
