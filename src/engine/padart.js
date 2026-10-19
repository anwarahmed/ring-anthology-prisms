// Pictures of known controllers for the CONTROLS screen, drawn in code (our own art,
// never product photos). A layout says where each button sits and what it's called, so
// the screen can name bindings by the button's label ("A", not "BUTTON 2"), outline the
// buttons of the selected action, and light up whatever is pressed.
//
// Button numbers are the ones the browser reports on Linux (the same order as
// RetroArch's udev autoconfig for the device).

// The 8BitDo M30 in its Mega Drive Mini mode (it reports "6B controller", 0ca3:0024,
// like the SEGA Mega Drive Mini 6B controller): D-pad, small X Y Z over big A B C, START
// at the top, three small buttons under it, and L and R on the top edge. L and R are
// 6 and 7 (SDL's mapping for this device); the "-" button reports as 8. The other two
// small buttons are drawn for looks.
const M30 = {
  match: /0ca3.*0024|6B controller/i,
  buttons: {
    3: { label: 'X', x: 120, y: 40, r: 6 }, 0: { label: 'Y', x: 135, y: 33, r: 6 }, 4: { label: 'Z', x: 150, y: 31, r: 6 },
    2: { label: 'A', x: 122, y: 63, r: 8 }, 1: { label: 'B', x: 139, y: 57, r: 8 }, 5: { label: 'C', x: 156, y: 51, r: 8 },
    9: { label: 'START', x: 88, y: 30, w: 38 },
    8: { label: '-', name: 'SELECT', x: 78, y: 70, r: 4 },
    6: { label: 'L', x: 42, y: 13, w: 36, shoulder: true }, 7: { label: 'R', x: 138, y: 13, w: 36, shoulder: true },
  },
  decor: [{ x: 88, y: 70, r: 4 }, { x: 98, y: 70, r: 4 }],
  dpad: { x: 44, y: 56, axes: [0, 1] },
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

  // Shoulder buttons (behind the body's top edge), then the body: two round grips
  // joined by a wide middle, with a face plate behind the buttons.
  for (const [b, k] of Object.entries(layout.buttons)) {
    if (!k.shoulder) continue;
    const n = Number(b);
    g.fillStyle(pressed(n) ? HELD : 0x4a4f5c, 1).fillRoundedRect(ox + k.x - k.w / 2, oy + k.y - 6, k.w, 14, 5);
    if (on(n)) g.lineStyle(2, SEL, 1).strokeRoundedRect(ox + k.x - k.w / 2 - 1, oy + k.y - 7, k.w + 2, 16, 6);
  }
  g.fillStyle(0x1a1c22, 1).fillEllipse(ox + 44, oy + 58, 88, 90).fillEllipse(ox + 136, oy + 58, 88, 90)
    .fillRoundedRect(ox + 44, oy + 16, 92, 86, 20);
  g.fillStyle(0x34373f, 1).fillEllipse(ox + 44, oy + 57, 82, 84).fillEllipse(ox + 136, oy + 57, 82, 84)
    .fillRoundedRect(ox + 44, oy + 17, 92, 80, 18);
  g.fillStyle(0x3e424c, 1).fillEllipse(ox + 138, oy + 48, 62, 54);
  g.lineStyle(1, 0x5a6070, 0.9).strokeEllipse(ox + 138, oy + 48, 62, 54);
  g.fillStyle(0x2a2d34, 1).fillCircle(ox + 44, oy + 56, 24);

  // D-pad.
  const d = layout.dpad;
  const [ax, ay] = d.axes;
  const cx = ox + d.x;
  const cy = oy + d.y;
  g.fillStyle(0x22242b, 1).fillCircle(cx, cy, 20);
  const arm = (dx, dy, lit, sel) => {
    const x = cx + dx * 10 - 5;
    const y = cy + dy * 10 - 5;
    g.fillStyle(lit ? HELD : 0x121318, 1).fillRect(x, y, 10, 10);
    if (sel) g.lineStyle(2, SEL, 1).strokeRect(x - 1, y - 1, 12, 12);
  };
  g.fillStyle(0x121318, 1).fillRect(cx - 5, cy - 5, 10, 10);
  arm(0, -1, axis(ay) < -0.5, axisOn(ay, -1));
  arm(0, 1, axis(ay) > 0.5, axisOn(ay, 1));
  arm(-1, 0, axis(ax) < -0.5, axisOn(ax, -1));
  arm(1, 0, axis(ax) > 0.5, axisOn(ax, 1));

  // Buttons.
  for (const d of layout.decor ?? []) g.fillStyle(0x121318, 1).fillCircle(ox + d.x, oy + d.y, d.r);
  for (const [b, k] of Object.entries(layout.buttons)) {
    if (k.shoulder) continue;
    const n = Number(b);
    const x = ox + k.x;
    const y = oy + k.y;
    const fill = pressed(n) ? HELD : 0x16171c;
    if (k.w) {
      g.fillStyle(fill, 1).fillRoundedRect(x - k.w / 2, y - 6, k.w, 12, 6);
      if (on(n)) g.lineStyle(2, SEL, 1).strokeRoundedRect(x - k.w / 2 - 1, y - 7, k.w + 2, 14, 7);
    } else {
      g.fillStyle(0x0c0d10, 1).fillCircle(x, y + 1, k.r + 0.5);
      g.fillStyle(fill, 1).fillCircle(x, y, k.r);
      if (k.r > 5) g.fillStyle(0xffffff, pressed(n) ? 0 : 0.12).fillCircle(x - k.r / 4, y - k.r / 4, k.r / 2.5);
      if (on(n)) g.lineStyle(2, SEL, 1).strokeCircle(x, y, k.r + 2);
    }
  }
}

// Button letters (Text objects) for drawPad, made once per layout.
export function padLabels(scene, layout, ox, oy, txt) {
  return Object.values(layout.buttons).map((k) => txt(scene, ox + k.x, oy + k.y + (k.shoulder ? -3 : 0.5), k.label, { size: 8, color: k.w ? '#9aa4c8' : '#d8dce8' }).setOrigin(0.5));
}
