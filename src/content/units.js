// AI units: enemies, and allies when a script spawns them with `ally: true`.
// ai: behavior in src/engine/ai.js (walker | shooter | charger | flyer | turret | boss).
// entrance: how a unit appears when spawned (teleport | drop | fly | walk).
// puff: the color of the light puff a unit vanishes in when defeated.
// boss.attacks: pattern names from src/engine/ai.js, cycled in order.

export const UNITS = {
  'warrior-servant': {
    name: 'Forerunner Warrior-Servant', faction: 'forerunners', body: 'forerunner',
    pal: { armor: '#c3ccd6', trim: '#56687a', dark: '#2b3540', glow: '#7fd8ff' },
    health: 60, shields: 50, speed: 55, ai: 'shooter', weapon: 'hardlight-lance',
    range: 230, entrance: 'teleport', puff: '#7fd8ff', score: 100,
  },
  'warrior-servant-vanguard': {
    name: 'Warrior-Servant Vanguard', faction: 'forerunners', body: 'forerunner',
    pal: { armor: '#e1e6ec', trim: '#3d6f96', dark: '#24303b', glow: '#bdf0ff' },
    health: 110, shields: 120, speed: 85, ai: 'charger', weapon: 'hardlight-scatter',
    range: 120, melee: 30, entrance: 'teleport', puff: '#bdf0ff', score: 250, scale: 1.15,
  },
  sentinel: {
    name: 'Sentinel', faction: 'forerunners', body: 'sentinel',
    pal: { armor: '#9aa3ad', trim: '#c9d1d9', dark: '#3a4048', glow: '#ffc861' },
    health: 35, shields: 0, speed: 70, ai: 'flyer', weapon: 'sentinel-beam',
    range: 200, entrance: 'fly', puff: '#ffc861', score: 60,
  },
  'ancient-human-defender': {
    name: 'Ancient Human Soldier', faction: 'ancient-humans', body: 'humanoid', style: 'soldier',
    pal: { armor: '#6f6a4a', helmet: '#7d7752', trim: '#c9b26a', visor: '#9fefff', dark: '#26241a' },
    health: 80, shields: 40, speed: 60, ai: 'shooter', weapon: 'ancient-rifle',
    range: 240, entrance: 'walk', puff: '#e8c46a', score: 0,
  },
};
