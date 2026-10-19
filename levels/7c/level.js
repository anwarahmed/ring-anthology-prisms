// 7c · Warship Gbraakon. Spec: docs/CAMPAIGN.md (7c).
// Canon checked against Halo Infinite and Halopedia: Zeta Halo, Endless, The Weapon,
// Warship Gbraakon (2026-10-18). The fights are staging; the Endless imprisoned on
// Zeta Halo, the Banished attack on the Infinity, the Pilot finding the Chief in
// May 2560, storming the Banished warship, the Weapon and Cortana being gone are canon.

const bb = 'banished-brute';
const bg = 'banished-grunt';
const be = 'banished-elite';
const jk = 'jackal';

export default {
  id: '7c',
  title: "Warship Gbraakon",
  era: 'banished',
  theme: 'warship-gbraakon',
  music: 'banished-rise',
  players: ['master-chief', 'spartan-iv'],

  archive: {
    before: [
      {
        title: 'The Endless',
        text: 'Long ago, the Forerunners imprisoned a race called the Endless on Zeta Halo.',
        source: 'Halo Infinite; Halopedia: Endless',
        scene: 'bg space; ring 0.66 0.36; H=harbinger@0.36; H seal',
      },
      {
        title: 'Zeta Halo', when: '2559',
        text: 'In 2559, the Banished attacked the UNSC Infinity at Zeta Halo, and the ring was badly damaged. Master Chief was lost in space.',
        source: 'Halopedia: Zeta Halo; Halo Infinite',
        scene: 'bg space; ring 0.64 0.4; I=ship:unsc-big@0.3,0.52; fleet banished 4; boom 0.3 0.52 big & boom 0.64 0.4 big; flash',
      },
      {
        title: 'Found', when: 'May 2560',
        text: 'Six months later, a pilot found Master Chief drifting in space.',
        source: 'Halo Infinite',
        scene: 'bg space; M=master-chief@0.62,0.5; P=ship:unsc@-0.1,0.3; P>0.5,0.42',
      },
    ],
    after: [
      {
        title: 'The Weapon', when: 'May 2560',
        text: 'Aboard the Banished warship, Master Chief found the Weapon: an AI built to stop Cortana.',
        source: 'Halopedia: The Weapon',
        scene: 'M=master-chief@0.35; beam 0.62 #9ad8ff; M glow #9ad8ff; M talk',
      },
      {
        title: 'Cortana',
        text: 'Cortana was gone.',
        source: 'Halo Infinite',
        scene: 'M=master-chief@0.45; beam 0.62 #7ad8ff & dark; M kneel',
      },
    ],
  },

  legend: {},

  map: [
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::======:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::::::::::::::::::::::::::::::========:::::::::::::::::::::::::::::::::::::::::::::::======:::::::::::::::::::::::::::::::::::::::::::::::::====:::::=======:::::::::::::::::#',
    '#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::====::::::::::::====::::::::::::::::::::::::::::::::====::::::::::::::::::::::::::====:::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::==========:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::====##:::::::::::::::::::::::========::::::::::::::::::::========:::::::::::::========:::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::###:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::##.::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::##::::::::::::::::::::::::::#',
    '#::P::::::::::::::::::::A:::###:::::^^^:::::::::B:::::::::::##::::::::G:::C:::::::::::::::##D:::^^^:::::::::E::::::::####::::::::::M:::F::::::::::^^^:::::::::H::::::::::::##::::::::L:::I::J::::::X:::#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Storm the Banished warship' }] },
    { on: 'A', do: [{ spawn: [{ unit: bg, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Banished boarders' },
        { intensity: 1 },
        { wave: [{ unit: bg, n: 3, from: 'right' }, { unit: bb, n: 1, from: 'right' }] },
        { wave: [{ unit: be, n: 2, from: 'G' }, { unit: jk, n: 2, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: bb, n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the hangar' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: bg, n: 3, from: 'sky' }, { unit: bb, n: 1, from: 'right' }],
          [{ unit: be, n: 2, from: 'M' }],
          [{ unit: bb, n: 2, from: 'right' }, { unit: jk, n: 1, from: 'left' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    {
      on: 'H',
      do: [
        { lock: ['H', 'I'] },
        { intensity: 2 },
        { objective: 'Reach the Weapon' },
        { wave: [{ unit: bb, n: 3, from: 'right' }, { unit: be, n: 1, from: 'L' }] },
        { wave: [{ unit: be, n: 2, from: 'right' }, { unit: bb, n: 2, from: 'L' }] },
        { call: 'weapon' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    async weapon(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0x7ad8ff, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("Master Chief found the Weapon.", null, null, 3.5);
    },
  },
};
