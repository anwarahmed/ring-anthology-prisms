// 3m · The Pillar of Autumn (Reach). Spec: docs/CAMPAIGN.md (3m). Echo of 2a: the
// same map. Canon checked against Halo: Reach and Halopedia: Battle of Aszod, Emile-A239,
// Noble Six (2026-10-18). The fights are staging; Six and Emile carrying Cortana to
// the Pillar of Autumn through the Aszod ship-breaking yards on August 29-30, 2552,
// Emile manning the mass driver until he fell, Six taking the gun (the quoted line),
// the Autumn's escape and Six fighting on to the end are canon. Losses are told gently.

const gr = 'grunt';
const jk = 'jackal';
const sk = 'skirmisher';
const el = 'elite';
const ez = 'elite-zealot';
const br = 'jiralhanae-minor';

export default {
  id: '3m',
  title: 'The Pillar of Autumn (Reach)',
  era: 'covenant',
  theme: 'aszod',
  music: 'last-stand',
  players: ['noble-six', 'emile'],

  archive: {
    before: [
      {
        title: 'The Fall of Reach', when: 'August 29, 2552', where: 'Reach',
        text: 'The Covenant had overrun Reach. Noble Team was asked to carry a precious package to the ship Pillar of Autumn: an AI named Cortana.',
        source: 'Halo: Reach; Halopedia: Noble Team',
        scene: 'N=noble-six@0.24 & E=emile@0.14; glass 0.62 & glass 0.84; N glow #7ad8ff',
      },
      {
        title: 'Aszod', when: 'August 30, 2552', where: 'Aszod ship-breaking yards',
        text: 'Noble Six and Emile reached the Aszod ship-breaking yards, where the Pillar of Autumn was waiting to launch.',
        source: 'Halopedia: Battle of Aszod',
        scene: 'A=ship:unsc-big@0.7,0.62; N=noble-six@0.08 & E=emile@-0.02; N>0.32 & E>0.24',
      },
    ],
    after: [
      {
        title: 'The Mass Driver', when: 'August 30, 2552', where: 'Aszod',
        text: 'Emile manned a huge mass driver gun to protect the ship, and he held his post until he fell.',
        source: 'Halopedia: Emile-A239; Battle of Aszod',
        scene: 'E=emile@0.3; ship covenant 1.2>0.62 0.2; E fire 0.62,0.2; boom 0.62 0.2 big; E kneel',
      },
      {
        title: 'I Have the Gun',
        text: "When a Covenant cruiser threatened the Autumn, Six took the gun and stayed behind so the ship could get away. Six said: \"Negative. I have the gun. Good luck, sir.\"",
        source: 'Halo: Reach',
        scene: 'A=ship:unsc-big@0.3,0.55; C=ship:covenant-big@1.2,0.22<; C>0.76,0.22; N=noble-six@0.56; N talk; N fire C; boom 0.76 0.22 big; C down; A>-0.4,0.3',
      },
      {
        title: 'Escape',
        text: 'The Pillar of Autumn escaped with Cortana. Its journey would lead to Installation 04.',
        source: 'Halopedia: Pillar of Autumn',
        scene: 'bg space; A=ship:unsc-big@0.2,0.5; portal 0.76 0.45; A>0.72,0.45',
      },
      {
        title: 'The Price',
        text: 'Six gave up any chance of escape so the ship could get away, and fought on to the very end.',
        source: 'Halopedia: Noble Six',
        scene: 'N=noble-six@0.42; E=elite@0.84< & J=jiralhanae-minor@0.94<; N fire E; N glow #ffd27a; dark',
      },
    ],
  },

  legend: {},

  map: [
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '#:::::::::::::::::::::::::#####################::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#############:::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::#####################::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#############:::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::......::::::::::#####################:::::::::::::::::::::::::::::::::::::::::::......:::::::::::::::::::::::::::::::::::::#############::::::::::::::::::::::::::::::::::......:::::::::::::#',
    '#:::::::::......::::::::::#####################:::::::::::::::::::::::::::::::::::::::::::......:::::::::::::::::::::::::::::::::::::#############::::::::::::::::::::::::::::::::::......:::::::::::::#',
    '#:::::::::......::::::::::::::::::::::::......::::::::::::::::::::::::::::::::::::::::::::......::::::::::::::::::::::::::::::::::::::::::::......:::::::::::::::::::M::::::::::::::......:::::::::::::#',
    '#:::::::::......::::::::::::::::::::::::......::::::::::::::::::=======:::::::::::::::::::......::::::::::::::::::=======:::::::::::::::::::......::::::::::::::::=======:::::::::::......:::::::::::::#',
    '#:::::::::......::::::::::::::::::::::::......::::::::::::::::::::::::::::::::::::::::::::......::::::::::::::::::::::::::::::::::::::::::::......::::::::::::::::::::::::::::::::::......:::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::======::::::::::::======::::::::::::::::::::::::::======::::::::::::======::::::::::::::::::::::::======::::::::::::======::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#:::::::::::::::::::::::::::::::::::::::::::::::::#:::::::::::::::::::::::::::::::::::::::::::::::#::::::::::::::::::::::::::::::::::#',
    '#::P::::::::::::::::::::::::A:::::::::::::::::::::::B:::::::::::::#:::::::::G::C::::D^^:::::::::::::::E:::::::::::::#:::::::::H::F::::::::::::::::::::J:::::::::::::#:::::::::L::K::::::::::::::::X::::#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Get Cortana to the Pillar of Autumn' }] },
    { on: 'A', do: [{ spawn: [{ unit: gr, n: 3, from: 'right' }, { unit: jk, n: 1, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Clear the gantry' },
        { intensity: 1 },
        { wave: [{ unit: sk, n: 3, from: 'right' }, { unit: gr, n: 2, from: 'sky' }] },
        { wave: [{ unit: el, n: 2, from: 'G' }, { unit: jk, n: 2, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Keep moving: the Autumn is waiting' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: br, n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Fight through the yard' },
        { wave: [{ unit: br, n: 2, from: 'right' }, { unit: sk, n: 2, from: 'H' }] },
        { wave: [{ unit: el, n: 2, from: 'right' }, { unit: gr, n: 3, from: 'sky' }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    {
      on: 'J',
      do: [
        { lock: ['J', 'K'] },
        { intensity: 2 },
        { objective: 'Defend the mass driver while the Autumn launches' },
        { hold: { seconds: 60, every: 6, label: 'LAUNCH', groups: [
          [{ unit: sk, n: 3, from: 'right' }, { unit: gr, n: 2, from: 'sky' }],
          [{ unit: el, n: 2, from: 'L' }],
          [{ unit: br, n: 2, from: 'right' }, { unit: jk, n: 2, from: 'M' }],
          [{ unit: ez, n: 1, from: 'right' }, { unit: sk, n: 2, from: 'sky' }],
        ] } },
        { call: 'theGun' },
        { end: { result: 'history' } },
      ],
    },
  ],

  hooks: {
    // As history records: the Autumn launches; Emile has fallen and Six takes the gun.
    async theGun(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.shake(0.02, 2500);
      await hud.say('Emile held the mass driver until he fell.', null, null, 3);
      await hud.say('Negative. I have the gun. Good luck, sir.', 'Noble Six', 'Halo: Reach', 3.5);
      fx.slowmo(0.4, 2500);
      scene.cameras.main.flash(1600, 255, 220, 160);
      await hud.say('The Pillar of Autumn escaped with Cortana.', null, null, 3);
    },
  },
};
