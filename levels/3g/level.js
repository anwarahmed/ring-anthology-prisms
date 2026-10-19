// 3g · The Spartans. Spec: docs/CAMPAIGN.md (3g).
// Canon checked against Halo: The Fall of Reach and Halopedia: SPARTAN-II Program
// (2026-10-18). The course is staging (it teaches the controls); Dr. Halsey's
// program, the 75 children taken to Reach in 2517, Chief Mendez as their trainer,
// MJOLNIR armor and Kelly's speed are canon. The taking of the children is told gently.

const tg = 'training-target';

export default {
  id: '3g',
  title: 'The Spartans',
  era: 'covenant',
  theme: 'reach-training',
  music: 'reach-dawn',
  players: ['john-117-recruit', 'kelly-087'],

  archive: {
    before: [
      {
        title: 'SPARTAN-II', when: '2517',
        text: 'Dr. Catherine Halsey led a secret UNSC program to make super-soldiers: SPARTAN-II.',
        source: 'Halopedia: SPARTAN-II Program',
        scene: 'J=john-117-recruit@0.3 & K=kelly-087@0.42; J unarm & K unarm; beam 0.7 #9fd8ff; J talk',
      },
      {
        title: 'Reach', when: '2517', where: 'Reach',
        text: 'Seventy-five children were taken to the planet Reach to be trained. They had to leave their families behind, which was very hard.',
        source: 'Halo: The Fall of Reach',
        scene: 'ship unsc -0.2>0.5 0.2; beam 0.5 & J=john-117-recruit@0.44 & K=kelly-087@0.54; J unarm & K unarm; J face <',
      },
      {
        title: 'Chief Mendez', where: 'Reach',
        text: 'Chief Petty Officer Franklin Mendez trained them. Two of the recruits were John-117 and Kelly-087.',
        source: 'Halo: The Fall of Reach',
        scene: 'J=john-117-recruit@0.3 & K=kelly-087@0.42; T=training-target@0.8<; J fire T & K fire T; T down',
      },
    ],
    after: [
      {
        title: 'Growing Up', when: '2517–2525', where: 'Reach',
        text: "The Spartans trained for years. They grew up to be humanity's strongest soldiers and wore powerful MJOLNIR armor.",
        source: 'Halo: The Fall of Reach',
        scene: 'J=john-117-recruit@0.32; J unarm; flash; J hide; M=master-chief@0.32; M glow #7ad8ff',
      },
      {
        title: 'Friends',
        text: 'John and Kelly became close friends. Kelly was the fastest of all the Spartans.',
        source: 'Halo: The Fall of Reach',
        scene: 'J=john-117-recruit@0.2 & K=kelly-087@0.3; J unarm & K unarm; K>>0.85 & J>0.6',
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
    '#.................................====.............................=====.........=======.................................................................................=======.......................#',
    '#.......................====......::::......................===========...........=======........................................====.......=====........................:::::::.......................#',
    '#.......................::::......::::......................:::::::::::...........:::::::................................==========::.......:::::....................=======::::.......................#',
    '#...........======......::::......::::......................:::::::::::...........:::::::.##.#...........................::::::::::::.......:::::===.................:::::::::::=......................#',
    '#.......................::::###...::::......................:::::::::::...........:::::::.##.#...........................::::::::::::.......::::::::.................::::::::##:.......................#',
    '#..P....................A:::###...::::..........B...........::::####::G...C.......:::::::.##D#..............E.........##.::::::::::M:..F....::::::::..........H......::::::::##:.....L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Training course: run with LEFT and RIGHT' }] },
    { on: 'A', do: [{ objective: 'Climb onto the platforms with JUMP' }, { spawn: [{ unit: tg, n: 2, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Hit every target with FIRE' },
        { intensity: 1 },
        { wave: [{ unit: tg, n: 4, from: 'sky' }] },
        { objective: 'Aim up with UP to hit the high targets' },
        { wave: [{ unit: tg, n: 3, from: 'G' }, { unit: tg, n: 3, from: 'sky' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Sprint ahead with ABILITY' },
      ],
    },
    { on: 'D', do: [{ objective: 'Throw a GRENADE at the group of targets' }, { spawn: [{ unit: tg, n: 4, from: 'right', gap: 0.1 }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Speed drill: hit the targets as they appear' },
        { hold: { seconds: 35, every: 4, label: 'DRILL', groups: [
          [{ unit: tg, n: 3, from: 'sky' }],
          [{ unit: tg, n: 2, from: 'M' }, { unit: tg, n: 2, from: 'sky' }],
          [{ unit: tg, n: 4, from: 'sky' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Up close, use MELEE' },
      ],
    },
    {
      on: 'H',
      do: [
        { lock: ['H', 'I'] },
        { objective: 'Final drill: clear the course' },
        { intensity: 2 },
        { wave: [{ unit: tg, n: 6, from: 'sky', gap: 0.2 }, { unit: tg, n: 3, from: 'L' }] },
        { wave: [{ unit: tg, n: 8, from: 'sky', gap: 0.15 }] },
        { unlock: true },
      ],
    },
    { on: 'J', do: [{ call: 'graduation' }, { end: { result: 'win' } }] },
  ],

  hooks: {
    async graduation(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xffffff, 500);
      fx.slowmo(0.5, 1500);
      await new Promise((r) => scene.time.delayedCall(300, r));
      await hud.say('Years of training lay ahead. The SPARTAN-II program had begun.', null, null, 3.5);
    },
  },
};
