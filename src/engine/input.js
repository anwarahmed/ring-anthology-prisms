// Turns keyboards and gamepads into per-player actions. Any mix works: two keyboard
// layouts on one keyboard (kb1, kb2) and up to four gamepads (pad0..pad3).
//
// Every action is rebindable on the Controls screen. Bindings are saved per device:
// 'kb1', 'kb2', or 'pad:<the controller's name>', so a controller keeps its layout.
//   keyboard binding: a key code (number)
//   gamepad binding:  { b: buttonIndex } or { a: axisIndex, d: +1 | -1 }
// `read()` returns move x/y, aim x/y, every action held, and `pressed` (went down this frame).

import Phaser from 'phaser';

export const ACTIONS = ['up', 'down', 'left', 'right', 'jump', 'fire', 'ability', 'grenade', 'swap', 'melee', 'pause'];
const BUTTONS = ['jump', 'fire', 'ability', 'grenade', 'swap', 'melee', 'pause'];
const KC = Phaser.Input.Keyboard.KeyCodes;

export const DEFAULTS = {
  kb1: {
    up: [KC.W], down: [KC.S], left: [KC.A], right: [KC.D],
    jump: [KC.G], fire: [KC.F], ability: [KC.H], grenade: [KC.T], swap: [KC.R], melee: [KC.V], pause: [KC.ESC],
  },
  kb2: {
    up: [KC.UP], down: [KC.DOWN], left: [KC.LEFT], right: [KC.RIGHT],
    jump: [KC.L], fire: [KC.K], ability: [KC.SEMICOLON], grenade: [KC.P], swap: [KC.O], melee: [KC.M], pause: [KC.BACKSPACE],
  },
  // Standard gamepad layout (Xbox naming): A jump, RT/X fire, LT/B ability, LB grenade,
  // Y swap, RB melee, Start pause, d-pad or left stick to move.
  pad: {
    up: [{ b: 12 }, { a: 1, d: -1 }], down: [{ b: 13 }, { a: 1, d: 1 }],
    left: [{ b: 14 }, { a: 0, d: -1 }], right: [{ b: 15 }, { a: 0, d: 1 }],
    jump: [{ b: 0 }], fire: [{ b: 7 }, { b: 2 }], ability: [{ b: 6 }, { b: 1 }],
    grenade: [{ b: 4 }], swap: [{ b: 3 }], melee: [{ b: 5 }], pause: [{ b: 9 }],
  },
};

// --- Saved bindings ------------------------------------------------------------------

const STORE_KEY = 'ring-anthology-prisms.controls';
let saved = (() => {
  try {
    return JSON.parse(window.localStorage.getItem(STORE_KEY)) ?? {};
  } catch {
    return {};
  }
})();

function persist() {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(saved));
  } catch {
    // Storage unavailable: bindings last for this session only.
  }
}

export const bindingStore = {
  get(key) {
    const base = key.startsWith('pad:') ? DEFAULTS.pad : DEFAULTS[key];
    return { ...base, ...(saved[key] ?? {}) };
  },
  set(key, action, binding) {
    saved = { ...saved, [key]: { ...(saved[key] ?? {}), [action]: [binding] } };
    persist();
  },
  has(key) {
    return !!saved[key];
  },
  reset(key) {
    const { [key]: _, ...rest } = saved;
    saved = rest;
    persist();
  },
};

export function padKey(pad) {
  return `pad:${pad.id}`;
}

export function padName(pad) {
  const name = pad.id.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim() || `Controller ${pad.index + 1}`;
  return name.length > 26 ? `${name.slice(0, 25)}…` : name;
}

export function bindingLabel(binding) {
  if (typeof binding === 'number') {
    const name = Object.keys(KC).find((k) => KC[k] === binding);
    return name ?? `KEY ${binding}`;
  }
  if (binding.b !== undefined) return `BUTTON ${binding.b}`;
  return `AXIS ${binding.a}${binding.d > 0 ? '+' : '-'}`;
}

// --- Reading devices -----------------------------------------------------------------

export class Controls {
  constructor(scene) {
    this.scene = scene;
    this.keyObjs = new Map();
    this.prev = {};
    this.bots = {};
  }

  key(code) {
    if (!this.keyObjs.has(code)) this.keyObjs.set(code, this.scene.input.keyboard.addKey(code, false));
    return this.keyObjs.get(code);
  }

  pad(index) {
    const gp = this.scene.input.gamepad;
    if (!gp || !gp.total) return null;
    return gp.getPad(index) ?? null;
  }

  // 0..1 strength of one binding.
  value(binding, pad) {
    if (typeof binding === 'number') return this.key(binding).isDown ? 1 : 0;
    if (!pad) return 0;
    if (binding.b !== undefined) return pad.buttons[binding.b]?.value > 0.5 || pad.buttons[binding.b]?.pressed ? 1 : 0;
    const v = (pad.axes[binding.a]?.getValue() ?? 0) * binding.d;
    return v > 0.3 ? v : 0;
  }

