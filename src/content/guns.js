// Held weapon shapes, by kind. Coordinates are gun-local: origin at the firing hand,
// +x along the barrel, +y down. grip: where the support hand holds it; muzzle: where
// shots come out. Materials: gunBody, gunDark, gunGlow (colors from the weapon's `gun`).

export function gunShapes(kind, len = 16) {
  const L = len;
  switch (kind) {
    case 'cannon':
      return {
        grip: L * 0.45, muzzle: [L + 1, -1.2],
        shapes: [
          { t: 'cap', a: [-6, -1.2], b: [L, -1.2], r1: 3.3, r2: 2.9, m: 'gunBody' },
          { t: 'cap', a: [L * 0.35, -1.2], b: [L * 0.42, -1.2], r1: 3.7, r2: 3.7, m: 'gunDark', z: 0.2 },
          { t: 'cap', a: [L * 0.7, -1.2], b: [L * 0.76, -1.2], r1: 3.5, r2: 3.5, m: 'gunDark', z: 0.2 },
          { t: 'ell', c: [L, -1.2], rx: 1.3, ry: 2.6, m: 'gunGlow', z: 0.4, hot: true },
          { t: 'poly', pts: [[-1, 1.5], [2, 1.5], [1.5, 5], [-1.5, 5]], m: 'gunDark', z: -0.2 },
        ],
      };
    case 'lance':
      return {
        grip: L * 0.4, muzzle: [L + 2, 0],
        shapes: [
          { t: 'poly', pts: [[-5, -1.8], [L - 3, -1.3], [L + 2, 0], [L - 3, 1.4], [-5, 2]], m: 'gunBody', bevel: 1.3 },
          { t: 'poly', pts: [[2, -1.5], [7, -4.5], [9, -4], [6, -1]], m: 'gunBody', z: -0.1, bevel: 1 },
          { t: 'cap', a: [-2, 0], b: [L, 0], r1: 0.6, r2: 0.6, m: 'gunGlow', z: 0.4, hot: true, noSep: true },
        ],
      };
    case 'scatter':
      return {
        grip: L * 0.4, muzzle: [L + 1, 0],
        shapes: [
          { t: 'poly', pts: [[-5, -2.5], [L - 2, -3], [L, 0], [L - 2, 3], [-5, 2.5]], m: 'gunBody', bevel: 1.5 },
          { t: 'cap', a: [L - 3, -2.2], b: [L + 1, -3.2], r1: 0.8, r2: 0.6, m: 'gunGlow', z: 0.3, noSep: true },
          { t: 'cap', a: [L - 3, 2.2], b: [L + 1, 3.2], r1: 0.8, r2: 0.6, m: 'gunGlow', z: 0.3, noSep: true },
          { t: 'cap', a: [-1, 0], b: [L - 1, 0], r1: 0.6, r2: 0.6, m: 'gunGlow', z: 0.3, hot: true, noSep: true },
        ],
      };
    case 'rifle':
    default:
      return {
        grip: L * 0.5, muzzle: [L + 1, -0.7],
        shapes: [
          { t: 'poly', pts: [[-9, -1.2], [-3, -2.3], [-3, 1.6], [-8, 3.2]], m: 'gunBody', z: -0.1, bevel: 1.1 },
          { t: 'poly', pts: [[-3, -2.4], [L * 0.62, -2.4], [L * 0.66, 1], [-3, 1.9]], m: 'gunBody', bevel: 1.2 },
          { t: 'cap', a: [L * 0.6, -0.7], b: [L, -0.7], r1: 1.1, r2: 1, m: 'gunDark' },
          { t: 'poly', pts: [[1.5, 1.6], [4.5, 1.6], [5.5, 5.5], [2.5, 5.5]], m: 'gunDark', z: -0.2, bevel: 0.9 },
          { t: 'cap', a: [0, -1.3], b: [L * 0.5, -1.3], r1: 0.5, r2: 0.5, m: 'gunGlow', z: 0.3, noSep: true },
          { t: 'poly', pts: [[2, -2.3], [6, -2.3], [5.5, -3.8], [2.5, -3.8]], m: 'gunDark', z: 0.1, bevel: 0.8 },
        ],
      };
  }
}
