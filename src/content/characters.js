// Playable characters. Canon characters or generic canon roles only (docs/CAMPAIGN.md).
// short: the name shown on the HUD when `name` is long.
// kit: overrides the era's ability kit (src/engine/kits.js) when the character's own
// technology differs from the era's; extra: an additional kit power (e.g. 'camo').

export const CHARACTERS = {
  forthencho: {
    name: 'Forthencho', title: 'Lord of Admirals', faction: 'ancient-humans',
    body: 'humanoid', style: 'ancient-lord',
    pal: { armor: '#a8742c', helmet: '#c88e34', trim: '#ffcc33', visor: '#35f0ff', dark: '#3a2214', cape: '#d4263c' },
    shields: 70, health: 100, speed: 115, jump: 385,
    weapons: ['ancient-rifle', 'ancient-cannon'], grenade: 'frag', kit: 'covenant',
  },
  'ancient-human-soldier': {
    name: 'Ancient Human Soldier', short: 'Soldier', title: 'Defender of Charum Hakkor', faction: 'ancient-humans',
    body: 'humanoid', style: 'soldier',
    pal: { armor: '#4f6234', helmet: '#5c6e3a', trim: '#d8b040', visor: '#4ff6ff', dark: '#2a2616' },
    shields: 60, health: 100, speed: 120, jump: 390,
    weapons: ['ancient-rifle', 'ancient-cannon'], grenade: 'frag', kit: 'covenant',
  },
};
