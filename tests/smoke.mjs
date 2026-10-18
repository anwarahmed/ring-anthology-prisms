// Smoke test: boots the game in headless Chromium, plays a level with the autopilot
// bot, and fails on any page error. Screenshots go to --shots (default: test-results/).
//
//   node tests/smoke.mjs                       title screen + every built level, 20 s each
//   node tests/smoke.mjs --level 1a --finish   play 1a with the bot until it ends
//   options: --seconds N  --shots DIR  --difficulty easy  --solo

import { createServer } from 'vite';
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? dflt : args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
};
const shots = opt('shots', 'test-results');
const seconds = Number(opt('seconds', 20));
const finish = !!opt('finish', false);
const difficulty = opt('difficulty', 'normal');
const levels = opt('level', null) ? [opt('level')] : readdirSync('levels', { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && existsSync(join('levels', d.name, 'level.js'))).map((d) => d.name);
mkdirSync(shots, { recursive: true });

const server = await createServer({ server: { port: 0 }, logLevel: 'error' });
await server.listen();
const base = server.resolvedUrls.local[0];
const executablePath = process.env.CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--autoplay-policy=no-user-gesture-required', '--use-gl=angle', '--use-angle=swiftshader'] });
let failed = false;

async function run(name, url, check) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
  // Hide real controllers plugged into this machine; tests use their own fake ones.
  await page.addInitScript(() => { navigator.getGamepads = () => []; });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text()); });
  // A missing home-soundtrack manifest is normal; any other missing file is a failure.
  page.on('response', (r) => {
    if (r.status() >= 400 && !/home-soundtrack\/|favicon/.test(r.url())) errors.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(base + url);
  try {
    await check(page);
  } catch (e) {
    errors.push(e.message);
  }
  await page.screenshot({ path: join(shots, `${name}.png`) });
  if (errors.length) {
    failed = true;
    console.error(`FAIL ${name}\n  ${[...new Set(errors)].join('\n  ')}`);
  } else {
    console.log(`ok   ${name}`);
  }
  await page.close();
}

const active = (page, key) => page.evaluate((k) => window.__game?.scene.isActive(k), key);
// The level is running and its fade-in is over (slow under load in headless Chromium).
const levelReady = async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 15000 });
  await page.waitForFunction(() => !window.__game.scene.getScene('Level').cameras.main.fadeEffect.isRunning, null, { timeout: 30000 });
};

await run('title', '', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Title'), null, { timeout: 15000 });
  await page.waitForTimeout(1500);
});

// The way the kids start: title → join → timeline → Archive cards → first level.
await run('menus', '', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Title'), null, { timeout: 15000 });
  const press = async (key, scene) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(120);
    await page.keyboard.up(key);
    await page.waitForTimeout(500);
    if (scene) await page.waitForFunction((k) => window.__game.scene.isActive(k), scene, { timeout: 12000 });
  };
  await press('f', 'Players');
  await page.waitForTimeout(400);
  await press('g', 'Timeline');
  await press('Escape', 'Archive'); // Start (keys 1) plays from the level select
  await page.screenshot({ path: join(shots, 'archive.png') });
  for (let i = 0; i < 12 && !(await active(page, 'Level')); i++) await press('g');
  if (!(await active(page, 'Level'))) throw new Error('menus did not reach the first level');
});

// Controls: open from the title menu, rebind kb1 JUMP to J, check it is saved and works.
await run('controls', '', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Title'), null, { timeout: 15000 });
  const tap = async (key, wait = 300) => { await page.keyboard.down(key); await page.waitForTimeout(100); await page.keyboard.up(key); await page.waitForTimeout(wait); };
  await tap('s');
  await tap('f');
  await page.waitForFunction(() => window.__game.scene.isActive('Controls'), null, { timeout: 5000 });
  for (let i = 0; i < 5; i++) await tap('ArrowDown', 150); // device row → UP, DOWN, LEFT, RIGHT, JUMP
  await tap('Enter', 400);
  await tap('j', 500);
  await page.screenshot({ path: join(shots, 'controls.png') });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ring-anthology-prisms.controls') ?? '{}'));
  if (saved.kb1?.jump?.[0] !== 74) throw new Error(`jump not rebound to J: ${JSON.stringify(saved)}`);
  await page.evaluate(() => localStorage.removeItem('ring-anthology-prisms.controls'));
});

