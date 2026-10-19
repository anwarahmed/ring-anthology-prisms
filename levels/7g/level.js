// 7g · The Silent Auditorium. Spec: docs/CAMPAIGN.md (7g).
// Canon checked against Halo Infinite and Halopedia: Silent Auditorium, Harbinger
// (2026-10-18). The fights are staging; the Harbinger trying to free the Endless and
// the Chief stopping her are canon. This is where Halo Infinite's story ends.

const sk = 'skimmer';
const bb = 'banished-brute';
const be = 'banished-elite';

export default {
  id: '7g',
  title: "The Silent Auditorium",
  era: 'banished',
  theme: 'silent-auditorium',
  music: 'zeta-halo',
  players: ['master-chief', 'spartan-iv'],

  archive: {
    before: [
      {
        title: 'The Silent Auditorium', when: '2560', where: 'Silent Auditorium',
        text: 'Deep inside Zeta Halo, the Harbinger tried to free the Endless.',
        source: 'Halo Infinite; Halopedia: Harbinger',
        scene: 'M=master-chief@0.14; H=harbinger@0.62<; H glow #9ff4ff; beam 0.62 #9ff4ff; M>0.34',
      },
    ],
    after: [
      {
        title: 'Stopped', when: '2560', where: 'Zeta Halo',
        text: 'Master Chief stopped the Harbinger before she could free the Endless.',
        source: 'Halo Infinite; Halopedia: Harbinger',
        scene: 'S=spartan-iv@0.2 & M=master-chief@0.3; H=harbinger@0.66<; M fire H; flash #9ff4ff; H down',
      },
      {
        title: 'For Now',
        text: 'This is where Halo Infinite\'s story ends, and where this Archive ends: from the Forerunners to Zeta Halo, the whole timeline.',
        source: 'Halo Infinite',
        scene: 'bg space; ring 0.5 0.42; ship forerunner -0.2>0.22 0.16 & ship covenant 1.2>0.8 0.2 & ship unsc -0.2>0.2 0.7 & ship banished 1.2>0.82 0.74',
      },
      {
        title: 'The Archive Is Complete',
        text: 'Every era you played is now in the Archive. Thank you for remembering it all.',
        source: 'Ring Anthology: Prisms',
        scene: 'I=isodidact@0.16 & F=forthencho@0.3 & T=arbiter@0.44 & M=master-chief@0.58 & L=locke@0.72; I face > & F face > & T face > & L face <; M glow #ffd27a',
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
    '#:::::::::::::=====:::::::::::::::::::::::::::::::::::::=====:::::::::::::::::::::::::::::========::::::::::::::::::::::::::========:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::===========::::::::::::::::::::::::::::========::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::========::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::::::::::::::::::::::::::====::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::====:::::::::::::::::::::::::=====:::::::::::::=======:::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::======::::##:::::::::::::::::::::====:::::::::::::::::::::::::::::::=====::::::::========::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::##::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::##:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::####::::::::::::::::::::::#',
    '#::P::::::::::::::::::::A:::##::::::^^^:::::::::B::::::::####:::::::::G:::C:::::::::::::::##D:::^^^:::::::::E::::::::###:::::::::::M:::F::::::::::^^^:::::::::H::::::::::::::####::::L:::I::J::::::X:::#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Stop the Harbinger' }] },
    { on: 'A', do: [{ spawn: [{ unit: sk, n: 3, from: 'sky' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Skimmers!' },
        { intensity: 1 },
        { wave: [{ unit: sk, n: 4, from: 'sky' }] },
        { wave: [{ unit: sk, n: 2, from: 'G' }, { unit: bb, n: 2, from: 'right' }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: sk, n: 2, from: 'sky' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the hall' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: sk, n: 3, from: 'sky' }],
          [{ unit: be, n: 2, from: 'M' }, { unit: sk, n: 2, from: 'sky' }],
          [{ unit: bb, n: 2, from: 'right' }, { unit: sk, n: 2, from: 'sky' }],
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
        { objective: 'The Harbinger!' },
        { boss: { unit: 'harbinger', from: 'L', title: 'The Harbinger', subtitle: 'Of the Endless' } },
        { call: 'stopped' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    async stopped(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xff7ae0, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("Master Chief stopped the Harbinger.", null, null, 3.5);
    },
  },
};
