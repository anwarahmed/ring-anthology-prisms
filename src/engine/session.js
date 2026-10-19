// Who is playing, at what difficulty, and what has been completed. Progress is saved in
// this browser only (localStorage); nothing ever leaves the machine (docs/LEGAL.md).

const KEY = 'ring-anthology-prisms.progress';

function load() {
  try {
    return JSON.parse(window.localStorage.getItem(KEY)) ?? { done: {} };
  } catch {
    return { done: {} };
  }
}

const params = new URLSearchParams(window.location.search);

export const session = {
  players: [{ device: 'kb1' }],
  difficulty: params.get('difficulty') ?? 'normal',
  progress: load(),
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

  // Something shown once, like the prologue.
  markSeen(key) {
    this.progress.seen = { ...this.progress.seen, [key]: true };
    this.save();
  },

  seen(key) {
    return !!this.progress.seen?.[key];
  },

  save() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(this.progress));
    } catch {
      // Storage can be unavailable (private windows); progress just isn't kept.
    }
  },

  isDone(id) {
    return !!this.progress.done[id];
  },
};

if (session.debug.p2) session.players.push({ device: session.debug.p2 });
