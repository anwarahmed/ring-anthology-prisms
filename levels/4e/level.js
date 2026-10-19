// 4e · Sacred Icon. Spec: docs/CAMPAIGN.md (4e).
// Canon checked against Halo 2 and Halopedia: Installation 05, Library, Activation
// Index (2026-10-18). The fights are staging; the Arbiter fighting through the Library
// for the Index past Sentinels and the Flood, and Tartarus taking it (told gently),
// are canon.

const sn = 'sentinel';
const inf = 'flood-infection';
const fe = 'flood-elite';
const fm = 'flood-marine';

export default {
  id: '4e',
  title: "Sacred Icon",
  era: 'covenant',
  theme: 'delta-halo-library',
  music: 'flood-dread',
  players: ['arbiter', 'spec-ops-sangheili'],

  archive: {
    before: [
      {
        title: 'Delta Halo', when: 'November 3, 2552', where: 'Delta Halo',
        text: 'Installation 05, called Delta Halo, was another Forerunner ring. The Prophets wanted its Activation Index, which they called the Sacred Icon.',
        source: 'Halopedia: Installation 05; Activation Index',
        scene: 'bg space; ring 0.5 0.4; fleet covenant 3; beam 0.5 #9ff4ff',
      },
      {
        title: 'The Library',
        text: 'The Index was kept deep in the Library. The Arbiter was sent to bring it back. The Flood had broken loose inside.',
        source: 'Halo 2; Halopedia: Library',
        scene: 'T=arbiter@0.2 & S=spec-ops-sangheili@0.1; F=flood-elite@0.76< & I=flood-infection@0.64<; flood 0.72; T fire I & S fire F; I down',
      },
    ],
    after: [
      {
        title: 'The Index', when: 'November 3, 2552', where: 'Delta Halo',
        text: 'The Arbiter reached the Index.',
        source: 'Halo 2',
        scene: 'T=arbiter@0.3; beam 0.62 #9ff4ff; T>0.55; T glow #9ff4ff',
      },
      {
        title: 'Betrayal',
        text: 'But the Brute chieftain Tartarus took the Index from him, and the Arbiter fell into a deep chasm. He survived.',
        source: 'Halo 2; Halopedia: Tartarus',
        scene: 'T=arbiter@0.42; R=tartarus@0.84<; R>0.58; R talk; R glow #ff8a3a; T>0.4,1.4',
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
    '#:::::::======:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::====::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::====::::::::====:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::=====::::::::::::::::::::::::::::::::::#',
    '#:::::::::======::::::::::::::::::::::::::::::::::::::::::======:::::::::::::::::::====:::::::::::::::::::::::====::::::::======::::::::::::::====:::::::::::::::::::::::::::=======:::::::::::::::::::#',
    '#::::::::::::::::::::===:==:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::##:#:::::::::::::::::========::::::::::::::::::::::::=====:::::::::::::::::::::::::=====:::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::###:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::##.#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::P::::::::::::::::::::A:::###:::::^^^:::::::::B::::::::::::###::::::G:::C:::::::::::::::##D#::^^^:::::::::E::::::::::::###:::::::M:::F::::::::::^^^:::::::::H:::::::::::::####:::::L:::I::J::::::X:::#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Find the Index in the Library' }] },
    { on: 'A', do: [{ spawn: [{ unit: sn, n: 2, from: 'sky' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'The Flood!' },
        { intensity: 1 },
        { wave: [{ unit: inf, n: 6, from: 'right', gap: 0.15 }, { unit: fm, n: 2, from: 'right' }] },
        { wave: [{ unit: fe, n: 2, from: 'G' }, { unit: sn, n: 2, from: 'sky' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Go deeper' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: inf, n: 6, from: 'right', gap: 0.15 }, { unit: sn, n: 2, from: 'sky' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the gallery' },
        { hold: { seconds: 45, every: 5, label: 'HOLD', groups: [
          [{ unit: inf, n: 6, from: 'right', gap: 0.12 }],
          [{ unit: fe, n: 2, from: 'M' }, { unit: sn, n: 2, from: 'sky' }],
          [{ unit: fm, n: 3, from: 'right' }, { unit: inf, n: 4, from: 'left', gap: 0.12 }],
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
        { objective: 'The Index chamber' },
        { wave: [{ unit: fe, n: 3, from: 'right' }, { unit: inf, n: 6, from: 'L', gap: 0.12 }] },
        { wave: [{ unit: sn, n: 4, from: 'sky' }, { unit: fm, n: 3, from: 'right' }] },
        { call: 'index' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    async index(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0x8ad8a8, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("The Arbiter reached the Index.", null, null, 3.5);
    },
  },
};
