// Validates every level, the content catalogs, and the legal rules. Run: npm run validate
// Exits non-zero on any error, so CI blocks broken levels.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseMap } from '../src/engine/mapparse.js';
import { ERAS, LEGAL_NOTICE } from '../src/engine/config.js';
import { CHARACTERS } from '../src/content/characters.js';
import { UNITS } from '../src/content/units.js';
import { WEAPONS, GRENADES } from '../src/content/weapons.js';
import { THEMES } from '../src/content/themes.js';
import { TRACKS } from '../src/content/music.js';
import { BODIES } from '../src/content/bodies.js';
import { VEHICLES } from '../src/content/vehicles.js';
import { parseNotes, noteFreq } from '../src/engine/audio.js';
import { parseCampaign } from '../levels/campaign.js';

const errors = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const campaignMd = readFileSync('docs/CAMPAIGN.md', 'utf8');
const campaign = parseCampaign(campaignMd);
const specs = Object.fromEntries(campaign.parts.flatMap((p) => p.levels).map((l) => [l.id, l]));

// --- Catalogs ------------------------------------------------------------------------
for (const [id, c] of Object.entries(CHARACTERS)) {
  if (!BODIES[c.body]) err(`character ${id}`, `unknown body '${c.body}'`);
  for (const w of c.weapons) if (!WEAPONS[w]) err(`character ${id}`, `unknown weapon '${w}'`);
  if (c.grenade && !GRENADES[c.grenade]) err(`character ${id}`, `unknown grenade '${c.grenade}'`);
}
for (const [id, u] of Object.entries(UNITS)) {
  if (!BODIES[u.body]) err(`unit ${id}`, `unknown body '${u.body}'`);
  if (u.weapon && !WEAPONS[u.weapon]) err(`unit ${id}`, `unknown weapon '${u.weapon}'`);
  if (u.ai === 'boss' && !u.boss?.attacks?.length) err(`unit ${id}`, 'boss without boss.attacks');
  if (u.boss?.summon && !UNITS[u.boss.summon]) err(`unit ${id}`, `unknown summon '${u.boss.summon}'`);
}
for (const [id, v] of Object.entries(VEHICLES)) {
  if (!BODIES[v.body]) err(`vehicle ${id}`, `unknown body '${v.body}'`);
  if (v.weapon && !WEAPONS[v.weapon]) err(`vehicle ${id}`, `unknown weapon '${v.weapon}'`);
}
for (const [id, t] of Object.entries(TRACKS)) {
  for (const [name, l] of Object.entries(t.layers)) {
    for (const ev of parseNotes(l.notes)) {
      for (const n of ev.notes) {
        const ok = l.wave === 'noise' ? ['k', 's', 'h'].includes(n) : noteFreq(n) !== null;
        if (!ok) err(`track ${id}.${name}`, `bad note '${n}'`);
      }
    }
  }
}

