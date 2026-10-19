// 6b · Requiem. Spec: docs/CAMPAIGN.md (6b). Echo of 6a: the same map. Echo of 1f.
// Canon checked against Halo 4 and Halopedia: Requiem, Cortana, Ur-Didact
// (2026-10-18). The fights are staging; the Chief waking in 2557 after four years
// adrift, Requiem, Cortana's age (rampancy) and the Chief unknowingly freeing the
// Didact are canon.

const re = 'remnant-elite';
const gr = 'grunt';
const kn = 'knight-enemy';
const cr = 'crawler';
const wa = 'watcher';

export default {
  id: '6b',
  title: "Requiem",
  era: 'created',
  theme: 'requiem',
  music: 'requiem',
  players: ['master-chief', 'spartan-iv'],

  archive: {
    before: [
      {
        title: 'Adrift', when: 'July 2557',
        text: 'For four years, Master Chief slept in cryo in the drifting back half of the Forward Unto Dawn. In 2557, Cortana woke him.',
        source: 'Halo 4; Halopedia: Forward Unto Dawn',
        scene: 'M=master-chief@0.45; M seal; wait 0.6; beam 0.45 #7ad8ff; M wake',
      },
      {
        title: 'Requiem', when: 'July 2557', where: 'Requiem',
        text: 'The ship was being pulled toward a Forerunner shield world: Requiem.',
        source: 'Halopedia: Requiem',
        scene: 'bg space; planet 0.76 0.5 0.18 #5a6a8a; A=ship:unsc-big@0.08,0.4; A>0.58,0.48',
      },
    ],
    after: [
      {
        title: 'The Didact Wakes', when: 'July 2557', where: 'Requiem',
        text: 'Without knowing it, Master Chief opened the Cryptum and set the Didact free.',
        source: 'Halo 4; Halopedia: Ur-Didact',
        scene: 'D=didact@0.64; D seal; M=master-chief@0.22; M>0.44; D wake; D talk; M face >',
      },
      {
        title: 'Cortana',
        text: 'Cortana was getting old for an AI. Her mind was starting to break down, a condition called rampancy.',
        source: 'Halopedia: Cortana; Rampancy',
        scene: 'M=master-chief@0.42; M glow #7ad8ff; flash #ff6a8a; M talk',
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
    '#......................................................=====....................................====...............=======..........................................=====..............................#',
    '#............=======......................................................................=======..................:::::::====....................====..............:::::..............................#',
    '#................=======.==.....................................======....................:::::::...............===:::::::::::..................=======.............:::::..............................#',
    '#......................::::...............................=====...........................##.::::..................:::::::::::....................::::..............:::::======........................#',
    '#......................::::.###...........................:::::...........................##.::::..................::::::##:::....................::::..............:::::..............................#',
    '#..P...................:A::.###.....^^^.........B.........:::::####...G...C...............##D:::^^^.........E......::::::##:::.....M...F..........^^^:........H.....:::::...###......L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Explore Requiem. ABILITY is a thruster dash' }] },
    { on: 'A', do: [{ spawn: [{ unit: gr, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Covenant on Requiem' },
        { intensity: 1 },
        { wave: [{ unit: re, n: 2, from: 'right' }, { unit: gr, n: 3, from: 'sky' }] },
        { wave: [{ unit: re, n: 2, from: 'G' }, { unit: gr, n: 2, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: re, n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Prometheans!' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: cr, n: 4, from: 'right', gap: 0.2 }],
          [{ unit: kn, n: 1, from: 'M' }, { unit: wa, n: 1, from: 'sky' }],
          [{ unit: cr, n: 3, from: 'left' }, { unit: re, n: 1, from: 'right' }],
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
        { objective: 'The Cryptum' },
        { wave: [{ unit: kn, n: 2, from: 'right' }, { unit: wa, n: 2, from: 'sky' }] },
        { wave: [{ unit: re, n: 3, from: 'L' }, { unit: cr, n: 4, from: 'right', gap: 0.2 }] },
        { call: 'wake' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    async wake(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xff8a3a, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("The Cryptum opened. The Didact was free.", null, null, 3.5);
    },
  },
};