// Graphics: open from the title menu, choose a CRT preset, check it is saved and drawn.
await run('graphics', '', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Title'), null, { timeout: 15000 });
  const tap = async (key, wait = 300) => { await page.keyboard.down(key); await page.waitForTimeout(100); await page.keyboard.up(key); await page.waitForTimeout(wait); };
  await tap('s');
  await tap('s');
  await tap('f');
  await page.waitForFunction(() => window.__game.scene.isActive('Graphics'), null, { timeout: 5000 });
  await tap('ArrowDown', 150); // ART STYLE → CRT PRESET
  await tap('ArrowRight', 150);
  await tap('ArrowRight', 600); // Off → Subtle → Arcade
  await page.screenshot({ path: join(shots, 'graphics.png') });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ring-anthology-prisms.graphics') ?? '{}'));
  if (saved.preset !== 'arcade' || !(saved.scanlines > 0)) throw new Error(`preset not saved: ${JSON.stringify(saved)}`);
  // The CRT pass draws the whole frame: the top third (the GRAPHICS title) must not be blank.
  const top = await page.evaluate(() => new Promise((done) => window.__game.renderer.snapshotArea(0, 0, 960, 180, (img) => {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let max = 0;
    for (let i = 0; i < d.length; i += 4) max = Math.max(max, d[i] + d[i + 1] + d[i + 2]);
    done({ max, drawn: window.__game.crtFrames });
  })));
  if (!(top.drawn > 0)) throw new Error('CRT pass not drawn');
  if (top.max < 300) throw new Error(`top of screen blank with CRT on: ${JSON.stringify(top)}`);
  await tap('Escape', 600);
  await page.waitForFunction(() => window.__game.scene.isActive('Title'), null, { timeout: 5000 });
  await page.evaluate(() => localStorage.removeItem('ring-anthology-prisms.graphics'));
});

// A controller the browser doesn't recognize (like the 8BitDo M30, "6B controller"):
// any button confirms, and joining runs the one-time guided button setup.
await run('unknown-pad', '', async (page) => {
  await page.evaluate(() => {
    const pad = { id: '6B controller', index: 0, mapping: '', connected: true, timestamp: 0,
      buttons: Array.from({ length: 14 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0] };
    window.__pad = pad;
    navigator.getGamepads = () => [pad, null, null, null];
    window.dispatchEvent(Object.assign(new Event('gamepadconnected'), { gamepad: pad }));
  });
  await page.waitForFunction(() => window.__game?.scene.isActive('Title'), null, { timeout: 15000 });
  const press = async (i, wait = 350) => {
    await page.evaluate((b) => { window.__pad.buttons[b] = { pressed: true, value: 1 }; window.__pad.timestamp = performance.now(); }, i);
    await page.waitForTimeout(150);
    await page.evaluate((b) => { window.__pad.buttons[b] = { pressed: false, value: 0 }; window.__pad.timestamp = performance.now(); }, i);
    await page.waitForTimeout(wait);
  };
  await press(11); // a non-standard Start
  await page.waitForFunction(() => window.__game.scene.isActive('Controls'), null, { timeout: 5000 });
  await page.waitForTimeout(900);
  for (let i = 0; i < 11; i++) await press(i, 650);
  await page.screenshot({ path: join(shots, 'wizard.png') });
  await page.waitForFunction(() => window.__game.scene.isActive('Players'), null, { timeout: 6000 });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ring-anthology-prisms.controls') ?? '{}')['pad:6B controller']);
  if (saved?.jump?.[0]?.b !== 4 || saved?.pause?.[0]?.b !== 10) throw new Error(`wizard bindings wrong: ${JSON.stringify(saved)}`);
  await page.waitForTimeout(500);
  await press(10); // the new Start
  await page.waitForFunction(() => window.__game.scene.isActive('Timeline'), null, { timeout: 5000 });
  await page.waitForTimeout(400);
  await press(4); // Jump no longer starts a level from the level select
  if (!(await active(page, 'Timeline'))) throw new Error('jump started a level from the level select');
  await press(10); // Start does
  await page.waitForFunction(() => window.__game.scene.isActive('Archive'), null, { timeout: 5000 });
  await page.evaluate(() => localStorage.removeItem('ring-anthology-prisms.controls'));
});

// Pause: a long press of Start pauses and the menu stays open; Start again resumes.
await run('pause', '?level=1a', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.keyboard.down('Escape');
  await page.waitForFunction(() => window.__game.scene.isActive('Pause'), null, { timeout: 5000 });
  await page.waitForTimeout(400);
  await page.keyboard.up('Escape');
  await page.waitForTimeout(800);
  if (!(await active(page, 'Pause'))) throw new Error('pause menu closed by the same Start press');
  await page.keyboard.down('Escape');
  await page.waitForTimeout(400);
  await page.keyboard.up('Escape');
  await page.waitForTimeout(800);
  if (await active(page, 'Pause')) throw new Error('Start did not resume');
  if (!(await page.evaluate(() => window.__game.scene.isActive('Level')))) throw new Error('level not running after resume');
});

