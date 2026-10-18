# Home soundtrack

Put music files you own here to hear them while playing on this computer. Git ignores
everything in this folder except this README. It is never committed or deployed; see
docs/LEGAL.md.

Create `manifest.json` here to map eras or levels to files:

```json
{
  "eras": { "forerunner": "forerunner.mp3", "covenant": "covenant.mp3" },
  "levels": { "2f-the-maw": "the-maw.mp3" },
  "boss": "boss.mp3"
}
```

When a file is listed for the current level or era, the game plays it in place of the
built-in chiptune music.
