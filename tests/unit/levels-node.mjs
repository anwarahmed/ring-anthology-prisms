// Loads every level file in Node (levels/index.js uses Vite's import.meta.glob).
import { readdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const dirs = readdirSync('levels', { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && existsSync(join('levels', d.name, 'level.js')));
export const LEVELS = Object.fromEntries(await Promise.all(dirs.map(async (d) => {
  const m = await import(pathToFileURL(join(process.cwd(), 'levels', d.name, 'level.js')).href);
  return [d.name, m.default];
})));
