// Heads-up display over a level: shields, health, weapon, ability, objectives,
// subtitles, timers, medals, boss intros and the boss bar.

import Phaser from 'phaser';
import { VIEW } from '../engine/config.js';
import { txt, bar } from '../engine/ui.js';
import { hexNum } from '../engine/textures.js';

export class HudScene extends Phaser.Scene {
  constructor() {
    super('Hud');
  }

  init(data) {
    this.level = data.level;
  }

  create() {
    const era = this.level.era;
    this.color = era.color;
    this.g = this.add.graphics();
    this.panels = this.level.players.map((p, i) => {
      const right = i === 1;
      const x = right ? VIEW.w - 8 : 8;
      return {
        p,
        right,
        name: txt(this, x, 6, `P${i + 1} ${p.def.name.toUpperCase()}`, { size: 8, color: era.css }).setOrigin(right ? 1 : 0, 0),
        weapon: txt(this, x, 30, '', { size: 8 }).setOrigin(right ? 1 : 0, 0),
        kit: txt(this, x, 41, '', { size: 8, color: '#bbbbbb' }).setOrigin(right ? 1 : 0, 0),
      };
    });
    this.objectiveText = txt(this, VIEW.w / 2, 62, '', { size: 8, align: 'center' }).setOrigin(0.5, 0).setAlpha(0);
    this.subtitle = txt(this, VIEW.w / 2, VIEW.h - 14, '', { font: 'read', size: 16, align: 'center', wrap: VIEW.w - 60 }).setOrigin(0.5, 1).setAlpha(0);
    this.timerText = txt(this, VIEW.w / 2, 74, '', { size: 8, color: '#ffd27a' }).setOrigin(0.5, 0);
    this.timerEnd = null;
    this.boss = null;
    this.bossName = txt(this, VIEW.w / 2, VIEW.h - 30, '', { size: 8, color: '#ff6a6a' }).setOrigin(0.5, 1);
    this.bars = [this.add.rectangle(0, 0, VIEW.w, 0, 0x000000).setOrigin(0, 0).setDepth(50),
      this.add.rectangle(0, VIEW.h, VIEW.w, 0, 0x000000).setOrigin(0, 1).setDepth(50)];
    this.level.events.emit('hud-ready');
  }

  update() {
    const g = this.g;
    g.clear();
    for (const pn of this.panels) {
      const p = pn.p;
      const w = 90;
      const x = pn.right ? VIEW.w - 8 - w : 8;
      const sf = p.shields / p.stats.shields;
      const flash = sf <= 0 && Math.floor(this.time.now / 200) % 2 === 0;
      bar(g, x, 17, w, 5, sf, flash ? 0xff3030 : this.color);
      bar(g, x, 24, w, 3, p.health / p.stats.health, p.health / p.stats.health < 0.35 ? 0xff5050 : 0x7fe07f);
      const wpn = p.current;
      pn.weapon.setText(wpn.def.name.toUpperCase());
      const k = p.kit.hud();
      pn.kit.setText(k.label.toUpperCase());
      pn.kit.setColor(k.ready >= 1 || k.active ? '#ffffff' : '#777777');
      const kx = pn.right ? VIEW.w - 8 - 40 : 8;
      bar(g, kx, 52, 40, 2, k.ready, k.active ? 0xffffff : this.color);
      pn.name.setAlpha(p.alive ? 1 : 0.4);
    }
    if (this.timerEnd) {
      const left = Math.max(0, Math.ceil((this.timerEnd - this.time.now) / 1000));
      this.timerText.setText(`${this.timerLabel} ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`);
    }
    if (this.boss) {
      if (!this.boss.alive) {
        this.boss = null;
        this.bossName.setText('');
      } else {
        const b = this.boss;
        bar(g, VIEW.w / 2 - 100, VIEW.h - 26, 200, 4, b.shields / Math.max(1, b.stats.shields), this.color);
        bar(g, VIEW.w / 2 - 100, VIEW.h - 20, 200, 5, b.health / b.stats.health, 0xff4040);
      }
    }
  }

  objective(text) {
    this.objectiveText.setText(text.toUpperCase()).setAlpha(1);
    this.tweens.killTweensOf(this.objectiveText);
    this.tweens.add({ targets: this.objectiveText, alpha: 0.55, delay: 4000, duration: 800 });
  }

  // Canon dialogue or neutral narration only (docs/CAMPAIGN.md, the canon rule).
  say(text, who, source, time) {
    const line = who ? `${who}: ${text}` : text;
    this.subtitle.setText(line).setAlpha(1);
    const ms = (time ?? Math.max(2.5, line.length / 14)) * 1000;
    this.tweens.killTweensOf(this.subtitle);
    return new Promise((res) => {
      this.tweens.add({ targets: this.subtitle, alpha: 0, delay: ms, duration: 400, onComplete: res });
    });
  }

  timer(label, seconds) {
    if (!label) {
      this.timerEnd = null;
      this.timerText.setText('');
      return;
    }
    this.timerLabel = label;
    this.timerEnd = this.time.now + seconds * 1000;
  }

  announce(text, color = '#ffffff', big = false) {
    const t = txt(this, VIEW.w / 2, VIEW.h * 0.42, text, { size: big ? 16 : 8, color }).setOrigin(0.5).setScale(2).setAlpha(0);
    this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 180, ease: 'Back.Out' });
    this.tweens.add({ targets: t, alpha: 0, y: t.y - 14, delay: 1300, duration: 500, onComplete: () => t.destroy() });
  }

  go() {
    const t = txt(this, VIEW.w - 30, VIEW.h / 2, 'GO >', { size: 16, color: this.level.era.css }).setOrigin(1, 0.5);
    this.tweens.add({ targets: t, x: VIEW.w - 20, duration: 300, yoyo: true, repeat: 4, onComplete: () => t.destroy() });
  }

  letterbox(on) {
    this.tweens.add({ targets: this.bars, height: on ? 34 : 0, duration: 500, ease: 'Cubic.InOut' });
  }

  // A cinematic title card. Resolves when the boss should appear.
  bossIntro(title, subtitle) {
    this.letterbox(true);
    const c = this.level.era.css;
    const t1 = txt(this, -200, VIEW.h / 2 - 12, title.toUpperCase(), { size: 16, color: '#ffffff' }).setOrigin(0.5);
    const t2 = txt(this, VIEW.w + 200, VIEW.h / 2 + 12, subtitle.toUpperCase(), { size: 8, color: c }).setOrigin(0.5);
    const line = this.add.rectangle(VIEW.w / 2, VIEW.h / 2, 0, 1, hexNum(c)).setOrigin(0.5);
    this.tweens.add({ targets: t1, x: VIEW.w / 2, duration: 600, ease: 'Cubic.Out' });
    this.tweens.add({ targets: t2, x: VIEW.w / 2, duration: 600, delay: 150, ease: 'Cubic.Out' });
    this.tweens.add({ targets: line, width: 260, duration: 700, delay: 100 });
    return new Promise((res) => {
      this.time.delayedCall(2600, () => {
        this.tweens.add({ targets: [t1, t2, line], alpha: 0, duration: 400, onComplete: () => [t1, t2, line].forEach((o) => o.destroy()) });
        this.letterbox(false);
        res();
      });
    });
  }

  bossBar(unit) {
    this.boss = unit;
    this.bossName.setText(unit.def.name.toUpperCase());
  }
}
