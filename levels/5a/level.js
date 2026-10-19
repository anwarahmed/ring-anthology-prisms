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
        scene: 'bg space; planet 0.5 0.55 0.16 #8a9ab0; ring 0.5 0.55; flood 0.4 & flood 0.6; boom 0.44 0.5 big & boom 0.58 0.6 big; ringbreak',
      },
      {
        title: 'The Lesser Ark', when: '97,445 BCE', where: 'The Ark',
        text: 'The IsoDidact, once called Bornstellar, led the surviving Forerunners to the lesser Ark, far outside the galaxy.',
        source: 'Halopedia: IsoDidact; Ark',
        scene: 'bg space; planet 0.82 0.5 0.1 #8ac8a0; S=ship:forerunner-big@0.06,0.4; T=ship:forerunner@-0.1,0.3; S>0.62,0.45 & T>0.5,0.3',
      },
      {
        title: 'The Librarian', when: '97,445 BCE', where: 'Earth',
        text: 'The Librarian went to Earth and drew the Flood there, to buy the last Forerunners time. She stayed on Earth until the very end.',
        source: 'Halopedia: Librarian',
        scene: 'bg sky #ffb070 #ffe8c8 #6a8a4a; beam 0.36 #fff0d0; G=flood-warrior@0.88< & I=flood-infection@0.78<; G>0.6 & I>0.52; beam 0.36 #fff0d0',
      },
    ],
    after: [
      {
        title: 'The Firing', when: '97,445 BCE',
        text: 'The Halo Array was fired. Every thinking creature in the galaxy was lost, and the Flood had nothing left to feed on.',
        source: 'Halopedia: Halo Array; Forerunner-Flood war',
        // The IsoDidact watches from the Ark as a ring fires; the Flood fades away.
        scene: 'bg space #3a4258; I=isodidact@0.18 & W=forerunner-warrior@0.08; ring 0.72 0.24; F=flood-warrior@0.62< & G=flood-infection@0.74< & H=flood-infection@0.86<; flood 0.75; wait 0.8; ringfire; F down & G down & H down; quiet; I kneel',
      },
      {
        title: 'Seeds',
        text: 'From the Ark, the species the Librarian had saved were carried home to their worlds again.',
        source: 'Halopedia: Ark; Conservation Measure',
        scene: 'bg sky #8ac8f0 #e0f4ff #5a9a4a; beam 0.3 & C=chakas@0.3; beam 0.5 & S=sanshyuum@0.5; beam 0.7 & G=unggoy@0.7; S unarm & C unarm',
      },
      {
        title: 'Leaving',
        text: 'The surviving Forerunners left the galaxy.',
        source: 'Halopedia: Forerunner',
        scene: 'bg space; S=ship:forerunner-big@0.3,0.5; T=ship:forerunner@0.14,0.34; S>0.92,0.3 & T>0.8,0.2',
      },
      {
        title: 'The Price',
        text: 'The Forerunners gave up their own civilization to stop the Flood.',
        source: 'Halopedia: Forerunner-Flood war',
        scene: 'I=isodidact@0.45; I kneel; quiet',
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
