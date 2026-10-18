// Turns keyboards and gamepads into per-player actions. Any mix works: two keyboard
// layouts on one keyboard (kb1, kb2) and up to four gamepads (pad0..pad3).
//
// Actions: move x/y, aim x/y, jump, fire, ability, grenade, swap, melee, pause.
// `pressed` holds actions that went down this frame.

export const KEYMAPS = {
  kb1: {
    label: 'Keyboard (left)',
    left: 'A', right: 'D', up: 'W', down: 'S',
    jump: 'G', fire: 'F', ability: 'H', grenade: 'T', swap: 'R', melee: 'V', pause: 'ESC',
  },
  kb2: {
    label: 'Keyboard (right)',
    left: 'LEFT', right: 'RIGHT', up: 'UP', down: 'DOWN',
    jump: 'L', fire: 'K', ability: 'SEMICOLON', grenade: 'P', swap: 'O', melee: 'M', pause: 'BACKSPACE',
  },
};

// Standard gamepad layout (Xbox naming).
const PAD = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, BACK: 8, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
const ACTIONS = ['jump', 'fire', 'ability', 'grenade', 'swap', 'melee', 'pause'];

export class Controls {
  constructor(scene) {
    this.scene = scene;
    this.keys = {};
    for (const [dev, map] of Object.entries(KEYMAPS)) {
      const codes = {};
      for (const [action, key] of Object.entries(map)) if (action !== 'label') codes[action] = key;
      this.keys[dev] = scene.input.keyboard.addKeys(codes, false);
    }
    this.prev = {};
    this.bots = {};
  }

  pad(index) {
    const gp = this.scene.input.gamepad;
    if (!gp || !gp.total) return null;
    return gp.getPad(index) ?? null;
  }

  raw(device) {
    if (this.bots[device]) return this.bots[device]();
    const s = { x: 0, y: 0, aimX: 0, aimY: 0, stick: false };
    if (device.startsWith('kb')) {
      const k = this.keys[device];
      s.x = (k.right.isDown ? 1 : 0) - (k.left.isDown ? 1 : 0);
      s.y = (k.down.isDown ? 1 : 0) - (k.up.isDown ? 1 : 0);
      for (const a of ACTIONS) s[a] = k[a].isDown;
    } else {
      const p = this.pad(Number(device.slice(3)));
      if (!p) return { ...s, jump: false, fire: false, ability: false, grenade: false, swap: false, melee: false, pause: false };
      const b = (i) => !!p.buttons[i]?.pressed;
      const ax = (i) => { const v = p.axes[i]?.getValue() ?? 0; return Math.abs(v) < 0.25 ? 0 : v; };
      s.x = ax(0) || (b(PAD.RIGHT) ? 1 : 0) - (b(PAD.LEFT) ? 1 : 0);
      s.y = ax(1) || (b(PAD.DOWN) ? 1 : 0) - (b(PAD.UP) ? 1 : 0);
      s.aimX = ax(2);
      s.aimY = ax(3);
      s.stick = Math.hypot(s.aimX, s.aimY) > 0.5;
      s.jump = b(PAD.A);
      s.fire = b(PAD.RT) || b(PAD.X);
      s.ability = b(PAD.LT) || b(PAD.B);
      s.grenade = b(PAD.LB);
      s.swap = b(PAD.Y);
      s.melee = b(PAD.RB);
      s.pause = b(PAD.START);
    }
    return s;
  }

  // Call once per frame per device.
  read(device) {
    const s = this.raw(device);
    const prev = this.prev[device] ?? {};
    s.pressed = {};
    for (const a of ACTIONS) s.pressed[a] = s[a] && !prev[a];
    s.pressed.up = s.y < -0.5 && !(prev.y < -0.5);
    s.pressed.down = s.y > 0.5 && !(prev.y > 0.5);
    s.pressed.left = s.x < -0.5 && !(prev.x < -0.5);
    s.pressed.right = s.x > 0.5 && !(prev.x > 0.5);
    this.prev[device] = s;
    return s;
  }

  // Which device pressed a "join" button this frame (for the player-select screen).
  joinPressed(taken) {
    const devices = ['kb1', 'kb2', ...[0, 1, 2, 3].map((i) => `pad${i}`)];
    for (const d of devices) {
      if (taken.includes(d)) continue;
      const s = this.read(d);
      if (s.pressed.jump || s.pressed.fire) return d;
    }
    return null;
  }
}

export function deviceLabel(device) {
  if (KEYMAPS[device]) return KEYMAPS[device].label;
  return `Controller ${Number(device.slice(3)) + 1}`;
}
