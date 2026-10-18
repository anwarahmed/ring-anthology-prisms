// The EPIC layer: puffs, sparks, explosions, shake, hit-stop, slow motion, teleports.
// Every effect goes through here so levels feel consistent.

import Phaser from 'phaser';
import { audio } from './audio.js';
import { hexNum } from './textures.js';

export class Fx {
  constructor(scene) {
    this.scene = scene;
    this.emitters = new Map();
    this.slowUntil = 0;
  }

  emitter(color, tex = 'px') {
    const key = `${tex}-${color}`;
    if (!this.emitters.has(key)) {
      const e = this.scene.add.particles(0, 0, tex, {
        emitting: false, lifespan: { min: 250, max: 700 }, speed: { min: 40, max: 180 },
        scale: { start: 1.2, end: 0 }, alpha: { start: 1, end: 0 }, tint: color, blendMode: 'ADD',
        gravityY: 120,
      }).setDepth(40);
      this.emitters.set(key, e);
    }
    return this.emitters.get(key);
  }

  glow(x, y, color, scale = 1, ms = 250) {
    const g = this.scene.add.image(x, y, 'glow').setTint(color).setBlendMode('ADD').setDepth(41).setScale(scale);
    this.scene.tweens.add({ targets: g, alpha: 0, scale: scale * 1.8, duration: ms, onComplete: () => g.destroy() });
  }

  ring(x, y, color, size = 1, ms = 350) {
    const r = this.scene.add.image(x, y, 'ring').setTint(color).setBlendMode('ADD').setDepth(41).setScale(0.1);
    this.scene.tweens.add({ targets: r, scale: size, alpha: 0, duration: ms, ease: 'Cubic.Out', onComplete: () => r.destroy() });
  }

  // The signature defeat: enemies vanish in a puff of their faction's light.
  puff(x, y, colorHex, big = false) {
    const c = typeof colorHex === 'string' ? hexNum(colorHex) : colorHex;
    this.emitter(c).explode(big ? 40 : 18, x, y);
    this.emitter(0xffffff).explode(big ? 12 : 5, x, y);
    this.glow(x, y, c, big ? 2.5 : 1.2);
    this.ring(x, y, c, big ? 1.6 : 0.7);
    audio.sfx('puff');
  }

  sparks(x, y, color, n = 6) {
    this.emitter(color, 'spark').explode(n, x, y);
  }

  explosion(x, y, radius, color = 0xffa040) {
    this.emitter(color).explode(30, x, y);
    this.emitter(0xfff0c0).explode(14, x, y);
    this.glow(x, y, color, radius / 10, 400);
    this.ring(x, y, 0xffffff, radius / 28, 300);
    this.shake(0.012, 220);
    audio.sfx('explode');
  }

  shake(power = 0.008, ms = 150) {
    this.scene.cameras.main.shake(ms, power);
  }

  flash(color = 0xffffff, ms = 120) {
    this.scene.cameras.main.flash(ms, (color >> 16) & 255, (color >> 8) & 255, color & 255);
  }

  hitstop(ms = 60) {
    const w = this.scene.physics.world;
    if (w.isPaused) return;
    w.pause();
    window.setTimeout(() => w.resume(), ms);
  }

  // Slow motion for finishing blows and climaxes. Uses real time to end.
  slowmo(scale = 0.3, ms = 900) {
    const s = this.scene;
    s.physics.world.timeScale = 1 / scale;
    s.time.timeScale = scale;
    s.tweens.timeScale = scale;
    s.anims.globalTimeScale = scale;
    window.clearTimeout(this.slowTimer);
    this.slowTimer = window.setTimeout(() => {
      if (!s.sys.isActive()) return;
      s.physics.world.timeScale = 1;
      s.time.timeScale = 1;
      s.tweens.timeScale = 1;
      s.anims.globalTimeScale = 1;
    }, ms);
  }

  // Hard-light teleport in: a column of light, then the unit fades in.
  teleportIn(sprite, color) {
    const s = this.scene;
    const beam = s.add.rectangle(sprite.x, sprite.y, 4, 260, color, 0.9).setOrigin(0.5, 1).setBlendMode('ADD').setDepth(39);
    beam.y = sprite.y + sprite.displayHeight / 2;
    s.tweens.add({ targets: beam, scaleX: 6, alpha: 0, duration: 450, onComplete: () => beam.destroy() });
    this.ring(sprite.x, sprite.y, color, 0.8);
    sprite.setAlpha(0);
    s.tweens.add({ targets: sprite, alpha: 1, duration: 350 });
    audio.sfx('teleport');
  }

  muzzle(x, y, color) {
    this.glow(x, y, color, 0.35, 90);
  }
}

// The final color grade: a saturation and contrast lift so everything pops (WebGL only).
// grade: { saturate, contrast, brightness } per theme (defaults below).
export function gradeCamera(cam, scene, grade = {}) {
  if (scene.renderer.type !== Phaser.WEBGL) return;
  const cm = cam.postFX.addColorMatrix();
  cm.saturate(grade.saturate ?? 0.1);
  cm.contrast(grade.contrast ?? 0.12, true);
  if (grade.brightness) cm.brightness(grade.brightness, true);
}

// A soft ground shadow under an actor or vehicle. It shrinks and fades with height, so
// jumps and flying units read clearly. Returns an updater to call each frame.
export function dropShadow(scene, obj, width) {
  const img = scene.add.image(obj.x, obj.y, 'shadow').setDepth(11).setVisible(false);
  const base = width / 32;
  const update = () => {
    if (!obj.active || !obj.visible || !obj.body) return img.setVisible(false);
    let ground = null;
    for (let i = 0; i < 14 && ground === null; i++) {
      const t = scene.layer.getTileAtWorldXY(obj.x, obj.body.bottom + i * 16);
      if (t?.collides) ground = t.getTop();
    }
    if (ground === null) return img.setVisible(false);
    const hgt = Math.max(0, ground - obj.body.bottom);
    img.setVisible(true).setPosition(obj.x, ground).setAlpha(Math.max(0, 0.7 - hgt / 180)).setScale(base * (1 - Math.min(0.5, hgt / 260)), 1);
  };
  update.destroy = () => img.destroy();
  return update;
}
