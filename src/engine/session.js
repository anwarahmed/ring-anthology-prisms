// Who is playing, at what difficulty, and what has been completed. Progress is saved in
// this browser only (localStorage); nothing ever leaves the machine (docs/LEGAL.md).
//
// Three save slots, one per player (chosen on the title screen). Slot 1 uses the
// original key, so progress from before slots existed lands there.

export const SLOTS = 3;
const SLOT_KEY = 'ring-anthology-prisms.slot';
const keyFor = (slot) => (slot === 1 ? 'ring-anthology-prisms.progress' : `ring-anthology-prisms.progress.${slot}`);

function store(fn, fallback) {
  try {
    return fn(window.localStorage);
  } catch {
    return fallback; // storage unavailable (private windows): progress just isn't kept
  }
}

function loadSlot(slot) {
  return store((ls) => JSON.parse(ls.getItem(keyFor(slot))), null) ?? { done: {} };
}

function savedSlot() {
  const n = Number(store((ls) => ls.getItem(SLOT_KEY), 1));
  return n >= 1 && n <= SLOTS ? n : 1;
}

const params = new URLSearchParams(window.location.search);

export const session = {
  players: [{ device: 'kb1' }],
  difficulty: params.get('difficulty') ?? 'normal',
  slot: savedSlot(),
  progress: loadSlot(savedSlot()),
  // Debug and test switches: ?level=1a ?saga=prologue|epilogue ?p2=kb2 ?bot=1 ?god=1 ?all=1 ?difficulty=easy
  debug: {
    level: params.get('level'),
    saga: params.get('saga'),
    p2: params.get('p2'),
    bot: params.has('bot'),
    god: params.has('god'),
    all: params.has('all'),
  },

  complete(id) {
    this.progress.done[id] = this.difficulty;
    this.save();
  },

  // A finished run: keeps the level's best time (seconds) and most medals.
  record(id, { time, medals }) {
    const b = this.progress.best?.[id];
    this.progress.best = { ...this.progress.best, [id]: { time: Math.min(time, b?.time ?? Infinity), medals: Math.max(medals, b?.medals ?? 0) } };
    this.save();
  },

  best(id) {
    return this.progress.best?.[id] ?? null;
  },

  // NEW GAME: forget the current slot's finished levels, records and seen prologue.
  // Other slots, controls, settings and skulls are kept.
  reset() {
    this.progress = { done: {} };
    this.save();
  },

  // Something shown once, like the prologue.
  markSeen(key) {
    this.progress.seen = { ...this.progress.seen, [key]: true };
    this.save();
  },

  seen(key) {
    return !!this.progress.seen?.[key];
  },

  save() {
    store((ls) => ls.setItem(keyFor(this.slot), JSON.stringify(this.progress)));
  },

  // Switches to another save slot and loads its progress.
  useSlot(n) {
    this.slot = n;
    this.progress = loadSlot(n);
    store((ls) => ls.setItem(SLOT_KEY, String(n)));
  },

  // How many levels a slot has finished (for the title menu).
  slotDone(n) {
    return Object.keys(loadSlot(n).done ?? {}).length;
  },

  isDone(id) {
    return !!this.progress.done[id];
  },
};

if (session.debug.p2) session.players.push({ device: session.debug.p2 });
