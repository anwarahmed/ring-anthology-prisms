// 4f · The Great Journey. Spec: docs/CAMPAIGN.md (4f).
// Canon checked against Halo 2 and Halopedia: Great Schism, Tartarus, Installation 05
// (2026-10-18). The fights are staging; the Brutes replacing the Elites, the Schism,
// the Arbiter learning the truth, Elites and humans fighting together, the Scarab,
// Tartarus's defeat with the ring stopped and the rings left on standby for the Ark
// are canon.

const br = 'jiralhanae-minor';
const bc = 'jiralhanae-captain';
const gr = 'grunt';
const jk = 'jackal';

export default {
  id: '4f',
  title: "The Great Journey",
  era: 'covenant',
  theme: 'delta-halo',
  music: 'covenant-war',
  players: ['arbiter', 'johnson'],

  archive: {
    before: [
      {
        title: 'The Great Schism', when: 'November 3, 2552',
        text: 'The Prophets replaced the Sangheili with the Jiralhanae as their guards. The Sangheili were cast aside, and the Covenant split in a great civil war.',
        source: 'Halopedia: Great Schism',
      },
      {
        title: 'The Truth',
        text: 'The Arbiter learned the truth: firing the Halos would not begin the Great Journey. It would wipe out all life.',
        source: 'Halo 2',
      },
      {
        title: 'Strange Allies', when: 'November 3, 2552', where: 'Delta Halo',
        text: 'The Sangheili and the humans now fought together. Sergeant Johnson joined the Arbiter to stop Tartarus from firing the ring.',
        source: 'Halo 2; Halopedia: Avery Johnson',
      },
    ],
    after: [
      {
        title: 'The Ring Stops', when: 'November 3, 2552', where: 'Delta Halo',
        text: 'Together, the Arbiter and Johnson defeated Tartarus, and Delta Halo did not fire.',
        source: 'Halo 2; Halopedia: Tartarus',
      },
      {
        title: 'Standby',
        text: 'But the rings had been set to wait for a signal. They could now be fired from a single place, far away: the Ark.',
        source: 'Halo 2; Halopedia: Halo Array',
      },
      {
        title: 'The Price',
        text: 'The Sangheili gave up the faith they had lived for.',
        source: 'Halopedia: Great Schism',
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
    '#.......====........====..............................=============....................................................................................................................................#',
    '#...........................=====..........................::::::::.............====.............................=====...............................................=========.........................#',
    '#..........................................................::::::::.............................======..........======.............................=======...........::::::::..........................#',
    '#..........................................................:::::::====.=..................##.......................=======...................=======::::::...........::::=====.........................#',
    '#...........................####.........................###:::::::.......................##.......................:::::::.........................:::::::...........::::::::..........................#',
    '#..P....................A...####................B........###:::::::...G...C...............##D...............E......::::::###.......M...F...........:::::::....H......:##:::::........L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Stop Tartarus' }, { allies: [{ unit: 'elite-ally', n: 2, from: 'left' }] }, { vehicle: { id: 'banshee', at: 'A' } }] },
    { on: 'A', do: [{ spawn: [{ unit: br, n: 2, from: 'right' }, { unit: gr, n: 2, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Break the Brute line' },
        { intensity: 1 },
        { wave: [{ unit: br, n: 3, from: 'right' }, { unit: jk, n: 2, from: 'sky' }] },
        { wave: [{ unit: bc, n: 1, from: 'G' }, { unit: br, n: 2, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
        { allies: [{ unit: 'scarab-ally', n: 1, from: 'left' }] },
        { objective: 'A friendly Scarab! Follow it' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: br, n: 3, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold with the Scarab' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: br, n: 2, from: 'right' }, { unit: gr, n: 2, from: 'sky' }],
          [{ unit: bc, n: 1, from: 'M' }, { unit: br, n: 1, from: 'right' }],
          [{ unit: 'banshee-enemy', n: 2, from: 'sky' }],
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
        { objective: 'Tartarus! Stop him before he fires the ring' },
        { boss: { unit: 'tartarus', from: 'L', title: 'Tartarus', subtitle: 'Chieftain of the Jiralhanae' } },
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
      fx.flash(0xe8c46a, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("Tartarus was defeated, and Delta Halo did not fire.", null, null, 3.5);
      await hud.say("But the rings were still waiting, for a signal from the Ark.", null, null, 3.5);
    },
  },
};
