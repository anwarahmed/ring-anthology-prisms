// Visual themes: tile colors and parallax backdrop layers for a place.
// Backdrop layer types (drawn by src/engine/backdrop.js):
//   gradient {top, bottom}           stars {count}
//   planet {x, y, r, color, shade}   halo {x, y, r, k, rot, scroll, glow}  (a whole ring seen from off it)
//   ringrise {x, horizon, top, bottom, lean, haze, dim}  (standing on a ring: its far side rising into the sky)
//   ships {count, color, scroll, beams}   spires {color, glow, scroll, height, density}
//   smoke {color, alpha, scroll, y, height}   hills {color, rim, scroll, height}
//   mountains {color, light, shadow, cap, scroll, height}   clouds {color, light, shade, y, height, count, scroll, alpha}
//   ruins {color, light, shadow, glow, scroll, height}   lightshafts {color, count, alpha, angle, scroll}
//   industrial {color, rim, light, scroll, height}   temple {style: stone | forerunner, color, light, shadow, glow, sconce, scroll}
//   fog {color, alpha, y, height, scroll, speed}   beacons {color, count, scroll}
// atmosphere {color, amount}: far layers fade toward it.  grade {saturate, contrast, brightness}.
// props / foreground: see src/engine/scenery.js.
//   embers {color}   haze {color, alpha}
// x/y in backdrop layers are fractions of the screen.

