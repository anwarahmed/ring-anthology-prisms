// Generates a level's character, weapon and vehicle art ahead of time. Art is otherwise
// made the first time something appears, which froze the game for a moment whenever a
// new kind of enemy showed up mid-fight. The Archive cards before a level work through
// the jobs one per frame; the level finishes any that are left when it loads.

import { CHARACTERS } from '../content/characters.js';
import { UNITS } from '../content/units.js';
import { WEAPONS } from '../content/weapons.js';
import { VEHICLES } from '../content/vehicles.js';
import { BODIES } from '../content/bodies.js';
import { bodyTexture, armTexture, gunTexture } from './textures.js';

function groupsOf(a) {
  return [...(a.spawn ?? []), ...(a.wave ?? []), ...(a.allies ?? []), ...(a.hold?.groups ?? []).flat()];
}

// Every unit and vehicle a level can show.
export function levelContent(level) {
  const units = new Set();
  const vehicles = new Set();
  for (const t of level.script ?? []) {
    for (const a of t.do ?? []) {
      for (const g of groupsOf(a)) units.add(g.unit);
      if (a.boss) units.add(a.boss.unit);
      if (a.vehicle) vehicles.add(a.vehicle.id);
    }
  }
  for (const e of Object.values(level.legend ?? {})) {
    if (e.unit) units.add(e.unit);
    if (e.vehicle) vehicles.add(e.vehicle);
  }
  // Units spawned by name inside the level's custom set pieces.
  for (const fn of Object.values(level.hooks ?? {})) {
    for (const m of String(fn).matchAll(/'([a-z0-9-]+)'/g)) {
      if (UNITS[m[1]]) units.add(m[1]);
      if (VEHICLES[m[1]]) vehicles.add(m[1]);
    }
  }
  for (const id of [...units]) {
    const u = UNITS[id];
    if (!u) { units.delete(id); continue; }
    if (u.boss?.summon) units.add(u.boss.summon);
    if (u.pilot) units.add(u.pilot);
  }
  return { units: [...units], vehicles: [...vehicles].filter((id) => VEHICLES[id]) };
}

const armed = (def) => !BODIES[def.body]?.flying && BODIES[def.body]?.reach;

// The art jobs for a level, cheapest to skip when already made.
export function prewarmJobs(level) {
  const { units, vehicles } = levelContent(level);
  const jobs = [];
  const drops = units.map((id) => UNITS[id].weapon).filter((w) => WEAPONS[w]?.gun);
  for (const charId of new Set(level.players ?? [])) {
    const c = CHARACTERS[charId];
    if (!c) continue;
    jobs.push((s) => bodyTexture(s, charId, c));
    if (!armed(c)) continue;
    const weapons = c.weapons.length ? [...new Set([...c.weapons, ...drops])] : [null];
    for (const w of weapons) jobs.push((s) => armTexture(s, charId, c, w ?? 'none', w ? WEAPONS[w] : null));
  }
  for (const id of units) {
    const u = UNITS[id];
    jobs.push((s) => bodyTexture(s, id, u));
    if (u.weapon && armed(u)) jobs.push((s) => armTexture(s, id, u, u.weapon, WEAPONS[u.weapon]));
    if (WEAPONS[u.weapon]?.gun) jobs.push((s) => gunTexture(s, u.weapon, WEAPONS[u.weapon]));
  }
  for (const id of vehicles) jobs.push((s) => bodyTexture(s, `veh-${id}`, VEHICLES[id]));
  return jobs;
}

export function prewarm(scene, level) {
  for (const job of prewarmJobs(level)) job(scene);
}
