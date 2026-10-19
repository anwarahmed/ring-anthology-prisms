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
  canvasTex(scene, 16, 128, (d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const edge = 1 - Math.abs(x - w / 2) / (w / 2);
      d.set([255, 255, 255, Math.round(255 * edge * (1 - y / h) * 0.9)], (y * w + x) * 4);
    }
  }, 'shaft');
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
          scene.add.image(L.x * VIEW.w, L.y * VIEW.h, key).setScale(ring.scale).setScrollFactor(L.scroll ?? 0.02).setDepth(depth).setRotation(L.rot ?? 0);
        }
        if (L.glow) {
          const g = scene.add.image(L.x * VIEW.w, L.y * VIEW.h, 'glow').setTint(hexNum(L.glow)).setBlendMode('ADD')
            .setScale((L.r * 2.4) / 32, (L.r * 0.9) / 32).setAlpha(0.25).setScrollFactor(L.scroll ?? 0.02).setDepth(depth).setRotation(L.rot ?? 0);
          scene.halos = [...(scene.halos ?? []), g];
        }
        break;
      }
      case 'ringrise': {
        // Standing on a ring: the ring's far side rises from the horizon as a wide band
        // that tapers as it climbs and arches overhead, off the top of the screen. Its
        // surface is a map (land, sea, cloud) that gets finer with distance; blue haze
        // is strongest low down and thins as it climbs, and beside the band the sky
        // darkens to the black of space, with stars and a distant sun. A sharp shadow
        // line splits day from night across the arch, and the night side glows with
        // lights. Thin bright lines are the atmosphere walls.
        //   state: 'pristine' (Forerunner era: hard-light bridges, gleaming citadels),
        //          'damaged' (Banished era: missing chunks, glowing breaks, smoke, sparks),
        //          'unfinished' (bare framework in places), or normal.
        //   dim: 0..1 for night levels (the whole arch in darkness, lit up).
        const W = VIEW.w * HD, H = VIEW.h * HD;
        const key = `ringrise-${L.x}-${L.horizon}-${L.haze}-${L.state ?? 'normal'}-${L.dim ?? 0}`;
        if (!scene.textures.exists(key)) {
          const tex = scene.textures.createCanvas(key, W, H);
          const ctx = tex.getContext();
          const fbm2 = (x, y, sd) => { let v = 0, a = 0.5, f = 1; for (let o = 0; o < 5; o++) { v += noise2(x * f, y * f, sd + o) * a; a *= 0.5; f *= 2.05; } return v; };
          const css = (c, al = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${al})`;
          const haze = hexRgb(L.haze ?? '#c8d4f0');
          const dim = L.dim ?? 0;
          const state = L.state ?? 'normal';
          const horizon = (L.horizon ?? 0.74) * H;
          // The sky above the haze: darker toward the top, the void of space.
          const sky = ctx.createLinearGradient(0, 0, 0, horizon);
          sky.addColorStop(0, `rgba(3,5,16,${0.88 - dim * 0.1})`);
          sky.addColorStop(0.55, 'rgba(6,10,30,0.35)');
          sky.addColorStop(1, 'rgba(6,10,30,0)');
          ctx.fillStyle = sky;
          ctx.fillRect(0, 0, W, horizon);
          for (let k = 0; k < 90; k++) {
            const x = hash(k, 1, 77) * W, y = Math.pow(hash(k, 2, 77), 1.6) * horizon * 0.6;
            ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.6 * hash(k, 3, 77)})`;
            ctx.fillRect(x, y, HD * 0.6, HD * 0.6);
          }
          if (dim < 0.5) {
            const sx = W * 0.12, sy = H * 0.14;
            const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 40 * HD);
            g.addColorStop(0, 'rgba(255,250,230,1)');
            g.addColorStop(0.12, 'rgba(255,240,200,0.9)');
            g.addColorStop(1, 'rgba(255,220,160,0)');
            ctx.fillStyle = g;
            ctx.fillRect(sx - 40 * HD, sy - 40 * HD, 80 * HD, 80 * HD);
          }
          // The arch: a curve from the horizon up and over, off the top of the screen.
          const bx = (L.x ?? 0.5) * W * 0.6;
          const P = [[bx, horizon + 6 * HD], [bx + 0.02 * W, 0.2 * H], [bx + 0.2 * W, -0.12 * H], [bx + 0.85 * W, -0.32 * H]];
          const at = (u) => {
            const m = 1 - u;
            const x = m * m * m * P[0][0] + 3 * m * m * u * P[1][0] + 3 * m * u * u * P[2][0] + u * u * u * P[3][0];
            const y = m * m * m * P[0][1] + 3 * m * m * u * P[1][1] + 3 * m * u * u * P[2][1] + u * u * u * P[3][1];
            return [x, y];
          };
          const wBase = 0.34 * W, wTop = 0.05 * W;
          const halfW = (u) => (wTop + (wBase - wTop) * Math.pow(1 - u, 1.5)) / 2;
          const M = 420, NV = 10;
          const pal = {
            sea: hexRgb('#3a5a7a'), deep: hexRgb('#2a405e'), green: hexRgb('#4f7a48'), forest: hexRgb('#3a5e3a'),
            tan: hexRgb('#a8946e'), rock: hexRgb('#7a7268'), snow: hexRgb('#e8eef4'),
          };
          const corner = (u, v) => {
            const [x, y] = at(u), [x2, y2] = at(Math.min(1, u + 0.002));
            let nx = -(y2 - y), ny = x2 - x;
            const n = Math.hypot(nx, ny) || 1;
            nx /= n; ny /= n;
            const hw = halfW(u);
            return [x + nx * (v - 0.5) * 2 * hw, y + ny * (v - 0.5) * 2 * hw];
          };
          const gaps = [];
          for (let i = 0; i < M; i++) {
            const u0 = i / M, u1 = (i + 1) / M, um = (u0 + u1) / 2;
            const along = um * 14 + um * um * 40; // the surface gets finer with distance
            const shadow = 0.36;
            for (let j = 0; j < NV; j++) {
              const v0 = j / NV, v1 = (j + 1) / NV, vm = (v0 + v1) / 2;
              const missing = state === 'damaged' && fbm2(along * 0.16, vm * 1.2 + 3, 91) > 0.53 && um > 0.1;
              if (missing) { if (hash(i, j, 5) < 0.12) gaps.push(corner(um, vm)); continue; }
              const frame = state === 'unfinished' && fbm2(along * 0.1, 7, 61) > 0.58 && um > 0.15;
              let c;
              if (frame) {
                // Bare framework: ribs across the band, open to space between them.
                if (i % 6 > 1 && j % 3 !== 0) continue;
                c = mix(hexRgb('#6a7280'), hexRgb('#a8b0bc'), 0.5);
              } else {
                const n = fbm2(along, vm * 3, 5);
                c = n < 0.4 ? mix(pal.deep, pal.sea, n / 0.4) : n < 0.5 ? pal.green : n < 0.6 ? pal.forest : n < 0.7 ? pal.tan : pal.rock;
                const cl = fbm2(along * 1.4 + 9, vm * 4, 21);
                if (cl > 0.56) c = mix(c, pal.snow, Math.min(0.9, (cl - 0.56) * 5));
              }
              // Night: past the shadow line, or the whole arch on night levels.
              const night = dim > 0.4 || um + (vm - 0.5) * 0.06 > shadow;
              if (night) c = mix(c, [8, 10, 22], 0.78);
              // Haze: thick near the ground, thinning as the arch climbs.
              c = mix(c, haze, Math.max(0, 0.62 * Math.pow(1 - um, 2.2) - (night ? 0.2 : 0)));
              if (dim > 0) c = mix(c, [6, 8, 18], dim * 0.35);
              const a = corner(u0, v0), b = corner(u1, v0), d2 = corner(u1, v1), e = corner(u0, v1);
              ctx.fillStyle = css(c);
              ctx.strokeStyle = css(c);
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d2[0], d2[1]); ctx.lineTo(e[0], e[1]);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
              // City lights on the night side: scattered dots, finer with distance.
              if (night && !frame) {
                for (let k = 0; k < 3; k++) {
                  if (hash(i * 7 + k, j, 41) > 0.1 + dim * 0.12) continue;
                  const t = hash(i, j * 5 + k, 43), q = hash(j, i * 3 + k, 47);
                  const x = a[0] + (b[0] - a[0]) * t + (e[0] - a[0]) * q, y = a[1] + (b[1] - a[1]) * t + (e[1] - a[1]) * q;
                  ctx.fillStyle = `rgba(255,${200 + ((k * 20) | 0)},120,${0.6 + 0.4 * t})`;
                  const sz = HD * Math.max(0.35, 0.9 * (1 - um));
                  ctx.fillRect(x, y, sz, sz);
                }
              }
            }
            // Pristine: hard-light bridges spanning the band, and gleaming citadels.
            if (state === 'pristine' && i % 23 === 0 && um > 0.06) {
              const a = corner(um, 0), b = corner(um, 1);
              for (const [w, al] of [[3.2, 0.25], [1.2, 0.95]]) {
                ctx.strokeStyle = `rgba(140,230,255,${al})`;
                ctx.lineWidth = Math.max(0.6, HD * w * (1 - um));
                ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
              }
            }
            if (state === 'pristine' && hash(i, 9, 3) < 0.05) {
              const [x, y] = corner(um, 0.2 + 0.6 * hash(i, 8, 3));
              ctx.fillStyle = 'rgba(255,255,240,0.95)';
              ctx.fillRect(x, y, HD * (1.2 - um), HD * (1.2 - um));
            }
          }
          // The atmosphere walls along both edges.
          for (const v of [0, 1]) {
            ctx.strokeStyle = 'rgba(230,240,255,0.7)';
            ctx.lineWidth = HD * 0.6;
            ctx.beginPath();
            for (let i = 0; i <= M; i++) {
              const [x, y] = corner(i / M, v);
              if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
          // Damaged: glowing breaks, smoke and sparks at the missing chunks.
          for (const [x, y] of gaps) {
            const g = ctx.createRadialGradient(x, y, 0, x, y, 8 * HD);
            g.addColorStop(0, 'rgba(255,150,60,0.7)');
            g.addColorStop(1, 'rgba(255,90,30,0)');
            ctx.fillStyle = g;
            ctx.fillRect(x - 8 * HD, y - 8 * HD, 16 * HD, 16 * HD);
            ctx.fillStyle = 'rgba(70,64,64,0.35)';
            ctx.beginPath(); ctx.ellipse(x + 3 * HD, y - 6 * HD, 7 * HD, 4 * HD, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,200,120,0.9)';
            for (let k = 0; k < 3; k++) ctx.fillRect(x + (hash(x, k, 1) - 0.5) * 10 * HD, y + hash(y, k, 2) * 8 * HD, HD * 0.7, HD * 0.7);
          }
          tex.refresh();
          if (STYLE === 'prerendered') tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
        scene.add.image(0, 0, key).setOrigin(0).setScale(1 / HD).setScrollFactor(L.scroll ?? 0.02, 0).setDepth(depth);
        break;
      }
      case 'industrial': {
        // Industrial depth in the style of late-90s fighting-game stages: lattice truss
        // towers, girders, pipe runs and catwalks in silhouette, rim-lit by the haze,
        // with beacon lights. Painted at HD resolution.
        const sf2 = L.scroll ?? 0.3;
        const lw = Math.min(width, Math.floor(4096 / HD));
        const W = lw * HD, H = VIEW.h * HD;
        const base = air(hexRgb(L.color), sf2), rim = air(hexRgb(L.rim), sf2), deep = mix(base, [0, 0, 0], 0.35);
        const lights = [];
        const key = canvasTex(scene, W, H, (d) => {
          const put = (x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < H) d.set([...c, 255], ((y | 0) * W + (x | 0)) * 4); };
          const rect = (x0, y0, x1, y1, c) => { for (let y = Math.max(0, y0 | 0); y < Math.min(H, y1); y++) for (let x = Math.max(0, x0 | 0); x < Math.min(W, x1); x++) put(x, y, c); };
          const line = (x0, y0, x1, y1, c, t = 1) => {
            const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
            for (let i = 0; i <= n; i++) rect(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, x0 + ((x1 - x0) * i) / n + t, y0 + ((y1 - y0) * i) / n + t, c);
          };
          // Haze rises from the bottom: structures fade into the distance below.
          const fogged = (y, c) => mix(c, rim, 0.4 * Math.pow(Math.max(0, y / H - 0.35) / 0.65, 1.6));
          const solid = (x0, y0, x1, y1, c) => { for (let y = Math.max(0, y0 | 0); y < Math.min(H, y1); y++) for (let x = Math.max(0, x0 | 0); x < Math.min(W, x1); x++) put(x, y, fogged(y, c)); };
          const tower = (x, tw, top) => {
            // Lattice tower: two legs, cross-bracing, a platform on top.
            solid(x, top, x + 3 * HD, H, base); solid(x + tw - 3 * HD, top, x + tw, H, base);
            solid(x, top, x + HD, H, rim);
            for (let y = top; y < H; y += 12 * HD) { line(x, y, x + tw, y + 12 * HD, fogged(y, base), HD); line(x + tw, y, x, y + 12 * HD, fogged(y, base), HD); solid(x, y, x + tw, y + HD, rim); }
            solid(x - 4 * HD, top - 3 * HD, x + tw + 4 * HD, top, base); solid(x - 4 * HD, top - 3 * HD, x + tw + 4 * HD, top - 2 * HD, rim);
            if (rnd.frac() < 0.8) lights.push({ x: (x + tw / 2) / HD, y: (top - 6 * HD) / HD });
          };
          const tank = (x, tw, top) => {
            // A storage tank: a domed cylinder with bands and a ladder.
            const r = tw / 2, cx = x + r;
            for (let y = Math.max(0, top - r); y < H; y++) {
              for (let xx = x; xx < x + tw; xx++) {
                const dx = (xx - cx) / r;
                if (y < top && Math.hypot(dx, (y - top) / (r * 0.5)) > 1) continue;
                const shade = dx < -0.6 ? rim : dx > 0.45 ? deep : base;
                put(xx, y, fogged(y, (y - top) % (14 * HD) < HD && y > top ? deep : shade));
              }
            }
            for (let y = top; y < H; y += 3 * HD) solid(cx + r * 0.5, y, cx + r * 0.5 + HD, y + HD, rim);
          };
          const block = (x, tw, top) => {
            // A blocky building with a few lit windows.
            solid(x, top, x + tw, H, base); solid(x, top, x + HD, H, rim); solid(x, top, x + tw, top + HD, rim);
            for (let wy = top + 6 * HD; wy < H - 10 * HD; wy += 9 * HD) for (let wx = x + 4 * HD; wx < x + tw - 5 * HD; wx += 7 * HD) {
              if (rnd.frac() < 0.35) solid(wx, wy, wx + 3 * HD, wy + 4 * HD, mix(hexRgb(L.light ?? '#ffc23a'), base, 0.35));
            }
          };
          const crane = (x, tw, top) => {
            tower(x, Math.min(tw, 16 * HD), top);
            const arm = rnd.between(40, 90) * HD, ay = top - 8 * HD;
            solid(x - arm * 0.3, ay, x + arm, ay + 2 * HD, base); solid(x - arm * 0.3, ay, x + arm, ay + HD / 2, rim);
            line(x + 8 * HD, top - 22 * HD, x + arm, ay, base, HD); line(x + 8 * HD, top - 22 * HD, x - arm * 0.3, ay, base, HD);
            solid(x + 6 * HD, top - 22 * HD, x + 10 * HD, top, base);
            line(x + arm * 0.8, ay, x + arm * 0.8, ay + rnd.between(20, 60) * HD, base, HD / 2);
          };
          let x = rnd.between(10, 60) * HD;
          let prev = null;
          while (x < W) {
            const kind = rnd.frac();
            const tw = (kind < 0.5 ? rnd.between(18, 34) : rnd.between(26, 60)) * HD;
            const top = H * (1 - L.height * rnd.realInRange(0.45, 1));
            if (kind < 0.45) tower(x, tw, top);
            else if (kind < 0.65) tank(x, tw, top + 20 * HD);
            else if (kind < 0.88) block(x, tw, top + 10 * HD);
            else crane(x, tw, top);
            // A pipe or catwalk to the previous structure, at a shared height.
            if (prev && rnd.frac() < 0.55) {
              const py = Math.max(prev.top, top) + rnd.between(10, 40) * HD, r = rnd.between(2, 4) * HD / 2;
              for (let xx = prev.end; xx < x; xx++) for (let dy = -r; dy <= r; dy++) put(xx, py + dy, fogged(py, dy < -r * 0.4 ? rim : dy > r * 0.5 ? deep : base));
              for (let xx = prev.end; xx < x; xx += 24 * HD) solid(xx, py - r, xx + 2 * HD, py + r + HD, deep);
            }
            prev = { end: x + tw, top };
            x += tw + rnd.between(14, 70) * HD;
          }
        });
        scene.add.image(0, 0, key).setOrigin(0).setScale(1 / HD).setScrollFactor(sf2, 0).setDepth(depth);
        for (const l of lights) beacon(scene, l.x, l.y, hexNum(L.light ?? '#ff4a3a'), sf2, depth + 0.5, rnd);
        break;
      }
      case 'temple': {
        // An interior wall: big carved blocks between pilasters, lit in pools by sconces
        // (stone) or glyph lights (Forerunner). Painted at HD resolution.
        const sf2 = L.scroll ?? 0.55;
        const lw = Math.min(width, Math.floor(4096 / HD));
        const W = lw * HD, H = VIEW.h * HD;
        const base = hexRgb(L.color), lit = hexRgb(L.light), dark = hexRgb(L.shadow), glyph = hexRgb(L.glow ?? '#45e6ff');
        const fore = L.style === 'forerunner';
        const pil = 70 * HD, pw = 12 * HD, sconces = [];
        const key = canvasTex(scene, W, H, (d) => {
          for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
              const px = x % pil, bx = (x + (Math.floor(y / (22 * HD)) % 2) * 17 * HD) % (34 * HD), by = y % (22 * HD);
              // Lighting pools around each sconce, fading into darkness above and below.
              const cx = Math.floor(x / pil) * pil + pil / 2, ly = H * 0.42;
              const pool = Math.max(0, 1 - Math.hypot((x - cx) / (pil * 0.55), (y - ly) / (H * 0.45)));
              let c = mix(dark, base, pool * 0.9 + 0.1);
              if (px < pw) c = mix(dark, px < 3 * HD ? lit : base, 0.5 + pool * 0.5); // pilaster
              else if (bx < HD || by < HD) c = mix(c, dark, 0.6); // block joints
              else if (by < 2 * HD) c = mix(c, lit, 0.25 * pool);
              const gx = (x - pw) % (17 * HD), gy = y % (44 * HD);
              if (px >= pw && (gx === 6 * HD || gy === 30 * HD) && noise2(Math.floor(x / (17 * HD)), Math.floor(y / (44 * HD)), 3) > 0.45) c = fore ? mix(c, glyph, 0.35 + pool * 0.4) : mix(c, dark, 0.5);
              // Arched windows between the pilasters, glowing from outside.
              const wx = px - pil / 2, wtop = H * 0.2, wbot = H * 0.5, wr = 10 * HD;
              const inArch = Math.abs(wx) < wr && y < wbot && (y > wtop + wr || Math.hypot(wx, y - (wtop + wr)) < wr);
              if (L.windows && px >= pw && inArch) {
                const edge = Math.abs(wx) > wr - 2 * HD || (y < wtop + wr + 2 * HD && Math.hypot(wx, y - (wtop + wr)) > wr - 2 * HD);
                c = edge ? mix(dark, lit, 0.4) : mix(glyph, [255, 255, 255], 0.15 * (1 - (y - wtop) / (wbot - wtop)));
                if (!edge && Math.abs(wx) < HD / 2) c = mix(c, dark, 0.7);
              } else if (!L.windows && px >= pw && Math.abs(wx) < wr * 1.15 && y > H * 0.24 && y < H * 0.54) {
                // Windowless walls: a carved alcove with a glowing panel inside.
                const ax = Math.abs(wx) / (wr * 1.15);
                const inner = ax < 0.62 && y > H * 0.28 && y < H * 0.5;
                const frame = !inner && (ax > 0.86 || y < H * 0.26 || y > H * 0.52);
                c = inner ? mix(glyph, dark, 0.35 + 0.4 * Math.abs((y / H - 0.39) / 0.11)) : frame ? mix(c, lit, 0.4) : mix(c, dark, 0.55);
                if (inner && fore && Math.abs(wx) < HD * 0.7) c = mix(c, [255, 255, 255], 0.5);
              } else if (L.marble && px >= pw) {
                const vein = Math.abs(noise2(x / (30 * HD) + y / (90 * HD), y / (40 * HD), 51) - 0.5);
                if (vein < 0.012) c = mix(c, lit, 0.18);
              }
              // Carved trim bands: a frieze under the windows and a plinth at the bottom.
              const fy = y / H;
              if (px >= pw && Math.abs(fy - 0.56) < 0.012) c = mix(c, lit, 0.35 + pool * 0.3);
              else if (px >= pw && Math.abs(fy - 0.59) < 0.006) c = mix(c, dark, 0.5);
              if (fy > 0.86) c = mix(c, dark, 0.35 + (fy - 0.86) * 2);
              // Capitals: a lit block where each pilaster meets the ceiling band.
              if (px < pw + 2 * HD && fy > 0.08 && fy < 0.12) c = mix(c, lit, 0.45);
              // Shadow under the ceiling and a soft falloff toward the floor.
              c = mix(c, dark, Math.max(0, 0.45 - fy * 2.2) + Math.max(0, fy - 0.7) * 0.6);
              const g = (hash(x, y, 2) - 0.5) * 0.08;
              d.set([...c.map((v) => Math.max(0, Math.min(255, v * (1 + g)))), 255], (y * W + x) * 4);
            }
          }
          for (let x = pil / 2; x < W; x += pil) sconces.push(x / HD);
        });
        scene.add.image(0, 0, key).setOrigin(0).setScale(1 / HD).setScrollFactor(sf2, 0).setDepth(depth);
        for (const sx of sconces) {
          const g = scene.add.image(sx, VIEW.h * 0.42, 'glow').setTint(fore ? hexNum(L.glow ?? '#45e6ff') : hexNum(L.sconce ?? '#ffb04a'))
            .setBlendMode('ADD').setScale(2.2).setAlpha(0.5).setScrollFactor(sf2, 0).setDepth(depth + 0.5);
          scene.tweens.add({ targets: g, alpha: 0.32, duration: 600 + rnd.between(0, 600), yoyo: true, repeat: -1 });
          // A slanted beam from each window (or a soft wash under each light).
          if (L.windows || fore) {
            const beam = scene.add.image(sx + 6, VIEW.h * 0.24, 'shaft').setOrigin(0.5, 0).setTint(fore ? hexNum(L.glow ?? '#45e6ff') : 0xfff0c8)
              .setBlendMode('ADD').setAlpha(0.14).setScale(1.6, VIEW.h / 150).setRotation(-0.32).setScrollFactor(sf2, 0).setDepth(depth + 0.4);
            scene.tweens.add({ targets: beam, alpha: 0.07, duration: rnd.between(2500, 5000), yoyo: true, repeat: -1, ease: 'Sine.InOut' });
          }
        }
        // Dust motes drifting through the light.
        scene.add.particles(0, 0, 'px', {
          x: { min: 0, max: VIEW.w }, y: { min: VIEW.h * 0.2, max: VIEW.h * 0.8 }, lifespan: 6000, frequency: 260,
          speedX: { min: -4, max: 6 }, speedY: { min: -3, max: 3 }, scale: { min: 0.4, max: 0.9 },
          alpha: { start: 0, end: 0, ease: (t) => Math.sin(t * Math.PI) * 0.6 }, tint: fore ? hexNum(L.glow ?? '#45e6ff') : 0xffe8b8, blendMode: 'ADD',
        }).setScrollFactor(0).setDepth(depth + 0.45);
        break;
      }
      case 'floor': {
        // A perspective floor receding from the playfield to the back wall: horizontal
        // strips whose tiles shrink and whose scroll speed slows with distance, so it
        // reads as a real floor plane (line scrolling, as SNES-era stages did).
        const y0 = (L.top ?? 0.62) * VIEW.h, y1 = (L.bottom ?? 0.78) * VIEW.h, rows = L.rows ?? 10;
        const c = hexRgb(L.color), ln = hexRgb(L.line), hi = hexRgb(L.light ?? L.line);
        for (let r = 0; r < rows; r++) {
          const t0 = r / rows, t1 = (r + 1) / rows;
          const ya = y0 + (y1 - y0) * t0 * t0, yb = y0 + (y1 - y0) * t1 * t1;
          const hh = Math.max(1, Math.round(yb - ya));
          const scale = 0.35 + 0.65 * t1; // nearer rows: bigger tiles, faster scroll
          const tw = Math.max(8, Math.round((L.tile ?? 40) * scale));
          const key = canvasTex(scene, tw * HD, hh * HD, (d, w, h) => {
            for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
              let col = mix(c, [0, 0, 0], (1 - t1) * 0.55);
              if (x < HD) col = mix(ln, [0, 0, 0], (1 - t1) * 0.5);
              if (y === 0 && r % 2 === 0) col = mix(hi, [0, 0, 0], (1 - t1) * 0.6);
              const sheen = Math.max(0, 1 - Math.abs(x / w - 0.3) * 3) * 0.12 * t1;
              col = mix(col, hi, sheen);
              d.set([...col, 255], (y * w + x) * 4);
            }
          }, `floor-${L.color}-${r}`);
          const ts = scene.add.tileSprite(0, ya, VIEW.w, hh, key).setOrigin(0).setScrollFactor(0).setDepth(depth).setTileScale(1 / HD);
          const sf2 = (L.scroll ?? 0.5) + (1 - (L.scroll ?? 0.5)) * t1;
          const follow = () => { ts.tilePositionX = scene.cameras.main.scrollX * sf2 * HD; };
          scene.events.on('update', follow);
          scene.events.once('shutdown', () => scene.events.off('update', follow));
        }
        break;
      }
      case 'fog': {
        // A drifting band of volumetric haze, thick in the middle and fading at the edges.
        const W = 512, Hh = Math.round(VIEW.h * (L.height ?? 0.4)), c = hexRgb(L.color);
        const key = canvasTex(scene, W, Hh, (d, w, h) => {
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const band = Math.sin((y / h) * Math.PI);
            const n = noise2(x / 60, y / 20, 41) * 0.6 + noise2(x / 23, y / 9, 43) * 0.4;
            const a = Math.max(0, band * (0.35 + n * 0.65)) * (L.alpha ?? 0.5);
            d.set([...c, Math.round(255 * a)], (y * w + x) * 4);
          }
        });
        const ts = scene.add.tileSprite(0, VIEW.h * (L.y ?? 0.5), VIEW.w, Hh, key).setOrigin(0).setScrollFactor(0).setDepth(depth);
        scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
        const sf2 = L.scroll ?? 0.4;
        const drift = (_t, dt) => { ts.tilePositionX = scene.cameras.main.scrollX * sf2 + (ts.drift = (ts.drift ?? 0) + dt * (L.speed ?? 0.008)); };
        scene.events.on('update', drift);
        scene.events.once('shutdown', () => scene.events.off('update', drift));
        break;
      }
      case 'beacons': {
        for (let i = 0; i < (L.count ?? 6); i++) {
          beacon(scene, rnd.between(0, width), rnd.realInRange(0.15, 0.55) * VIEW.h, hexNum(L.color), L.scroll ?? 0.2, depth, rnd);
        }
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
        // Painted at HD resolution (coordinates below are in screen pixels: x / HD).
        const lw = Math.min(width, Math.floor(4096 / HD));
        const key = canvasTex(scene, lw * HD, H * HD, (d, w) => {
          const tops = [];
          for (let X = 0; X <= w; X++) tops.push(H - H * L.height * (0.35 + 0.65 * ridge(X / HD)));
          for (let X = 0; X < w; X++) {
            const x = X / HD;
            // Slope over a few pixels, so faces shade in broad planes (no streaks).
            const slope = (tops[Math.min(w, X + 3 * HD)] - tops[Math.max(0, X - 3 * HD)]) / 3;
            for (let Y = Math.max(0, Math.floor(tops[X] * HD)); Y < H * HD; Y++) {
              const y = Y / HD;
              const depthIn = y - tops[X];
              const strata = noise2(x / 30, y / 4, seed) - 0.5;
              const t = Math.max(-1, Math.min(1, slope * 0.7));
              let c = t > 0 ? mix(base, lit, t) : mix(base, dark, -t);
              c = mix(c, strata > 0 ? lit : dark, Math.abs(strata) * 0.45);
              // Gullies: fine dark streaks running down the faces.
              if (noise2(x / 3, y / 26, seed + 7) > 0.78) c = mix(c, dark, 0.35);
              if (cap && depthIn < 3 + noise1(x / 6, seed) * 4) c = mix(cap, lit, depthIn < 0.8 ? 0.3 : 0);
              const fade = Math.min(1, depthIn / (H * 0.6));
              if (atm) c = mix(c, hexRgb(atm.color), Math.max(0, fade - 0.35) * 0.35);
              d.set([...c, 255], (Y * w + X) * 4);
            }
          }
        });
        scene.add.image(0, 0, key).setOrigin(0).setScale(1 / HD).setScrollFactor(sf2, 0).setDepth(depth);
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
        // Painted at HD resolution: a lit rim, clumps of trees or bushes along the crest,
        // shaded hollows, and a gentle darkening toward the bottom.
        const lw = Math.min(width, Math.floor(4096 / HD));
        const dark = mix(base, [0, 0, 0], 0.28);
        const key = canvasTex(scene, lw * HD, H * HD, (d, w) => {
          for (let X = 0; X < w; X++) {
            const x = X / HD;
            const hgt = H * L.height * (0.55 + 0.25 * Math.sin(x / 47 + seed) + 0.15 * Math.sin(x / 19 + seed * 2) + 0.05 * Math.sin(x / 7));
            const clump = Math.max(0, noise1(x / 5, seed * 13) - 0.45) * 9 * (L.trees === false ? 0 : 1);
            const top = H - hgt - clump;
            const slope = Math.cos(x / 47 + seed) * 0.25 / 47 * H * L.height + Math.cos(x / 19 + seed * 2) * 0.15 / 19 * H * L.height;
            for (let Y = Math.max(0, Math.floor(top * HD)); Y < H * HD; Y++) {
              const y = Y / HD;
              const depthIn = y - top;
              let c = depthIn < 1.2 ? rim : mix(base, slope > 0 ? dark : rim, Math.min(0.35, Math.abs(slope) * 0.6));
              if (depthIn >= 1.2 && depthIn < clump + 2) c = mix(c, noise2(x / 1.5, y / 1.5, seed) > 0.5 ? rim : dark, 0.35);
              c = mix(c, dark, Math.min(0.4, Math.max(0, depthIn - 6) / (H * 0.5)));
              if (noise2(x / 9, y / 5, seed + 3) > 0.74) c = mix(c, dark, 0.2);
              d.set([...c, 255], (Y * w + X) * 4);
            }
          }
        });
        scene.add.image(0, 0, key).setOrigin(0).setScale(1 / HD).setScrollFactor(L.scroll, 0).setDepth(depth);
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

// A point light in the distance: a glow, a star flare, a soft cone of light angled down
// through the haze, and a slow blink.
function beacon(scene, x, y, color, scroll, depth, rnd) {
  const g = scene.add.image(x, y, 'glow').setTint(color).setBlendMode('ADD').setScale(0.9).setScrollFactor(scroll, 0).setDepth(depth);
  const flare = scene.add.rectangle(x, y, 14, 1, color, 0.8).setBlendMode('ADD').setScrollFactor(scroll, 0).setDepth(depth);
  const cone = scene.add.image(x, y, 'shaft').setOrigin(0.5, 0).setTint(color).setBlendMode('ADD').setAlpha(0.16)
    .setScale(2.2, 0.7).setRotation(rnd.realInRange(-0.5, 0.5)).setScrollFactor(scroll, 0).setDepth(depth - 0.1);
  scene.tweens.add({ targets: [g, flare], alpha: 0.35, duration: rnd.between(700, 1600), yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  scene.tweens.add({ targets: cone, alpha: 0.08, duration: rnd.between(1500, 3000), yoyo: true, repeat: -1 });
}
