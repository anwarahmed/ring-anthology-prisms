// 3j · The Shield World. Spec: docs/CAMPAIGN.md (3j). Echo partner: 5g.
// Canon checked against Halo Wars and Halopedia: Trove, Ripa 'Moramee, John Forge,
// Spirit of Fire (2026-10-18). The fights are staging; the shield world, Ripa
// 'Moramee using Professor Anders to wake the Forerunner fleet, Forge defeating him
// with an energy sword, the detonation that sent the sun supernova, Forge staying
// behind (told gently) and the ship drifting with its crew in cryo sleep are canon.

const el = 'elite';
const em = 'elite-major';
const fl = 'flood-marine';
const fe = 'flood-elite';
const inf = 'flood-infection';

export default {
  id: '3j',
  title: 'The Shield World',
  era: 'covenant',
  theme: 'trove',
  music: 'flood-dread',
  players: ['forge', 'red-team-spartan'],

  archive: {
    before: [
      {
        title: 'A Hidden World', when: '2531',
        text: 'The Spirit of Fire followed the Covenant to a secret Forerunner world, built inside a giant shell: a shield world.',
        source: 'Halo Wars; Halopedia: Trove',
        scene: 'bg space; planet 0.76 0.45 0.16 #6a6a7a; A=ship:unsc-big@-0.2,0.4; A>0.6,0.45; A hide',
      },
      {
        title: 'The Fleet',
        text: "Arbiter Ripa 'Moramee had captured Professor Ellen Anders. He was using her to wake a hidden fleet of Forerunner ships.",
        source: "Halo Wars; Halopedia: Ripa 'Moramee",
        scene: 'R=ripa-moramee@0.6<; fleet forerunner 4 & R glow #7ae8ff',
      },
    ],
    after: [
      {
        title: 'The Arbiter Falls', when: '2531',
        text: "Sergeant Forge defeated Ripa 'Moramee with an energy sword.",
        source: "Halo Wars; Halopedia: Ripa 'Moramee",
        scene: 'F=forge@0.24; R=ripa-moramee@0.76<; F>0.46 & R>0.6; R fire F; F fire R; R down',
      },
      {
        title: 'The Star',
        text: "To stop the fleet, the crew set the Spirit of Fire's engine core to explode inside the shield world, which made its sun go supernova. Someone had to stay behind to set it off. Sergeant Forge chose to stay.",
        source: 'Halo Wars; Halopedia: John Forge',
        scene: 'F=forge@0.42; A=ship:unsc-big@0.5,0.25; F face >; A>1.25,0.15; F glow #ffd27a; flash #fff4c0; boom 0.72 0.35 big',
      },
      {
        title: 'Adrift',
        text: "The Spirit of Fire escaped, but it had given up its faster-than-light drive. The crew went into cryo sleep, drifting through space.",
        source: 'Halo Wars; Halopedia: Spirit of Fire',
        scene: 'bg space; A=ship:unsc-big@0.18,0.46; A>0.6,0.42',
      },
      {
        title: 'The Price',
        text: 'Forge gave his life for the crew.',
        source: 'Halopedia: John Forge',
        scene: 'F=forge@0.45; beam 0.45 #fff0c0; F glow #ffd27a',
      },
    ],
  },

  legend: {},

  map: [
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::=======:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::========:::::::::::::::::::::::::::::::::::::::::::::=======:::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::=========::::::::::::======::::::::::::::::::::::========::::::::::::::::::::::::::::::::::::::::::::::::::::========:::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::=======::::::::::::::::::::::::::::::::::::::::::::::=====::::::::::::::::::::::::::::=====:::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::========:::::==:==::::::::::::::::::::::::::::::::::::::::::::::::::::::=====::::##:#::::::::::::::::::::::::::::::::::::::::::::::======:::::::::::::::::::::::::::::::====:=::::::::::::::::#',
    '#:::::::::::::::::::::::::::###:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::##.#::::::::::::::::::::::::::::::##:::::::::::::::::::::::::::::::::::::::::::##::::::::::::::::::::::::::::#',
    '#::P::::::::::::::::::::A:::###:::::^^^:::::::::B::::::::::::::###::::G:::C:::::::::::::::##D#::^^^:::::::::E:::::::::::::::##:::::M:::F::::::::::^^^:::::::::H::::::::::##::::::::::L:::I::J::::::X:::#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Find Professor Anders' }] },
    { on: 'A', do: [{ spawn: [{ unit: el, n: 2, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Fight through the Covenant guard' },
        { intensity: 1 },
        { wave: [{ unit: el, n: 2, from: 'right' }, { unit: 'grunt', n: 3, from: 'sky' }] },
        { wave: [{ unit: em, n: 1, from: 'G' }, { unit: el, n: 2, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'The Flood are loose here too' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: inf, n: 6, from: 'right', gap: 0.2 }, { unit: fl, n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold off the Flood' },
        { hold: { seconds: 45, every: 5, label: 'HOLD', groups: [
          [{ unit: inf, n: 6, from: 'right', gap: 0.15 }],
          [{ unit: fl, n: 2, from: 'M' }, { unit: fe, n: 1, from: 'right' }],
          [{ unit: fe, n: 2, from: 'right' }, { unit: inf, n: 4, from: 'left', gap: 0.15 }],
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
        { objective: 'Stop the Arbiter' },
        { boss: { unit: 'ripa-moramee', from: 'L', title: "Ripa 'Moramee", subtitle: 'Arbiter' } },
        { call: 'supernova' },
        { end: { result: 'history' } },
      ],
    },
  ],

  hooks: {
    // As history records: the engine core goes off and the sun goes supernova. Shown
    // only as light; Forge's choice is told on the Archive cards.
    async supernova(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      hud.timer('DETONATION', 8);
      fx.shake(0.015, 6000);
      await hud.say("The crew set the Spirit of Fire's engine core to explode.", null, null, 3.5);
      hud.timer(null);
      fx.slowmo(0.4, 2500);
      scene.cameras.main.flash(2000, 255, 240, 200);
      await hud.say('The star went supernova, and the Forerunner fleet was gone.', null, null, 3.5);
    },
  },
};