  raw(device) {
    if (this.bots[device]) return this.bots[device]();
    const s = { x: 0, y: 0, aimX: 0, aimY: 0, stick: false };
    let pad = null;
    let binds;
    if (device.startsWith('kb')) {
      binds = bindingStore.get(device);
    } else {
      pad = this.pad(Number(device.slice(3)));
      if (!pad) {
        for (const a of BUTTONS) s[a] = false;
        return s;
      }
      binds = bindingStore.get(padKey(pad));
    }
    const v = (action) => Math.max(0, ...binds[action].map((b) => this.value(b, pad)));
    s.x = Math.min(1, v('right')) - Math.min(1, v('left'));
    s.y = Math.min(1, v('down')) - Math.min(1, v('up'));
    for (const a of BUTTONS) s[a] = v(a) > 0.5;
    // Twin-stick aim with the right stick, only on standard-layout pads whose axes 2/3
    // aren't bound to something else (retro pads report triggers or d-pads there).
    const used = Object.values(binds).flat().some((b) => b.a === 2 || b.a === 3);
    if (pad && pad.pad?.mapping === 'standard' && pad.axes.length >= 4 && !used) {
      const ax = pad.axes[2].getValue(), ay = pad.axes[3].getValue();
      if (Math.hypot(ax, ay) > 0.5) {
        s.aimX = ax;
        s.aimY = ay;
        s.stick = true;
      }
    }
    return s;
  }

  // Call once per frame per device.
  read(device) {
    const s = this.raw(device);
    const prev = this.prev[device] ?? {};
    s.pressed = {};
    for (const a of BUTTONS) s.pressed[a] = s[a] && !prev[a];
    s.pressed.up = s.y < -0.5 && !(prev.y < -0.5);
    s.pressed.down = s.y > 0.5 && !(prev.y > 0.5);
    s.pressed.left = s.x < -0.5 && !(prev.x < -0.5);
    s.pressed.right = s.x > 0.5 && !(prev.x > 0.5);
    this.prev[device] = s;
    return s;
  }

  // Whether a gamepad reports the standard layout (then the defaults fit it).
  isStandard(device) {
    if (!device.startsWith('pad')) return true;
    return this.pad(Number(device.slice(3)))?.pad?.mapping === 'standard';
  }

  // Any gamepad button that went down this frame, other than the ones bound to
  // directions. Menus use it so any button confirms, whatever the controller's layout.
  anyButton(device) {
    if (!device.startsWith('pad')) return false;
    const pad = this.pad(Number(device.slice(3)));
    if (!pad) return false;
    const binds = bindingStore.get(padKey(pad));
    const dirs = new Set(['up', 'down', 'left', 'right'].flatMap((a) => binds[a]).filter((b) => b.b !== undefined).map((b) => b.b));
    const now = pad.buttons.map((b) => b.pressed || b.value > 0.5);
    const prev = this.prevButtons?.[device] ?? [];
    (this.prevButtons ??= {})[device] = now;
    return now.some((on, i) => on && !prev[i] && !dirs.has(i));
  }

  devices() {
    const pads = [0, 1, 2, 3].filter((i) => this.pad(i)).map((i) => `pad${i}`);
    return ['kb1', 'kb2', ...pads];
  }

  // Which device pressed jump or fire this frame (for the player-select screen).
  joinPressed(taken) {
    for (const d of ['kb1', 'kb2', 'pad0', 'pad1', 'pad2', 'pad3']) {
      if (taken.includes(d)) continue;
      const s = this.read(d);
      if (s.pressed.jump || s.pressed.fire || this.anyButton(d)) return d;
    }
    return null;
  }

  // Snapshot of a gamepad's raw buttons and axes (for rebinding).
  snapshot(index) {
    const p = this.pad(index);
    if (!p) return null;
    return { buttons: p.buttons.map((b) => b.value), axes: p.axes.map((a) => a.getValue()) };
  }

  // The first gamepad input that changed from `base`: a binding, or null.
  padChange(index, base) {
    const now = this.snapshot(index);
    if (!now || !base) return null;
    const b = now.buttons.findIndex((v, i) => v > 0.5 && (base.buttons[i] ?? 0) <= 0.5);
    if (b >= 0) return { b };
    const a = now.axes.findIndex((v, i) => Math.abs(v - (base.axes[i] ?? 0)) > 0.6 && Math.abs(v) > 0.5);
    if (a >= 0) return { a, d: Math.sign(now.axes[a]) };
    return null;
  }

  padIdle(index) {
    const s = this.snapshot(index);
    return !s || (s.buttons.every((v) => v <= 0.5) && s.axes.every((v) => Math.abs(v) < 0.5));
  }

  label(device) {
    if (device === 'kb1') return 'Keys 1 (left)';
    if (device === 'kb2') return 'Keys 2 (right)';
    const p = this.pad(Number(device.slice(3)));
    return p ? padName(p) : `Controller ${Number(device.slice(3)) + 1}`;
  }

  storeKey(device) {
    if (device.startsWith('kb')) return device;
    const p = this.pad(Number(device.slice(3)));
    return p ? padKey(p) : null;
  }
}
