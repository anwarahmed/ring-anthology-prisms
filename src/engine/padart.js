// Pictures of known controllers for the CONTROLS screen, drawn in code (our own art,
// never product photos). A layout says where each button sits and what it's called, so
// the screen can name bindings by the button's label ("A", not "BUTTON 2"), outline the
// buttons of the selected action, and light up whatever is pressed.
//
// Button numbers are the ones the browser reports on Linux (the same order as
// RetroArch's udev autoconfig for the device).

// The 8BitDo M30, the light grey one with colorful buttons, in its Mega Drive Mini mode
// (it reports "6B controller", 0ca3:0024, like the SEGA Mega Drive Mini 6B controller):
// a D-pad in a raised ring, small X Y Z over big A B C, a red start pill with three small
// buttons under it, and L and R peeking over the top edge. L and R are
// 6 and 7 (SDL's mapping for this device); the "-" button reports as 8. The other two
// small buttons are drawn for looks.
const M30 = {
  match: /0ca3.*0024|6B controller/i,
  buttons: {
    3: { label: 'X', x: 116.2, y: 42.4, r: 6.2, fill: 0xa4a4a8, ink: '#4a4a50' }, 0: { label: 'Y', x: 131.8, y: 34.6, r: 6.2, fill: 0xa4a4a8, ink: '#4a4a50' }, 4: { label: 'Z', x: 148, y: 30.4, r: 6.2, fill: 0xa4a4a8, ink: '#4a4a50' },
    2: { label: 'A', x: 122.3, y: 61.5, r: 8.2, fill: 0x2a9a3e, ink: '#145a20' }, 1: { label: 'B', x: 139.3, y: 52.8, r: 8.2, fill: 0xf2cc1c, ink: '#7a6408' }, 5: { label: 'C', x: 158, y: 47.1, r: 8.2, fill: 0x2a3cb0, ink: '#101a60' },
    9: { label: 'start', name: 'START', x: 88.6, y: 46, w: 17, h: 6, fill: 0xc8243e, ly: 9.5, ink: '#5a5a62', small: true, dot: true },
    // The middle small button, MODE, reports as 8 (the other two are drawn for looks).
    8: { label: '', name: 'MODE', x: 88.6, y: 64.4, r: 4.6, fill: 0xa8a8ac },
    // Shoulders: red bands along the top edge over each grip (x range).
    6: { label: 'L', x: 42, y: 1, band: [21, 63], fill: 0xb8203c }, 7: { label: 'R', x: 137, y: 1, band: [117, 158], fill: 0xb8203c },
  },
  // The light grey M30 with colorful buttons. Outline and positions measured from a
  // photo of the controller (in the 180 x 104 box).
  outline: [[-1.1, 59.0], [2.2, 42.2], [9.7, 25.5], [17.3, 17.4], [24.9, 11.4], [32.4, 8.7], [40.0, 7.1], [47.6, 7.1], [55.1, 8.2], [62.7, 9.2], [70.3, 13.0], [77.8, 13.6], [85.4, 13.6], [93.0, 13.6], [100.5, 13.6], [108.1, 13.0], [115.7, 9.8], [123.2, 8.2], [130.8, 7.1], [138.4, 7.1], [145.9, 8.2], [153.5, 10.9], [161.1, 16.8], [168.6, 24.4], [176.2, 40.1], [178.9, 50.9], [180.0, 57.9], [178.9, 75.7], [176.2, 84.9], [168.6, 93.6], [161.1, 96.8], [153.5, 98.4], [145.9, 97.9], [138.4, 96.8], [130.8, 94.1], [123.2, 90.3], [115.7, 87.1], [108.1, 84.9], [100.5, 83.3], [93.0, 82.8], [85.4, 82.8], [77.8, 83.3], [70.3, 84.9], [62.7, 87.6], [55.1, 90.9], [47.6, 94.1], [40.0, 96.8], [32.4, 98.4], [24.9, 98.4], [17.3, 96.8], [9.7, 93.0], [2.2, 83.3]],
  look: { body: 0xedebe6, line: 0x2c2c30, ring: 0x8a8884, shadow: 0xbab7b0, plate: 0xe2e0db, disc: 0x232326, dpad: 0x3a3a3e, groove: 0x18181a, small: 0xa8a8ac },
  decor: [{ x: 76.5, y: 64.4, r: 4.6 }, { x: 101, y: 64.4, r: 4.6 }],
  face: { x: 137.5, y: 46, r: 34.7, inner: 29.8 },
  dpadRings: [31.9, 27],
  dpad: { x: 42.5, y: 46, axes: [0, 1] },
};

