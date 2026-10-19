// Skulls: optional fun modifiers, switched on from the title menu and saved in this
// browser. Named after the Halo games' skulls, but simple and kid-friendly:
//   birthday:     defeated enemies burst into confetti with a cheer (fx.puff)
//   lowgrav:      everyone jumps higher and floats down (LevelScene)
//   thunderstorm: enemies are tougher (Unit stats)

const KEY = 'ring-anthology-prisms.skulls';

export const SKULLS = [
  { id: 'birthday', name: 'GRUNT BIRTHDAY PARTY', text: 'Defeated enemies burst into confetti, with a cheer.' },
  { id: 'lowgrav', name: 'LOW GRAVITY', text: 'Everyone jumps higher and floats down slowly.' },
  { id: 'thunderstorm', name: 'THUNDERSTORM', text: 'Enemies are tougher: half again as much health and shields.' },
];

function load() {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(KEY)) ?? []);
  } catch {
    return new Set();
  }
}

export const skulls = {
  on: load(),
  has(id) {
    return this.on.has(id);
  },
  toggle(id) {
    if (this.on.has(id)) this.on.delete(id);
    else this.on.add(id);
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...this.on]));
    } catch {
      // Storage unavailable: the choice lasts for this session only.
    }
  },
};
