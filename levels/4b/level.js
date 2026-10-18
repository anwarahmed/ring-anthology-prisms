// 4b · The Arbiter. Spec: docs/CAMPAIGN.md (4b).
// Canon checked against Halo 2 and Halopedia: Thel 'Vadamee, Arbiter, Sesa 'Refumee,
// Threshold gas mine (2026-10-18). The fights are staging; Thel spared and made the
// Arbiter, the gas mine on Threshold, the heretics, their Sentinels, Sesa 'Refumee and
// what 343 Guilty Spark had told him are canon.

const he = 'heretic-elite';
const hg = 'heretic-grunt';
const sn = 'sentinel';

export default {
  id: '4b',
  title: "The Arbiter",
  era: 'covenant',
  theme: 'threshold',
  music: 'covenant-war',
  players: ['arbiter', 'spec-ops-sangheili'],

  archive: {
    before: [
      {
        title: 'Disgrace', when: '2552',
        text: 'Thel \'Vadamee had commanded the Covenant fleet at Installation 04, and the ring was lost. He was to be punished, but the Prophets spared him and made him the Arbiter, a title of shame.',
        source: 'Halo 2; Halopedia: Thel \'Vadamee',
      },
      {
        title: 'The Heretics', when: '2552', where: 'Threshold',
        text: 'Some Covenant had begun to doubt the Prophets. The Arbiter was sent to a gas mine on the planet Threshold to stop them and their leader, Sesa \'Refumee.',
        source: 'Halopedia: Sesa \'Refumee',
      },
    ],
    after: [
      {
        title: 'The Heretic Leader', when: '2552', where: 'Threshold',
        text: 'The Arbiter defeated Sesa \'Refumee.',
        source: 'Halo 2; Halopedia: Sesa \'Refumee',
      },
      {
        title: 'A Warning',
        text: 'The heretics had been told something by a Forerunner Monitor, 343 Guilty Spark: the Halos were weapons, not a path to the Great Journey. The Arbiter did not believe it yet.',
        source: 'Halopedia: Sesa \'Refumee; 343 Guilty Spark',
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
    '#::::::::::::::::::::::::::::====:::::::::::::::::::::::::=======::::::::::::::::=======::::::::::::::::::::::::::::::======:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::=====::::::::::::::::::::::::::::::::::======::::::::::::::::::::::::::====::::::::::::::::::::::::::::::::::::::::::::::::::===========::::::::::=======:::========::::::::::::::::::::#',
    '#:::::::====:::::::::::::::::::::::::::::::::::::::::::::::::::=====:::::::::::::::::::::::::::::::::::::::::::::=======:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::##:#:::::::::::::::::::=======:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::####::::::::::::::::::::::::::::::::::::::::::::::::::::::::::##.#:::::::::::::::::::::::####::::::::::::::::::::::::::::::::::::::::::::::###:::::::::::::::::::::::::::::#',
    '#::P::::::::::::::::::::A:::####::::^^^:::::::::B::::::::::::##:::::::G:::C:::::::::::::::##D#::^^^:::::::::E::::::::####::::::::::M:::F::::::::::^^^:::::::::H::::::::###:::::::::::L:::I::J::::::X:::#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Hunt down the heretics' }, { vehicle: { id: 'banshee', at: 'A' } }] },
    { on: 'A', do: [{ spawn: [{ unit: hg, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Use ABILITY for active camo' },
        { intensity: 1 },
        { wave: [{ unit: he, n: 2, from: 'right' }, { unit: hg, n: 3, from: 'sky' }] },
        { wave: [{ unit: he, n: 2, from: 'G' }, { unit: sn, n: 2, from: 'sky' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Deeper into the mine' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: sn, n: 3, from: 'sky' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'The heretics have Sentinels' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: sn, n: 3, from: 'sky' }],
          [{ unit: he, n: 2, from: 'M' }, { unit: hg, n: 2, from: 'right' }],
          [{ unit: sn, n: 2, from: 'sky' }, { unit: he, n: 1, from: 'right' }],
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
        { objective: 'Stop the Heretic Leader' },
        { boss: { unit: 'sesa-refumee', from: 'L', title: "Sesa 'Refumee", subtitle: 'The Heretic Leader' } },
        { call: 'done' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    async done(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0x7ad8ff, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("The heretics were stopped. But their warning would not go away.", null, null, 3.5);
    },
  },
};