// Weapon drops: an enemy's gun drops when it dies; walking over it adds it once.
await run('pickup', '?level=1a&god=1', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 15000 });
  await page.waitForTimeout(1500);
  const killNear = () => page.evaluate(() => {
    const L = window.__game.scene.getScene('Level');
    const p = L.players[0];
    const u = L.spawnUnit('warrior-servant', p.x + 4, p.y + p.meta.h / 2, { entrance: 'none' });
    u.hurt(9999, 'melee', p);
  });
  await killNear();
  await page.waitForTimeout(1500);
  const one = await page.evaluate(() => { const p = window.__game.scene.getScene('Level').players[0]; return { ids: p.weapons.map((w) => w.id), cur: p.current.id }; });
  if (!one.ids.includes('hardlight-lance') || one.cur !== 'hardlight-lance') throw new Error(`gun not picked up: ${JSON.stringify(one)}`);
  await killNear();
  await page.waitForTimeout(1500);
  const two = await page.evaluate(() => window.__game.scene.getScene('Level').players[0].weapons.filter((w) => w.id === 'hardlight-lance').length);
  if (two !== 1) throw new Error(`same gun carried ${two} times`);
});

// Allies hop over fire instead of walking into it (1a has a fire at columns 89-90).
await run('ally-fire', '?level=1a&god=1', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const L = window.__game.scene.getScene('Level');
    // Quiet the level script so no waves or arenas interfere.
    L.runner.triggers.forEach((t) => { t.fired = true; });
    L.arena = null;
    const p = L.players[0];
    p.body.reset(97 * 16, 13 * 16 - p.meta.h / 2 - 1);
    L.focus = { x: 90 * 16, y: p.y };
    L.updateCamera(0, true);
    window.__ally = L.spawnUnit('ancient-human-defender', 82 * 16, 13 * 16, { ally: true, entrance: 'none' });
  });
  // Wait in game terms (slow test machines run the game slower than real time).
  await page.waitForFunction(() => window.__ally.x / 16 >= 91 || !window.__ally.alive, null, { timeout: 30000 }).catch(() => {});
  const r = await page.evaluate(() => ({ x: Math.round(window.__ally.x / 16), alive: window.__ally.alive, hp: window.__ally.health, shields: Math.round(window.__ally.shields) }));
  if (!r.alive || r.x < 91) throw new Error(`ally did not get past the fire unhurt: ${JSON.stringify(r)}`);
  if (r.hp < 80) throw new Error(`ally was burned: ${JSON.stringify(r)}`);
});

