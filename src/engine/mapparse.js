// Parses a level's ASCII map. Pure: used by the game and by scripts/validate.mjs.
//
// Built-in characters (see docs/ENGINE.md):
//   .  air          #  solid          =  one-way platform    ^  hazard
//   :  background wall (no collision)  P  player spawn         X  exit
//   A–W, Y, Z  markers for the script (any uppercase except P and X)
//   a–z  entities, defined in the level's legend

export const TILES = { air: 0, solid: 1, platform: 2, hazard: 3, back: 4 };
const TILE_CHARS = { '.': 0, ' ': 0, '#': 1, '=': 2, '^': 3, ':': 4 };

export function parseMap(rows, legend = {}) {
  const errors = [];
  const height = rows.length;
  const width = Math.max(...rows.map((r) => r.length));
  const grid = [];
  const markers = {};
  const entities = [];
  let spawn = null;
  let exit = null;

  rows.forEach((row, y) => {
    if (row.length !== width) errors.push(`row ${y} is ${row.length} wide, expected ${width}`);
    const line = [];
    for (let x = 0; x < width; x++) {
      const ch = row[x] ?? '.';
      if (ch in TILE_CHARS) {
        line.push(TILE_CHARS[ch]);
        continue;
      }
      line.push(0);
      if (ch === 'P') {
        if (spawn) errors.push(`second P at ${x},${y}`);
        spawn = { x, y };
      } else if (ch === 'X') {
        exit = { x, y };
      } else if (ch >= 'A' && ch <= 'Z') {
        if (markers[ch]) errors.push(`marker ${ch} appears twice`);
        markers[ch] = { x, y };
      } else if (ch >= 'a' && ch <= 'z') {
        if (!legend[ch]) errors.push(`entity '${ch}' at ${x},${y} is not in the legend`);
        entities.push({ ch, x, y, ...legend[ch] });
      } else {
        errors.push(`unknown character '${ch}' at ${x},${y}`);
      }
    }
    grid.push(line);
  });

  if (!spawn) errors.push('map has no P (player spawn)');
  return { width, height, grid, markers, entities, spawn, exit, errors };
}

// The top of the ground in a column at or below row `fromY`, in tiles (or null).
export function groundBelow(grid, x, fromY = 0) {
  for (let y = Math.max(0, fromY); y < grid.length; y++) {
    const t = grid[y]?.[x];
    if (t === TILES.solid || t === TILES.platform) return y;
  }
  return null;
}
