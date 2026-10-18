// Reads docs/CAMPAIGN.md: "## Part ..." headings and "### <id> · <Title>" level entries,
// with each entry's Era line. Pure, so scripts/validate.mjs uses it too.

export function parseCampaign(md) {
  const parts = [];
  let part = null;
  let level = null;
  for (const line of md.split('\n')) {
    const p = /^## (Part [^\n]+)$/.exec(line);
    if (p) {
      part = { title: p[1].trim(), levels: [] };
      parts.push(part);
      level = null;
      continue;
    }
    if (/^## /.test(line)) { part = null; level = null; continue; }
    const l = /^### (\w+) · (.+)$/.exec(line);
    if (l && part) {
      level = { id: l[1], title: l[2].trim(), era: null, status: 'planned' };
      part.levels.push(level);
      continue;
    }
    if (level) {
      const era = /^- \*\*Era:\*\* ([A-Za-z ]+?)(?: \(| ·)/.exec(line);
      if (era) level.era = eraKey(era[1]);
      const st = /^- \*\*Status:\*\* (\w+)/.exec(line);
      if (st) level.status = st[1];
    }
  }
  return { parts };
}

function eraKey(name) {
  const n = name.toLowerCase();
  if (n.startsWith('forerunner')) return 'forerunner';
  if (n.startsWith('covenant')) return 'covenant';
  if (n.startsWith('created')) return 'created';
  if (n.startsWith('banished')) return 'banished';
  return null;
}