// Vehicles: get in with SWAP (R on keys 1), drive, run a Grunt over, get out.
await run('vehicle', '?level=1a&god=1', async (page) => {
  await levelReady(page);
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const L = window.__game.scene.getScene('Level');
    L.runner.triggers.forEach((t) => { t.fired = true; });
    const p = L.players[0];
    window.__v = L.spawnVehicle('warthog', p.x + 20, 13 * 16);
  });
  await page.waitForTimeout(600);
  const tap = async (k) => { await page.keyboard.down(k); await page.waitForTimeout(120); await page.keyboard.up(k); await page.waitForTimeout(300); };
  await tap('r');
  const inside = await page.evaluate(() => window.__game.scene.getScene('Level').players[0].vehicle === window.__v);
  if (!inside) throw new Error('SWAP did not enter the Warthog');
  const x0 = await page.evaluate(() => window.__v.x);
  await page.evaluate(() => {
    const L = window.__game.scene.getScene('Level');
    window.__g = L.spawnUnit('grunt', window.__v.x + 120, 13 * 16, { entrance: 'none' });
  });
  await page.keyboard.down('d');
  await page.waitForFunction((x0) => window.__v.x - x0 > 160 || !window.__g.alive && window.__v.x - x0 > 80, x0, { timeout: 20000 }).catch(() => {});
  await page.keyboard.up('d');
  const r = await page.evaluate(() => ({ moved: window.__v.x, grunt: window.__g.alive, inside: !!window.__game.scene.getScene('Level').players[0].vehicle }));
  if (!r.inside) throw new Error('thrown out of the Warthog while driving');
  if (r.moved - x0 < 80) throw new Error(`Warthog did not drive: ${x0} -> ${r.moved}`);
  if (r.grunt) throw new Error('driving into the Grunt did not run it over');
  await page.screenshot({ path: join(shots, 'vehicle-driving.png') });
  await tap('r');
  const out = await page.evaluate(() => { const p = window.__game.scene.getScene('Level').players[0]; return !p.vehicle && p.visible && p.body.enable; });
  if (!out) throw new Error('SWAP did not leave the Warthog');
});

// The screen edges hold: sprinting and dashing right (into an arena lock), then back
// left, the player's body never leaves the screen.
await run('screen-edge', '?level=1d&god=1', async (page) => {
  await levelReady(page);
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const L = window.__game.scene.getScene('Level');
    window.__worst = 0;
    L.events.on('postupdate', () => {
      const cam = L.cameras.main, p = L.players[0];
      const half = p.body.width / 2;
      const over = Math.max(cam.scrollX - (p.x - half), (p.x + half) - (cam.scrollX + cam.width / cam.zoom));
      window.__worst = Math.max(window.__worst, over);
    });
  });
  await page.keyboard.down('d');
  await page.keyboard.down('h');
  for (let i = 0; i < 24; i++) {
    await page.keyboard.down('g'); await page.waitForTimeout(160); await page.keyboard.up('g');
    await page.waitForTimeout(120);
  }
  await page.keyboard.up('h');
  await page.keyboard.up('d');
  // Tiles are drawn across the whole screen after scrolling (culling matches the view).
  const cull = await page.evaluate(() => {
    const L = window.__game.scene.getScene('Level'), cam = L.cameras.main, s = L.layer.scaleX;
    const xs = L.layer.culledTiles.map((t) => t.pixelX * s);
    return { scroll: cam.scrollX, min: Math.min(...xs), max: Math.max(...xs) + 16 };
  });
  if (cull.scroll < 8) throw new Error(`camera did not scroll: ${JSON.stringify(cull)}`);
  if (cull.min > cull.scroll || cull.max < cull.scroll + 480) throw new Error(`tiles not drawn across the screen: ${JSON.stringify(cull)}`);
  await page.keyboard.down('a');
  await page.waitForTimeout(2500);
  await page.keyboard.up('a');
  const worst = await page.evaluate(() => window.__worst);
  if (worst > 1) throw new Error(`player went ${worst.toFixed(1)} px off screen`);
});

