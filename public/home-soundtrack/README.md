# Home soundtrack

Music you own, for playing on this computer only. Git ignores everything in this folder
except this README; it is never committed or deployed (docs/LEGAL.md).

**The usual way:** run `npm run soundtrack`. It downloads the private soundtrack
repository (anwarahmed/ring-anthology-prisms-soundtrack) into `private/` here.

**By hand:** put files here with a `manifest.json` (same format):

```json
{
  "tracks": { "title": "title.m4a" },
  "eras": { "forerunner": "forerunner.m4a" },
  "levels": { "5b": { "calm": "sierra-calm.m4a", "combat": "sierra-combat.m4a", "boss": "sierra-boss.m4a" } }
}
```

Levels win over eras, eras over built-in tracks (`tracks` replaces a built-in track by
id, which covers the menus). A value is one file, or calm/combat/boss files that follow
the fight's intensity like the built-in music. Anything not listed keeps the built-in
chiptune music.
