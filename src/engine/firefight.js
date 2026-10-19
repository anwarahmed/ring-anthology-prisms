// Firefight: endless-style survival on a campaign level's map. Pure data, no Phaser.
//
// A Firefight is built from a level: its map, theme and players, with a generated
// script instead of the story. The roster is every enemy and boss used by the levels
// of the same era. 3 rounds of 5 waves; each wave is tougher than the last, and wave
// 5 of round 3 is a boss. Fought inside the level's first arena (markers B and C).

import { UNITS } from '../content/units.js';

export const ROUNDS = 3;
export const WAVES = 5;

function groupsOf(action) {
  if (action.spawn) return action.spawn;
  if (action.wave) return action.wave;
  if (action.hold) return action.hold.groups.flat();
  return [];
}

// The enemies (weakest first) and bosses that appear in an era's levels.
export function eraRoster(levels, era) {
  const enemies = new Set();
  const bosses = new Set();
  for (const L of levels) {
    if (L.era !== era) continue;
    for (const t of L.script ?? []) {
      for (const a of t.do ?? []) {
        if (a.boss) bosses.add(a.boss.unit);
        for (const g of groupsOf(a)) if (!g.ally && !g.neutral && UNITS[g.unit]) enemies.add(g.unit);
      }
    }
    for (const e of Object.values(L.legend ?? {})) if (e.unit && !e.ally && !e.neutral && UNITS[e.unit]) enemies.add(e.unit);
  }
  for (const b of bosses) enemies.delete(b);
  const strength = (id) => (UNITS[id].health ?? 0) + (UNITS[id].shields ?? 0);
  const list = [...enemies].filter((id) => UNITS[id].ai !== 'idle' && UNITS[id].ai !== 'boss').sort((a, b) => strength(a) - strength(b));
  return { enemies: list, bosses: [...bosses].filter((id) => UNITS[id]) };
}

// Wave n (0-based across the whole set) as spawn groups: more and tougher enemies as
// the set goes on. Deterministic, so a map always plays the same way.
export function waveGroups(roster, n) {
  const { enemies } = roster;
  if (!enemies.length) return [];
  const total = ROUNDS * WAVES;
  const reach = Math.max(1, Math.ceil(enemies.length * Math.min(1, (n + 3) / total)));
  const pool = enemies.slice(0, reach);
  const groups = [];
  const count = 3 + Math.floor(n / 2);
  const kinds = Math.min(pool.length, 1 + Math.floor(n / 5));
  for (let k = 0; k < kinds; k++) {
    const unit = pool[(pool.length - 1 - k + n) % pool.length];
    const flying = ['flyer'].includes(UNITS[unit].ai);
    const from = flying ? 'sky' : ['right', 'left', 'sky'][(n + k) % 3];
    groups.push({ unit, n: Math.max(1, Math.round(count / kinds)), from, gap: 0.3 });
  }
  return groups;
}

export function firefightLevel(level, levels) {
  const roster = eraRoster(levels, level.era);
  const markers = level.map.join('\n');
  const arena = markers.includes('B') && markers.includes('C') ? ['B', 'C'] : null;
  const script = [{ objective: 'Firefight: survive every wave!' }, { intensity: 1 }];
  if (arena) script.push({ lock: arena });
  for (let r = 0; r < ROUNDS; r++) {
    for (let w = 0; w < WAVES; w++) {
      const n = r * WAVES + w;
      script.push({ objective: `ROUND ${r + 1} · WAVE ${w + 1}` });
      if (r === ROUNDS - 1 && w === WAVES - 1 && roster.bosses.length) {
        script.push({ intensity: 2 });
        const boss = roster.bosses[(level.id.charCodeAt(1) ?? 0) % roster.bosses.length];
        script.push({ boss: { unit: boss, from: 'right', title: UNITS[boss].name, subtitle: 'Firefight' } });
      } else {
        script.push({ wave: waveGroups(roster, n) });
      }
    }
    // No checkpoints: if everyone goes down, the set starts again from round 1.
    if (r < ROUNDS - 1) script.push({ objective: `ROUND ${r + 1} COMPLETE` }, { wait: 3 });
  }
  script.push({ end: { result: 'win' } });
  return {
    ...level,
    archive: {},
    hooks: {},
    firefight: true,
    script: [{ on: 'start', do: script }],
  };
}
