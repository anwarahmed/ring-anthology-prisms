// Text and small UI helpers. Two bundled OFL fonts: 'Press Start 2P' for titles and
// labels, 'VT323' for reading text (Archive cards, subtitles).

export const FONT = { pixel: '"Press Start 2P"', read: 'VT323' };

export function txt(scene, x, y, str, { size = 8, color = '#ffffff', font = 'pixel', align = 'left', wrap = 0, stroke = true } = {}) {
  const t = scene.add.text(x, y, str, {
    fontFamily: FONT[font],
    fontSize: `${size}px`,
    color,
    align,
    wordWrap: wrap ? { width: wrap } : undefined,
    stroke: stroke ? '#000000' : undefined,
    strokeThickness: stroke ? (font === 'pixel' ? 2 : 3) : 0,
    lineSpacing: font === 'read' ? -2 : 3,
  });
  t.setResolution(1);
  return t;
}

export function bar(g, x, y, w, h, frac, color, back = 0x000000) {
  g.fillStyle(back, 0.6).fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle(color, 1).fillRect(x, y, Math.max(0, Math.round(w * Math.min(1, frac))), h);
  g.fillStyle(0xffffff, 0.35).fillRect(x, y, Math.max(0, Math.round(w * Math.min(1, frac))), 1);
}
