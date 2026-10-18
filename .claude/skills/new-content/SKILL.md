---
name: new-content
description: >
  Add a playable character, enemy or ally unit, weapon, grenade, pixel-art body, visual
  theme, or chiptune track to Ring Anthology: Prisms's catalogs in src/content/,
  following the canon, legal, and kid-friendly rules. Use when a level needs something
  the catalogs don't have (e.g. "add Elites", "we need a Warthog", "make a Requiem
  theme", "add Grunts").
---

# Adding content

The catalogs are plain data in `src/content/`. Their field lists are in
`docs/ENGINE.md` ("Content catalogs"). Read only the catalog file you are adding to.

## Checklist

```
- [ ] Canon: the character/unit exists in Halo canon (or is a generic canon role); appearance checked (lore-check)
- [ ] Original art: drawn in code with a palette; never traced from game art or official renders
- [ ] Reuse first: an existing body or weapon with a new palette/stats, if it fits
- [ ] Entry added with every required field (validator lists them)
- [ ] Kid-friendly: defeat = light puff in the faction color; Flood goofy, not scary
- [ ] npm test passes
- [ ] Seen on screen: a level or ?level= run, screenshot reviewed
- [ ] docs/ENGINE.md updated if a new body, AI behavior, kit, action, or backdrop layer type was added
```

## By type

- **Character** (`characters.js`): canon name, `title`, `faction`, `body`, `pal`,
  `shields`, `health` (100 standard), `speed` (~110–125), `jump` (~330–345), 1–2
  `weapons`, `grenade`. Add `kit` only when the character's technology differs from
  the era's (e.g. ancient humans use `covenant`). Use `extra: 'camo'` for active
  camouflage.
- **Unit** (`units.js`): `ai` from the behaviors in ENGINE.md, an `entrance` that fits
  the faction (Forerunners teleport, the Covenant drop in, Sentinels fly), and a `puff`
  color matching the faction's light. Bosses: `ai: 'boss'` with `boss.attacks` (and
  optionally `boss.summon`), and enough health for a fight of about 60–90 s on Normal.
- **Weapon** (`weapons.js`): choose `tech` to match the faction (UNSC ballistic,
  Covenant plasma, Forerunner hard-light, Banished mostly ballistic and explosive). Use
  descriptive names; canon weapon names only for canon weapons.
- **Body** (`bodies.js`): a painter function using `p.r(x, y, w, h, color)` only, with
  8 frames (idle ×2, run ×4, jump, crouch) for walkers or 2 for hoverers. Keep it to a
  readable silhouette at 3× scale. Register it in `BODIES` with `w`, `h`, `frames`,
  `muzzle` (and `flying`).
- **Theme** (`themes.js`): tile colors plus backdrop layers. A `halo` layer is allowed
  **only where canon puts a ring in the sky**; check before adding one.
- **Track** (`music.js`): original music, or arrangements of **Halo 3** music only
  (docs/LEGAL.md). Give it calm (level 0), combat (level 1) and climax (level 2)
  layers, and keep layer lengths whole bars. Credit any Halo 3 arrangement in
  CREDITS.md.
