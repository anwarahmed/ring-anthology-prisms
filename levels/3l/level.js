// 3l · Winter Contingency. Spec: docs/CAMPAIGN.md (3l).
// Canon checked against Halo: Reach and Halopedia: Battle of Visegrád Relay, Winter
// Contingency, Noble Team (2026-10-18). The fights are staging; Noble Team sent to the
// dead relay near Visegrád on July 24, 2552, finding the first Covenant ground forces
// on Reach, the Zealots, restoring the relay and Winter Contingency are canon.

const gr = 'grunt';
const jk = 'jackal';
const sk = 'skirmisher';
const el = 'elite';
const ez = 'elite-zealot';

export default {
  id: '3l',
  title: 'Winter Contingency',
  era: 'covenant',
  theme: 'reach-visegrad',
  music: 'reach-dawn',
  players: ['noble-six', 'kat'],

  archive: {
    before: [
      {
        title: 'Reach', when: 'July 24, 2552', where: 'Reach',
        text: "Reach was one of humanity's most important worlds. Contact was lost with a communications relay near the town of Visegrád.",
        source: 'Halopedia: Battle of Visegrád Relay',
        scene: 'fire 0.76; N=noble-six@0.2 & K=kat@0.1; N face >',
      },
      {
        title: 'Noble Team',
        text: 'Noble Team, a squad of Spartans, was sent to find out why. Its newest member was Noble Six. Kat, Noble Two, was the team\'s tech expert.',
        source: 'Halopedia: Noble Team',
        scene: 'ship unsc -0.2>0.4 0.25; N=noble-six@0.38 & K=kat@0.28 & J=spartan-ally@0.48; K talk',
      },
    ],
    after: [
      {
        title: 'They Are Here', when: 'July 24, 2552', where: 'Visegrád',
        text: 'Noble Team found Covenant forces on the ground. It was the first sign that the Covenant had come to Reach.',
        source: 'Halopedia: Battle of Visegrád Relay',
        scene: 'N=noble-six@0.25 & K=kat@0.15; S=skirmisher@0.8< & E=elite@0.9<; N fire S & K fire E; S down',
      },
      {
        title: 'Winter Contingency',
        text: 'Noble Team brought the relay back online, and the UNSC declared Winter Contingency: the alert that Reach was being invaded.',
        source: 'Halopedia: Winter Contingency',
        scene: 'N=noble-six@0.4 & K=kat@0.6; K kneel; beam 0.7 #9fd8ff; ship unsc -0.2>1.2 0.15 & ship unsc -0.4>1.2 0.26',
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
    '#....................................................========...=======...............======................................................====.........................=======.......................#',
    '#.............................=======..........................................................................................====......................................:::::::.......................#',
    '#...............=======............................................===.=............................................................................====.................::======......................#',
    '#...............:::====...........................................................========##..............................=========......................................:::::::.......................#',
    '#...............:::::::.....####..................................................::::::::##.............................................................................:::::::.......................#',
    '#..P............:::::::.A...####................B...............####..G...C.......::::::::##D...............E........####..........M...F......................H..........:::::##.....L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Investigate the dead relay' }, { vehicle: { id: 'warthog', at: 'A' } }] },
    { on: 'A', do: [{ spawn: [{ unit: gr, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Covenant! Clear the farmstead' },
        { intensity: 1 },
        { wave: [{ unit: gr, n: 3, from: 'right' }, { unit: jk, n: 2, from: 'right' }] },
        { wave: [{ unit: sk, n: 3, from: 'G' }, { unit: jk, n: 1, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Reach the relay' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: sk, n: 3, from: 'right', gap: 0.3 }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the relay while Kat restores it' },
        { hold: { seconds: 45, every: 6, label: 'RELAY', groups: [
          [{ unit: gr, n: 3, from: 'sky' }, { unit: sk, n: 1, from: 'right' }],
          [{ unit: el, n: 2, from: 'M' }],
          [{ unit: sk, n: 3, from: 'right' }, { unit: jk, n: 1, from: 'left' }],
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
        { objective: 'Zealots!' },
        { spawn: [{ unit: ez, n: 1, from: 'I' }] },
        { boss: { unit: ez, from: 'L', title: 'Zealots', subtitle: 'Sangheili elite warriors' } },
        { call: 'clearZealots' },
        { call: 'contingency' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    async clearZealots(api) {
      await new Promise((res) => {
        const ev = api.scene.time.addEvent({ delay: 200, loop: true, callback: () => {
          if (!api.scene.units.some((u) => u.alive && u.id === 'elite-zealot')) { ev.remove(); res(); }
        } });
      });
    },
    async contingency(api) {
      api.hud.letterbox(true);
      api.fx.slowmo(0.5, 1500);
      api.fx.flash(0xffffff, 400);
      await api.hud.say('The relay was back online. Winter Contingency was declared.', null, null, 3.5);
    },
  },
};
