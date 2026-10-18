// 5a · The Firing. Spec: docs/CAMPAIGN.md (5a). Echo partner: 5c (the same map).
// Canon checked against the Forerunner Saga and Halopedia: Forerunner-Flood war, Ark,
// Halo Array, Librarian (2026-10-18). The defense is staging; the fall of the Greater
// Ark, the IsoDidact bringing the survivors to the lesser Ark, the Librarian on Earth
// (told gently), the firing of the Array (shown only on Archive cards), the Flood
// starved, the reseeding and the Forerunners leaving the galaxy are canon.

const inf = 'flood-infection';
const fw = 'flood-warrior';

export default {
  id: '5a',
  title: "The Firing",
  era: 'forerunner',
  theme: 'ark-ancient',
  music: 'flood-dread',
  players: ['isodidact', 'forerunner-warrior'],

  archive: {
    before: [
      {
        title: 'The Greater Ark Falls', when: '97,445 BCE',
        text: 'The Flood destroyed the Greater Ark, the great foundry where the Halos had been built.',
        source: 'Halopedia: Forerunner-Flood war; Greater Ark',
      },
      {
        title: 'The Lesser Ark', when: '97,445 BCE', where: 'The Ark',
        text: 'The IsoDidact, once called Bornstellar, led the surviving Forerunners to the lesser Ark, far outside the galaxy.',
        source: 'Halopedia: IsoDidact; Ark',
      },
      {
        title: 'The Librarian', when: '97,445 BCE', where: 'Earth',
        text: 'The Librarian went to Earth and drew the Flood there, to buy the last Forerunners time. She stayed on Earth until the very end.',
        source: 'Halopedia: Librarian',
      },
    ],
    after: [
      {
        title: 'The Firing', when: '97,445 BCE',
        text: 'The Halo Array was fired. Every thinking creature in the galaxy was lost, and the Flood had nothing left to feed on.',
        source: 'Halopedia: Halo Array; Forerunner-Flood war',
      },
      {
        title: 'Seeds',
        text: 'From the Ark, the species the Librarian had saved were carried home to their worlds again.',
        source: 'Halopedia: Ark; Conservation Measure',
      },
      {
        title: 'Leaving',
        text: 'The surviving Forerunners left the galaxy.',
        source: 'Halopedia: Forerunner',
      },
      {
        title: 'The Price',
        text: 'The Forerunners gave up their own civilization to stop the Flood.',
        source: 'Halopedia: Forerunner-Flood war',
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
    '#................................................................=======.......................................................................................................====....................#',
    '#.................................=====.............................::::...................................................=======.....................................................................#',
    '#.................................=====.............................::::..................==.=====.................========.................====.=====.................................................#',
    '#........................=======..:::::...........=====.............::::..................##::::::...............======.....................::::.:::::..........=======..........====.=................#',
    '#...........................####..:::::.............................::::..................##::::::..........................................::::.:::::................###..............................#',
    '#..P....................A...####..::^^^.........B..............####.::G:..C...............##D:::^^^.........E..............####....M...F....::::.:^^^:........H.......###............L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Hold the Ark' }] },
    { on: 'A', do: [{ spawn: [{ unit: inf, n: 4, from: 'right', gap: 0.2 }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Defend the landing fields' },
        { intensity: 1 },
        { wave: [{ unit: inf, n: 6, from: 'right', gap: 0.15 }, { unit: fw, n: 2, from: 'right' }] },
        { wave: [{ unit: fw, n: 3, from: 'G' }, { unit: inf, n: 4, from: 'left', gap: 0.15 }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: fw, n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold while the Array charges' },
        { hold: { seconds: 45, every: 6, label: 'THE ARRAY', groups: [
          [{ unit: inf, n: 6, from: 'right', gap: 0.12 }],
          [{ unit: fw, n: 2, from: 'M' }, { unit: inf, n: 4, from: 'left', gap: 0.12 }],
          [{ unit: fw, n: 3, from: 'right' }],
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
        { objective: 'The last of the Flood on the Ark' },
        { hold: { seconds: 40, every: 5, label: 'THE ARRAY', groups: [[{ unit: inf, n: 8, from: 'right', gap: 0.1 }], [{ unit: fw, n: 3, from: 'L' }], [{ unit: fw, n: 2, from: 'right' }, { unit: inf, n: 6, from: 'left', gap: 0.1 }]] } },
        { call: 'array' },
        { end: { result: 'history' } },
      ],
    },
  ],

  hooks: {
    async array(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xffffff, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("The Array was ready. What happened next is kept in the Archive.", null, null, 3.5);
    },
  },
};
