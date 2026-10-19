// 6f · Blue Team. Spec: docs/CAMPAIGN.md (6f).
// Canon checked against Halo 5: Guardians and Halopedia: Blue Team, Meridian
// (2026-10-18). The fights are staging; Cortana's message after the Argent Moon
// mission, Blue Team going AWOL to Meridian, the Prometheans there and boarding a
// Guardian to Genesis are canon.

const kn = 'knight-enemy';
const cr = 'crawler';
const wa = 'watcher';

export default {
  id: '6f',
  title: "Blue Team",
  era: 'created',
  theme: 'meridian',
  music: 'reach-dawn',
  players: ['master-chief', 'fred-104'],

  archive: {
    before: [
      {
        title: 'Cortana\'s Message', when: 'October 2558',
        text: 'After a mission at a station called Argent Moon, Master Chief heard a message from Cortana. It pointed to the colony Meridian.',
        source: 'Halo 5: Guardians; Halopedia: Blue Team',
        scene: 'bg space; planet 0.8 0.45 0.12 #c8a070; S=ship:unsc-big@0.3,0.52; beam 0.3 #7ad8ff',
      },
      {
        title: 'AWOL', when: 'October 2558', where: 'Meridian',
        text: 'Blue Team, Master Chief and his oldest friends from the Spartan program, disobeyed orders and went to Meridian.',
        source: 'Halopedia: Blue Team',
        scene: 'F=fred-104@0.2 & M=master-chief@0.3 & K=kelly-087@0.4; M face >; ship unsc -0.2>1.2 0.2',
      },
    ],
    after: [
      {
        title: 'The Guardian', when: 'October 2558',
        text: 'On Meridian, Blue Team boarded a Guardian, a giant Forerunner machine. It carried them to the Forerunner world Genesis.',
        source: 'Halo 5: Guardians; Halopedia: Meridian',
        scene: 'G=ship:forerunner-big@0.62,0.28; F=fred-104@0.2 & M=master-chief@0.3 & K=kelly-087@0.4; beam 0.62 #9ff4ff & M beamout & F beamout & K beamout; G>1.05,0.15',
      },
      {
        title: 'Reunion',
        text: 'On Genesis, Master Chief found Cortana again.',
        source: 'Halopedia: Genesis',
        scene: 'M=master-chief@0.3; beam 0.62 #7ad8ff; M>0.48; M talk',
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
    '#.............................................................======..........................=======............................................=====...............=====.............................#',
    '#.............................................................::::::...............................................................................=====...............................................#',
    '#................=======................................======::::::..............=====..........................========.......................................======........======...................#',
    '#..........==========....................................:::::::::::......................##...................=======:::........==.=...........................::::::........::::::...................#',
    '#..........::::::::.........####.........................:::::##::::......................##.....................::::::::####....::::...........................::::::........::::::...................#',
    '#..P.......::::::::.....A...####................B........:::::##::::..G...C...............##D...............E....::::::::####....::M:..F......................H.::::::........####::.L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Follow the signal' }] },
    { on: 'A', do: [{ spawn: [{ unit: cr, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Prometheans on Meridian' },
        { intensity: 1 },
        { wave: [{ unit: cr, n: 4, from: 'right', gap: 0.2 }, { unit: wa, n: 1, from: 'sky' }] },
        { wave: [{ unit: kn, n: 1, from: 'G' }, { unit: cr, n: 3, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: wa, n: 2, from: 'sky' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the ridge' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: cr, n: 5, from: 'right', gap: 0.15 }],
          [{ unit: kn, n: 1, from: 'M' }, { unit: wa, n: 2, from: 'sky' }],
          [{ unit: kn, n: 1, from: 'right' }, { unit: cr, n: 3, from: 'left' }],
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
        { objective: 'Reach the Guardian' },
        { wave: [{ unit: kn, n: 2, from: 'right' }, { unit: wa, n: 2, from: 'L' }] },
        { wave: [{ unit: kn, n: 2, from: 'right' }, { unit: cr, n: 5, from: 'sky', gap: 0.2 }] },
        { call: 'guardian' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    async guardian(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xff8a3a, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("Blue Team boarded the Guardian.", null, null, 3.5);
    },
  },
};
