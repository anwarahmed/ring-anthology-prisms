// AI units: enemies, and allies when a script spawns them with `ally: true`.
// ai: behavior in src/engine/ai.js (walker | shooter | charger | flyer | turret | boss).
// entrance: how a unit appears when spawned (teleport | drop | fly | walk).
// puff: the color of the light puff a unit vanishes in when defeated.
// boss.attacks: pattern names from src/engine/ai.js, cycled in order.

export const UNITS = {
  'warrior-servant': {
    name: 'Forerunner Warrior-Servant', faction: 'forerunners', body: 'forerunner',
    pal: { armor: '#d6e2ee', trim: '#3a7fd0', dark: '#1c3352', glow: '#45e6ff' },
    health: 60, shields: 50, speed: 55, ai: 'shooter', weapon: 'hardlight-lance',
    range: 230, entrance: 'teleport', puff: '#7fd8ff', score: 100,
  },
  'warrior-servant-vanguard': {
    name: 'Warrior-Servant Vanguard', faction: 'forerunners', body: 'forerunner',
    pal: { armor: '#eef3f8', trim: '#f2b632', dark: '#1a2c4a', glow: '#7ff4ff' },
    health: 110, shields: 120, speed: 85, ai: 'charger', weapon: 'hardlight-scatter',
    range: 120, melee: 30, entrance: 'teleport', puff: '#bdf0ff', score: 250, scale: 1.15,
  },
  sentinel: {
    name: 'Sentinel', faction: 'forerunners', body: 'sentinel',
    pal: { armor: '#aeb8c4', trim: '#e2e8ee', dark: '#323c4c', glow: '#ffaa1e' },
    health: 35, shields: 0, speed: 70, ai: 'flyer', weapon: 'sentinel-beam',
    range: 200, entrance: 'fly', puff: '#ffc861', score: 60,
  },
  'ancient-human-defender': {
    name: 'Ancient Human Soldier', faction: 'ancient-humans', body: 'humanoid', style: 'soldier',
    pal: { armor: '#4f6234', helmet: '#5c6e3a', trim: '#d8b040', visor: '#4ff6ff', dark: '#2a2616' },
    health: 80, shields: 40, speed: 60, ai: 'shooter', weapon: 'ancient-rifle',
    range: 240, entrance: 'walk', puff: '#e8c46a', score: 0,
  },
};
