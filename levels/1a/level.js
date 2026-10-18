// 1a · Lord of Admirals. Spec: docs/CAMPAIGN.md (1a). Canon checked against Halopedia:
// Battle of Charum Hakkor, Forthencho (2026-10-17).

const ws = 'warrior-servant';
const vg = 'warrior-servant-vanguard';
const sn = 'sentinel';

export default {
  id: '1a',
  title: 'Lord of Admirals',
  era: 'forerunner',
  theme: 'charum-hakkor',
  music: 'last-stand',
  players: ['forthencho', 'ancient-human-soldier'],

  archive: {
    before: [
      {
        title: 'The Precursors', when: 'Millions of years ago',
        text: 'Long before humanity, the Forerunners rose against their creators, the Precursors, and drove them to extinction. The last Precursors turned themselves into a fine powder, meant to bring them back one day. Over millions of years the powder went bad. Living things it touched were changed. This was the beginning of the Flood.',
        source: 'Forerunner Saga; Halopedia: Precursors',
      },
      {
        title: 'The Plague War', when: 'c. 107,500 BCE', where: 'Human space',
        text: 'The Flood appeared in human space. Ancient humanity and its San\'Shyuum allies fought it, and in time it seemed to vanish. Then humanity went to war with the Forerunners. The war lasted fifty years.',
        source: 'Halopedia: Forerunner-Flood war, Battle of Charum Hakkor',
      },
      {
        title: 'Charum Hakkor', when: 'c. 107,475 BCE', where: 'Charum Hakkor',
        text: 'Charum Hakkor was the heart of the human empire. Forthencho, Lord of Admirals, commanded its last fleets. Outnumbered, with weaker ships, he held out against the Didact for three years.',
        source: 'Halo: Primordium; Halopedia: Forthencho',
      },
    ],
    after: [
      {
        title: 'The Surrender', when: 'c. 107,472 BCE', where: 'Citadel Charum',
        text: 'The San\'Shyuum had secretly agreed to let the Forerunners through. The last humans made their stand in Citadel Charum, an ancient Precursor ruin. Humanity\'s leaders could have released the Flood on the Forerunners to buy time. They refused, because it was too dangerous for everyone. They surrendered.',
        source: 'Halopedia: Battle of Charum Hakkor',
      },
      {
        title: 'Lord of Admirals', where: 'Citadel Charum',
        text: 'The captured humans hid their ranks, but the Didact found Forthencho among them. He met him not as a prisoner, but as a fellow warrior.',
        source: 'Halopedia: Forthencho',
      },
    ],
  },

  legend: {
    h: { unit: 'ancient-human-defender', ally: true },
  },

  map: [
    '#..................................................................................................................................................................................#',
    '#..................................................................................................................................................................................#',
    '#.....................................................................................................................................................::::::::::::::::::::::::::::.#',
    '#.....................................................................................................................................................::::::::::::::::::::::::::::.#',
    '#.................................................::................................................::................................................::::::::::::::::::::::::::::.#',
    '#.................................................::............................:::::...............::................................................::::::::::::::::::::::::::::.#',
    '#...=======.......................................::............................:::::...............::................................................:::::::::::::M::::::::::::::.#',
    '#...:::::::.......................................::................=====.......:::::.........:::::.::..................=====.........................::::::::::=======:::::::::::.#',
    '#...:::::::....======.............................::............................:::::.........:::::.::..====..........................................::::::::::::::::::::::::::::.#',
    '#...:::::::....::::::...................======....===......=====................:::::.........:::::.===.........=====.................................==::::::::::::::::======::::.#',
    '#...:::::::....::::::...:::.....................................................:::::.========:::::...................................................::::=====:::::::::::::::::::.#',
    '#...:::::::....::::::...:::...#######...................#.........#.............:::::.........:::::.........##........#...............................::::::::::::###:::::::::::::.#',
    '#..P:::::::....::::::...:::.A.#######.............B..h.h#.........#.......G..C..::D::....^^...:::::.E..h..h.##.h......#.....H..F..I.....====..........J::h:::h::::###:::::::::L::K.#',
    '########################################################################################################################################....########################################',
    '########################################################################################################################################....########################################',
    '########################################################################################################################################^^^^########################################',
    '########################################################################################################################################^^^^########################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Reach the outer defenses' }] },
    { on: 'A', do: [{ spawn: [{ unit: sn, n: 2, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Hold the outer defenses' },
        { wave: [{ unit: ws, n: 2, from: 'G' }] },
        { wave: [{ unit: sn, n: 3, from: 'sky' }, { unit: ws, n: 1, from: 'G' }] },
        { wave: [{ unit: vg, n: 1, from: 'G' }, { unit: ws, n: 2, from: 'G' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Defend the city' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: sn, n: 2, from: 'right' }, { unit: ws, n: 1, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the city' },
        { hold: { seconds: 60, every: 7, label: 'HOLD', groups: [
          [{ unit: ws, n: 2, from: 'H' }],
          [{ unit: sn, n: 3, from: 'sky' }],
          [{ unit: vg, n: 1, from: 'H' }, { unit: ws, n: 1, from: 'H' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Fall back to Citadel Charum' },
      ],
    },
    { on: 'I', do: [{ fx: 'shake' }, { intensity: 1 }] },
    {
      on: 'J',
      do: [
        { lock: ['J', 'K'] },
        { objective: 'The last stand' },
        { intensity: 2 },
        { hold: { seconds: 75, every: 6, label: 'HOLD', groups: [
          [{ unit: ws, n: 2, from: 'L' }],
          [{ unit: sn, n: 2, from: 'sky' }, { unit: ws, n: 1, from: 'M' }],
          [{ unit: vg, n: 2, from: 'L' }],
          [{ unit: ws, n: 3, from: 'L' }, { unit: sn, n: 2, from: 'sky' }],
        ] } },
        { call: 'surrender' },
        { end: { result: 'history' } },
      ],
    },
  ],

  hooks: {
    // The Forerunners arrive in overwhelming numbers. History records a surrender.
    async surrender(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0x7fd8ff, 600);
      fx.shake(0.02, 1200);
      const m = api.marker('L');
      for (let i = 0; i < 8; i++) {
        scene.time.delayedCall(i * 180, () => {
          const u = scene.spawnUnit('warrior-servant', (m.x - 2 - i * 2.5) * api.tile, (m.y + 1) * api.tile);
          if (u) u.brain = () => u.setVelocityX(0);
        });
      }
      fx.slowmo(0.4, 2500);
      await hud.say('Rather than release the Flood, humanity\'s leaders chose to surrender.', null, null, 4);
    },
  },
};