const LAYOUTS = [M30];
export const PAD_W = 180;
export const PAD_H = 104;
const DIRS = { '0-1': 'LEFT', '01': 'RIGHT', '1-1': 'UP', '11': 'DOWN' };

export function padLayout(id) {
  return (id && LAYOUTS.find((l) => l.match.test(id))) || null;
}

// The name of a binding on this pad, or null to use the generic label.
export function padBindingLabel(layout, binding) {
  if (typeof binding !== 'object') return null;
  if (binding.b !== undefined) { const k = layout.buttons[binding.b]; return k ? k.name ?? k.label : null; }
  const dir = DIRS[`${binding.a}${binding.d > 0 ? 1 : -1}`];
  return binding.a === layout.dpad.axes[0] || binding.a === layout.dpad.axes[1] ? `DPAD ${dir}` : null;
}

// Draws the pad at (ox, oy). selected: bindings of the selected action (outlined);
// pad: the live Phaser Gamepad (pressed buttons and directions light up).
export function drawPad(g, layout, ox, oy, selected = [], pad = null) {
  const on = (b) => selected.some((s) => typeof s === 'object' && s.b === b);
  const axisOn = (a, d) => selected.some((s) => typeof s === 'object' && s.a === a && Math.sign(s.d) === d);
  const pressed = (b) => !!pad?.buttons[b]?.pressed;
  const axis = (a) => pad?.axes[a]?.getValue() ?? 0;
  const SEL = 0x45e6ff;
  const HELD = 0x7fe07f;
  const L = layout.look;
  const rad = (d) => (d * Math.PI) / 180;

  // Body, then the shoulder bands following its top edge over each grip.
  const pts = (dy = 0) => layout.outline.map(([x, y]) => ({ x: ox + x, y: oy + y + dy }));
  g.fillStyle(L.shadow, 1).fillPoints(pts(2), true);
  g.fillStyle(L.body, 1).fillPoints(pts(), true);
  g.lineStyle(1.2, L.line, 1).strokePoints(pts(), true);
  // Thin double rings around the D-pad and the face buttons; the face's inner ring is
  // a slightly darker plate.
  const f = layout.face;
  g.fillStyle(L.plate, 1).fillCircle(ox + f.x, oy + f.y, f.inner);
  g.lineStyle(0.8, L.ring, 1).strokeCircle(ox + f.x, oy + f.y, f.r).strokeCircle(ox + f.x, oy + f.y, f.inner);
  for (const r of layout.dpadRings) g.lineStyle(0.8, L.ring, 1).strokeCircle(ox + layout.dpad.x, oy + layout.dpad.y, r);
  for (const [b, k] of Object.entries(layout.buttons)) {
    if (!k.band) continue;
    const n = Number(b);
    const top = layout.outline.filter(([x, y]) => x >= k.band[0] && x <= k.band[1] && y < 30).sort((p, q) => p[0] - q[0]);
    const strip = [...top.map(([x, y]) => ({ x: ox + x, y: oy + y })), ...top.reverse().map(([x, y]) => ({ x: ox + x, y: oy + y + 5 }))];
    g.fillStyle(pressed(n) ? HELD : k.fill, 1).fillPoints(strip, true);
    if (on(n)) g.lineStyle(2, SEL, 1).strokePoints(strip.map((p) => ({ x: p.x, y: p.y + (p.y > oy + 20 ? 1 : -1) })), true);
  }

  // D-pad: a near-black disc with a grooved cross, corner arrows and a center dimple.
  const d = layout.dpad;
  const [ax, ay] = d.axes;
  const cx = ox + d.x;
  const cy = oy + d.y;
  g.fillStyle(L.disc, 1).fillCircle(cx, cy, 20);
  g.lineStyle(1, L.line, 1).strokeCircle(cx, cy, 20);
  g.fillStyle(L.dpad, 1).fillRoundedRect(cx - 16, cy - 5.5, 32, 11, 2).fillRoundedRect(cx - 5.5, cy - 16, 11, 32, 2);
  g.lineStyle(0.8, L.groove, 1).strokeRoundedRect(cx - 16, cy - 5.5, 32, 11, 2).strokeRoundedRect(cx - 5.5, cy - 16, 11, 32, 2);
  g.fillStyle(L.dpad, 1).fillRect(cx - 5, cy - 5, 10, 10);
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const tx = cx + dx * 11;
    const ty = cy + dy * 11;
    g.fillStyle(0x6a6a70, 1).fillTriangle(tx - 1.5 * dx, ty, tx, ty - 1.5 * dy, tx + 1.2 * dx, ty + 1.2 * dy);
  }
  const arm = (dx, dy, lit, sel) => {
    const x = cx + dx * 10.5 - 5.5;
    const y = cy + dy * 10.5 - 5.5;
    if (lit) g.fillStyle(HELD, 1).fillRoundedRect(x, y, 11, 11, 2);
    if (sel) g.lineStyle(2, SEL, 1).strokeRoundedRect(x - 1, y - 1, 13, 13, 2);
  };
  arm(0, -1, axis(ay) < -0.5, axisOn(ay, -1));
  arm(0, 1, axis(ay) > 0.5, axisOn(ay, 1));
  arm(-1, 0, axis(ax) < -0.5, axisOn(ax, -1));
  arm(1, 0, axis(ax) > 0.5, axisOn(ax, 1));
  g.fillStyle(L.groove, 1).fillCircle(cx, cy, 3);

  // Buttons. Pressed ones flash white with a green ring (A is already green).
  for (const s of layout.decor ?? []) g.fillStyle(L.small, 1).fillCircle(ox + s.x, oy + s.y, s.r).lineStyle(0.8, L.line, 1).strokeCircle(ox + s.x, oy + s.y, s.r);
  for (const [b, k] of Object.entries(layout.buttons)) {
    if (k.band) continue;
    const n = Number(b);
    const x = ox + k.x;
    const y = oy + k.y;
    const fill = pressed(n) ? 0xffffff : k.fill;
    if (k.w) {
      const h = k.h ?? 9;
      g.fillStyle(0xd8d6d0, 1).fillRoundedRect(x - k.w / 2 - 1.5, y - h / 2 - 1.5, k.w + 3, h + 3, h / 2 + 1.5);
      g.lineStyle(0.8, L.line, 1).strokeRoundedRect(x - k.w / 2 - 1.5, y - h / 2 - 1.5, k.w + 3, h + 3, h / 2 + 1.5);
      g.fillStyle(fill, 1).fillRoundedRect(x - k.w / 2, y - h / 2, k.w, h, h / 2);
      if (k.dot) g.fillStyle(fill, 1).fillCircle(x - 12.5, oy + k.y + k.ly + 0.5, 1);
      if (pressed(n)) g.lineStyle(2, HELD, 1).strokeRoundedRect(x - k.w / 2 - 1, y - h / 2 - 1, k.w + 2, h + 2, h / 2 + 1);
      if (on(n)) g.lineStyle(2, SEL, 1).strokeRoundedRect(x - k.w / 2 - 2.5, y - h / 2 - 2.5, k.w + 5, h + 5, h / 2 + 2);
    } else {
      g.fillStyle(0x000000, 0.25).fillCircle(x, y + 1.2, k.r);
      g.fillStyle(fill, 1).fillCircle(x, y, k.r);
      g.lineStyle(0.8, L.line, 1).strokeCircle(x, y, k.r);
      if (k.r > 5) g.fillStyle(0xffffff, pressed(n) ? 0 : 0.18).fillCircle(x - k.r / 3, y - k.r / 3, k.r / 3);
      if (pressed(n)) g.lineStyle(2, HELD, 1).strokeCircle(x, y, k.r + 1);
      if (on(n)) g.lineStyle(2, SEL, 1).strokeCircle(x, y, k.r + 2.5);
    }
  }
}

// Button letters (Text objects) for drawPad, made once per layout.
export function padLabels(scene, layout, ox, oy, txt) {
  return Object.values(layout.buttons).map((k) => txt(scene, ox + k.x, oy + k.y + (k.ly ?? 0.5), k.label, k.small ? { font: 'read', size: 12, color: k.ink, stroke: false } : k.tiny ? { font: 'read', size: 8, color: k.ink, stroke: false } : { size: 8, color: k.ink ?? '#ffffff', stroke: !k.ink }).setOrigin(0.5));
}
