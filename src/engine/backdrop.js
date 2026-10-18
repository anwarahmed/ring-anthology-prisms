// Parallax backdrops built from a theme's layer list (src/content/themes.js).

import Phaser from 'phaser';
import { VIEW } from './config.js';
import { audio } from './audio.js';
import { hexNum } from './textures.js';

export function buildBackdrop(scene, theme, worldW) {
  const rnd = new Phaser.Math.RandomDataGenerator([theme.seed ?? 'prisms']);
  let depth = -100;
  for (const L of theme.backdrop) {
    depth += 1;
    const sf = L.scroll ?? 0;
    const width = VIEW.w + Math.ceil(sf * Math.max(0, worldW - VIEW.w)) + 40;
    switch (L.type) {
      case 'gradient': {
        const g = scene.add.graphics().setScrollFactor(0).setDepth(depth);
        g.fillGradientStyle(hexNum(L.top), hexNum(L.top), hexNum(L.bottom), hexNum(L.bottom), 1);
        g.fillRect(0, 0, VIEW.w, VIEW.h);
        break;
      }
      case 'stars': {
        const g = scene.add.graphics().setScrollFactor(0.01).setDepth(depth);
        for (let i = 0; i < L.count; i++) {
          g.fillStyle(0xffffff, rnd.realInRange(0.3, 1));
          const s = rnd.frac() < 0.1 ? 2 : 1;
          g.fillRect(rnd.between(0, VIEW.w + 20), rnd.between(0, VIEW.h * 0.7), s, s);
        }
        break;
      }
      case 'planet': {
        const g = scene.add.graphics().setScrollFactor(0.02).setDepth(depth);
        const x = L.x * VIEW.w, y = L.y * VIEW.h;
        g.fillStyle(hexNum(L.color), 1).fillCircle(x, y, L.r);
        g.fillStyle(hexNum(L.shade), 0.75).fillCircle(x + L.r * 0.35, y + L.r * 0.2, L.r * 0.9);
        g.lineStyle(1, 0xffffff, 0.25).strokeCircle(x, y, L.r);
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
        for (let i = 0; i < L.count; i++) {
          const g = scene.add.graphics().setScrollFactor(L.scroll).setDepth(depth);
          const len = rnd.between(40, 110);
          const x = rnd.between(0, width), y = rnd.between(15, VIEW.h * 0.35);
          g.fillStyle(hexNum(L.color), 1);
          g.fillPoints([
            { x: 0, y: 0 }, { x: len * 0.3, y: -len * 0.06 }, { x: len, y: -len * 0.02 },
            { x: len * 0.85, y: len * 0.05 }, { x: len * 0.25, y: len * 0.07 },
          ], true);
          g.fillStyle(hexNum(L.beams), 0.9).fillRect(len * 0.3, 0, len * 0.5, 1);
          g.x = x;
          g.y = y;
          scene.tweens.add({ targets: g, x: x - rnd.between(30, 80), duration: rnd.between(40000, 70000), yoyo: true, repeat: -1 });
          if (L.beams) {
            scene.time.addEvent({
              delay: rnd.between(4000, 9000), loop: true,
              callback: () => {
                const beam = scene.add.rectangle(g.x + len * 0.5, g.y, 3, VIEW.h, hexNum(L.beams), 0.9)
                  .setOrigin(0.5, 0).setScrollFactor(L.scroll).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
                scene.tweens.add({ targets: beam, alpha: 0, scaleX: 4, duration: 450, onComplete: () => beam.destroy() });
                audio.noise({ dur: 0.8, vol: 0.06, freq: 300, type: 'lowpass', at: 0.3 });
              },
            });
          }
        }
        break;
      }
      case 'spires': {
        const g = scene.add.graphics().setScrollFactor(L.scroll).setDepth(depth);
        const base = VIEW.h;
        let x = -20;
        while (x < width) {
          const w = rnd.between(10, 34);
          const h = VIEW.h * L.height * rnd.realInRange(0.35, 1);
          g.fillStyle(hexNum(L.color), 1);
          g.fillRect(x, base - h, w, h);
          g.fillTriangle(x, base - h, x + w, base - h, x + w / 2, base - h - w * 0.8);
          g.fillStyle(hexNum(L.glow), 0.8);
          for (let wy = base - h + 6; wy < base - 4; wy += 7) {
            if (rnd.frac() < 0.35) g.fillRect(x + rnd.between(2, Math.max(2, w - 4)), wy, 2, 2);
          }
          x += w + rnd.between(0, 30 / L.density);
        }
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
