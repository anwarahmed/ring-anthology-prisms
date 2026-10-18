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
  'ancient-human-heavy': {
    name: 'Ancient Human Heavy', faction: 'ancient-humans', body: 'humanoid', style: 'soldier',
    pal: { armor: '#5a4a34', helmet: '#6a583c', trim: '#d8b040', visor: '#ff8a3a', dark: '#2a2016' },
    health: 120, shields: 60, speed: 45, ai: 'shooter', weapon: 'ancient-cannon',
    range: 260, entrance: 'walk', puff: '#e8c46a', score: 150, burst: 1,
  },
  'sentinel-enforcer': {
    name: 'Sentinel Enforcer', faction: 'forerunners', body: 'sentinel', scale: 1.7,
    pal: { armor: '#8a96a8', trim: '#ffd27a', dark: '#262c3a', glow: '#ff7a1e' },
    health: 170, shields: 60, speed: 45, ai: 'flyer', weapon: 'enforcer-mortar',
    range: 260, entrance: 'fly', puff: '#ffaa1e', score: 300, burst: 1,
  },
  'flood-infection': {
    name: 'Flood Infection Form', faction: 'flood', body: 'infection',
    pal: { armor: '#d8d070', trim: '#fff4b0', dark: '#8a7a3a' },
    health: 6, shields: 0, speed: 95, ai: 'swarm', melee: 6,
    entrance: 'walk', puff: '#b8e04a', score: 10,
  },
  'flood-warrior': {
    name: 'Flood-Taken Warrior-Servant', faction: 'flood', body: 'forerunner', style: 'infected',
    pal: { armor: '#8a9a7a', trim: '#5a6a4a', dark: '#2a3a24', glow: '#c8f04a', cape: '#c8c060' },
    health: 70, shields: 0, speed: 70, ai: 'charger', melee: 22,
    entrance: 'walk', puff: '#b8e04a', score: 80,
  },
  'didact-npc': {
    name: 'The Didact', faction: 'forerunners', body: 'forerunner', scale: 1.15,
    pal: { armor: '#4a5060', trim: '#ff8a2a', dark: '#1c1e26', glow: '#ffa03a' },
    health: 999, shields: 0, speed: 0, ai: 'idle', entrance: 'teleport', puff: '#ffa03a', score: 0,
  },
  'forthencho-npc': {
    name: 'Forthencho', faction: 'ancient-humans', body: 'humanoid', style: 'ancient-lord',
    pal: { armor: '#a8742c', helmet: '#c88e34', trim: '#ffcc33', visor: '#35f0ff', dark: '#3a2214', cape: '#d4263c' },
    health: 999, shields: 0, speed: 0, ai: 'idle', entrance: 'walk', puff: '#ffcc33', score: 0,
  },
};
