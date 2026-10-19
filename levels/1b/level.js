// 1b · The Fall of Charum Hakkor. Spec: docs/CAMPAIGN.md (1b). Echo of 1a: the same map.
// Canon checked against Halopedia: Battle of Charum Hakkor, Forthencho, Halo: Cryptum (2026-10-18).

const hs = 'ancient-human-defender';
const hv = 'ancient-human-heavy';
const ws = 'warrior-servant';

export default {
  id: '1b',
  title: 'The Fall of Charum Hakkor',
  era: 'forerunner',
  theme: 'charum-hakkor',
  music: 'forerunner-march',
  players: ['didact', 'forerunner-warrior'],

  archive: {
    before: [
      {
        title: 'The Assault', when: 'c. 107,475 BCE', where: 'Charum Hakkor',
        text: 'The Didact led the Forerunner attack on Charum Hakkor. His ships came through seven slipspace portals, wave after wave, giving themselves up to break the human defenses.',
        source: 'Halopedia: Battle of Charum Hakkor',
        scene: 'bg space #2a2236; D=didact@0.16 & W=forerunner-warrior@0.06; portal 0.74 0.28; fleet forerunner 5; boom 0.38 0.2 big & boom 0.56 0.12; boom 0.28 0.3',
      },
      {
        title: 'A Secret Deal', where: 'Charum Hakkor',
        text: "The San'Shyuum, humanity's allies, had secretly agreed to let the Forerunners through. In return, they would be left alone in their home system.",
        source: 'Halopedia: Battle of Charum Hakkor',
        scene: 'planet 0.2 0.22 0.07 #c89a60; S=sanshyuum@0.3 & W=warrior-servant@0.72<; S talk; W talk; ship forerunner 1.2>-0.2 0.16 slow',
      },
    ],
    after: [
      {
        title: 'Fellow Warriors', when: 'c. 107,472 BCE', where: 'Citadel Charum',
        text: 'The captured humans hid their ranks, but the Didact found Forthencho, Lord of Admirals, among them. He met him as a fellow warrior.',
        source: 'Halopedia: Forthencho',
        scene: 'D=didact@0.16; A=ancient-human-soldier@0.6< & F=forthencho@0.72< & B=ancient-human-soldier@0.84<; D>0.46; D talk; F talk',
      },
      {
        title: 'The Search for a Cure',
        text: 'The Forerunners believed humans had found a cure for the Flood. The Composers turned the captives into stored data so their minds could be searched. No cure was found.',
        source: 'Halopedia: Battle of Charum Hakkor',
        scene: 'W=warrior-servant@0.14; A=ancient-human-soldier@0.42 & B=ancient-human-soldier@0.56 & C=ancient-human-soldier@0.7; beam 0.56 & A data & B data & C data; W talk',
      },
      {
        title: 'Exile', where: 'Erde-Tyrene (Earth)',
        text: 'Humanity was made primitive again and sent back to its homeworld, Earth. The Librarian was given Earth to watch over.',
        source: 'Halo: Cryptum; Halopedia: Halo: Cryptum',
        scene: 'bg sky #5a8ad0 #cfe4f0 #4a7a3a; C=chakas@0.36 & R=riser@0.46; ship forerunner 0.5>1.25 0.18; beam 0.8 #e8f8ff',
      },
    ],
  },

  // The same gates as 1a, now held by human defenders.
  legend: {
    h: { unit: hs },
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
    { on: 'start', do: [{ objective: 'Break the outer defenses' }, { allies: [{ unit: ws, n: 2, from: 'sky' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: hs, n: 2, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Take the outer defenses' },
        { wave: [{ unit: hs, n: 3, from: 'G' }] },
        { wave: [{ unit: hv, n: 1, from: 'G' }, { unit: hs, n: 2, from: 'right' }] },
        { wave: [{ unit: hs, n: 4, from: 'G' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Push into the city' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: hs, n: 2, from: 'right' }, { unit: hv, n: 1, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Take the city' },
        { allies: [{ unit: ws, n: 2, from: 'E' }] },
        { hold: { seconds: 50, every: 7, label: 'ASSAULT', groups: [
          [{ unit: hs, n: 2, from: 'H' }],
          [{ unit: hv, n: 1, from: 'H' }, { unit: hs, n: 1, from: 'H' }],
          [{ unit: hs, n: 3, from: 'right' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Reach Citadel Charum' },
      ],
    },
    { on: 'I', do: [{ intensity: 1 }, { call: 'bombard' }] },
    {
      on: 'J',
      do: [
        { lock: ['J', 'K'] },
        { objective: 'Break the last stand' },
        { intensity: 2 },
        { wave: [{ unit: hs, n: 3, from: 'L' }, { unit: hv, n: 1, from: 'M' }] },
        { wave: [{ unit: hs, n: 4, from: 'L' }, { unit: hv, n: 2, from: 'L' }] },
        { call: 'surrender' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    // The Didact's fleet strikes the city ahead of the players.
    async bombard(api) {
      const { scene, fx } = api;
      for (let i = 0; i < 6; i++) {
        await new Promise((r) => scene.time.delayedCall(450, r));
        const p = api.players.find((pl) => pl.alive);
        if (!p) return;
        const x = p.x + 90 + i * 45;
        const ground = (api.marker('J').y + 1) * api.tile;
        const beam = scene.add.rectangle(x, 0, 6, ground, 0x45e6ff, 0.9).setOrigin(0.5, 0).setBlendMode('ADD').setDepth(35);
        scene.tweens.add({ targets: beam, alpha: 0, scaleX: 4, duration: 400, onComplete: () => beam.destroy() });
        api.explode(x, ground - 8, 44, 60);
        fx.shake(0.012, 200);
      }
    },
    // The last defenders lay down their arms; the Didact finds Forthencho.
    async surrender(api) {
      const { scene, fx, hud } = api;
      for (const u of api.units) if (u.alive && u.team === 'enemies') fx.puff(u.x, u.y, '#ffcc33'), u.disableBody(true, true), (u.alive = false);
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.slowmo(0.5, 2000);
      const m = api.marker('L');
      scene.spawnUnit('forthencho-npc', m.x * api.tile, (m.y + 1) * api.tile, { team: 'neutral' });
      await hud.say('The last defenders of Charum Hakkor surrendered.', null, null, 3.5);
      await hud.say('Among the captives, the Didact found Forthencho, Lord of Admirals.', null, null, 3.5);
    },
  },
};
