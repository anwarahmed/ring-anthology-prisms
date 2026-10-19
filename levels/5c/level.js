// 5c · The Ark. Spec: docs/CAMPAIGN.md (5c). Echo of 5a: the same map.
// Canon checked against Halo 3 and Halopedia: Ark, Battle of Installation 00
// (2026-10-18). The fights are staging; the portal to the Ark, Truth's plan to fire
// the Array from it, the Brutes, the Warthog and Mongoose, and the Scarab are canon.

const br = 'jiralhanae-minor';
const bc = 'jiralhanae-captain';
const gr = 'grunt';
const gh = 'ghost-enemy';

export default {
  id: '5c',
  title: "The Ark",
  era: 'covenant',
  theme: 'ark',
  music: 'ring-world',
  players: ['master-chief', 'arbiter'],

  archive: {
    before: [
      {
        title: 'Through the Portal', when: 'December 2552',
        text: 'The portal near Voi opened a way to the Ark, far outside the galaxy. The Prophet of Truth went through it.',
        source: 'Halopedia: Battle of Voi; Ark',
        scene: 'portal 0.52 0.4; C=ship:covenant-big@0.08,0.34; C>0.52,0.4; C hide; A=ship:unsc-big@-0.2,0.5; A>0.46,0.45',
      },
      {
        title: 'The Ark',
        text: 'From the Ark, every Halo could be fired at once. Truth meant to do it. Master Chief and the Arbiter followed him.',
        source: 'Halo 3; Halopedia: Ark',
        scene: 'bg space; planet 0.5 0.62 0.2 #8ab0c0; ring 0.16 0.24 & ring 0.84 0.3; ship covenant -0.2>0.44 0.3 & ship unsc -0.4>0.34 0.42',
      },
    ],
    after: [
      {
        title: 'The Scarab', when: 'December 2552', where: 'The Ark',
        text: 'The Scarab guarding the way was stopped.',
        source: 'Halo 3',
        scene: 'M=master-chief@0.2 & T=arbiter@0.3; K=scarab@0.76<; M fire K & T fire K; boom 0.76 0.55 big; K down',
      },
      {
        title: 'The Citadel',
        text: 'Truth had reached the Citadel, the place where the rings could be fired.',
        source: 'Halopedia: Citadel',
        scene: 'P=sanshyuum@0.62; P unarm; beam 0.62 #9ff4ff; P glow #c890ff',
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
    '#........................=======..:::::...........=====.............::::....................::::::...............======.....................::::.:::::..........=======..........====.=................#',
    '#.................................:::::.............................::::....................::::::..........................................::::.:::::.................................................#',
    '#..P....................A.........::............B...................::G:..C.................D:::............E......................M...F....::::.:...:........H......................L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Follow the Prophet of Truth' }, { vehicle: { id: 'warthog', at: 'A' } }, { allies: [{ unit: 'marine-ally', n: 2, from: 'left' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: gr, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Clear the landing zone' },
        { intensity: 1 },
        { wave: [{ unit: br, n: 2, from: 'right' }, { unit: gh, n: 1, from: 'right' }] },
        { wave: [{ unit: bc, n: 1, from: 'G' }, { unit: gr, n: 3, from: 'sky' }] },
        { unlock: true },
        { checkpoint: true },
        { vehicle: { id: 'mongoose', at: 'D' } },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: gh, n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the valley' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: gh, n: 2, from: 'right' }],
          [{ unit: br, n: 2, from: 'M' }, { unit: gr, n: 2, from: 'sky' }],
          [{ unit: bc, n: 1, from: 'right' }, { unit: gh, n: 1, from: 'right' }],
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
        { objective: 'A Scarab! Stop it!' },
        { boss: { unit: 'scarab', from: 'I', title: 'Scarab', subtitle: 'Guarding the way' } },
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
      await hud.say("The Scarab was down. The way to the Citadel was open.", null, null, 3.5);
    },
  },
};
