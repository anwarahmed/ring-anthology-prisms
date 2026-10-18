// 3a · The Reformists. Spec: docs/CAMPAIGN.md (3a). Echo of 1e: the same map.
// Canon checked against Halopedia: Janjur Qom, Forerunner Dreadnought, San'Shyuum
// (2026-10-18). The battle layout is staging; the century of fighting, the 1,000
// Reformists taking the Dreadnought, the torn-away piece of the planet and the Stoics
// letting the relic go are canon.

const st = 'sanshyuum-stoic';

export default {
  id: '3a',
  title: 'The Reformists',
  era: 'covenant',
  theme: 'janjur-qom-reformist',
  music: 'janjur-escape',
  players: ['sanshyuum', 'sanshyuum'],

  archive: {
    before: [
      {
        title: 'The Dreadnought', when: 'c. 2200 BCE', where: 'Janjur Qom',
        text: "Long after the Forerunners were gone, a great Forerunner ship still rested on the San'Shyuum's world: a Dreadnought.",
        source: 'Halopedia: Forerunner Dreadnought; Janjur Qom',
      },
      {
        title: 'Two Sides', where: 'Janjur Qom',
        text: "The Reformists wanted to explore the ship and use it. The Stoics believed it was too sacred to touch. They argued, and then they fought, for about a hundred years.",
        source: 'Halopedia: Janjur Qom',
      },
      {
        title: 'The Plan', when: '2100 BCE', where: 'Janjur Qom',
        text: 'About a thousand Reformists fought their way inside the Dreadnought and barricaded themselves in.',
        source: 'Halopedia: Janjur Qom',
      },
    ],
    after: [
      {
        title: 'Lift-Off', when: '2100 BCE', where: 'Janjur Qom',
        text: 'The Reformists woke the Dreadnought. It rose into the sky, tearing away a piece of the planet. The Stoics could not bring themselves to harm the holy ship, so it got away.',
        source: 'Halopedia: Janjur Qom; Forerunner Dreadnought',
      },
      {
        title: 'Exile',
        text: 'The Reformists left their home behind and set out into the stars, searching for more Forerunner relics.',
        source: "Halopedia: San'Shyuum",
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
    { on: 'start', do: [{ objective: 'Reach the Dreadnought' }] },
    { on: 'A', do: [{ spawn: [{ unit: st, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Break through the Stoic lines' },
        { intensity: 1 },
        { wave: [{ unit: st, n: 4, from: 'right' }] },
        { wave: [{ unit: st, n: 3, from: 'G' }, { unit: st, n: 3, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Push on to the Dreadnought' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: st, n: 4, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the square while the others get aboard' },
        { hold: { seconds: 40, every: 6, label: 'HOLD', groups: [
          [{ unit: st, n: 3, from: 'right' }],
          [{ unit: st, n: 2, from: 'H' }, { unit: st, n: 2, from: 'left' }],
          [{ unit: st, n: 4, from: 'H' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'I', do: [{ objective: 'Get aboard!' }, { intensity: 2 }, { call: 'rumble' }, { spawn: [{ unit: st, n: 4, from: 'right' }] }] },
    { on: 'J', do: [{ call: 'liftoff' }, { end: { result: 'win' } }] },
  ],

  hooks: {
    // The Dreadnought wakes: the ground shakes harder and harder.
    rumble(api) {
      const { scene, fx, hud } = api;
      hud.timer('THE DREADNOUGHT', 40);
      scene.time.addEvent({ delay: 1800, loop: true, callback: () => fx.shake(0.008, 500) });
    },
    // The ship rises, tearing away a piece of the planet. Shown as light and shaking.
    async liftoff(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.timer(null);
      hud.letterbox(true);
      fx.shake(0.025, 2500);
      fx.slowmo(0.4, 2500);
      await new Promise((r) => scene.time.delayedCall(600, r));
      scene.cameras.main.flash(1400, 255, 230, 180);
      await hud.say('The Dreadnought rose into the sky, and the Reformists flew into exile.', null, null, 3.5);
    },
  },
};
