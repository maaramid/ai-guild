// Office cast — roster metadata + sprite frames. Internal `name` ids are kept
// from the original roster (sprites + saved teams key on them); only the
// user-facing displayName/blurb are localized to Filipino names.
//
// The static portraits (cards / picker) are custom-drawn from per-character
// recipes in portraitArt.ts; the 3D office derives each agent's default mesh
// look (skin, hair, outfit) from the same recipe, so the floor matches the
// card. No LimeZu art is used for the cast. See assets/ATTRIBUTION.md.

import { paintPortrait } from './portraitArt';

export type OfficeCharacterName =
  | 'michael' | 'jim' | 'pam' | 'dwight' | 'kevin' | 'angela'
  | 'oscar' | 'stanley' | 'phyllis' | 'andy' | 'kelly' | 'ryan'
  | 'toby' | 'creed' | 'meredith';

export interface CastMember {
  name: OfficeCharacterName;
  displayName: string;
  /** Signature accent color (hex) — used for the in-scene selection glow. */
  shirt: string;
  /** Blurb shown when this character is picked / has no description yet. */
  blurb: string;
}

/** Selectable roster, in display order. */
export const OFFICE_CAST: CastMember[] = [
  { name: 'michael',  displayName: 'Roy',  shirt: '#5a6b8c', blurb: 'Office head, the boss' },
  { name: 'jim',      displayName: 'Kazuma',      shirt: '#6fa8dc', blurb: 'Sales lead, prankster' },
  { name: 'pam',      displayName: 'Emilia',      shirt: '#9caf88', blurb: 'Front desk, artist' },
  { name: 'dwight',   displayName: 'Edward',   shirt: '#b89b3e', blurb: 'Assistant (to the) manager' },
  { name: 'kevin',    displayName: 'Subaru',    shirt: '#4a7ab5', blurb: 'Accounting' },
  { name: 'angela',   displayName: 'Misato',   shirt: '#8a86a6', blurb: 'Head of accounting' },
  { name: 'oscar',    displayName: 'Rudeus',    shirt: '#7a4b6b', blurb: 'Accountant' },
  { name: 'stanley',  displayName: 'Spike',  shirt: '#8c5a4b', blurb: 'Sales, crossword' },
  { name: 'phyllis',  displayName: 'Kaoru',  shirt: '#b08bbf', blurb: 'Sales' },
  { name: 'andy',     displayName: 'Vash',     shirt: '#6fae6f', blurb: 'Sales, choir singer' },
  { name: 'kelly',    displayName: 'Aqua',    shirt: '#d16ba5', blurb: 'Customer service' },
  { name: 'ryan',     displayName: 'Shinji',     shirt: '#3a3a44', blurb: 'The intern' },
  { name: 'toby',     displayName: 'Naofumi',     shirt: '#9a8c5a', blurb: 'Human resources' },
  { name: 'creed',    displayName: 'Satoru',    shirt: '#6b7a4b', blurb: 'Quality assurance' },
  { name: 'meredith', displayName: 'Faye', shirt: '#b5544a', blurb: 'Supplier relations' },
];

export const CAST_BY_NAME: Record<OfficeCharacterName, CastMember> =
  Object.fromEntries(OFFICE_CAST.map((c) => [c.name, c])) as Record<OfficeCharacterName, CastMember>;

export const DEFAULT_CHARACTER: OfficeCharacterName = 'jim';

/**
 * Paint a character's static portrait for cards / the picker (delegates to the
 * custom procedural composer in portraitArt.ts).
 */
export async function paintCastPortrait(
  ctx: CanvasRenderingContext2D,
  name: OfficeCharacterName,
  scale = 2,
  clear = true,
): Promise<void> {
  paintPortrait(ctx, name, scale, clear);
}
