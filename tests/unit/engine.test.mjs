import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDamage, aimFrom } from '../../src/engine/rules.js';
import { parseMap, groundBelow, TILES } from '../../src/engine/mapparse.js';
import { noteFreq, parseNotes } from '../../src/engine/audio.js';
import { parseCampaign } from '../../levels/campaign.js';

test('plasma strips shields faster than ballistics', () => {
  const a = applyDamage({ shields: 50, health: 100 }, 20, 'plasma');
  const b = applyDamage({ shields: 50, health: 100 }, 20, 'ballistic');
  assert.ok(a.shields < b.shields);
  assert.equal(a.health, 100);
});

test('damage overflowing shields carries into health', () => {
  const r = applyDamage({ shields: 10, health: 100 }, 30, 'explosive');
  assert.equal(r.shields, 0);
  assert.equal(r.shieldBroke, true);
  assert.equal(r.health, 80);
});

test('health never goes below zero and death is reported', () => {
  const r = applyDamage({ shields: 0, health: 10 }, 500, 'ballistic');
  assert.equal(r.health, 0);
  assert.equal(r.dead, true);
});

test('aiming down only works in the air', () => {
  assert.deepEqual(aimFrom(0, 1, 1, true), { x: 1, y: 0 });
  assert.equal(aimFrom(0, 1, 1, false).y, 1);
  assert.deepEqual(aimFrom(0, 0, -1, true), { x: -1, y: 0 });
});

test('map parsing finds spawn, markers, entities and errors', () => {
  const m = parseMap(['#....#', '#P.Aa#', '######'], { a: { unit: 'x' } });
  assert.deepEqual(m.errors, []);
  assert.deepEqual(m.spawn, { x: 1, y: 1 });
  assert.deepEqual(m.markers.A, { x: 3, y: 1 });
  assert.equal(m.entities[0].unit, 'x');
  assert.equal(m.grid[2][0], TILES.solid);
  assert.equal(groundBelow(m.grid, 2, 0), 2);
  assert.ok(parseMap(['#.', '#'], {}).errors.some((e) => e.includes('wide')));
  assert.ok(parseMap(['#q#'], {}).errors.some((e) => e.includes('legend')));
});

test('notes parse to frequencies', () => {
  assert.equal(Math.round(noteFreq('A4')), 440);
  assert.equal(noteFreq('H4'), null);
  assert.deepEqual(parseNotes('D3+F3:16 -:4')[0].notes, ['D3', 'F3']);
});

test('campaign parsing reads parts, ids, eras and status', () => {
  const md = '## Part I · X\n\n### 1a · Lord\n- **Era:** Forerunner · **When/where:** y\n- **Status:** building\n\n## Firefight\n### zz · No';
  const c = parseCampaign(md);
  assert.equal(c.parts.length, 1);
  assert.deepEqual(c.parts[0].levels[0], { id: '1a', title: 'Lord', era: 'forerunner', status: 'building' });
});

test('sprite renderer shades, outlines and reports frames', async () => {
  const { render, material, ramp } = await import('../../src/engine/raster.js');
  const px = render([{ t: 'ell', c: [8, 8], rx: 5, ry: 5, m: 'a' }], 16, 16, { a: material('#8888cc', { spec: true }) });
  const alpha = (x, y) => px[(y * 16 + x) * 4 + 3];
  assert.equal(alpha(8, 8), 255);
  assert.equal(alpha(1, 1), 0);
  assert.equal(alpha(2, 8), 255, 'outline pixel just outside the shape');
  const r = ramp('#8888cc');
  assert.equal(r.length, 5);
  assert.ok(r[0][0] < r[2][0] && r[2][0] < r[4][0], 'ramp goes dark to light');
});

test('every body builds all frames and aim angles', async () => {
  const { bodyFrames, armFrames, aimFrame } = await import('../../src/engine/sprites.js');
  const { CHARACTERS } = await import('../../src/content/characters.js');
  const { UNITS } = await import('../../src/content/units.js');
  const { WEAPONS } = await import('../../src/content/weapons.js');
  for (const def of [...Object.values(CHARACTERS), ...Object.values(UNITS)]) {
    const frames = bodyFrames(def);
    assert.ok(frames.length >= 4);
    for (const f of frames) assert.ok(f.rgba.some((v, i) => i % 4 === 3 && v > 0));
    const w = WEAPONS[def.weapon ?? def.weapons[0]];
    if (w.gun) assert.equal(armFrames(def, w).length, 9);
  }
  assert.deepEqual(aimFrame(1, 0), { i: 4, flip: false });
  assert.deepEqual(aimFrame(-1, 0), { i: 4, flip: true });
  assert.equal(aimFrame(0.02, -1).i, 0);
});
