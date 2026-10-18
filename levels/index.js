// Level registry. Built levels are found automatically (levels/<id>/level.js); the play
// order, titles and Parts come from docs/CAMPAIGN.md, so there is nothing to register.

import campaign from '../docs/CAMPAIGN.md?raw';
import { parseCampaign } from './campaign.js';

const modules = import.meta.glob(['./*/level.js', '!./_*/level.js'], { eager: true });

export const LEVELS = Object.fromEntries(Object.values(modules).map((m) => [m.default.id, m.default]));
export const CAMPAIGN = parseCampaign(campaign);
export const ORDER = CAMPAIGN.parts.flatMap((p) => p.levels.map((l) => ({ ...l, part: p.title })));
