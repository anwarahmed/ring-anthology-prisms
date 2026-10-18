// Parallax backdrops built from a theme's layer list (src/content/themes.js), painted
// pixel by pixel in a 16-bit style: dithered skies, lit planets, detailed ships, city
// silhouettes with rim light and lit windows, drifting smoke.

import Phaser from 'phaser';
import { VIEW, STYLE, HD } from './config.js';
import { audio } from './audio.js';
import { hexNum } from './textures.js';
import { render, material, hexRgb } from './raster.js';
import { ringHalves } from './titleart.js';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16);
let uid = 0;

function canvasTex(scene, w, h, paint, key = `bd-${uid++}`) {
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  const img = ctx.createImageData(w, h);
  paint(img.data, w, h);
  ctx.putImageData(img, 0, 0);
  tex.refresh();
  // Pre-rendered style: backgrounds are smoothly filtered for a soft, painted depth.
  if (STYLE === 'prerendered') tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
  return key;
}

function rgbaTex(scene, rgba, w, h) {
  return canvasTex(scene, w, h, (d) => d.set(rgba));
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

function hash(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function noise1(x, s) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return hash(i, 0, s) * (1 - u) + hash(i + 1, 0, s) * u;
}

function noise2(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function buildBackdrop(scene, theme, worldW) {
  const rnd = new Phaser.Math.RandomDataGenerator([theme.seed ?? 'prisms']);
  // Atmospheric perspective: far layers (low scroll) blend toward the haze color.
  const atm = theme.atmosphere;
  const air = (c, scroll) => (atm ? mix(c, hexRgb(atm.color), Math.max(0, atm.amount * (1 - Math.min(1, (scroll ?? 0) * 2)))) : c);
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
        // A painted ring (landscape inside, hull outside). Only where canon puts one.
        const ring = ringHalves(scene, L.r, L.k ?? 0.22, L.band ?? 0.08, `ring-${L.r}-${L.k ?? 0.22}`);
        for (const key of [ring.back, ring.front]) {
          scene.add.image(L.x * VIEW.w, L.y * VIEW.h, key).setScrollFactor(L.scroll ?? 0.02).setDepth(depth).setRotation(L.rot ?? 0);
        }
        if (L.glow) {
          const g = scene.add.image(L.x * VIEW.w, L.y * VIEW.h, 'glow').setTint(hexNum(L.glow)).setBlendMode('ADD')
            .setScale((L.r * 2.4) / 32, (L.r * 0.9) / 32).setAlpha(0.25).setScrollFactor(L.scroll ?? 0.02).setDepth(depth).setRotation(L.rot ?? 0);
          scene.halos = [...(scene.halos ?? []), g];
        }
        break;
      }
      case 'ringrise': {
        // Standing on a ring: the far side of the ring rises from the horizon as a band
        // that widens toward its base and climbs high into the sky. Its inner surface
        // reads like a satellite image (muted land, cloud and snow, little water) with
        // detail shrinking with distance, faint Forerunner circuit lines, and metal rims.
        const W = VIEW.w * HD, H = VIEW.h * HD;
        const cx = (L.x ?? 0.5) * W, horizon = (L.horizon ?? 0.9) * H;
        const wTop = (L.top ?? 0.1) * W, wBot = (L.bottom ?? 0.34) * W, lean = (L.lean ?? 0.03) * W;
        const haze = hexRgb(L.haze ?? '#c8d4f0');
        const pal = {
          dark: hexRgb('#3e3a3e'), brown: hexRgb('#6c5c4c'), tan: hexRgb('#a08c70'), grey: hexRgb('#8a8278'),
          snow: hexRgb('#e6eaf0'), water: hexRgb('#4a5868'), circuit: hexRgb('#5ab8ff'),
        };
        const rimLight = hexRgb('#eef4ff'), rimDark = hexRgb('#2a2c3a');
        const fbm2 = (x, y, sd) => { let v = 0, a = 0.5, f = 1; for (let o = 0; o < 5; o++) { v += noise2(x * f, y * f, sd + o) * a; a *= 0.5; f *= 2.05; } return v; };
        const key = canvasTex(scene, W, H, (d) => {
          for (let y = 0; y < horizon; y++) {
            const t = y / horizon; // 0 at the top of the sky, 1 at the horizon
            const flare = Math.pow(t, 2.2);
            const w = wTop + (wBot - wTop) * flare;
            const c = cx + lean * (1 - t) - w * 0.06 * flare;
            const left = c - w / 2, right = c + w / 2;
            const dist = 1 / (0.08 + (1 - t)) * 3; // distance along the ring (compressed far away)
            for (let x = Math.max(0, Math.floor(left)); x < Math.min(W, Math.ceil(right)); x++) {
              const u = (x - left) / w; // 0..1 across the band
              let col;
              const rim = Math.min(u, 1 - u) * w;
              if (rim < 1.2 + flare * 2.5) col = u < 0.5 ? rimLight : rimDark;
              else {
                const n = fbm2(u * 3.2, dist, 5);
                col = n < 0.36 ? mix(pal.water, pal.dark, (n - 0.2) * 3) : n < 0.46 ? mix(pal.dark, pal.brown, (n - 0.36) * 10)
                  : n < 0.56 ? mix(pal.brown, pal.tan, (n - 0.46) * 10) : mix(pal.tan, pal.grey, Math.min(1, (n - 0.56) * 6));
                const cl = fbm2(u * 4 + 9, dist * 1.3, 21);
                if (cl > 0.55) col = mix(col, pal.snow, Math.min(0.92, (cl - 0.55) * 5));
                const ci = noise2(u * 26, dist * 6, 33);
                if (Math.abs(ci - 0.5) < 0.012 && n > 0.4) col = mix(col, pal.circuit, 0.6);
                col = mix(col, [16, 14, 26], 0.4 * u * u); // the side away from the light
              }
              const h = Math.max(Math.pow(t, 5) * 0.65, (1 - t) * 0.3);
              col = mix(col, haze, h);
              d.set([...col, 255], (y * W + x) * 4);
            }
          }
        });
        scene.add.image(0, 0, key).setOrigin(0).setScale(1 / HD).setScrollFactor(L.scroll ?? 0.02, 0).setDepth(depth);
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
        const base = air(hexRgb(L.color), L.scroll), glow = hexRgb(L.glow);
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
      case 'mountains': {
        // Ridged peaks: lit faces toward the light, rock strata, optional snow or grass caps.
        const H = VIEW.h, sf2 = L.scroll ?? 0.1;
        const base = air(hexRgb(L.color), sf2), lit = air(hexRgb(L.light), sf2), dark = air(hexRgb(L.shadow ?? L.color), sf2);
        const cap = L.cap ? air(hexRgb(L.cap), sf2) : null;
        const seed = rnd.between(1, 9999);
        const ridge = (x) => {
          let v = 0, amp = 1, f = 1 / 90;
          for (let o = 0; o < 4; o++) { v += (1 - Math.abs(noise1(x * f, seed + o) * 2 - 1)) * amp; amp *= 0.5; f *= 2.1; }
          return v / 1.875;
        };
        const key = canvasTex(scene, width, H, (d, w) => {
          const tops = [];
          for (let x = 0; x <= w; x++) tops.push(Math.round(H - H * L.height * (0.35 + 0.65 * ridge(x))));
          for (let x = 0; x < w; x++) {
            // Slope over a few columns, so faces shade in broad planes (no streaks).
            const slope = Math.round((tops[Math.min(w, x + 3)] - tops[Math.max(0, x - 3)]) / 3);
            for (let y = Math.max(0, tops[x]); y < H; y++) {
              const depthIn = y - tops[x];
              const strata = noise2(x / 30, y / 4, seed) - 0.5;
              let c = slope > 0 ? lit : slope < 0 ? dark : base;
              if (Math.abs(slope) <= 1 && depthIn > 3) c = mix(base, slope > 0 ? lit : dark, 0.5);
              c = mix(c, strata > 0 ? lit : dark, Math.abs(strata) * 0.5);
              if (cap && depthIn < 3 + noise1(x / 6, seed) * 4) c = cap;
              const fade = Math.min(1, depthIn / (H * 0.6));
              if (atm && fade > BAYER[(y & 3) * 4 + (x & 3)] * 0.5 + 0.5) c = mix(c, hexRgb(atm.color), (fade - 0.5) * 0.3);
              d.set([...c, 255], (y * w + x) * 4);
            }
          }
        });
        scene.add.image(0, 0, key).setOrigin(0).setScrollFactor(sf2, 0).setDepth(depth);
        break;
      }
      case 'clouds': {
        // Shaded cumulus: lit tops, soft shadowed bellies, dithered edges; drifts slowly.
        const W = 640, Hh = Math.round(VIEW.h * (L.height ?? 0.35)), sf2 = L.scroll ?? 0.05;
        const lit = air(hexRgb(L.light), sf2), base = air(hexRgb(L.color), sf2), shade = air(hexRgb(L.shade), sf2);
        const puffs = [];
        for (let i = 0; i < (L.count ?? 7); i++) {
          const cx = rnd.between(0, W), cy = rnd.between(Hh * 0.45, Hh * 0.75), size = rnd.between(18, 42);
          for (let j = 0; j < 7; j++) puffs.push({ x: cx + rnd.between(-size * 1.6, size * 1.6), y: cy + rnd.between(-size * 0.5, size * 0.2), r: size * rnd.realInRange(0.45, 0.85) });
        }
        const key = canvasTex(scene, W, Hh, (d, w, h) => {
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            let best = 0, ny = 0, nx = 0;
            for (const pf of puffs) for (const dx of [-W, 0, W]) {
              const qx = (x - pf.x - dx) / pf.r, qy = (y - pf.y) / (pf.r * 0.75);
              const q = 1 - (qx * qx + qy * qy);
              if (q > best) { best = q; nx = qx; ny = qy; }
            }
            if (best <= BAYER[(y & 3) * 4 + (x & 3)] * 0.15) continue;
            const light = -nx * 0.45 - ny * 0.9;
            const c = light > 0.35 ? lit : light > -0.15 ? base : shade;
            d.set([...c, Math.round(255 * (L.alpha ?? 1))], (y * w + x) * 4);
          }
        });
        const ts = scene.add.tileSprite(0, VIEW.h * (L.y ?? 0.05), VIEW.w, Hh, key).setOrigin(0).setScrollFactor(0).setDepth(depth);
        const drift = (_t, dt) => { ts.tilePositionX = scene.cameras.main.scrollX * sf2 + (ts.drift = (ts.drift ?? 0) + dt * (L.speed ?? 0.004)); };
        scene.events.on('update', drift);
        scene.events.once('shutdown', () => scene.events.off('update', drift));
        break;
      }
      case 'lightshafts': {
        // Soft beams of light from above, swaying slowly.
        canvasTex(scene, 16, 128, (d, w, h) => {
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const edge = 1 - Math.abs(x - w / 2) / (w / 2);
            d.set([255, 255, 255, Math.round(255 * edge * (1 - y / h) * 0.9)], (y * w + x) * 4);
          }
        }, 'shaft');
        for (let i = 0; i < (L.count ?? 4); i++) {
          const sh = scene.add.image(rnd.between(20, VIEW.w - 20), -10, 'shaft').setOrigin(0.5, 0).setScrollFactor(L.scroll ?? 0.1, 0)
            .setTint(hexNum(L.color)).setBlendMode('ADD').setAlpha(L.alpha ?? 0.18).setDepth(depth)
            .setScale(rnd.realInRange(1.5, 3.5), VIEW.h / 100).setRotation(L.angle ?? -0.35);
          scene.tweens.add({ targets: sh, alpha: (L.alpha ?? 0.18) * 0.4, rotation: (L.angle ?? -0.35) + 0.05, duration: rnd.between(3000, 6000), yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        }
        break;
      }
      case 'ruins': {
        // Mid-distance colonnades: arches with lit edges, dark openings and lit windows.
        const H = VIEW.h, sf2 = L.scroll ?? 0.3;
        const base = air(hexRgb(L.color), sf2), lit = air(hexRgb(L.light), sf2), dark = air(hexRgb(L.shadow), sf2), glow = hexRgb(L.glow ?? '#ffc23a');
        const key = canvasTex(scene, width, H, (d, w) => {
          const put = (x, y, c) => { if (x >= 0 && x < w && y >= 0 && y < H) d.set([...c, 255], (y * w + x) * 4); };
          let x = rnd.between(0, 60);
          while (x < w) {
            const bw = rnd.between(70, 150), top = Math.round(H * (1 - L.height * rnd.realInRange(0.6, 1)));
            const arches = Math.max(2, Math.round(bw / 26)), aw = bw / arches;
            for (let px = x; px < x + bw; px++) {
              for (let py = top; py < H; py++) {
                const ax = (px - x) % aw, ay = py - top;
                const archTop = top + 16 + (aw / 2 - Math.sqrt(Math.max(0, (aw / 2 - 3) ** 2 - (ax - aw / 2) ** 2)));
                const opening = ax > 3 && ax < aw - 3 && py > archTop && py < H - 6;
                let c = base;
                if (opening) c = dark;
                else if (ay < 3) c = ay === 0 ? lit : mix(base, lit, 0.5);
                else if (ax <= 1) c = lit;
                else if (ax >= aw - 2) c = mix(base, dark, 0.6);
                if (!opening && ay > 6 && ay < 12 && Math.floor(ax) % 6 === 3 && hash(px, Math.floor(py / 4), 7) > 0.6) c = glow;
                put(px, py, c);
              }
            }
            // Crumbled top edge.
            for (let px = x; px < x + bw; px += 3) {
              const bite = Math.round(hash(px, 3, 11) * 6);
              for (let py = top; py < top + bite; py++) for (let k = 0; k < 3; k++) d.set([0, 0, 0, 0], (py * w + px + k) * 4);
            }
            x += bw + rnd.between(30, 110);
          }
        });
        scene.add.image(0, 0, key).setOrigin(0).setScrollFactor(sf2, 0).setDepth(depth);
        break;
      }
      case 'hills': {
        // Rolling hills with a lit rim, from layered sine noise.
        const H = VIEW.h, base = air(hexRgb(L.color), L.scroll), rim = air(hexRgb(L.rim), L.scroll);
        const seed = rnd.frac() * 100;
        const key = canvasTex(scene, width, H, (d, w) => {
          for (let x = 0; x < w; x++) {
            const hgt = H * L.height * (0.55 + 0.25 * Math.sin(x / 47 + seed) + 0.15 * Math.sin(x / 19 + seed * 2) + 0.05 * Math.sin(x / 7));
            const top = Math.round(H - hgt);
            for (let y = Math.max(0, top); y < H; y++) {
              const c = y - top < 2 ? rim : y - top < 4 && BAYER[(y & 3) * 4 + (x & 3)] < 0.5 ? rim : base;
              d.set([...c, 255], (y * w + x) * 4);
            }
          }
        });
        scene.add.image(0, 0, key).setOrigin(0).setScrollFactor(L.scroll, 0).setDepth(depth);
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
