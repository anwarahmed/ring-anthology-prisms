# Legal Checklist

Ring Anthology: Prisms is a free, noncommercial fan game. It follows Microsoft's
[Game Content Usage Rules](https://www.xbox.com/en-US/developers/rules). These rules
apply because the game is publicly hosted. Every level and every piece of content
must pass this checklist. The `new-level` and `new-content` skills run it.

This is guidance, not legal advice.

## Rules

- [ ] **Original assets only.** Every sprite, sound, piece of music, and font is either
      made for this project or used under an open license that's recorded in
      `CREDITS.md`. Nothing is ripped or traced from any Halo game, and no Halo game is
      reverse-engineered.
- [ ] **Music rules.** Microsoft's rules say *"the music from Halo 3 is available for
      your use in non-profit ventures"* (by arrangement with O'Donnell/Salvatori, Inc.).
      - Halo 3 music, including retro or chiptune arrangements of it, may be used in
        the published game. Credit it in `CREDITS.md`.
      - Music from any other Halo game must not be published, in any form, including
        chiptune arrangements. That covers CE, 2, ODST, Reach, 4, 5, Infinite, and both
        Halo Wars games.
      - An optional "home soundtrack" folder, which git ignores, may hold music the
        user owns. It is played only on that machine and never committed or deployed.
      - The home soundtrack lives in a **private** repository,
        `anwarahmed/ring-anthology-prisms-soundtrack`, which `npm run soundtrack`
        clones into `public/home-soundtrack/private/`. It must stay private. Builds
        strip the folder (vite.config.js), and the Pages workflow refuses to deploy a
        build containing any home music. The public game only ever plays the original
        chiptune tracks.
- [ ] **No official logos or fonts.** That includes the Halo logo, the UNSC, Covenant,
      and Banished insignia, and the 343 or Halo Studios logos.
- [ ] **"Halo" stays out of the title.** The game is named "Ring Anthology: Prisms". "Halo" can
      appear only in descriptions such as "an unofficial Halo fan game".
- [ ] **Never commercial.** No sales, ads, donation links, GitHub Sponsors,
      merchandise, paid hosting, or app stores.
- [ ] **The notice is displayed** on the title screen and in the README, and links to
      the rules:
      > Halo © Microsoft Corporation. Ring Anthology: Prisms was created under Microsoft's "Game
      > Content Usage Rules" using assets from Halo, and it is not endorsed by or
      > affiliated with Microsoft.
- [ ] **The license is clear.** The MIT license covers only the original code. Halo
      names, characters, and lore belong to Microsoft.
- [ ] **No data collection.** Children play this game, so there are no analytics,
      cookies, accounts, or network calls. The game runs entirely offline.

## Notes

- Microsoft can withdraw permission at any time. If Microsoft asks, make the repository
  private and turn off GitHub Pages straight away.
- Under the rules, original story contributions, such as the Prism and its Monitor,
  are licensed to Microsoft.
- Precedent: 343 Industries told the fan game *Installation 01* it faced no
  legal threat as long as it stayed noncommercial and followed the usage rules.
