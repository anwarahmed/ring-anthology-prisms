// Shared art for the menu screens, matching the in-game look: a painted space backdrop
// with era-colored nebulae, ornate panels, gradient headers with flourishes, era
// emblems and a glowing selection bar. All original shapes (no official symbols).

import { VIEW, ERAS } from './config.js';
import { spaceSky, logoText } from './titleart.js';
import { vignette } from './scenery.js';
import { baseTextures } from './textures.js';

const shade = (c, k) => {
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return (f(c >> 16) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255);
};
const css = (c) => `#${c.toString(16).padStart(6, '0')}`;

// Painted nebula sky, twinkling stars, drifting era-colored glows and a vignette.
// Returns the glows so a screen can recolor them (setTint) when the era changes.
export function menuBackdrop(scene, color = 0x45e6ff) {
  baseTextures(scene);
  scene.add.image(0, 0, spaceSky(scene)).setOrigin(0);
  const glows = [[90, 60, 7], [390, 200, 9], [300, 40, 5]].map(([x, y, s], i) => {
    const g = scene.add.image(x, y, 'glow').setTint(color).setBlendMode('ADD').setScale(s).setAlpha(0.22);
    scene.tweens.add({ targets: g, x: x + (i % 2 ? -30 : 30), alpha: 0.32, duration: 6000 + i * 1500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return g;
  });
  for (let i = 0; i < 18; i++) {
    const st = scene.add.image(Math.random() * VIEW.w, Math.random() * VIEW.h * 0.85, 'px')
      .setTint([0xffffff, 0xbfe6ff, 0xffd8f0][i % 3]).setBlendMode('ADD').setAlpha(0).setScale(i % 5 ? 0.5 : 1);
    scene.tweens.add({ targets: st, alpha: 1, duration: 600 + Math.random() * 900, yoyo: true, repeat: -1, delay: Math.random() * 2000 });
  }
  // Just above the sky, below the screen's content.
  vignette(scene).setDepth(0);
  return glows;
}

// A framed panel: drop shadow, dark gradient body, double border in the accent color,
// gem corners and a top highlight.
export function ornatePanel(scene, x, y, w, h, color = 0x45e6ff, { alpha = 0.9, depth = 0 } = {}) {
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(0x000000, 0.45).fillRoundedRect(x + 3, y + 4, w, h, 6);
  g.fillGradientStyle(0x14103a, 0x14103a, 0x05030f, 0x05030f, alpha, alpha, alpha, alpha).fillRect(x + 2, y + 2, w - 4, h - 4);
  g.lineStyle(2, shade(color, 0.45), 1).strokeRoundedRect(x, y, w, h, 6);
  g.lineStyle(1, color, 0.95).strokeRoundedRect(x + 3, y + 3, w - 6, h - 6, 4);
  g.lineStyle(1, 0xffffff, 0.18).lineBetween(x + 10, y + 5, x + w - 10, y + 5);
  for (const [cx, cy] of [[x + 3, y + 3], [x + w - 3, y + 3], [x + 3, y + h - 3], [x + w - 3, y + h - 3]]) {
    g.fillStyle(shade(color, 0.5), 1).fillPoints([{ x: cx, y: cy - 5 }, { x: cx + 5, y: cy }, { x: cx, y: cy + 5 }, { x: cx - 5, y: cy }], true);
    g.fillStyle(color, 1).fillPoints([{ x: cx, y: cy - 3 }, { x: cx + 3, y: cy }, { x: cx, y: cy + 3 }, { x: cx - 3, y: cy }], true);
    g.fillStyle(0xffffff, 0.9).fillRect(cx - 0.5, cy - 1.5, 1, 1);
  }
  const mx = x + w / 2;
  g.fillStyle(color, 1).fillPoints([{ x: mx - 8, y }, { x: mx, y: y - 4 }, { x: mx + 8, y }, { x: mx, y: y + 3 }], true);
  return g;
}

// A gradient title (white into the accent color) with flourished lines either side.
export function header(scene, text, y, color = 0x45e6ff, size = 16) {
  const key = `hdr-${size}-${color.toString(16)}-${text}`;
  const img = scene.add.image(VIEW.w / 2, y, logoText(scene, key, text, size, ['#ffffff', css(shade(color, 1.35)), css(color)])).setOrigin(0.5);
  const g = scene.add.graphics();
  const half = img.width / 2 + 10;
  const len = Math.min(70, VIEW.w / 2 - half - 18);
  for (const s of len >= 12 ? [-1, 1] : []) {
    const x0 = VIEW.w / 2 + s * half, x1 = VIEW.w / 2 + s * (half + len);
    g.lineStyle(1, color, 0.9).lineBetween(x0, y, x1, y);
    g.lineStyle(1, color, 0.4).lineBetween(x0 + s * 6, y + 3, x1 - s * 12, y + 3);
    g.fillStyle(color, 1).fillPoints([{ x: x0, y: y - 3 }, { x: x0 + s * 3, y }, { x: x0, y: y + 3 }, { x: x0 - s * 3, y }], true);
    g.fillStyle(0xffffff, 0.9).fillCircle(x1, y, 1.2);
  }
  return { img, g, destroy() { img.destroy(); g.destroy(); } };
}

// An era emblem: Forerunner nested triangles, Covenant crescent and orb, Created
// hexagon and core, Banished spiked crown. size is the emblem's radius.
export function emblem(scene, era, x, y, size = 8) {
  const c = ERAS[era]?.color ?? 0x888888;
  const g = scene.add.graphics({ x, y });
  const s = size;
  g.fillStyle(shade(c, 0.35), 1).fillCircle(0, 0, s + 2);
  g.lineStyle(1, c, 1).strokeCircle(0, 0, s + 2);
  g.fillStyle(c, 1);
  if (era === 'forerunner') {
    g.fillTriangle(0, -s, s * 0.9, s * 0.6, -s * 0.9, s * 0.6);
    g.fillStyle(shade(c, 0.35), 1).fillTriangle(0, -s * 0.35, s * 0.4, s * 0.35, -s * 0.4, s * 0.35);
  } else if (era === 'covenant') {
    g.fillCircle(0, 0, s * 0.8);
    g.fillStyle(shade(c, 0.35), 1).fillCircle(s * 0.3, -s * 0.2, s * 0.65);
    g.fillStyle(0xffffff, 0.9).fillCircle(-s * 0.15, s * 0.1, s * 0.18);
  } else if (era === 'created') {
    const hex = Array.from({ length: 6 }, (_, i) => ({ x: Math.cos(i * Math.PI / 3) * s * 0.85, y: Math.sin(i * Math.PI / 3) * s * 0.85 }));
    g.fillPoints(hex, true);
    g.fillStyle(shade(c, 0.35), 1).fillCircle(0, 0, s * 0.45);
    g.fillStyle(0xffffff, 0.95).fillCircle(0, 0, s * 0.2);
  } else {
    g.fillPoints([{ x: -s * 0.8, y: s * 0.5 }, { x: -s * 0.8, y: -s * 0.3 }, { x: -s * 0.4, y: 0 }, { x: 0, y: -s * 0.8 }, { x: s * 0.4, y: 0 }, { x: s * 0.8, y: -s * 0.3 }, { x: s * 0.8, y: s * 0.5 }], true);
    g.fillStyle(shade(c, 0.35), 1).fillRect(-s * 0.5, s * 0.15, s, s * 0.15);
  }
  g.fillStyle(0xffffff, 0.35).fillCircle(-s * 0.5, -s * 0.6, s * 0.2);
  return g;
}

// A glowing selection bar that glides between rows: soft light fading out at both
// ends, bright edge lines, a chevron and a sheen that sweeps across.
export function selectBar(scene, color = 0x45e6ff, depth = 0) {
  const g = scene.add.graphics().setBlendMode('ADD').setDepth(depth);
  const sheen = scene.add.rectangle(0, 0, 18, 10, 0xffffff, 0.22).setBlendMode('ADD').setDepth(depth).setVisible(false);
  const bar = {
    g, sheen, color, w: 0, h: 0, x: 0, y: 0,
    draw() {
      const { w, h } = this;
      const c = this.color;
      g.clear();
      g.fillGradientStyle(c, c, c, c, 0, 0.5, 0, 0.5).fillRect(0, 0, w / 2, h);
      g.fillGradientStyle(c, c, c, c, 0.5, 0, 0.5, 0).fillRect(w / 2, 0, w / 2, h);
      g.fillGradientStyle(c, c, c, c, 0, 0.9, 0, 0.9).fillRect(0, 0, w / 2, 1);
      g.fillGradientStyle(c, c, c, c, 0.9, 0, 0.9, 0).fillRect(w / 2, 0, w / 2, 1);
      g.fillGradientStyle(c, c, c, c, 0, 0.6, 0, 0.6).fillRect(0, h - 1, w / 2, 1);
      g.fillGradientStyle(c, c, c, c, 0.6, 0, 0.6, 0).fillRect(w / 2, h - 1, w / 2, 1);
      g.fillStyle(0xffffff, 0.9).fillTriangle(4, h / 2 - 3, 8, h / 2, 4, h / 2 + 3);
      sheen.setSize(18, h);
    },
    place(x, y, w, h) {
      const first = this.w === 0;
      if (w !== this.w || h !== this.h) { this.w = w; this.h = h; this.draw(); }
      this.x = x; this.y = y;
      scene.tweens.killTweensOf(g);
      if (first) g.setPosition(x, y);
      else scene.tweens.add({ targets: g, x, y, duration: 110, ease: 'Quad.Out' });
      sheen.setVisible(true);
      return this;
    },
    setColor(c) { this.color = c; this.draw(); return this; },
    setVisible(v) { g.setVisible(v); sheen.setVisible(v); return this; },
  };
  scene.tweens.add({ targets: g, alpha: 0.7, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  scene.time.addEvent({
    delay: 16, loop: true, callback: () => {
      const t = (scene.time.now % 1600) / 1600;
      sheen.setPosition(g.x + t * (bar.w + 40) - 20, g.y + bar.h / 2).setAlpha(Math.sin(t * Math.PI) * 0.25);
    },
  });
  return bar;
}