export const THEMES = {
  'charum-hakkor': {
    tiles: { solid: '#5c3f2c', top: '#d29a38', edge: '#ffe38a', platform: '#9a6230', hazard: '#ff5a1f', back: '#3c2a2c', window: '#ffc23a' },
    atmosphere: { color: '#d8607a', amount: 0.55 },
    grade: { saturate: 0.1, contrast: 0.14 },
    backdrop: [
      { type: 'gradient', top: '#120838', bottom: '#f0584e' },
      { type: 'stars', count: 120 },
      { type: 'planet', x: 0.78, y: 0.24, r: 40, color: '#e8885c', shade: '#b8584a' },
      { type: 'clouds', color: '#c05a7a', light: '#ffb08a', shade: '#6a2a5a', y: 0.08, height: 0.3, count: 5, scroll: 0.03, alpha: 0.9 },
      { type: 'mountains', color: '#6a2a60', light: '#e07a8a', shadow: '#341848', scroll: 0.06, height: 0.55 },
      { type: 'ships', count: 5, color: '#7a88a8', scroll: 0.05, beams: '#45e6ff' },
      { type: 'lightshafts', color: '#ffb08a', count: 4, alpha: 0.24, scroll: 0.08 },
      { type: 'spires', color: '#5a2458', glow: '#ffb347', scroll: 0.15, height: 0.62, density: 0.6 },
      { type: 'smoke', color: '#8a3a5a', alpha: 0.5, scroll: 0.2, y: 0.42, height: 0.4 },
      { type: 'haze', color: '#ff6a3d', alpha: 0.1 },
      { type: 'ruins', color: '#4a1e40', light: '#c86a6a', shadow: '#1e0a22', glow: '#ffc23a', scroll: 0.32, height: 0.42 },
      { type: 'spires', color: '#341238', glow: '#ffc23a', scroll: 0.42, height: 0.45, density: 0.3 },
      { type: 'smoke', color: '#4a1c3a', alpha: 0.65, scroll: 0.55, y: 0.66, height: 0.35 },
      { type: 'embers', color: '#ffc23a' },
    ],
    props: [
      { kind: 'rubble', chance: 0.12, color: '#7a5a42' },
      { kind: 'rocks', chance: 0.06, color: '#8a6a52' },
      { kind: 'lamp', chance: 0.035, color: '#4a3020', glow: '#ffb347' },
      { kind: 'rubble', chance: 0.05, front: true, color: '#5a3a2a' },
    ],
    foreground: { kind: 'pillars', color: '#140814', rim: '#5a2a3a', every: 640 },
  },
  // 1c: a Forerunner ship overrun by the Flood.
  'forerunner-ship': {
    tiles: { style: 'metal', solid: '#2c3c5e', top: '#5a7ab4', edge: '#cfeaff', glow: '#45e6ff', platform: '#4a6a9e', hazard: '#a8d84a', back: '#1a2240', window: '#45e6ff' },
    atmosphere: { color: '#1e2a52', amount: 0.4 },
    grade: { saturate: 0.09, contrast: 0.16 },
    props: [
      { kind: 'console', chance: 0.06, color: '#3a4a6a', glow: '#45e6ff' },
      { kind: 'growth', chance: 0.12, color: '#c8c060' },
      { kind: 'debris', chance: 0.06, color: '#6a7a9a' },
      { kind: 'growth', chance: 0.05, front: true, color: '#b8b050' },
    ],
    foreground: { kind: 'pillars', color: '#0a0e1e', rim: '#2a4a7a', every: 820 },
    backdrop: [
      { type: 'gradient', top: '#060a1e', bottom: '#1e2a52' },
      { type: 'lightshafts', color: '#45e6ff', count: 3, alpha: 0.17, scroll: 0.1 },
      { type: 'stars', count: 60 },
      { type: 'temple', style: 'forerunner', color: '#2a3866', light: '#6a8ac8', shadow: '#080c1e', glow: '#45e6ff', scroll: 0.5 },
      { type: 'fog', color: '#6a9a3a', alpha: 0.35, y: 0.55, height: 0.45, scroll: 0.5 },
      { type: 'beacons', color: '#45e6ff', count: 5, scroll: 0.5 },
      { type: 'smoke', color: '#4a6a2a', alpha: 0.35, scroll: 0.3, y: 0.55, height: 0.45 },
      { type: 'haze', color: '#7ad84a', alpha: 0.06 },
      { type: 'embers', color: '#c8f04a' },
    ],
  },
  // 1d: the Greater Ark, with the first Halos under construction.
  'greater-ark': {
    tiles: { style: 'metal', solid: '#a8b8d0', top: '#e4ecf8', edge: '#ffffff', glow: '#45c8ff', platform: '#8aa0c8', hazard: '#45e6ff', back: '#6a7c9c', window: '#9ff4ff' },
    atmosphere: { color: '#5aa0e8', amount: 0.5 },
    grade: { saturate: 0.1, contrast: 0.12 },
    props: [
      { kind: 'crystal', chance: 0.07, glow: '#45e6ff' },
      { kind: 'console', chance: 0.04, color: '#8a9ab8', glow: '#9ff4ff' },
    ],
    foreground: { kind: 'pillars', color: '#0e1a3a', rim: '#7ad8ff', every: 900 },
    backdrop: [
      { type: 'gradient', top: '#040a2a', bottom: '#2a7ac8' },
      { type: 'stars', count: 140 },
      { type: 'clouds', color: '#7aa8e0', light: '#e8f4ff', shade: '#3a5a9a', y: 0.45, height: 0.3, count: 6, scroll: 0.05, alpha: 0.85 },
      { type: 'lightshafts', color: '#bfe8ff', count: 4, alpha: 0.24, scroll: 0.08 },
      { type: 'halo', x: 0.5, y: 0.3, r: 250, k: 0.24, rot: -0.12, glow: '#7fd8ff' },
      { type: 'ships', count: 4, color: '#c8d4e8', scroll: 0.06, beams: '#45e6ff' },
      { type: 'spires', color: '#2a3a6a', glow: '#9ff4ff', scroll: 0.2, height: 0.7, density: 0.5 },
      { type: 'haze', color: '#45c8ff', alpha: 0.08 },
      { type: 'industrial', color: '#3a4a7a', rim: '#bfe8ff', light: '#45e6ff', scroll: 0.42, height: 0.6 },
    ],
  },
  // 1e: Janjur Qom, the San'Shyuum homeworld, as a Halo charges in its sky.
  'janjur-qom': {
    tiles: { solid: '#5c3a6c', top: '#d0a440', edge: '#ffe08a', platform: '#8a5aa4', hazard: '#ff6a3a', back: '#3a2450', window: '#ffd27a' },
    atmosphere: { color: '#a85a9a', amount: 0.5 },
    grade: { saturate: 0.1, contrast: 0.14 },
    props: [
      { kind: 'lamp', chance: 0.05, color: '#3a2040', glow: '#ffd27a' },
      { kind: 'plant', chance: 0.08, color: '#4a8a6a' },
      { kind: 'rubble', chance: 0.06, color: '#7a5a8a' },
      { kind: 'plant', chance: 0.04, front: true, color: '#3a6a5a' },
    ],
    foreground: { kind: 'pillars', color: '#1a0a24', rim: '#c8a040', every: 860 },
    backdrop: [
      { type: 'gradient', top: '#081a3e', bottom: '#c05a9a' },
      { type: 'stars', count: 90 },
      { type: 'planet', x: 0.18, y: 0.2, r: 22, color: '#8ad0e0', shade: '#4a8aa8' },
      { type: 'clouds', color: '#b06aa8', light: '#ffc8d8', shade: '#5a2a6a', y: 0.2, height: 0.3, count: 5, scroll: 0.04, alpha: 0.85 },
      { type: 'mountains', color: '#5a3a7a', light: '#c88ab8', shadow: '#2a1848', scroll: 0.07, height: 0.45 },
      { type: 'ruins', color: '#3e1e50', light: '#e0b850', shadow: '#1a0a28', glow: '#ffd27a', scroll: 0.3, height: 0.4 },
      { type: 'halo', x: 0.62, y: 0.26, r: 170, k: 0.3, rot: 0.18, glow: '#ffffff' },
      { type: 'ships', count: 3, color: '#b8c4dc', scroll: 0.05, beams: '#45e6ff' },
      { type: 'spires', color: '#4a2060', glow: '#ffd27a', scroll: 0.18, height: 0.55, density: 0.5 },
      { type: 'smoke', color: '#7a3a7a', alpha: 0.45, scroll: 0.3, y: 0.6, height: 0.35 },
      { type: 'spires', color: '#2c1240', glow: '#ffc23a', scroll: 0.45, height: 0.4, density: 0.35 },
    ],
  },
  // 1f: ancient Earth: the Djamonkin Crater under a bright sky.
  'erde-tyrene': {
    tiles: { style: 'rock', solid: '#7a5236', top: '#4ca83e', edge: '#a8e86a', platform: '#9a7044', hazard: '#ff7a2a', back: '#4e3626', window: '#ffd27a' },
    atmosphere: { color: '#bcd8f0', amount: 0.55 },
    grade: { saturate: 0.11, contrast: 0.1 },
    props: [
      { kind: 'grass', chance: 0.3, color: '#6ac048' },
      { kind: 'rocks', chance: 0.07, color: '#9a7a5a' },
      { kind: 'plant', chance: 0.07, color: '#3e8a3a' },
      { kind: 'grass', chance: 0.15, front: true, color: '#5ab040' },
    ],
    foreground: { kind: 'ferns', color: '#0e2a14', rim: '#3a8a3a', every: 700 },
    backdrop: [
      { type: 'gradient', top: '#2a6ad8', bottom: '#ffd890' },
      { type: 'planet', x: 0.82, y: 0.18, r: 16, color: '#fff4c0', shade: '#ffe08a' },
      { type: 'clouds', color: '#e8f0ff', light: '#ffffff', shade: '#a8bcd8', y: 0.06, height: 0.32, count: 6, scroll: 0.04 },
      { type: 'mountains', color: '#7a6aa0', light: '#c8b8e8', shadow: '#4a3a70', cap: '#ffffff', scroll: 0.05, height: 0.6 },
      { type: 'lightshafts', color: '#fff4c0', count: 3, alpha: 0.2, scroll: 0.08 },
      { type: 'smoke', color: '#ffffff', alpha: 0.7, scroll: 0.08, y: 0.08, height: 0.3 },
      { type: 'hills', color: '#7a6aa8', rim: '#c8b8f0', scroll: 0.1, height: 0.5 },
      { type: 'hills', color: '#4a7a4a', rim: '#9ad870', scroll: 0.25, height: 0.38 },
      { type: 'hills', color: '#2e5a32', rim: '#6ab850', scroll: 0.45, height: 0.26 },
    ],
  },
  // 2a, 2f: the UNSC Pillar of Autumn.
  'pillar-of-autumn': {
    tiles: { style: 'metal', solid: '#4a5250', top: '#7a8478', edge: '#d0d8d0', glow: '#ffb040', platform: '#6a6c5c', hazard: '#ff5a2a', back: '#2e3436', window: '#ffb040' },
    atmosphere: { color: '#1a2026', amount: 0.35 },
    grade: { saturate: 0.08, contrast: 0.16 },
    props: [
      { kind: 'console', chance: 0.07, color: '#4a5450', glow: '#ffb040' },
      { kind: 'debris', chance: 0.08, color: '#7a8478' },
      { kind: 'debris', chance: 0.04, front: true, color: '#4a5048' },
    ],
    foreground: { kind: 'pillars', color: '#0a0c0e', rim: '#5a6a5a', every: 820 },
    backdrop: [
      { type: 'gradient', top: '#04060c', bottom: '#1a2026' },
      { type: 'lightshafts', color: '#ffb040', count: 3, alpha: 0.14, scroll: 0.1 },
      { type: 'stars', count: 70 },
      { type: 'fog', color: '#a8703a', alpha: 0.45, y: 0.15, height: 0.6, scroll: 0.15 },
      { type: 'industrial', color: '#262c2e', rim: '#8a7a5a', light: '#ff3a2a', scroll: 0.2, height: 0.8 },
      { type: 'fog', color: '#6a4a2a', alpha: 0.4, y: 0.45, height: 0.5, scroll: 0.3 },
      { type: 'industrial', color: '#14181a', rim: '#c89a5a', light: '#ffb040', scroll: 0.4, height: 0.65 },
      { type: 'smoke', color: '#3a3a3a', alpha: 0.4, scroll: 0.3, y: 0.55, height: 0.45 },
      { type: 'haze', color: '#ff7a2a', alpha: 0.05 },
    ],
  },
  // 2b: Installation 04: grassland under the ring arching into the sky.
  'installation-04': {
    tiles: { style: 'rock', solid: '#6a5a44', top: '#4ca83e', edge: '#a8e86a', platform: '#8a9498', hazard: '#ff7a2a', back: '#5a5e66', window: '#7ad8ff' },
    atmosphere: { color: '#a8c8f0', amount: 0.55 },
    grade: { saturate: 0.1, contrast: 0.1 },
    props: [
      { kind: 'grass', chance: 0.3, color: '#5ab048' },
      { kind: 'rocks', chance: 0.06, color: '#8a8a8a' },
      { kind: 'plant', chance: 0.06, color: '#3a8a40' },
      { kind: 'grass', chance: 0.15, front: true, color: '#4aa040' },
    ],
    foreground: { kind: 'ferns', color: '#0e2a16', rim: '#3a8a40', every: 760 },
    backdrop: [
      { type: 'gradient', top: '#2a6ad8', bottom: '#c8e4ff' },
      { type: 'ringrise', x: 0.56, horizon: 0.74, haze: '#c8dcf8' },
      { type: 'clouds', color: '#e8f0ff', light: '#ffffff', shade: '#a8bcd8', y: 0.04, height: 0.3, count: 5, scroll: 0.04 },
      { type: 'mountains', color: '#6a7aa8', light: '#c0d0f0', shadow: '#3a4a7a', cap: '#ffffff', scroll: 0.06, height: 0.55 },
      { type: 'hills', color: '#6a8ab8', rim: '#bcd4f0', scroll: 0.1, height: 0.42 },
      { type: 'hills', color: '#3e7a44', rim: '#8ad06a', scroll: 0.25, height: 0.32 },
      { type: 'hills', color: '#2a5a30', rim: '#5ab048', scroll: 0.45, height: 0.22 },
    ],
  },
  // 2c: the Silent Cartographer's island beach.
  'installation-04-beach': {
    tiles: { style: 'rock', solid: '#a88a5a', top: '#e8d090', edge: '#fff4c0', platform: '#8a9498', hazard: '#ff7a2a', back: '#5a5e66', window: '#7ad8ff' },
    atmosphere: { color: '#b8dcff', amount: 0.55 },
    grade: { saturate: 0.11, contrast: 0.1 },
    props: [
      { kind: 'rocks', chance: 0.08, color: '#b89a70' },
      { kind: 'plant', chance: 0.06, color: '#3a9a50' },
      { kind: 'grass', chance: 0.1, front: true, color: '#8ab850' },
    ],
    foreground: { kind: 'ferns', color: '#0a2a1a', rim: '#4aa060', every: 820 },
    backdrop: [
      { type: 'gradient', top: '#1a5ad0', bottom: '#d8f0ff' },
      { type: 'ringrise', x: 0.56, horizon: 0.74, haze: '#d8ecff' },
      { type: 'clouds', color: '#e8f4ff', light: '#ffffff', shade: '#b0c8e0', y: 0.05, height: 0.28, count: 5, scroll: 0.04 },
      { type: 'hills', color: '#2a7ac8', rim: '#bfefff', scroll: 0.12, height: 0.18 },
      { type: 'hills', color: '#3a8a4a', rim: '#8ad06a', scroll: 0.3, height: 0.28 },
    ],
  },
  // 2d: the swamp at night, where the Flood is found.
  'installation-04-swamp': {
    tiles: { style: 'rock', solid: '#3a3828', top: '#3a5a2a', edge: '#6a8a3a', platform: '#5a6064', hazard: '#a8d84a', back: '#26282a', window: '#7ad8ff' },
    atmosphere: { color: '#1a3a3a', amount: 0.5 },
    grade: { saturate: 0.08, contrast: 0.16, brightness: 0.95 },
    props: [
      { kind: 'plant', chance: 0.12, color: '#2a5a3a' },
      { kind: 'growth', chance: 0.06, color: '#a8a850' },
      { kind: 'grass', chance: 0.2, color: '#3a6a3a' },
      { kind: 'plant', chance: 0.08, front: true, color: '#1a3a2a' },
    ],
    foreground: { kind: 'ferns', color: '#040c0a', rim: '#1e4a3a', every: 640 },
    backdrop: [
      { type: 'gradient', top: '#04060e', bottom: '#14262a' },
      { type: 'stars', count: 120 },
      { type: 'ringrise', x: 0.56, horizon: 0.74, haze: '#2a3a4a', dim: 0.55 },
      { type: 'hills', color: '#18262a', rim: '#2e4a44', scroll: 0.15, height: 0.45 },
      { type: 'fog', color: '#3a6a5a', alpha: 0.45, y: 0.5, height: 0.4, scroll: 0.2 },
      { type: 'beacons', color: '#7ad8ff', count: 3, scroll: 0.2 },
      { type: 'smoke', color: '#3a5a4a', alpha: 0.5, scroll: 0.25, y: 0.5, height: 0.45 },
      { type: 'hills', color: '#0e1a18', rim: '#2a3a2a', scroll: 0.45, height: 0.3 },
      { type: 'embers', color: '#a8f04a' },
    ],
  },
  // 2e: cliffs near Alpha Base at dusk.
  'installation-04-dusk': {
    tiles: { style: 'rock', solid: '#5a4a44', top: '#5a8a3e', edge: '#b8d86a', platform: '#8a9498', hazard: '#ff7a2a', back: '#4a4a56', window: '#ffb040' },
    atmosphere: { color: '#d88a8a', amount: 0.5 },
    grade: { saturate: 0.1, contrast: 0.12 },
    props: [
      { kind: 'grass', chance: 0.25, color: '#7a9a48' },
      { kind: 'rocks', chance: 0.07, color: '#8a6a6a' },
      { kind: 'grass', chance: 0.12, front: true, color: '#6a8a40' },
    ],
    foreground: { kind: 'ferns', color: '#1a0e1a', rim: '#8a5a6a', every: 780 },
    backdrop: [
      { type: 'gradient', top: '#2a1a5a', bottom: '#ff9a6a' },
      { type: 'ringrise', x: 0.56, horizon: 0.74, haze: '#f0b8a8' },
      { type: 'clouds', color: '#d88aa8', light: '#ffd0b0', shade: '#6a3a6a', y: 0.08, height: 0.3, count: 5, scroll: 0.04 },
      { type: 'hills', color: '#5a4a7a', rim: '#c89ab8', scroll: 0.12, height: 0.42 },
      { type: 'hills', color: '#3a3a4a', rim: '#8a6a6a', scroll: 0.3, height: 0.3 },
    ],
  },
};