// Units placed inside a raised block (the 1a surrender line crosses one) stand on top
// of it instead of being pushed out through the floor.
await run('spawn-ground', '?level=1a&god=1', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 15000 });
  const fell = await page.evaluate(async () => {
    const L = window.__game.scene.getScene('Level'), m = L.map.markers.L, T = 16;
    const units = [];
    for (let i = 0; i < 8; i++) {
      const u = L.spawnUnit('warrior-servant', (m.x - 2 - i * 2.5) * T, (m.y + 1) * T);
      u.brain = () => u.setVelocityX(0);
      units.push(u);
    }
    await new Promise((r) => setTimeout(r, 1500));
    return units.filter((u) => u.y > (m.y + 1) * T).map((u) => [Math.round(u.x), Math.round(u.y)]);
  });
  if (fell.length) throw new Error(`units fell through the floor: ${JSON.stringify(fell)}`);
});

// When everyone is down, characters stop and their arms stay on their bodies until
// the checkpoint restart (they used to be left floating while bodies kept moving).
await run('down-arms', '?level=1a&god=1', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 15000 });
  const gap = await page.evaluate(async () => {
    const L = window.__game.scene.getScene('Level'), p = L.players[0];
    const u = L.spawnUnit('ancient-human-defender', p.x + 40, p.y + 20, { ally: true });
    await new Promise((r) => setTimeout(r, 400));
    u.setVelocityX(120);
    p.invulnUntil = 0;
    p.die();
    await new Promise((r) => setTimeout(r, 1200));
    const s = u.shoulder();
    return Math.round(Math.hypot(u.gun.x - s.x, u.gun.y - s.y));
  });
  if (gap > 2) throw new Error(`arm left ${gap} px from its body after the players went down`);
});

// Checkpoints save the feet on solid ground and restart the players standing there.
// Restarts used to place them inside the ground (they fell through and the retry
// looped), and a checkpoint on 1b's pit platform would drop them into the pit.
await run('checkpoint', '?level=1b&p2=kb2', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 15000 });
  const setup = await page.evaluate(async () => {
    const L = window.__game.scene.getScene('Level'), T = 16;
    L.runner.triggers.forEach((t) => { t.fired = true; });
    L.arena = null;
    const floor = L.map.spawn.y + 1;
    const stand = async (x, y) => {
      L.focus = { x, y };
      L.updateCamera(0, true);
      for (const p of L.players) { p.invulnUntil = Infinity; p.body.reset(x, y - p.body.height / 2 - 1); }
      await new Promise((r) => setTimeout(r, 700));
      return L.players[0].body.blocked.down && Math.abs(L.players[0].x - x) < 4;
    };
    // 1. On the platform over the pit: the checkpoint goes to the ground beside it.
    let pit = L.map.spawn.x;
    while (L.layer.getTileAt(pit, floor)?.index < 32) pit++;
    const ok1 = (await stand((pit - 2) * T, floor * T)) && (await stand((pit + 1) * T + 8, (floor - 1) * T));
    L.checkpoint(1);
    const pitCp = { ...L.cp, pit: pit * T, floor: floor * T };
    // 2. On top of the raised block near the start: restart standing on it.
    let col = L.map.spawn.x;
    while (L.layer.getTileAt(col, floor - 1)?.index >= 32 || !L.layer.getTileAt(col, floor - 1)) col++;
    let top = floor - 1;
    while (L.layer.getTileAt(col + 1, top - 1)?.index < 32) top--;
    const ok2 = await stand((col + 2) * T + 8, top * T);
    L.checkpoint(1);
    window.__top = top * T;
    L.restart();
    return { ok1, ok2, pitCp, top: top * T };
  });
  if (!setup.ok1 || !setup.ok2) throw new Error(`test setup failed: ${JSON.stringify(setup)}`);
  const c = setup.pitCp;
  if (c.y !== c.floor || c.x >= c.pit) throw new Error(`checkpoint over the pit not on solid ground: ${JSON.stringify(c)}`);
  await page.waitForTimeout(500);
  await page.waitForFunction(() => window.__game.scene.isActive('Level') && window.__game.scene.getScene('Level').players.length, null, { timeout: 30000 });
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => {
    const L = window.__game.scene.getScene('Level');
    return { players: L.players.map((p) => ({ alive: p.alive, x: Math.round(p.x), feet: Math.round(p.body.bottom), down: p.body.blocked.down })), ended: !!L.ended };
  });
  if (r.ended || r.players.some((p) => !p.alive || !p.down || Math.abs(p.feet - setup.top) > 1)) throw new Error(`restart from checkpoint failed: ${JSON.stringify({ top: setup.top, ...r })}`);
});

