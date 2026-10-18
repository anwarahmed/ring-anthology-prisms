// Visual themes: tile colors and parallax backdrop layers for a place.
// Backdrop layer types (drawn by src/engine/backdrop.js):
//   gradient {top, bottom}           stars {count}
//   planet {x, y, r, color, shade}   halo {x, y, rx, ry, color, tilt}  (only where canon puts a ring)
//   ships {count, color, scroll, beams}   spires {color, glow, scroll, height, density}
//   smoke {color, alpha, scroll, y, height}   embers {color}   haze {color, alpha}
// x/y in backdrop layers are fractions of the screen.

export const THEMES = {
  'charum-hakkor': {
    tiles: { solid: '#4a3a2e', top: '#9a7a44', edge: '#f0cf78', platform: '#6a5236', hazard: '#ff6a3d', back: '#2c231e', window: '#ffb04a' },
    backdrop: [
      { type: 'gradient', top: '#0c0820', bottom: '#7a3340' },
      { type: 'stars', count: 110 },
      { type: 'planet', x: 0.78, y: 0.24, r: 40, color: '#d39a72', shade: '#b67a5e' },
      { type: 'ships', count: 5, color: '#59647a', scroll: 0.05, beams: '#7fd8ff' },
      { type: 'spires', color: '#3a2630', glow: '#ff9a3d', scroll: 0.15, height: 0.62, density: 0.6 },
      { type: 'smoke', color: '#5a3040', alpha: 0.55, scroll: 0.2, y: 0.42, height: 0.4 },
      { type: 'haze', color: '#ff7a3d', alpha: 0.1 },
      { type: 'spires', color: '#24171c', glow: '#ffb04a', scroll: 0.4, height: 0.45, density: 0.4 },
      { type: 'smoke', color: '#2e1a20', alpha: 0.7, scroll: 0.55, y: 0.66, height: 0.35 },
      { type: 'embers', color: '#ffb04a' },
    ],
  },
};
