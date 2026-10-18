# Writes a standard level file (cards, map from test-results/map-<id>.txt, script and
# hooks) for scripted batches of levels. See test-results/part4.py for usage.
import json, os
def card(title, text, source, when=None, where=None):
    d = {'title': title}
    if when: d['when'] = when
    if where: d['where'] = where
    d['text'] = text; d['source'] = source
    return d
def js(o, ind):
    # Small JS-literal printer for cards (single-quoted strings).
    def q(v): return "'" + v.replace('\\', '\\\\').replace("'", "\\'") + "'"
    pad = ' ' * ind
    out = []
    for c in o:
        head = ', '.join(f"{k}: {q(c[k])}" for k in ('title', 'when', 'where') if k in c)
        out.append(f"{pad}{{\n{pad}  {head},\n{pad}  text: {q(c['text'])},\n{pad}  source: {q(c['source'])},\n{pad}}},")
    return '\n'.join(out)
def level(id, title, era, theme, music, players, header, consts, before, after, script, hooks):
    mp = open(f'test-results/map-{id}.txt').read().rstrip('\n')
    os.makedirs(f'levels/{id}', exist_ok=True)
    src = f"""{header}

{consts}

export default {{
  id: '{id}',
  title: {json.dumps(title)},
  era: '{era}',
  theme: '{theme}',
  music: '{music}',
  players: {json.dumps(players).replace('"', "'")},

  archive: {{
    before: [
{js(before, 6)}
    ],
    after: [
{js(after, 6)}
    ],
  }},

  legend: {{}},

  map: [
{mp}
  ],

  script: [
{script}
  ],

  hooks: {{
{hooks}
  }},
}};
"""
    open(f'levels/{id}/level.js', 'w').write(src)

def ending(name, lines, flash='0xffffff', result_slow=True):
    says = '\n'.join(f"      await hud.say({json.dumps(l)}, null, null, 3.5);" for l in lines)
    return f"""    async {name}(api) {{
      const {{ scene, fx, hud }} = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash({flash}, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
{says}
    }},"""
