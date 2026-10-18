// Visual themes: tile colors and parallax backdrop layers for a place.
// Backdrop layer types (drawn by src/engine/backdrop.js):
//   gradient {top, bottom}           stars {count}
//   planet {x, y, r, color, shade}   halo {x, y, r, k, rot, scroll, glow}  (painted ring; only where canon puts one)
//   ships {count, color, scroll, beams}   spires {color, glow, scroll, height, density}
//   smoke {color, alpha, scroll, y, height}   hills {color, rim, scroll, height}
//   embers {color}   haze {color, alpha}
// x/y in backdrop layers are fractions of the screen.

export const THEMES = {
  'charum-hakkor': {
    tiles: { solid: '#5c3f2c', top: '#d29a38', edge: '#ffe38a', platform: '#9a6230', hazard: '#ff5a1f', back: '#3c2a2c', window: '#ffc23a' },
    backdrop: [
      { type: 'gradient', top: '#120838', bottom: '#f0584e' },
      { type: 'stars', count: 120 },
      { type: 'planet', x: 0.78, y: 0.24, r: 40, color: '#e8885c', shade: '#b8584a' },
      { type: 'ships', count: 5, color: '#7a88a8', scroll: 0.05, beams: '#45e6ff' },
      { type: 'spires', color: '#5a2458', glow: '#ffb347', scroll: 0.15, height: 0.62, density: 0.6 },
      { type: 'smoke', color: '#8a3a5a', alpha: 0.5, scroll: 0.2, y: 0.42, height: 0.4 },
      { type: 'haze', color: '#ff6a3d', alpha: 0.12 },
      { type: 'spires', color: '#341238', glow: '#ffc23a', scroll: 0.4, height: 0.45, density: 0.4 },
      { type: 'smoke', color: '#4a1c3a', alpha: 0.65, scroll: 0.55, y: 0.66, height: 0.35 },
      { type: 'embers', color: '#ffc23a' },
    ],
  },
  // 1c: a Forerunner ship overrun by the Flood.
  'forerunner-ship': {
    tiles: { style: 'metal', solid: '#2c3c5e', top: '#5a7ab4', edge: '#cfeaff', glow: '#45e6ff', platform: '#4a6a9e', hazard: '#a8d84a', back: '#1a2240', window: '#45e6ff' },
    backdrop: [
      { type: 'gradient', top: '#060a1e', bottom: '#1e2a52' },
      { type: 'stars', count: 60 },
      { type: 'spires', color: '#18203e', glow: '#45e6ff', scroll: 0.25, height: 0.95, density: 0.9 },
      { type: 'smoke', color: '#4a6a2a', alpha: 0.35, scroll: 0.3, y: 0.55, height: 0.45 },
      { type: 'haze', color: '#7ad84a', alpha: 0.06 },
      { type: 'embers', color: '#c8f04a' },
    ],
  },
  // 1d: the Greater Ark, with the first Halos under construction.
  'greater-ark': {
    tiles: { style: 'metal', solid: '#a8b8d0', top: '#e4ecf8', edge: '#ffffff', glow: '#45c8ff', platform: '#8aa0c8', hazard: '#45e6ff', back: '#6a7c9c', window: '#9ff4ff' },
    backdrop: [
      { type: 'gradient', top: '#040a2a', bottom: '#2a7ac8' },
      { type: 'stars', count: 140 },
      { type: 'halo', x: 0.5, y: 0.3, r: 250, k: 0.24, rot: -0.12, glow: '#7fd8ff' },
      { type: 'ships', count: 4, color: '#c8d4e8', scroll: 0.06, beams: '#45e6ff' },
      { type: 'spires', color: '#2a3a6a', glow: '#9ff4ff', scroll: 0.2, height: 0.7, density: 0.5 },
      { type: 'haze', color: '#45c8ff', alpha: 0.08 },
      { type: 'spires', color: '#1a2650', glow: '#45e6ff', scroll: 0.45, height: 0.45, density: 0.35 },
    ],
  },
  // 1e: Janjur Qom, the San'Shyuum homeworld, as a Halo charges in its sky.
  'janjur-qom': {
    tiles: { solid: '#5c3a6c', top: '#d0a440', edge: '#ffe08a', platform: '#8a5aa4', hazard: '#ff6a3a', back: '#3a2450', window: '#ffd27a' },
    backdrop: [
      { type: 'gradient', top: '#081a3e', bottom: '#c05a9a' },
      { type: 'stars', count: 90 },
      { type: 'planet', x: 0.18, y: 0.2, r: 22, color: '#8ad0e0', shade: '#4a8aa8' },
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
    backdrop: [
      { type: 'gradient', top: '#2a6ad8', bottom: '#ffd890' },
      { type: 'planet', x: 0.82, y: 0.18, r: 16, color: '#fff4c0', shade: '#ffe08a' },
      { type: 'smoke', color: '#ffffff', alpha: 0.7, scroll: 0.08, y: 0.08, height: 0.3 },
      { type: 'hills', color: '#7a6aa8', rim: '#c8b8f0', scroll: 0.1, height: 0.5 },
      { type: 'hills', color: '#4a7a4a', rim: '#9ad870', scroll: 0.25, height: 0.38 },
      { type: 'hills', color: '#2e5a32', rim: '#6ab850', scroll: 0.45, height: 0.26 },
    ],
  },
};
