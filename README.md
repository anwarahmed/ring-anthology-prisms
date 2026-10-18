# Ring Anthology: Prisms

*An unofficial Halo fan game.* A 2D co-op side-scroller through the whole Halo
timeline, from the Precursors to the end of *Halo Infinite*, played from every
faction's side.

Each level is a canon event. Between levels, the Archive shows sourced timeline cards,
so by the end players know the history in order: who did what, and why. Nothing new is
added to the story.

- **Two-player co-op** on one screen, with any mix of keyboard and gamepads
- **Four eras**, each with its own powers: Forerunner, Covenant War, the Created, the
  Banished
- **Difficulty levels:** Easy, Normal, Heroic, Legendary
- **Runs offline** in any modern browser. It collects no data.

## Play

Online: GitHub Pages (link coming soon). Locally:

```sh
npm install
npm start
```

| | Move/aim | Jump | Fire | Ability | Grenade | Swap | Melee | Pause |
|---|---|---|---|---|---|---|---|---|
| Keys 1 | WASD | G | F | H | T | R | V | Esc |
| Keys 2 | Arrows | L | K | ; | P | O | M | Backspace |
| Gamepad | Sticks / d-pad | A | RT / X | LT / B | LB | Y | RB | Start |

Every button can be changed on the **Controls** screen (title menu or pause menu).
Settings are saved per controller.

**Home soundtrack:** music you own can be dropped into `public/home-soundtrack/` (see
the README there). It plays on your machine only and is never committed.

## Develop

- [docs/CAMPAIGN.md](docs/CAMPAIGN.md): every level's spec (the canon rule lives here)
- [docs/LORE.md](docs/LORE.md): the lore bible
- [docs/ENGINE.md](docs/ENGINE.md): how to build a level
- [docs/LEGAL.md](docs/LEGAL.md): the legal checklist

`npm test` runs the unit tests and validator. `npm run smoke` plays every level
headlessly.

## Legal

Halo © Microsoft Corporation. Ring Anthology: Prisms was created under Microsoft's
"Game Content Usage Rules" using assets from Halo, and it is not endorsed by or
affiliated with Microsoft. See the [Game Content Usage Rules](https://www.xbox.com/en-US/developers/rules).

This game is free and will never be sold, carry ads, or take donations. All art and
sound are original and drawn in code. The only Halo music permitted is Halo 3's, which
Microsoft allows for non-profit use.

The [MIT license](LICENSE) covers this project's original code only. Halo names,
characters, and lore belong to Microsoft.
