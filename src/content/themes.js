// Visual themes: tile colors and parallax backdrop layers for a place.
// Backdrop layer types (drawn by src/engine/backdrop.js):
//   gradient {top, bottom}           stars {count}
//   planet {x, y, r, color, shade}   halo {x, y, rx, ry, color, tilt}  (only where canon puts a ring)
//   ships {count, color, scroll, beams}   spires {color, glow, scroll, height, density}
//   embers {color}                   haze {color, alpha}
// x/y in backdrop layers are fractions of the screen.

export const THEMES = {
  'charum-hakkor': {
    tiles: { solid: '#3a2e26', top: '#8a6d3b', edge: '#e8c46a', platform: '#5a4632', hazard: '#ff6a3d', back: '#2a221d' },
    backdrop: [
      { type: 'gradient', top: '#120b24', bottom: '#5a2a3a' },
      { type: 'stars', count: 90 },
      { type: 'planet', x: 0.78, y: 0.22, r: 38, color: '#c98b6a', shade: '#5a3040' },
      { type: 'ships', count: 5, color: '#1b1f2e', scroll: 0.05, beams: '#7fd8ff' },
      { type: 'spires', color: '#2a1d22', glow: '#ff9a3d', scroll: 0.2, height: 0.55, density: 0.5 },
      { type: 'haze', color: '#ff7a3d', alpha: 0.12 },
      { type: 'spires', color: '#1c1418', glow: '#ffb04a', scroll: 0.45, height: 0.4, density: 0.35 },
      { type: 'embers', color: '#ffb04a' },
    ],
  },
};
