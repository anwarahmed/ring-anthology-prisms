// 1f · The Cryptum. Spec: docs/CAMPAIGN.md (1f).
// Canon checked against Halopedia: Halo: Cryptum (2026-10-18). A breather level: the
// route across the savanna and crater is staging; the events in the crater are canon.

export default {
  id: '1f',
  title: 'The Cryptum',
  era: 'forerunner',
  theme: 'erde-tyrene',
  music: 'erde-tyrene',
  players: ['bornstellar', 'chakas'],

  archive: {
    before: [
      {
        title: 'Erde-Tyrene', when: 'About 100,000 years ago', where: 'Earth',
        text: "After the war, humanity lived simply on Earth, under the Librarian's watch. Most of its old knowledge was gone.",
        source: 'Halo: Cryptum; Halopedia: Halo: Cryptum',
        scene: 'bg sky #6a9ad8 #d8ecf0 #5a8a3a; C=chakas@0.3 & R=riser@0.42; fire 0.6; C kneel',
      },
      {
        title: 'Bornstellar', where: 'Earth',
        text: 'Bornstellar, a young Forerunner, refused to become a Builder. He came to Earth looking for treasures left by the Precursors. Two humans, Chakas and Riser, became his guides.',
        source: 'Halopedia: Halo: Cryptum',
        scene: 'bg sky #6a9ad8 #d8ecf0 #5a8a3a; C=chakas@0.24 & R=riser@0.34; B=bornstellar@1.1<; B>0.58; B talk; C talk',
      },
    ],
    after: [
      {
        title: 'The Didact Wakes', where: 'The Djamonkin Crater',
        text: 'In the crater stood a Cryptum, guarded by ancient war sphinxes. Without knowing it, Chakas and Riser carried the code that opened it. Inside, the Didact woke from his long sleep.',
        source: 'Halopedia: Halo: Cryptum',
        scene: 'D=didact@0.62; D seal; C=chakas@0.24 & R=riser@0.34 & B=bornstellar@0.12; C>0.46; D wake; D talk',
      },
      {
        title: 'Escape', where: 'The Djamonkin Crater',
        text: 'A Forerunner fleet arrived. The Didact escaped in a ship grown from beneath the crater, taking Bornstellar, Chakas, Riser and his war sphinxes with him.',
        source: 'Halopedia: Halo: Cryptum',
        scene: 'fleet forerunner 3; B=bornstellar@0.36 & C=chakas@0.24 & R=riser@0.3 & D=didact@0.5; beam 0.38 & B beamout & C beamout & R beamout & D beamout; ship forerunner 0.4>1.25 0.3 big',
      },
    ],
  },

  legend: {},

  map: [
    '#..............................................................................................................................................................................................#',
    '#..............................................................................................................................................................................................#',
    '#.....................................................................................................................:::::::::::::::::::::::::::::::::::::::::::::::::........................#',
    '#.....................................................................................................................:::::::::::::::::::::::::::::::::::::::::::::::::........................#',
    '#.....................................................................................................................:::::::::::::::::::::::::::::::::::::::::::::::::........................#',
    '#.....................................................................................................................:::::::::::::::::::::::::::::::::::::::::::::::::........................#',
    '#.....................................................................................................................:::::::::::::::::::::::::::::::::::::::::::::::::........................#',
    '#.............................................................................................=====...................:::::::::::::::::::::::::::::::::::::::::::::::::........................#',
    '#.......................................................................................................########......::::::::::::::::::::::::::::::::=======::::::::::.....................X..#',
    '#...................................................======........######..............=======...........########......::::::::======:::::::::::::::::::::::::::::::::::...........##############',
    '#.............................................................A...##############....................B...##############:::::::::::::::::::::::::::::::::::::::::::::::::.....####################',
    '#...........................########........................####################..................####################:::::::::::::::::::::::::::::::::::::::::::::::::#########################',
    '#..P................########################....^^^.........####################....^^^...........####################::C:::::::::::::::::::::J::::::::::::::::::::::::#########################',
    '################################################################################################################################################################################################',
    '################################################################################################################################################################################################',
    '################################################################################################################################################################################################',
    '################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Follow your guides to the crater' }] },
    { on: 'A', do: [{ objective: 'Cross the highlands' }] },
    { on: 'B', do: [{ checkpoint: true }, { objective: 'Climb down into the Djamonkin Crater' }] },
    { on: 'C', do: [{ objective: 'Find what is hidden here' }, { intensity: 1 }] },
    { on: 'J', do: [{ call: 'wake' }, { objective: "A fleet is coming! Reach the Didact's ship" }, { intensity: 2 }] },
  ],

  hooks: {
    // The Cryptum opens, the Didact wakes, and a Forerunner fleet appears overhead.
    async wake(api) {
      const { scene, fx, hud, audio } = api;
      const before = api.players.map((p) => p.invulnUntil);
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      const m = api.marker('J');
      const x = (m.x + 6) * api.tile, y = (m.y + 1) * api.tile;
      const pillar = scene.add.rectangle(x, y, 18, 220, 0xff9a3a, 0.75).setOrigin(0.5, 1).setBlendMode('ADD').setDepth(30);
      scene.tweens.add({ targets: pillar, alpha: 0.2, scaleX: 3, duration: 1400, yoyo: true });
      fx.ring(x, y - 30, 0xffa03a, 3, 900);
      audio.sfx('teleport');
      await new Promise((r) => scene.time.delayedCall(900, r));
      scene.spawnUnit('didact-npc', x, y, { team: 'neutral' });
      fx.flash(0xffd0a0, 500);
      fx.slowmo(0.5, 1500);
      await hud.say('Chakas and Riser carried the code that opened the Cryptum. The Didact woke.', null, null, 4);
      fx.shake(0.012, 1200);
      await hud.say('Then a Forerunner fleet appeared in the sky.', null, null, 3);
      hud.letterbox(false);
      api.players.forEach((p, i) => { p.invulnUntil = before[i]; });
      hud.timer('FLEET', 40);
    },
  },
};
