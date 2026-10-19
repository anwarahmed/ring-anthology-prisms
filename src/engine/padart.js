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
    3: { label: 'X', x: 114.6, y: 44.9, r: 6.2, fill: 0x6e6e74 }, 0: { label: 'Y', x: 130.3, y: 37.4, r: 6.2, fill: 0x6e6e74 }, 4: { label: 'Z', x: 147, y: 33, r: 6.2, fill: 0x6e6e74 },
    2: { label: 'A', x: 121.1, y: 64.4, r: 8.1, fill: 0x2fae4c }, 1: { label: 'B', x: 138.4, y: 54.6, r: 8.1, fill: 0xf0c218 }, 5: { label: 'C', x: 156.8, y: 49.2, r: 8.1, fill: 0x2a4ad8 },
    9: { label: 'start', name: 'START', x: 88.6, y: 47.6, w: 14, h: 4, fill: 0xd0254c, ly: 7, ink: '#7a7a82', small: true },
    8: { label: '-', name: 'SELECT', x: 75.1, y: 66.5, r: 4.8, fill: 0xe6e3dd, ink: '#7a7a82' },
    // Shoulders: red bands along the top edge over each grip (x range).
    6: { label: 'L', x: 43, y: 1, band: [23, 63], fill: 0xc8234a }, 7: { label: 'R', x: 137, y: 1, band: [117, 157], fill: 0xc8234a },
  },
  // The light grey M30 with colorful buttons. Outline and positions measured from a
  // photo of the controller (in the 180 x 104 box).
  outline: [[-1.1, 59.0], [2.2, 42.2], [9.7, 25.5], [17.3, 17.4], [24.9, 11.4], [32.4, 8.7], [40.0, 7.1], [47.6, 7.1], [55.1, 8.2], [62.7, 9.2], [70.3, 13.0], [77.8, 13.6], [85.4, 13.6], [93.0, 13.6], [100.5, 13.6], [108.1, 13.0], [115.7, 9.8], [123.2, 8.2], [130.8, 7.1], [138.4, 7.1], [145.9, 8.2], [153.5, 10.9], [161.1, 16.8], [168.6, 24.4], [176.2, 40.1], [178.9, 50.9], [180.0, 57.9], [178.9, 75.7], [176.2, 84.9], [168.6, 93.6], [161.1, 96.8], [153.5, 98.4], [145.9, 97.9], [138.4, 96.8], [130.8, 94.1], [123.2, 90.3], [115.7, 87.1], [108.1, 84.9], [100.5, 83.3], [93.0, 82.8], [85.4, 82.8], [77.8, 83.3], [70.3, 84.9], [62.7, 87.6], [55.1, 90.9], [47.6, 94.1], [40.0, 96.8], [32.4, 98.4], [24.9, 98.4], [17.3, 96.8], [9.7, 93.0], [2.2, 83.3]],
  look: { body: 0xebe9e4, edge: 0xa8a59e, shadow: 0x8a877f, ring: 0xe0ddd7, disc: 0x4c4e54, dpad: 0x2a2c31, small: 0xe6e3dd },
  decor: [{ x: 89.2, y: 66.5, r: 4.8 }, { x: 103.2, y: 66.5, r: 4.8 }],
  face: { x: 136, y: 50, r: 34 },
  dpad: { x: 43.8, y: 47.6, axes: [0, 1] },
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
  g.lineStyle(1, L.edge, 1).strokePoints(pts(), true);
  for (const [b, k] of Object.entries(layout.buttons)) {
    if (!k.band) continue;
    const n = Number(b);
    const top = layout.outline.filter(([x, y]) => x >= k.band[0] && x <= k.band[1] && y < 30).sort((p, q) => p[0] - q[0]);
    const strip = [...top.map(([x, y]) => ({ x: ox + x, y: oy + y })), ...top.reverse().map(([x, y]) => ({ x: ox + x, y: oy + y + 5 }))];
    g.fillStyle(pressed(n) ? HELD : k.fill, 1).fillPoints(strip, true);
    if (on(n)) g.lineStyle(2, SEL, 1).strokePoints(strip.map((p) => ({ x: p.x, y: p.y + (p.y > oy + 20 ? 1 : -1) })), true);
  }

  // D-pad: a dark disc in a raised ring, with a cross and a center dimple.
  const d = layout.dpad;
  const [ax, ay] = d.axes;
  const cx = ox + d.x;
  const cy = oy + d.y;
  g.fillStyle(L.ring, 1).fillCircle(cx, cy, 26);
  g.lineStyle(1, L.edge, 0.6).strokeCircle(cx, cy, 26);
  g.fillStyle(L.shadow, 1).fillCircle(cx, cy + 1, 19);
  g.fillStyle(L.disc, 1).fillCircle(cx, cy, 19);
  g.fillStyle(L.dpad, 1).fillRoundedRect(cx - 15, cy - 5, 30, 10, 2).fillRoundedRect(cx - 5, cy - 15, 10, 30, 2);
  const arm = (dx, dy, lit, sel) => {
    const x = cx + dx * 10 - 5;
    const y = cy + dy * 10 - 5;
    if (lit) g.fillStyle(HELD, 1).fillRoundedRect(x, y, 10, 10, 2);
    if (sel) g.lineStyle(2, SEL, 1).strokeRoundedRect(x - 1, y - 1, 12, 12, 2);
  };
  arm(0, -1, axis(ay) < -0.5, axisOn(ay, -1));
  arm(0, 1, axis(ay) > 0.5, axisOn(ay, 1));
  arm(-1, 0, axis(ax) < -0.5, axisOn(ax, -1));
  arm(1, 0, axis(ax) > 0.5, axisOn(ax, 1));
  g.fillStyle(0x3d3f45, 1).fillCircle(cx, cy, 3);

  // A faint raised ring around the face buttons.
  if (layout.face) g.lineStyle(1, L.edge, 0.45).strokeCircle(ox + layout.face.x, oy + layout.face.y, layout.face.r);

  // Buttons. Pressed ones flash white with a green ring (A is already green).
  for (const s of layout.decor ?? []) g.fillStyle(L.small, 1).fillCircle(ox + s.x, oy + s.y, s.r).lineStyle(1, L.edge, 1).strokeCircle(ox + s.x, oy + s.y, s.r);
  for (const [b, k] of Object.entries(layout.buttons)) {
    if (k.band) continue;
    const n = Number(b);
    const x = ox + k.x;
    const y = oy + k.y;
    const fill = pressed(n) ? 0xffffff : k.fill;
    if (k.w) {
      const h = k.h ?? 9;
      g.fillStyle(L.shadow, 1).fillRoundedRect(x - k.w / 2, y - h / 2 + 1, k.w, h, h / 2);
      g.fillStyle(fill, 1).fillRoundedRect(x - k.w / 2, y - h / 2, k.w, h, h / 2);
      if (pressed(n)) g.lineStyle(2, HELD, 1).strokeRoundedRect(x - k.w / 2 - 1, y - h / 2 - 1, k.w + 2, h + 2, h / 2 + 1);
      if (on(n)) g.lineStyle(2, SEL, 1).strokeRoundedRect(x - k.w / 2 - 2.5, y - h / 2 - 2.5, k.w + 5, h + 5, h / 2 + 2);
    } else {
      g.fillStyle(L.shadow, 1).fillCircle(x, y + 1.2, k.r);
      g.fillStyle(fill, 1).fillCircle(x, y, k.r);
      if (k.r > 5) g.fillStyle(0xffffff, pressed(n) ? 0 : 0.18).fillCircle(x - k.r / 3, y - k.r / 3, k.r / 3);
      if (pressed(n)) g.lineStyle(2, HELD, 1).strokeCircle(x, y, k.r + 1);
      if (on(n)) g.lineStyle(2, SEL, 1).strokeCircle(x, y, k.r + 2.5);
    }
  }
}

// Button letters (Text objects) for drawPad, made once per layout.
export function padLabels(scene, layout, ox, oy, txt) {
  return Object.values(layout.buttons).map((k) => txt(scene, ox + k.x, oy + k.y + (k.ly ?? 0.5), k.label, k.small ? { font: 'read', size: 12, color: k.ink, stroke: false } : { size: 8, color: k.ink ?? '#ffffff' }).setOrigin(0.5));
}
