// 7b · The Primordial. Spec: docs/CAMPAIGN.md (7b).
// Canon checked against Halo: Primordium and Halopedia: Halo: Primordium, Primordial
// (2026-10-18). The fights are staging; Chakas stranded on Installation 07 searching
// for Riser, the Primordial controlling the ring and drawing its captives toward the
// Flood facilities, the Precursors' secret and the Primordial living on in the
// Gravemind are canon.

const inf = 'flood-infection';
const fw = 'flood-warrior';
const sn = 'sentinel';

export default {
  id: '7b',
  title: "The Primordial",
  era: 'forerunner',
  theme: 'zeta-halo-ancient',
  music: 'flood-dread',
  players: ['chakas', 'riser'],

  archive: {
    before: [
      {
        title: 'Stranded', when: 'c. 97,450 BCE', where: 'Installation 07',
        text: 'Chakas, a young human, was stranded on Installation 07. He set out to find his small friend Riser.',
        source: 'Halo: Primordium; Halopedia: Chakas',
      },
      {
        title: 'The Pull',
        text: 'The Primordial now controlled the ring. It drew the humans living there toward the places where the Flood was kept.',
        source: 'Halopedia: Primordial',
      },
    ],
    after: [
      {
        title: 'The Secret',
        text: 'The Primordial told its secret: long ago the Forerunners had defeated the Precursors, who turned themselves into a dust that could rise again. That dust became the Flood.',
        source: 'Halopedia: Primordial; Precursor',
      },
      {
        title: 'The Gravemind',
        text: 'The Primordial\'s body was destroyed, but its mind lived on in the Gravemind.',
        source: 'Halopedia: Primordial',
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
    '#..................................................=====.............................................................=======...........................................................................#',
    '#................................====..............:::::...............................................................................................................................................#',
    '#...........========.......========::..............:::::.......======.............=======......................................................=======...................======.=====..................#',
    '#...........::::::::.......::::::::::..............:::::.....==::::::.............:::::::=##...................=======............................::::...................::::::==......................#',
    '#...........::::::::.......:##:::::::..............:::::##.....::::::.............:::::::.##......................................................::::...................::::::::......................#',
    '#..P........::::::::....A..:##:::::::...........B..:::::##.....::::::.G...C.......:::::::.##D...............E..............###.....M...F..........::::........H.........###::::::....L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    // Chakas and Riser carry no weapons (canon), so this is a run, not a fight: no
    // locked arenas. Melee and grenades still work on the Flood.
    { on: 'start', do: [{ objective: 'Find Riser. You have no weapons: keep moving!' }] },
    { on: 'A', do: [{ spawn: [{ unit: inf, n: 3, from: 'right', gap: 0.3 }] }] },
    { on: 'B', do: [{ objective: 'Sentinels overhead: run!' }, { intensity: 1 }, { spawn: [{ unit: sn, n: 2, from: 'sky' }, { unit: inf, n: 3, from: 'right', gap: 0.3 }] }, { checkpoint: true }] },
    { on: 'D', do: [{ spawn: [{ unit: fw, n: 1, from: 'right' }, { unit: inf, n: 3, from: 'left', gap: 0.3 }] }] },
    { on: 'E', do: [{ objective: 'The Flood facilities: stay out of reach' }, { spawn: [{ unit: fw, n: 2, from: 'right' }, { unit: sn, n: 2, from: 'sky' }] }, { checkpoint: true }] },
    { on: 'H', do: [{ objective: 'Riser is near!' }, { intensity: 2 }, { call: 'pressure' }, { spawn: [{ unit: inf, n: 5, from: 'right', gap: 0.2 }, { unit: sn, n: 2, from: 'sky' }] }] },
    { on: 'J', do: [{ call: 'secret' }, { end: { result: 'win' } }] },
  ],

  hooks: {
    pressure(api) {
      api.hud.timer('THE PRIMORDIAL', 30);
      api.scene.time.addEvent({ delay: 2500, loop: true, callback: () => api.fx.shake(0.006, 400) });
    },
    async secret(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.timer(null);
      hud.letterbox(true);
      fx.flash(0xb8e04a, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("Chakas and Riser had found the Primordial, and learned its secret.", null, null, 3.5);
    },
  },
};