// --- Levels --------------------------------------------------------------------------
const ACTIONS = ['say', 'objective', 'music', 'intensity', 'wait', 'lock', 'unlock', 'checkpoint', 'fx', 'spawn', 'allies', 'wave', 'hold', 'boss', 'vehicle', 'call', 'end'];
const dirs = readdirSync('levels', { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name);

for (const dir of dirs) {
  const file = join('levels', dir, 'level.js');
  if (!existsSync(file)) { err(`levels/${dir}`, 'missing level.js'); continue; }
  const L = (await import(pathToFileURL(file).href)).default;
  const at = `level ${dir}`;
  if (L.id !== dir) err(at, `id '${L.id}' does not match its folder`);
  const spec = specs[L.id];
  if (!spec) err(at, 'no entry in docs/CAMPAIGN.md');
  else if (spec.era && spec.era !== L.era) err(at, `era '${L.era}' differs from CAMPAIGN.md (${spec.era})`);
  if (spec?.status === 'done') {
    const entry = campaignMd.slice(campaignMd.indexOf(`### ${L.id} ·`)).split('\n### ')[0];
    if (entry.includes('(verify')) err(at, 'marked done but its spec still has (verify) items');
  }
  if (!L.title) err(at, 'missing title');
  if (!ERAS[L.era]) err(at, `unknown era '${L.era}'`);
  if (!THEMES[L.theme]) err(at, `unknown theme '${L.theme}'`);
  if (L.music && !TRACKS[L.music]) err(at, `unknown music '${L.music}'`);
  if (!L.players?.length || L.players.length > 2) err(at, 'players must list 1 or 2 characters');
  for (const c of L.players ?? []) if (!CHARACTERS[c]) err(at, `unknown character '${c}'`);
  for (const which of ['before', 'after']) {
    const cards = L.archive?.[which];
    if (!Array.isArray(cards) || !cards.length) err(at, `archive.${which} needs at least one card`);
    for (const c of cards ?? []) if (!c.title || !c.text || !c.source) err(at, `archive card '${c.title ?? '?'}' needs title, text and source`);
  }
  for (const [ch, e] of Object.entries(L.legend ?? {})) {
    if (e.unit && !UNITS[e.unit]) err(at, `legend '${ch}': unknown unit '${e.unit}'`);
    if (e.vehicle && !VEHICLES[e.vehicle]) err(at, `legend '${ch}': unknown vehicle '${e.vehicle}'`);
  }
  const map = parseMap(L.map ?? [], L.legend);
  for (const e of map.errors) err(at, `map: ${e}`);
  const markers = new Set(Object.keys(map.markers));
  let hasEnd = !!map.exit;
  const unitRefs = [];
  for (const t of L.script ?? []) {
    if (t.on !== 'start' && !markers.has(t.on)) err(at, `trigger '${t.on}' has no marker in the map`);
    for (const a of t.do ?? []) {
      const keys = Object.keys(a).filter((k) => ACTIONS.includes(k));
      if (!keys.length) err(at, `unknown action ${JSON.stringify(a)}`);
      if (a.end) hasEnd = true;
      if (a.lock) for (const m of a.lock) if (!markers.has(m)) err(at, `lock marker '${m}' missing`);
      if (a.vehicle && (!VEHICLES[a.vehicle.id] || !markers.has(a.vehicle.at))) err(at, `vehicle action needs a known id and marker: ${JSON.stringify(a.vehicle)}`);
      if (a.call && typeof L.hooks?.[a.call] !== 'function') err(at, `call '${a.call}' has no hook`);
      if (a.music && !TRACKS[a.music]) err(at, `unknown music '${a.music}'`);
      if (a.fx && !['shake', 'flash', 'slowmo'].includes(a.fx)) err(at, `unknown fx '${a.fx}'`);
      const groups = [a.spawn, a.allies, a.wave, ...(a.hold?.groups ?? [])].filter(Boolean);
      for (const g of groups) for (const s of g) unitRefs.push(s);
      if (a.boss) {
        unitRefs.push(a.boss);
      }
    }
  }
  for (const s of unitRefs) {
    if (!UNITS[s.unit]) err(at, `unknown unit '${s.unit}'`);
    const from = s.from ?? 'right';
    if (!['left', 'right', 'sky'].includes(from) && !markers.has(from)) err(at, `spawn point '${from}' is not a marker`);
  }
  if (!hasEnd) err(at, 'no way to finish: add an X exit or an { end } action');
}

// --- Legal (docs/LEGAL.md) ---------------------------------------------------------------
const squash = (s) => s.replace(/\s+/g, ' ');
if (!squash(readFileSync('README.md', 'utf8')).includes(squash(LEGAL_NOTICE))) err('README.md', 'missing the Microsoft notice (LEGAL_NOTICE)');
if (!readFileSync('src/scenes/menus.js', 'utf8').includes('LEGAL_NOTICE')) err('title screen', 'does not show LEGAL_NOTICE');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
if (pkg.funding) err('package.json', 'no funding links: the game is never commercial');
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
for (const f of [...walk('src'), ...walk('levels')].filter((f) => f.endsWith('.js'))) {
  const src = readFileSync(f, 'utf8');
  if (/\bfetch\(\s*['"`]https?:/.test(src) || /XMLHttpRequest|navigator\.sendBeacon|googletagmanager|analytics/i.test(src)) {
    err(f, 'network or analytics call: the game must run fully offline');
  }
}

if (errors.length) {
  console.error(`${errors.length} problem(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`ok: ${dirs.length} level(s), ${Object.keys(UNITS).length} units, ${Object.keys(CHARACTERS).length} characters, ${Object.keys(TRACKS).length} tracks`);
