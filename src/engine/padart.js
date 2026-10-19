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
    3: { label: 'X', x: 114, y: 43, r: 6.5, fill: 0x8e8e94 }, 0: { label: 'Y', x: 129, y: 36, r: 6.5, fill: 0x8e8e94 }, 4: { label: 'Z', x: 144, y: 31, r: 6.5, fill: 0x8e8e94 },
    2: { label: 'A', x: 121, y: 62, r: 8.5, fill: 0x2fae4c }, 1: { label: 'B', x: 137, y: 54, r: 8.5, fill: 0xf0c218 }, 5: { label: 'C', x: 153, y: 47, r: 8.5, fill: 0x2a4ad8 },
    9: { label: 'start', name: 'START', x: 90, y: 46, w: 18, fill: 0xd0254c, ly: 8, ink: '#7a7a82', small: true },
    8: { label: '-', name: 'SELECT', x: 77, y: 66, r: 5, fill: 0xe2dfd9, ink: '#6a6a70' },
    // Shoulders: red strips along the top edge, toward the middle.
    6: { label: 'L', x: 58, y: 1, strip: 38, fill: 0xc8234a }, 7: { label: 'R', x: 122, y: 1, strip: 38, fill: 0xc8234a },
  },
  // The light grey M30 with colorful buttons.
  look: { body: 0xeceae5, edge: 0xa8a59e, shadow: 0x8a877f, ring: 0xdedbd5, square: 0x56585e, dpad: 0x2f3136, small: 0xe2dfd9 },
  decor: [{ x: 90, y: 66, r: 5 }, { x: 103, y: 66, r: 5 }],
  face: { x: 134, y: 47, r: 30 },
  dpad: { x: 43, y: 52, axes: [0, 1] },
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

// The M30's outline: two round grips, a top edge that dips a little between them and a
// scooped notch along the bottom. inset shrinks it (for the rim and the face).
function bodyOutline(ox, oy, inset = 0) {
  const r = 44 - inset;
  const cy = oy + 56;
  const lx = ox + 44;
  const rx = ox + 136;
  const pts = [];
  const arc = (cx, a0, a1) => {
    for (let k = 0; k <= 24; k++) {
      const a = ((a0 + ((a1 - a0) * k) / 24) * Math.PI) / 180;
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
  };
  const curve = (p0, c, p1) => {
    for (let k = 1; k < 16; k++) {
      const t = k / 16;
      pts.push({ x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * c.x + t * t * p1.x, y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * c.y + t * t * p1.y });
    }
  };
  const at = (cx, deg) => ({ x: cx + r * Math.cos((deg * Math.PI) / 180), y: cy + r * Math.sin((deg * Math.PI) / 180) });
  arc(lx, 60, 300);
  curve(at(lx, 300), { x: ox + 90, y: cy - r - 2 }, at(rx, 240));
  arc(rx, 240, 480);
  curve(at(rx, 120), { x: ox + 90, y: cy + r * 0.62 }, at(lx, 60));
  return pts;
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

  // Shoulders: red strips peeking above the top edge, behind the body.
  for (const [b, k] of Object.entries(layout.buttons)) {
    if (!k.strip) continue;
    const n = Number(b);
    const x = ox + k.x - k.strip / 2;
    if (on(n)) g.lineStyle(2, SEL, 1).strokeRoundedRect(x - 2, oy + 6, k.strip + 4, 11, 4);
    g.fillStyle(pressed(n) ? HELD : k.fill, 1).fillRoundedRect(x, oy + 8, k.strip, 8, 3);
  }

  // Body.
  g.fillStyle(L.shadow, 1).fillPoints(bodyOutline(ox, oy + 3), true);
  g.fillStyle(L.edge, 1).fillPoints(bodyOutline(ox, oy), true);
  g.fillStyle(L.body, 1).fillPoints(bodyOutline(ox, oy - 0.5, 2), true);

  // D-pad: a big dark disc with a rounded cross and a center dimple.
  const d = layout.dpad;
  const [ax, ay] = d.axes;
  const cx = ox + d.x;
  const cy = oy + d.y;
  g.fillStyle(L.ring, 1).fillCircle(cx, cy, 28);
  g.lineStyle(1, L.edge, 0.7).strokeCircle(cx, cy, 28);
  g.fillStyle(L.shadow, 1).fillRoundedRect(cx - 21, cy - 20, 42, 42, 10);
  g.fillStyle(L.square, 1).fillRoundedRect(cx - 21, cy - 21, 42, 42, 10);
  g.fillStyle(0x000000, 0.25).fillRoundedRect(cx - 18, cy - 5, 36, 12, 3).fillRoundedRect(cx - 6, cy - 17, 12, 36, 3);
  g.fillStyle(L.dpad, 1).fillRoundedRect(cx - 18, cy - 6, 36, 12, 3).fillRoundedRect(cx - 6, cy - 18, 12, 36, 3);
  const arm = (dx, dy, lit, sel) => {
    const x = cx + dx * 12 - 6;
    const y = cy + dy * 12 - 6;
    if (lit) g.fillStyle(HELD, 1).fillRoundedRect(x, y, 12, 12, 3);
    if (sel) g.lineStyle(2, SEL, 1).strokeRoundedRect(x - 1, y - 1, 14, 14, 3);
  };
  arm(0, -1, axis(ay) < -0.5, axisOn(ay, -1));
  arm(0, 1, axis(ay) > 0.5, axisOn(ay, 1));
  arm(-1, 0, axis(ax) < -0.5, axisOn(ax, -1));
  arm(1, 0, axis(ax) > 0.5, axisOn(ax, 1));
  g.fillStyle(0x3d3f45, 1).fillCircle(cx, cy, 3.5);

  // A faint raised ring around the face buttons.
  if (layout.face) g.lineStyle(1, L.edge, 0.45).strokeCircle(ox + layout.face.x, oy + layout.face.y, layout.face.r);

  // Buttons. Pressed ones flash white with a green ring (A is already green).
  for (const s of layout.decor ?? []) g.fillStyle(L.small, 1).fillCircle(ox + s.x, oy + s.y, s.r).lineStyle(1, L.edge, 1).strokeCircle(ox + s.x, oy + s.y, s.r);
  for (const [b, k] of Object.entries(layout.buttons)) {
    if (k.strip) continue;
    const n = Number(b);
    const x = ox + k.x;
    const y = oy + k.y;
    const fill = pressed(n) ? 0xffffff : k.fill;
    if (k.w) {
      g.fillStyle(L.shadow, 1).fillRoundedRect(x - k.w / 2, y - 3.5, k.w, 9, 4);
      g.fillStyle(fill, 1).fillRoundedRect(x - k.w / 2, y - 4.5, k.w, 9, 4);
      if (pressed(n)) g.lineStyle(2, HELD, 1).strokeRoundedRect(x - k.w / 2 - 1, y - 5.5, k.w + 2, 11, 5);
      if (on(n)) g.lineStyle(2, SEL, 1).strokeRoundedRect(x - k.w / 2 - 2, y - 6.5, k.w + 4, 13, 6);
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
