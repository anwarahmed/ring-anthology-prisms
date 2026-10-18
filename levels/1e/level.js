// 1e · Janjur Qom. Spec: docs/CAMPAIGN.md (1e).
// Canon checked against Halopedia: Janjur Qom, Halo Array (2026-10-18). The battle
// layout and the race are staging; the uprising, its failure, the Halo and the
// San'Shyuum's survival through the Librarian are canon.

const sn = 'sentinel';
const en = 'sentinel-enforcer';

export default {
  id: '1e',
  title: 'Janjur Qom',
  era: 'forerunner',
  theme: 'janjur-qom',
  music: 'janjur-escape',
  players: ['sanshyuum', 'sanshyuum'],

  archive: {
    before: [
      {
        title: "The San'Shyuum", when: 'Late in the Forerunner-Flood war', where: 'Janjur Qom',
        text: "The San'Shyuum had once fought beside humanity. Now Forerunner defenses watched over their home system.",
        source: 'Halopedia: Janjur Qom; Battle of Charum Hakkor',
      },
      {
        title: 'The Uprising', where: 'Janjur Qom',
        text: "The San'Shyuum rose up against the Forerunner defenses around their world.",
        source: 'Halopedia: Janjur Qom',
      },
    ],
    after: [
      {
        title: 'The Ring', where: 'Janjur Qom',
        text: 'The uprising failed. As punishment, the Master Builder used a Halo on Janjur Qom, and all life on the planet went quiet.',
        source: 'Halopedia: Janjur Qom; Halo Array',
      },
      {
        title: 'Saved',
        text: "The San'Shyuum lived on, because the Librarian had already saved some of them. After the war, they were returned to Janjur Qom.",
        source: 'Halopedia: Janjur Qom',
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
    '#...................................==========..............................................................................................==========.................................................#',
    '#....========.......................::::::::::............................=======...............========....................................::::::::::.................................................#',
    '#....::::::::.......................::::::::::....======........................................::::::::......................======........::::::::::.................................................#',
    '#....::::::::.....======............::::::::::....::::::........................................::::::::....=====...........................::::::::::..........======.................................#',
    '#....::::::::.....::::::............::::::::::....::::::..........=====............======.......::::::::....................................::::::::::..........::::::.....======......................#',
    '#....::::::::.....::::::....#####...::::::::::....::::::........................................::::::::............=======.................::::::::::..........::::::...................======........#',
    '#....::::::::.....::::::....#####...::::::::::....::::::.....................#..................::::::::...............#....................::::::::::..........::::::.................................#',
    '#..P.::::::::.....::::::A...#####...::::::::::....::::::......B..............#........G..C^^^.D.::::::::..E............#..........H..F..I.^^^:::::::::..^^^.....::::::..^^^...........^^^.......J......#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Strike the Forerunner defenses' }] },
    { on: 'A', do: [{ spawn: [{ unit: sn, n: 3, from: 'sky' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Destroy the defense battery' },
        { intensity: 1 },
        { wave: [{ unit: sn, n: 4, from: 'sky' }] },
        { wave: [{ unit: en, n: 1, from: 'G' }, { unit: sn, n: 3, from: 'sky' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Push on to the capital' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: sn, n: 4, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the square' },
        { hold: { seconds: 40, every: 6, label: 'HOLD', groups: [
          [{ unit: sn, n: 3, from: 'sky' }],
          [{ unit: en, n: 1, from: 'H' }, { unit: sn, n: 2, from: 'sky' }],
          [{ unit: sn, n: 4, from: 'H' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'I', do: [{ call: 'charge' }, { objective: 'The uprising has failed. Run!' }, { intensity: 2 }, { spawn: [{ unit: sn, n: 4, from: 'sky' }] }] },
    { on: 'J', do: [{ call: 'fire' }, { end: { result: 'history' } }] },
  ],

  hooks: {
    // The Halo in the sky begins to charge: its glow builds, the ground shakes.
    charge(api) {
      const { scene, fx, hud } = api;
      hud.timer('THE RING', 45);
      for (const g of scene.halos ?? []) scene.tweens.add({ targets: g, alpha: 0.85, duration: 40000 });
      scene.time.addEvent({ delay: 2200, loop: true, callback: () => fx.shake(0.006, 400) });
    },
    // As history records: the ring fires. Shown only as light.
    async fire(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.timer(null);
      hud.letterbox(true);
      fx.slowmo(0.4, 2500);
      for (const g of scene.halos ?? []) scene.tweens.add({ targets: g, alpha: 1, scale: g.scaleX * 1.4, duration: 900 });
      await new Promise((r) => scene.time.delayedCall(500, r));
      scene.cameras.main.flash(1600, 255, 255, 255);
      await hud.say('The Halo fired, and Janjur Qom went quiet.', null, null, 3.5);
    },
  },
};
