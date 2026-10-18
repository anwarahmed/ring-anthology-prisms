// 5f · Halo. Spec: docs/CAMPAIGN.md (5f).
// Canon checked against Halo 3 and Halopedia: Installation 08, 343 Guilty Spark, Avery
// Johnson, Forward Unto Dawn (2026-10-18). The fights are staging; the unfinished
// ring, Spark turning on them, Johnson falling (told gently), the firing and the
// Warthog run to the Forward Unto Dawn are canon.

const inf = 'flood-infection';
const fm = 'flood-marine';
const fe = 'flood-elite';
const sn = 'sentinel';

export default {
  id: '5f',
  title: "Halo",
  era: 'covenant',
  theme: 'installation-08',
  music: 'warthog-run',
  players: ['master-chief', 'arbiter'],

  archive: {
    before: [
      {
        title: 'Installation 08', when: 'December 11, 2552', where: 'Installation 08',
        text: 'The new ring at the Ark was not finished. Firing it now would destroy the ring itself, and the Flood with it.',
        source: 'Halopedia: Installation 08',
      },
      {
        title: 'A Guide',
        text: '343 Guilty Spark, the Monitor, came along to help them light the ring. Sergeant Johnson came too.',
        source: 'Halo 3',
      },
    ],
    after: [
      {
        title: 'Spark Turns', when: 'December 11, 2552',
        text: 'When 343 Guilty Spark learned the ring would be destroyed, he turned on them. Sergeant Johnson was hurt, and he did not survive.',
        source: 'Halo 3; Halopedia: Avery Johnson',
      },
      {
        title: 'The Run',
        text: 'Master Chief fired the ring. He and the Arbiter raced across the falling-apart ring in a Warthog to reach their ship, the Forward Unto Dawn.',
        source: 'Halo 3; Halopedia: Forward Unto Dawn',
      },
      {
        title: 'The Price',
        text: 'Johnson gave his life for his friends.',
        source: 'Halopedia: Avery Johnson',
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
    '#..................====...............................=======......................========...................========..............................................=======............................#',
    '#..................::::.....................................========.............=====.......................................................==========..........===:::::::............................#',
    '#..................::::.....................................::::::::.............:::::..........................................===..........::::::::::..........::::::::::.......===.=................#',
    '#.......========...::::.........======......................:::::::===.=.........:::::....##.............................=======::::.........::::::::::..........::::::::::.......:::::................#',
    '#..................::::.....###.............................::::::::.............:::::....##....................................::::.........::::::::::..........::::::::::.......:::::................#',
    '#..P...............::::.A...###.....^^^.........B...........:####:::..G...C......:::::....##D...^^^.........E...................:::M...F.....:::::...::.......H..:::::::..........:::L:..I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Get to the control room' }, { allies: [{ unit: 'marine-ally', n: 1, from: 'left' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: inf, n: 6, from: 'right', gap: 0.15 }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Flood and Sentinels!' },
        { intensity: 1 },
        { wave: [{ unit: inf, n: 6, from: 'right', gap: 0.12 }, { unit: sn, n: 2, from: 'sky' }] },
        { wave: [{ unit: fe, n: 2, from: 'G' }, { unit: sn, n: 2, from: 'sky' }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: fm, n: 3, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { intensity: 2 },
        { objective: '343 Guilty Spark has turned on you!' },
        { boss: { unit: 'guilty-spark-boss', from: 'M', title: '343 Guilty Spark', subtitle: 'Monitor of Installation 04' } },
        { call: 'fire' },
        { unlock: true },
        { checkpoint: true },
        { vehicle: { id: 'warthog', at: 'E' } },
        { objective: 'Warthog run! Get to the Dawn' },
      ],
    },
    { on: 'H', do: [{ spawn: [{ unit: sn, n: 3, from: 'sky' }, { unit: fe, n: 2, from: 'right' }] }, { fx: 'shake' }] },
    { on: 'I', do: [{ spawn: [{ unit: inf, n: 6, from: 'right', gap: 0.1 }] }, { fx: 'shake' }] },
    { on: 'J', do: [{ call: 'escape' }, { end: { result: 'history' } }] },
  ],

  hooks: {
    async fire(api) {
      const { scene, fx, hud } = api;
      hud.letterbox(true);
      fx.slowmo(0.5, 1500);
      await hud.say('Sergeant Johnson had fallen. Master Chief fired the ring.', null, null, 3.5);
      hud.letterbox(false);
      hud.timer('THE RING', 60);
      scene.time.addEvent({ delay: 1500, loop: true, callback: () => fx.shake(0.01, 500) });
    },
    async escape(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.timer(null);
      hud.letterbox(true);
      fx.flash(0xffffff, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("They reached the Forward Unto Dawn just in time.", null, null, 3.5);
    },
  },
};
