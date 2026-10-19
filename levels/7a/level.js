// 7a · Mendicant Bias. Spec: docs/CAMPAIGN.md (7a). Echo partner: 7d (the same map).
// Canon checked against Halopedia: Installation 07, Mendicant Bias, Primordial
// (2026-10-18). The fights are staging (Sentinels stand for the machines Bias turned);
// the test firing of Installation 07, the Primordial's release, Bias turning, the
// attack on the Capital, the control code and the failsafe code are canon.

const sn = 'sentinel';
const inf = 'flood-infection';

export default {
  id: '7a',
  title: "Mendicant Bias",
  era: 'forerunner',
  theme: 'zeta-halo-ancient',
  music: 'forerunner-march',
  players: ['isodidact', 'forerunner-warrior'],

  archive: {
    before: [
      {
        title: 'The First Test', when: 'c. 97,495 BCE', where: 'Installation 07',
        text: 'The Forerunner AI Mendicant Bias was given the first test of a Halo: Installation 07, a ring that would one day be called Zeta Halo.',
        source: 'Halopedia: Installation 07; Mendicant Bias',
        scene: 'bg space; ring 0.6 0.42; S=sentinel@0.18,0.34 & T=sentinel@0.3,0.52; ringfire',
      },
      {
        title: 'The Prisoner',
        text: 'The test released an ancient prisoner, the Primordial. It was really a Gravemind, left behind by the Precursors.',
        source: 'Halopedia: Primordial',
        scene: 'W=forerunner-warrior@0.2; P=proto-gravemind@0.72<; flash #b8e04a; flood 0.72; W face >',
      },
    ],
    after: [
      {
        title: 'Bias Turns',
        text: 'Mendicant Bias was told to question the Primordial. Instead, the Primordial\'s words turned Bias against the Forerunners.',
        source: 'Halopedia: Mendicant Bias',
        scene: 'P=proto-gravemind@0.74<; S=sentinel@0.4,0.4; S talk; P talk; S glow #ff4a3a; S face <',
      },
      {
        title: 'The Capital',
        text: 'About 43 years later, Bias attacked the Forerunner Capital. The IsoDidact stunned it with a control code, and Bias was finally shut down with a failsafe code.',
        source: 'Halopedia: Installation 07; Mendicant Bias',
        scene: 'bg space; planet 0.28 0.56 0.15 #c8d0e0; S=ship:forerunner-big@1.1,0.3<; S>0.62,0.34; S fire 0.3,0.55; flash #9ff4ff; S down',
      },
    ],
  },

  legend: {},

  map: [
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#.......................======..................................=======.......................................=======...................................................========.......................#',
    '#.......................::::::....=====..................====.................................................:::::::..====.............................................::::::::.......................#',
    '#.......................::::::....:::::................========.....................=======.....====..........:::::::..::=======..............=====.....................::::::::.......................#',
    '#.......................::::::....:::::..................::::.............................##..................:::::::..::::.................======...................===::::::::.......................#',
    '#.......................::::####..:::::..................:::##............................##..................:::::::..####..........................................:::::::::::.......................#',
    '#..P....................A:::####..::^^^.........B........:::##........G...C...............##D...^^^.........E.:::::::..####........M...F..........^^^.........H......::::###::::.....L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Secure the test site' }] },
    { on: 'A', do: [{ spawn: [{ unit: sn, n: 2, from: 'sky' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'The machines have turned' },
        { intensity: 1 },
        { wave: [{ unit: sn, n: 4, from: 'sky' }] },
        { wave: [{ unit: sn, n: 3, from: 'G' }, { unit: sn, n: 2, from: 'sky' }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: sn, n: 3, from: 'sky' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the control station' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: sn, n: 3, from: 'sky' }],
          [{ unit: sn, n: 2, from: 'M' }, { unit: inf, n: 4, from: 'right', gap: 0.15 }],
          [{ unit: sn, n: 4, from: 'sky' }],
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
        { objective: "Reach the ring's core" },
        { wave: [{ unit: sn, n: 5, from: 'sky' }, { unit: inf, n: 6, from: 'L', gap: 0.12 }] },
        { wave: [{ unit: sn, n: 6, from: 'sky' }] },
        { call: 'turned' },
        { end: { result: 'history' } },
      ],
    },
  ],

  hooks: {
    async turned(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xffc861, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("Mendicant Bias had turned against its makers.", null, null, 3.5);
    },
  },
};