// Indoors (1c's cargo bay), sky and edge spawns land inside the room, never on or
// above the ceiling where nobody can reach them (the arena could never be cleared).
await run('spawn-indoors', '?level=1c&god=1', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 15000 });
  const bad = await page.evaluate(async () => {
    const L = window.__game.scene.getScene('Level'), T = 16, m = L.map.markers.B;
    L.runner.triggers.forEach((t) => { t.fired = true; });
    const p = L.players[0];
    p.body.reset(m.x * T, (m.y + 1) * T - p.body.height / 2 - 1);
    L.focus = { x: m.x * T, y: p.y };
    L.updateCamera(0, true);
    await new Promise((r) => setTimeout(r, 300));
    const units = await L.spawnGroup([{ unit: 'flood-infection', n: 6, from: 'sky', gap: 0.05 }, { unit: 'flood-warrior', n: 2, from: 'right', gap: 0.05 }]);
    for (const u of units) u.brain = () => u.setVelocityX(0);
    await new Promise((r) => setTimeout(r, 2000));
    let ceiling = m.y;
    const solid = (row) => { const i = L.layer.getTileAt(m.x, row)?.index ?? -1; return i >= 0 && i < 32; };
    while (ceiling > 0 && !solid(ceiling - 1)) ceiling--;
    return units.filter((u) => u.body.bottom < ceiling * T || u.body.bottom > (m.y + 1) * T + 1).map((u) => [u.unitId ?? u.id, Math.round(u.x), Math.round(u.body.bottom), ceiling * T]);
  });
  if (bad.length) throw new Error(`units outside the room: ${JSON.stringify(bad)}`);
});

// Back on the timeline after finishing a level, the next level is selected.
await run('timeline-next', '?all=1', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Title'), null, { timeout: 15000 });
  await page.evaluate(() => window.__game.scene.getScene('Title').scene.start('Timeline', { after: '1f' }));
  await page.waitForFunction(() => window.__game.scene.isActive('Timeline'), null, { timeout: 5000 });
  const sel = await page.evaluate(() => window.__game.scene.getScene('Timeline').selectedId);
  if (sel !== '2a') throw new Error(`expected 2a selected after 1f, got ${sel}`);
});

for (const id of levels) {
  const p2 = opt('solo', false) ? '' : '&p2=kb2';
  await run(`level-${id}`, `?level=${id}&bot=1&god=1${p2}&difficulty=${difficulty}`, async (page) => {
    await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 15000 });
    if (finish) {
      const deadline = Date.now() + 15 * 60 * 1000;
      let n = 0;
      while (Date.now() < deadline && !(await active(page, 'Results'))) {
        await page.waitForTimeout(10000);
        await page.screenshot({ path: join(shots, `level-${id}-${String(++n).padStart(2, '0')}.png`) });
      }
      if (!(await active(page, 'Results'))) throw new Error('level did not finish in 15 minutes');
      console.log(`     ${id} finished`);
    } else {
      await page.waitForTimeout(seconds * 1000);
      if (!(await active(page, 'Level'))) throw new Error('Level scene stopped unexpectedly');
    }
  });
}

await browser.close();
await server.close();
process.exit(failed ? 1 : 0);
