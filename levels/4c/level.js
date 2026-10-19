// 4c · Metropolis. Spec: docs/CAMPAIGN.md (4c).
// Canon checked against Halo 2 and Halopedia: Battle of Mombasa, Scarab (2026-10-18).
// The fights are staging; the Covenant landing in New Mombasa, the Scorpion and the
// Scarab rampaging through the city, and the Prophet of Regret fleeing to Delta Halo
// with the In Amber Clad following, are canon.

const gr = 'grunt';
const jk = 'jackal';
const el = 'elite';
const gh = 'ghost-enemy';

export default {
  id: '4c',
  title: "Metropolis",
  era: 'covenant',
  theme: 'new-mombasa',
  music: 'last-stand',
  players: ['master-chief', 'marine'],

  archive: {
    before: [
      {
        title: 'New Mombasa', when: 'October 20, 2552', where: 'New Mombasa',
        text: 'The Covenant Prophet of Regret landed in the African city of New Mombasa, on Earth.',
        source: 'Halopedia: Battle of Mombasa',
        scene: 'ship covenant 1.2>0.62 0.16 big; beam 0.62 #c890ff & P=sanshyuum@0.62<; P unarm; P talk',
      },
      {
        title: 'The Bridge',
        text: 'Master Chief and the Marines crossed the city in a Scorpion tank. A Scarab, a huge Covenant walker, was rampaging through the streets.',
        source: 'Halo 2',
        scene: 'S=veh:scorpion@0.08; K=scarab@0.86<; S>0.42; S fire K; boom 0.8 0.6',
      },
    ],
    after: [
      {
        title: 'The Scarab', when: 'October 20, 2552', where: 'New Mombasa',
        text: 'Master Chief stopped the Scarab.',
        source: 'Halo 2; Halopedia: Scarab',
        scene: 'M=master-chief@0.28; K=scarab@0.76<; M fire K; boom 0.76 0.55 big; K down; M face >',
      },
      {
        title: 'Into Slipspace',
        text: 'The Prophet of Regret\'s ship jumped away into slipspace, right out of the city. The UNSC ship In Amber Clad followed it, with Master Chief aboard.',
        source: 'Halopedia: Battle of Mombasa; In Amber Clad',
        scene: 'bg space; C=ship:covenant-big@0.4,0.34; portal 0.68 0.34; C>0.68,0.34; C hide; A=ship:unsc-big@0.06,0.42; A>0.6,0.38',
      },
      {
        title: 'Delta Halo',
        text: 'On the other side was another ring: Installation 05, called Delta Halo.',
        source: 'Halopedia: Installation 05',
        scene: 'bg space; portal 0.22 0.5; A=ship:unsc-big@0.22,0.5; A>0.42,0.5; ring 0.74 0.3',
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
    '#..........................========...............................======.....................................................................................................======....................#',
    '#................====........::::::.................................::::...........................................=======......................=======......................::::::....................#',
    '#............................::::::....................====.........::::.......................................======...=======.................:::::::...........=======....::::::....................#',
    '#............................::::::....................::::.........::::...........====......======............::::::...........................:::::::===........:::::::====::::::....................#',
    '#...............................:::....................::::.........::::...........::::......::::::............::::::...........................::::::::::........:::::::....::::::....................#',
    '#..P....................A.......:::.............B......:............::G:..C........::::.....D::::::.........E..::::::..............M...F........::::::::::....H...:::::......::::::..L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Cross the city' }, { vehicle: { id: 'scorpion', at: 'A' } }, { allies: [{ unit: 'marine-ally', n: 2, from: 'left' }] }] },
    { on: 'A', do: [{ objective: 'A Scorpion! Get in with SWAP' }, { spawn: [{ unit: gr, n: 3, from: 'right' }, { unit: gh, n: 1, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Clear the bridge' },
        { intensity: 1 },
        { wave: [{ unit: gh, n: 2, from: 'right' }, { unit: gr, n: 3, from: 'sky' }] },
        { wave: [{ unit: el, n: 2, from: 'G' }, { unit: jk, n: 2, from: 'right' }] },
        { unlock: true },
        { checkpoint: true },
        { vehicle: { id: 'warthog', at: 'D' } },
        { objective: 'Push into the city' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: gh, n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the street' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: gh, n: 2, from: 'right' }],
          [{ unit: el, n: 2, from: 'M' }, { unit: gr, n: 2, from: 'sky' }],
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
        { objective: 'Stop the Scarab!' },
        { boss: { unit: 'scarab', from: 'I', title: 'Scarab', subtitle: 'Covenant assault walker' } },
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
      fx.flash(0x7aff5a, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("The Scarab was down. Above the city, the Prophet's ship opened a slipspace portal.", null, null, 3.5);
    },
  },
};
