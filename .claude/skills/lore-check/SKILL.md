---
name: lore-check
description: >
  Verify Halo canon for Ring Anthology: Prisms against Halopedia before story text is
  written: clear (verify) items in docs/CAMPAIGN.md and docs/LORE.md, confirm dates,
  places, who was present, and what happened, and correct the docs when they're wrong.
  Use before building a level, writing Archive cards or say lines, or adding a canon
  character, and whenever asked to "check the lore" or "is this canon".
---

# Checking canon

The game adds nothing to the Halo story. Every story fact must come from canon: games,
novels, comics, Halo Waypoint, or the Halo Encyclopedia, as summarized by Halopedia.

## Steps

1. **List the claims.** From the CAMPAIGN.md entry (or the text being written), list
   every factual claim: dates, places, who was there, who did what, how it ended, and
   who was fought. Include everything marked **(verify)**.
2. **Check each claim** with WebFetch on `https://www.halopedia.org/<Article_Name>`
   (e.g. `Battle_of_Charum_Hakkor`, `Forthencho`). Ask for the specific facts. When an
   article is missing, try the related event or character article, or WebSearch with
   `site:halopedia.org`.
3. **Classify each claim:**
   - **Confirmed:** keep it and note the source.
   - **Wrong:** correct it in CAMPAIGN.md and the LORE.md timeline.
   - **Not found:** remove it, or mark it as staging if it is only gameplay (which room
     you fight in, which generic enemies appear), never story.
   - **Sources disagree:** prefer the newest official source (e.g. the 2022 Halo
     Encyclopedia), and say "c." for dates.
4. **Update the docs.** Remove the **(verify)** marks you resolved. Put the sources in
   the entry's Source field and in the level file's header comment, with the date.
5. **Kid filter.** Some canon is grim (mass suicide, glassing, composing). Leave
   details out or tell them gently (LORE.md, "Kid-friendly presentation"). Leaving a
   detail out is fine; changing what happened is not.

## Output

A short table: claim → confirmed / corrected / dropped → source. Mention any change to
an echo partner's entry too: echo levels must agree with each other.
