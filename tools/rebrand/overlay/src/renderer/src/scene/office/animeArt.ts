// AI Guild anime-style cast art (vector, cel-shaded).
//
// One look per cast member drives two drawings:
//  - drawAnimeBust:   the portrait used on cards, the picker and the terminal
//                     header (same 18x28 frame as the old pixel portraits, so
//                     no layout changes; drawn in vector so it stays sharp);
//  - drawAnimeSprite: the small chibi that walks around the 2D guild hall.
// Change a look in ANIME_LOOKS to redesign a character everywhere at once.

import type { OfficeCharacterName } from './cast';
import type { CharacterLook } from './portraitArt';

export type AnimeHair =
  | 'neat' | 'spiky' | 'messy' | 'wild' | 'long' | 'hime' | 'bob' | 'ponytail' | 'twintails' | 'braid';
export type AnimeOutfit = 'coat' | 'hoodie' | 'cloak' | 'armor' | 'robe' | 'jacket' | 'dress' | 'suit' | 'shirt';
export type AnimeSkin = 'fair' | 'light' | 'tan' | 'brown' | 'dark';

export interface AnimeLook {
  skin: AnimeSkin;
  hair: AnimeHair;
  hairColor: string;
  eyeColor: string;
  outfit: AnimeOutfit;
  /** Main outfit colour. */
  c1: string;
  /** Trim / inner layer colour. */
  c2: string;
  /** Buttons, ties, ribbons, clasps. */
  accent: string;
  pants?: string;
  eyes?: 'round' | 'sharp' | 'sleepy';
  mouth?: 'smile' | 'grin' | 'neutral' | 'smirk';
  lashes?: boolean;
  blush?: boolean;
  glasses?: boolean;
  acc?: 'ribbon' | 'headband' | 'clip' | 'goggles' | 'earring';
}

/** The cast. Original designs: anime archetypes, not copies of any show's art. */
export const ANIME_LOOKS: Record<OfficeCharacterName, AnimeLook> = {
  michael:  { skin: 'light', hair: 'neat', hairColor: '#232a3d', eyeColor: '#3b2a24', outfit: 'coat', c1: '#25335c', c2: '#d8b45a', accent: '#b8323a', eyes: 'sharp', mouth: 'smirk' },
  jim:      { skin: 'light', hair: 'messy', hairColor: '#6b4226', eyeColor: '#c58a2e', outfit: 'hoodie', c1: '#2f8f83', c2: '#efe6d0', accent: '#f2c14e', mouth: 'smirk' },
  pam:      { skin: 'fair', hair: 'long', hairColor: '#e8dff2', eyeColor: '#8a5cc7', outfit: 'dress', c1: '#f4f1fa', c2: '#9b74d4', accent: '#7c4fc0', lashes: true, blush: true, acc: 'clip', mouth: 'smile' },
  dwight:   { skin: 'light', hair: 'braid', hairColor: '#e9bf4f', eyeColor: '#d19a2a', outfit: 'jacket', c1: '#a8302c', c2: '#22202a', accent: '#c9c2b4', eyes: 'sharp', mouth: 'grin' },
  kevin:    { skin: 'light', hair: 'spiky', hairColor: '#1f1d26', eyeColor: '#3a3340', outfit: 'hoodie', c1: '#2b2b35', c2: '#f08a24', accent: '#f08a24', eyes: 'sleepy', mouth: 'grin' },
  angela:   { skin: 'light', hair: 'long', hairColor: '#5b3d8c', eyeColor: '#7a4a32', outfit: 'jacket', c1: '#2a2438', c2: '#d6354f', accent: '#e8c45a', lashes: true, mouth: 'smirk', acc: 'earring' },
  oscar:    { skin: 'light', hair: 'neat', hairColor: '#7a5134', eyeColor: '#3f9a63', outfit: 'robe', c1: '#5e6b3a', c2: '#e9dfc4', accent: '#c7973f', mouth: 'smile' },
  stanley:  { skin: 'tan', hair: 'wild', hairColor: '#2e4a40', eyeColor: '#6a4a33', outfit: 'suit', c1: '#30426b', c2: '#f1ede4', accent: '#e2c14d', eyes: 'sleepy', mouth: 'smirk' },
  phyllis:  { skin: 'light', hair: 'ponytail', hairColor: '#3b2421', eyeColor: '#3f6fd1', outfit: 'robe', c1: '#e48aa3', c2: '#5a3d7a', accent: '#f6d06b', lashes: true, blush: true, acc: 'ribbon', mouth: 'smile' },
  andy:     { skin: 'light', hair: 'spiky', hairColor: '#f3d670', eyeColor: '#2f9fa8', outfit: 'coat', c1: '#c3302e', c2: '#1f1c22', accent: '#d9d2c4', glasses: true, mouth: 'grin' },
  kelly:    { skin: 'fair', hair: 'twintails', hairColor: '#69c3ee', eyeColor: '#2f7fd8', outfit: 'dress', c1: '#3c7bd6', c2: '#f5f7fb', accent: '#ffd35c', lashes: true, blush: true, mouth: 'grin', acc: 'ribbon' },
  ryan:     { skin: 'light', hair: 'neat', hairColor: '#3a2a22', eyeColor: '#4a78c4', outfit: 'shirt', c1: '#f2f2ee', c2: '#2c3550', accent: '#2c3550', mouth: 'neutral' },
  toby:     { skin: 'light', hair: 'messy', hairColor: '#2a2222', eyeColor: '#4f9a52', outfit: 'armor', c1: '#4b6a3a', c2: '#a5aeb8', accent: '#d8b45a', eyes: 'sharp', mouth: 'neutral' },
  creed:    { skin: 'fair', hair: 'hime', hairColor: '#9fd8ea', eyeColor: '#e0a92e', outfit: 'robe', c1: '#2b3446', c2: '#d8b45a', accent: '#7fd3ea', mouth: 'smile' },
  meredith: { skin: 'light', hair: 'bob', hairColor: '#3b2b5c', eyeColor: '#3f9a6d', outfit: 'jacket', c1: '#e6be3c', c2: '#b8333a', accent: '#f1efe9', lashes: true, mouth: 'smirk', acc: 'earring' },
};

export const lookFor = (name: string | undefined | null): AnimeLook =>
  ANIME_LOOKS[(name ?? 'jim') as OfficeCharacterName] ?? ANIME_LOOKS.jim;

// ─── colour helpers ─────────────────────────────────────────────────────────
const SKIN: Record<AnimeSkin, { base: string; sh: string; line: string }> = {
  fair:  { base: '#fde3d2', sh: '#efbfa8', line: '#c98a72' },
  light: { base: '#f8d2b4', sh: '#e3a989', line: '#b77a5c' },
  tan:   { base: '#e3ad7f', sh: '#c68a5c', line: '#93603c' },
  brown: { base: '#b9805a', sh: '#96613f', line: '#6c4129' },
  dark:  { base: '#8a5a3c', sh: '#6c432b', line: '#48291a' },
};
const INK = '#2a2230';

function hex(c: string): [number, number, number] {
  const h = c.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** Lighten (k > 0) or darken (k < 0) a hex colour. */
export function tone(c: string, k: number): string {
  const [r, g, b] = hex(c);
  const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

function poly(ctx: Ctx, pts: Pt[]): void {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}
function paint(ctx: Ctx, fill: string | CanvasGradient, lw = 0.55, stroke: string | null = INK): void {
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.stroke(); }
}
function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}
function vgrad(ctx: Ctx, y0: number, y1: number, a: string, b: string): CanvasGradient {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, a); g.addColorStop(1, b);
  return g;
}

// ═══ BUST (portrait) ═══════════════════════════════════════════════════════
// Drawn in a 36x56 unit box (the 18x28 frame at 2x).
const BW = 36, BH = 56;

function facePath(ctx: Ctx): void {
  ctx.beginPath();
  ctx.moveTo(9, 20);
  ctx.bezierCurveTo(9, 9, 27, 9, 27, 20);
  ctx.bezierCurveTo(27, 27.5, 23.5, 32.2, 18, 34.6);
  ctx.bezierCurveTo(12.5, 32.2, 9, 27.5, 9, 20);
  ctx.closePath();
}

/** Fringe bottom edge per style, right to left, closing the hair cap. */
const FRINGE: Record<AnimeHair, Pt[]> = {
  neat:      [[28.6, 21], [26.4, 15.6], [23, 14.6], [19.4, 16.8], [15.2, 13.8], [11.4, 17.4], [7.4, 21.5]],
  spiky:     [[28.8, 21.5], [26.6, 17.2], [25, 20.4], [22.4, 15.2], [20.4, 19.6], [17.8, 14.8], [15.4, 20], [12.8, 15.4], [10.8, 19.8], [7.2, 21.8]],
  messy:     [[28.8, 22], [26.8, 16.6], [24.6, 19.4], [22.2, 15.4], [19.6, 18.8], [16.4, 15], [13.8, 18.6], [11.4, 15.6], [9.4, 19.6], [7.2, 22]],
  wild:      [[29.6, 23], [27.4, 17], [25.2, 20.2], [22.8, 15.6], [20, 19.2], [17, 15.2], [14.4, 19.4], [11.6, 15.8], [9.2, 20.6], [6.4, 23]],
  long:      [[28.8, 23], [26.8, 16.4], [23.6, 18.2], [20.2, 14.8], [18, 17.4], [15.8, 14.8], [12.4, 18.2], [9.2, 16.4], [7.2, 23]],
  hime:      [[28.8, 22], [28.2, 17.8], [24, 18.2], [20, 18], [16, 18], [12, 18.2], [7.8, 17.8], [7.2, 22]],
  bob:       [[29.2, 22], [27, 16.6], [23.4, 17.8], [19.8, 15.2], [17, 17.4], [13.6, 15.4], [10.2, 17.6], [6.8, 22]],
  ponytail:  [[28.6, 21], [26.4, 15.4], [23.2, 17.4], [20, 14.6], [17.4, 16.8], [14.2, 14.8], [11, 17.6], [7.4, 21.4]],
  twintails: [[28.6, 21.4], [26.6, 16.2], [23.6, 18], [20.6, 15], [18, 17.6], [15.4, 15], [12.4, 18], [9.4, 16.2], [7.4, 21.4]],
  braid:     [[28.6, 21.2], [26.8, 15.8], [24.2, 18.6], [21.4, 14.8], [19, 18], [16.4, 14.6], [13.4, 17.8], [10.6, 15.4], [7.4, 21.4]],
};

function hairCapPath(ctx: Ctx, h: AnimeHair, dy = 0): void {
  const big = h === 'wild' ? 2.4 : h === 'bob' ? 0.9 : 0;
  const top = 4.6 - big;
  ctx.beginPath();
  ctx.moveTo(7.2 - big * 0.6, 22 + dy);
  ctx.bezierCurveTo(5.6 - big, top, 30.4 + big, top, 28.8 + big * 0.6, 22 + dy);
  for (const [x, y] of FRINGE[h]) ctx.lineTo(x, y + dy);
  ctx.closePath();
}

function drawBackHair(ctx: Ctx, l: AnimeLook): void {
  const base = l.hairColor, dark = tone(base, -0.28);
  const fill = vgrad(ctx, 8, 54, base, dark);
  if (l.hair === 'long' || l.hair === 'hime') {
    ctx.beginPath();
    ctx.moveTo(8, 14);
    ctx.bezierCurveTo(4, 26, 4.5, 44, 6, 54);
    ctx.lineTo(30, 54);
    ctx.bezierCurveTo(31.5, 44, 32, 26, 28, 14);
    ctx.closePath();
    paint(ctx, fill);
  } else if (l.hair === 'ponytail') {
    ctx.beginPath();
    ctx.moveTo(24, 9);
    ctx.bezierCurveTo(34, 12, 35, 30, 31, 44);
    ctx.bezierCurveTo(30, 34, 28, 22, 22, 14);
    ctx.closePath();
    paint(ctx, fill);
  } else if (l.hair === 'twintails') {
    for (const s of [-1, 1]) {
      const x = 18 + s * 9.5;
      ctx.beginPath();
      ctx.moveTo(x, 12);
      ctx.bezierCurveTo(x + s * 7, 18, x + s * 6.5, 38, x + s * 3, 52);
      ctx.bezierCurveTo(x + s * 1, 40, x - s * 0.5, 24, x - s * 1.6, 15);
      ctx.closePath();
      paint(ctx, fill);
    }
  } else if (l.hair === 'braid') {
    for (let i = 0; i < 5; i++) {
      ellipse(ctx, 27.4 + i * 0.5, 30 + i * 4.6, 2.3, 2.8);
      paint(ctx, i % 2 ? base : tone(base, -0.12));
    }
  } else if (l.hair === 'bob') {
    ctx.beginPath();
    ctx.moveTo(7, 14);
    ctx.bezierCurveTo(4.6, 24, 5.4, 31, 9, 34);
    ctx.lineTo(27, 34);
    ctx.bezierCurveTo(30.6, 31, 31.4, 24, 29, 14);
    ctx.closePath();
    paint(ctx, fill);
  }
}

function drawSideLocks(ctx: Ctx, l: AnimeLook): void {
  const base = l.hairColor;
  const len = l.hair === 'long' ? 46 : l.hair === 'hime' ? 36 : l.hair === 'bob' ? 32 : l.hair === 'twintails' ? 30 : 27;
  const fill = vgrad(ctx, 14, len, base, tone(base, -0.22));
  for (const s of [-1, 1]) {
    const x = 18 + s * 9.3;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.6, 15);
    ctx.bezierCurveTo(x + s * 1.6, 22, x + s * 1.2, len - 6, x + s * 0.4, len);
    if (l.hair === 'hime') ctx.lineTo(x - s * 2.6, len);
    else ctx.bezierCurveTo(x - s * 1.2, len - 5, x - s * 1.8, 24, x - s * 2.2, 18);
    ctx.closePath();
    paint(ctx, fill);
  }
}

function drawFrontHair(ctx: Ctx, l: AnimeLook): void {
  const base = l.hairColor;
  // Shadow the fringe casts on the forehead.
  ctx.save();
  facePath(ctx); ctx.clip();
  hairCapPath(ctx, l.hair, 1.4);
  ctx.fillStyle = 'rgba(70, 30, 30, 0.22)';
  ctx.fill();
  ctx.restore();
  if (l.hair === 'spiky' || l.hair === 'wild') {
    // Spikes over the crown.
    const spikes: Pt[] = l.hair === 'wild'
      ? [[5, 18], [3, 11], [7.4, 10], [6.4, 4], [11.6, 6], [13, 1], [17.6, 4.4], [21.4, 0.8], [23.6, 5], [28.6, 3.6], [28.6, 9], [33, 10], [31, 18]]
      : [[7, 16], [5.4, 9.6], [9.4, 9], [9.6, 3.4], [14, 6], [17.6, 0.8], [20.6, 5.4], [25.2, 2.4], [26, 8], [30.6, 8.8], [29, 16]];
    poly(ctx, spikes);
    paint(ctx, vgrad(ctx, 0, 18, tone(base, 0.12), base));
  }
  hairCapPath(ctx, l.hair);
  paint(ctx, vgrad(ctx, 5, 22, tone(base, 0.14), tone(base, -0.08)));
  // Anime "angel ring" highlight.
  ctx.save();
  hairCapPath(ctx, l.hair); ctx.clip();
  ctx.beginPath();
  ctx.ellipse(18, 13, 9.4, 3.6, 0, Math.PI * 1.08, Math.PI * 1.92);
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
  ctx.stroke();
  ctx.restore();
  // A couple of strand lines.
  ctx.beginPath();
  ctx.moveTo(15, 9); ctx.quadraticCurveTo(14, 13, 15.2, 16);
  ctx.moveTo(22, 9.5); ctx.quadraticCurveTo(23.4, 13, 22.4, 16.4);
  ctx.lineWidth = 0.4; ctx.strokeStyle = tone(base, -0.35); ctx.stroke();
}

function drawEye(ctx: Ctx, l: AnimeLook, cx: number, side: -1 | 1, skin: { base: string; sh: string }): void {
  const kind = l.eyes ?? 'round';
  const ry = kind === 'sharp' ? 2.7 : 3.4;
  const cy = 24.2;
  ellipse(ctx, cx, cy, 3.1, ry);
  ctx.fillStyle = '#fbf8f4'; ctx.fill();
  ctx.save();
  ellipse(ctx, cx, cy, 3.1, ry); ctx.clip();
  ellipse(ctx, cx + side * 0.15, cy + 0.4, 2.45, 3.05);
  ctx.fillStyle = vgrad(ctx, cy - 3, cy + 3.4, tone(l.eyeColor, -0.45), tone(l.eyeColor, 0.25));
  ctx.fill();
  ellipse(ctx, cx + side * 0.15, cy + 0.6, 1.15, 1.7);
  ctx.fillStyle = tone(l.eyeColor, -0.7); ctx.fill();
  ellipse(ctx, cx - 0.9, cy - 1.1, 0.95, 1.05);
  ctx.fillStyle = '#ffffff'; ctx.fill();
  ellipse(ctx, cx + 0.95, cy + 1.6, 0.45, 0.45); ctx.fill();
  if (kind === 'sleepy') {
    ctx.fillStyle = skin.base;
    ctx.fillRect(cx - 4, cy - 5, 8, 4.4);
  }
  ctx.restore();
  // Upper lash line.
  const lidY = kind === 'sleepy' ? cy - 0.6 : cy - ry + 0.2;
  ctx.beginPath();
  const outer = cx + side * 3.5, inner = cx - side * 3.2;
  const outerY = kind === 'sharp' ? lidY - 0.6 : lidY + 0.6;
  ctx.moveTo(inner, lidY + 0.8);
  ctx.quadraticCurveTo(cx, lidY - 1.4, outer, outerY);
  if (l.lashes) ctx.lineTo(outer + side * 1.1, outerY - 1);
  ctx.lineWidth = l.lashes ? 1.25 : 1;
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.stroke();
  // Lower lid.
  ctx.beginPath();
  ctx.moveTo(cx - 1.6, cy + ry + 0.1);
  ctx.lineTo(cx + 1.6, cy + ry + 0.1);
  ctx.lineWidth = 0.35; ctx.strokeStyle = tone(skin.sh, -0.2); ctx.stroke();
}

function drawFace(ctx: Ctx, l: AnimeLook): void {
  const s = SKIN[l.skin];
  // Brows (mostly under the fringe).
  ctx.beginPath();
  if (l.eyes === 'sharp') {
    ctx.moveTo(10.4, 19.4); ctx.lineTo(15.4, 20.4); ctx.moveTo(25.6, 19.4); ctx.lineTo(20.6, 20.4);
  } else {
    ctx.moveTo(10.6, 20); ctx.quadraticCurveTo(13, 19, 15.4, 19.8);
    ctx.moveTo(25.4, 20); ctx.quadraticCurveTo(23, 19, 20.6, 19.8);
  }
  ctx.lineWidth = 0.6; ctx.strokeStyle = tone(l.hairColor, -0.4); ctx.stroke();
  drawEye(ctx, l, 13.2, -1, s);
  drawEye(ctx, l, 22.8, 1, s);
  // Nose.
  ctx.beginPath(); ctx.moveTo(18.5, 27.6); ctx.lineTo(18, 28.5);
  ctx.lineWidth = 0.5; ctx.strokeStyle = s.line; ctx.stroke();
  // Mouth.
  const m = l.mouth ?? 'smile';
  ctx.beginPath();
  if (m === 'grin') {
    ctx.moveTo(16, 30.2); ctx.quadraticCurveTo(18, 30.6, 20, 30.2); ctx.quadraticCurveTo(18, 33.4, 16, 30.2);
    ctx.fillStyle = '#9b3b45'; ctx.fill();
    ctx.lineWidth = 0.45; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(16.6, 30.5); ctx.lineTo(19.4, 30.5);
    ctx.lineWidth = 0.6; ctx.strokeStyle = '#ffffff'; ctx.stroke();
  } else {
    if (m === 'smile') { ctx.moveTo(16.4, 30.4); ctx.quadraticCurveTo(18, 31.6, 19.6, 30.4); }
    else if (m === 'smirk') { ctx.moveTo(16.6, 30.9); ctx.quadraticCurveTo(18.4, 31.2, 19.8, 30.1); }
    else { ctx.moveTo(16.9, 30.8); ctx.lineTo(19.1, 30.8); }
    ctx.lineWidth = 0.6; ctx.lineCap = 'round'; ctx.strokeStyle = '#8a3a3f'; ctx.stroke();
  }
  if (l.blush) {
    ctx.fillStyle = 'rgba(240, 120, 130, 0.34)';
    ellipse(ctx, 11.8, 28.4, 1.9, 0.95); ctx.fill();
    ellipse(ctx, 24.2, 28.4, 1.9, 0.95); ctx.fill();
  }
  if (l.glasses) {
    ctx.lineWidth = 0.55; ctx.strokeStyle = '#3a3540';
    ctx.fillStyle = 'rgba(170, 220, 255, 0.16)';
    for (const cx of [13.2, 22.8]) { ellipse(ctx, cx, 24.4, 3.7, 3.3); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(16.9, 24); ctx.lineTo(19.1, 24); ctx.stroke();
  }
}

function torsoPath(ctx: Ctx): void {
  ctx.beginPath();
  ctx.moveTo(3, 56);
  ctx.bezierCurveTo(3.4, 47, 6, 43.4, 13.6, 41.2);
  ctx.lineTo(22.4, 41.2);
  ctx.bezierCurveTo(30, 43.4, 32.6, 47, 33, 56);
  ctx.closePath();
}

function drawOutfit(ctx: Ctx, l: AnimeLook): void {
  const { c1, c2, accent } = l;
  const s = SKIN[l.skin];
  if (l.outfit === 'hoodie') {
    // Hood bunched behind the neck.
    ellipse(ctx, 18, 41.4, 9.6, 3.6); paint(ctx, tone(c1, -0.2));
  }
  if (l.outfit === 'cloak') { ellipse(ctx, 18, 42, 12, 4); paint(ctx, tone(c1, -0.15)); }
  // Neck.
  ctx.beginPath();
  ctx.moveTo(15.4, 32.6); ctx.lineTo(20.6, 32.6); ctx.lineTo(21, 42.6); ctx.lineTo(15, 42.6); ctx.closePath();
  paint(ctx, s.base, 0.45);
  ctx.beginPath(); ctx.moveTo(15.4, 33.4); ctx.quadraticCurveTo(18, 36.6, 20.6, 33.4); ctx.lineTo(20.6, 32.6); ctx.lineTo(15.4, 32.6);
  ctx.fillStyle = s.sh; ctx.fill();
  // Body.
  torsoPath(ctx);
  paint(ctx, vgrad(ctx, 41, 56, tone(c1, 0.1), tone(c1, -0.18)));
  ctx.save();
  torsoPath(ctx); ctx.clip();
  ctx.lineWidth = 0.5; ctx.strokeStyle = INK;
  switch (l.outfit) {
    case 'coat': {
      poly(ctx, [[15, 41.2], [18, 49], [21, 41.2]]); paint(ctx, c2, 0.4);
      ctx.fillStyle = c2; ctx.fillRect(17.4, 48, 1.2, 8);
      ctx.fillStyle = accent;
      for (const y of [50, 53.4]) { ellipse(ctx, 15.6, y, 0.7, 0.7); ctx.fill(); ellipse(ctx, 20.4, y, 0.7, 0.7); ctx.fill(); }
      // High collar.
      poly(ctx, [[12.6, 41.6], [15, 38.6], [16.6, 43.4]]); paint(ctx, c1, 0.4);
      poly(ctx, [[23.4, 41.6], [21, 38.6], [19.4, 43.4]]); paint(ctx, c1, 0.4);
      ctx.fillStyle = c2; ctx.fillRect(3, 46.6, 6, 1); ctx.fillRect(27, 46.6, 6, 1);
      break;
    }
    case 'hoodie': {
      ctx.beginPath(); ctx.moveTo(18, 43); ctx.lineTo(18, 56); ctx.lineWidth = 0.6; ctx.strokeStyle = tone(c1, -0.4); ctx.stroke();
      ctx.lineWidth = 0.5; ctx.strokeStyle = c2;
      ctx.beginPath(); ctx.moveTo(16.2, 43); ctx.lineTo(15.8, 49); ctx.moveTo(19.8, 43); ctx.lineTo(20.2, 49); ctx.stroke();
      ctx.fillStyle = c2; ctx.fillRect(3, 52, 30, 1.2);
      ctx.fillStyle = accent; ellipse(ctx, 15.8, 49.4, 0.6, 0.6); ctx.fill(); ellipse(ctx, 20.2, 49.4, 0.6, 0.6); ctx.fill();
      break;
    }
    case 'cloak': {
      poly(ctx, [[14, 41.2], [18, 56], [22, 41.2]]); paint(ctx, c2, 0.4);
      ellipse(ctx, 18, 44.6, 1.5, 1.5); paint(ctx, accent, 0.4);
      break;
    }
    case 'armor': {
      poly(ctx, [[12, 44], [24, 44], [23, 56], [13, 56]]);
      paint(ctx, vgrad(ctx, 44, 56, tone(c2, 0.3), tone(c2, -0.25)), 0.5);
      for (const x of [6.4, 29.6]) {
        ellipse(ctx, x, 46.4, 5.2, 3.6);
        paint(ctx, vgrad(ctx, 43, 50, tone(c2, 0.35), tone(c2, -0.2)), 0.5);
      }
      ctx.fillStyle = accent; ctx.fillRect(17.3, 45, 1.4, 11);
      break;
    }
    case 'robe': {
      poly(ctx, [[13.4, 41.2], [18, 50], [22.6, 41.2], [24.4, 42], [18, 54], [11.6, 42]]); paint(ctx, c2, 0.4);
      ctx.fillStyle = accent; ctx.fillRect(3, 53, 30, 1.6);
      break;
    }
    case 'jacket': {
      poly(ctx, [[14.6, 41.2], [18, 56], [21.4, 41.2]]); paint(ctx, c2, 0.35);
      poly(ctx, [[14.6, 41.2], [16.4, 49], [13.6, 47.4]]); paint(ctx, tone(c1, -0.12), 0.4);
      poly(ctx, [[21.4, 41.2], [19.6, 49], [22.4, 47.4]]); paint(ctx, tone(c1, -0.12), 0.4);
      break;
    }
    case 'dress': {
      // Sailor-ish collar with a ribbon.
      poly(ctx, [[11.4, 42], [18, 49.4], [24.6, 42], [27, 44.4], [18, 52.6], [9, 44.4]]); paint(ctx, c2, 0.45);
      ctx.beginPath(); ctx.moveTo(10.6, 44.2); ctx.lineTo(18, 51.4); ctx.lineTo(25.4, 44.2);
      ctx.lineWidth = 0.5; ctx.strokeStyle = tone(c2, -0.3); ctx.stroke();
      poly(ctx, [[18, 50], [15, 48.6], [15.4, 52], [18, 50.6], [20.6, 52], [21, 48.6]]); paint(ctx, accent, 0.4);
      break;
    }
    case 'suit': {
      poly(ctx, [[14.8, 41.2], [18, 52], [21.2, 41.2]]); paint(ctx, c2, 0.35);
      poly(ctx, [[17.2, 43], [18.8, 43], [19.2, 51], [18, 53], [16.8, 51]]); paint(ctx, accent, 0.4);
      poly(ctx, [[14.8, 41.2], [17, 50], [13.2, 46.4]]); paint(ctx, tone(c1, -0.1), 0.4);
      poly(ctx, [[21.2, 41.2], [19, 50], [22.8, 46.4]]); paint(ctx, tone(c1, -0.1), 0.4);
      break;
    }
    case 'shirt': {
      poly(ctx, [[14.6, 41.2], [18, 45], [16.2, 46.4], [13.4, 42.6]]); paint(ctx, tone(c1, -0.05), 0.4);
      poly(ctx, [[21.4, 41.2], [18, 45], [19.8, 46.4], [22.6, 42.6]]); paint(ctx, tone(c1, -0.05), 0.4);
      ctx.fillStyle = c2;
      for (const y of [47.4, 50.6, 53.8]) { ellipse(ctx, 18, y, 0.5, 0.5); ctx.fill(); }
      break;
    }
  }
  ctx.restore();
}

function drawAccessory(ctx: Ctx, l: AnimeLook): void {
  const a = l.accent;
  switch (l.acc) {
    case 'ribbon':
      poly(ctx, [[25.6, 8.4], [30.6, 5.4], [30, 11.2]]); paint(ctx, a, 0.45);
      poly(ctx, [[25.6, 8.4], [21.4, 4.6], [21.2, 10.4]]); paint(ctx, a, 0.45);
      ellipse(ctx, 25.6, 8.4, 1.3, 1.3); paint(ctx, tone(a, -0.15), 0.45);
      break;
    case 'clip':
      ctx.save(); ctx.translate(25.4, 14); ctx.rotate(-0.5);
      ctx.beginPath(); ctx.rect(-2.4, -0.7, 4.8, 1.4); paint(ctx, a, 0.4);
      ctx.restore();
      ellipse(ctx, 27.2, 12.4, 1.2, 1.2); paint(ctx, '#fff3b0', 0.4);
      break;
    case 'headband':
      ctx.beginPath(); ctx.ellipse(18, 15, 10.4, 6.6, 0, Math.PI * 1.04, Math.PI * 1.96);
      ctx.lineWidth = 1.6; ctx.strokeStyle = a; ctx.stroke();
      break;
    case 'goggles':
      for (const x of [14, 22]) { ellipse(ctx, x, 9.6, 2.6, 2.1); paint(ctx, '#9fd3ef', 0.6, '#3a3540'); }
      break;
    case 'earring':
      ellipse(ctx, 8.8, 28.4, 0.8, 0.8); paint(ctx, a, 0.35);
      ellipse(ctx, 27.2, 28.4, 0.8, 0.8); paint(ctx, a, 0.35);
      break;
  }
}

/** Draw the bust so it fills (x, y, w, h); keep w:h at 18:28. */
export function drawAnimeBust(ctx: Ctx, l: AnimeLook, x: number, y: number, w: number, h: number): void {
  const s = SKIN[l.skin];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(w / BW, h / BH);
  ctx.lineCap = 'round';
  drawBackHair(ctx, l);
  drawOutfit(ctx, l);
  // Ears, head.
  ellipse(ctx, 8.8, 24.4, 1.4, 2.2); paint(ctx, s.base, 0.45);
  ellipse(ctx, 27.2, 24.4, 1.4, 2.2); paint(ctx, s.base, 0.45);
  facePath(ctx);
  paint(ctx, vgrad(ctx, 14, 35, s.base, tone(s.base, -0.04)));
  ctx.save(); facePath(ctx); ctx.clip();
  ctx.beginPath(); ctx.ellipse(26, 27, 4, 9, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(190, 110, 90, 0.12)'; ctx.fill();
  ctx.restore();
  drawFace(ctx, l);
  if (l.hair !== 'spiky' && l.hair !== 'neat' && l.hair !== 'messy') drawSideLocks(ctx, l);
  drawFrontHair(ctx, l);
  drawAccessory(ctx, l);
  ctx.restore();
}

/** Portrait entry point with the old pixel-portrait signature (18x28 frame at `scale`). */
export function paintAnimePortrait(ctx: Ctx, name: OfficeCharacterName, scale = 2, clear = true): void {
  if (clear) ctx.clearRect(0, 0, 18 * scale, 28 * scale);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  drawAnimeBust(ctx, lookFor(name), 0, 0, 18 * scale, 28 * scale);
  ctx.restore();
}

/** The look reduced to what the optional 3D figure can show. */
export function animeCharacterLook(name: OfficeCharacterName): CharacterLook {
  const l = lookFor(name);
  const hairStyle: CharacterLook['hairStyle'] =
    l.hair === 'spiky' || l.hair === 'wild' ? 'spiky'
      : l.hair === 'neat' ? 'parted'
        : l.hair === 'messy' ? 'short'
          : l.hair === 'bob' ? 'curly'
            : l.hair === 'ponytail' || l.hair === 'braid' ? 'bun' : 'long';
  return {
    skin: SKIN[l.skin].base,
    hairColor: l.hairColor,
    hairStyle,
    topStyle: l.outfit === 'coat' || l.outfit === 'suit' || l.outfit === 'jacket' ? 'jacket' : 'tee',
    topColor: l.c1,
    bottomColor: l.pants ?? '#2f3242',
    glasses: Boolean(l.glasses),
  };
}

// ═══ SPRITE (2D guild hall) ════════════════════════════════════════════════
export type Facing = 'down' | 'up' | 'left' | 'right';

export interface SpritePose {
  facing: Facing;
  /** Walk cycle phase in radians; null when standing still. */
  walk: number | null;
  sitting?: boolean;
  /** Typing / casting motion while working. */
  working?: boolean;
  t: number;
}

/** Draw a chibi standing on (x, y) (feet). About 22 wide and 32 tall. */
export function drawAnimeSprite(ctx: Ctx, l: AnimeLook, x: number, y: number, pose: SpritePose): void {
  const s = SKIN[l.skin];
  const walking = pose.walk !== null;
  const sw = walking ? Math.sin(pose.walk as number) : 0;
  const bob = walking ? Math.abs(Math.cos(pose.walk as number)) * 0.9 : Math.sin(pose.t * 2.2) * 0.25;
  const sit = pose.sitting ? 2.6 : 0;
  const f = pose.facing;
  const pants = l.pants ?? '#2f3242';
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  // Shadow.
  ellipse(ctx, 0, 0, 6.6, 2.2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
  ctx.translate(0, -bob + sit);
  const longBack = l.hair === 'long' || l.hair === 'hime' || l.hair === 'twintails' || l.hair === 'ponytail' || l.hair === 'braid';
  // Back hair behind the body when facing the viewer.
  if (longBack && f !== 'up') {
    ctx.beginPath();
    ctx.moveTo(-6.6, -21); ctx.quadraticCurveTo(-8, -12, -5.4, -7.6); ctx.lineTo(5.4, -7.6); ctx.quadraticCurveTo(8, -12, 6.6, -21); ctx.closePath();
    paint(ctx, tone(l.hairColor, -0.18), 0.5);
  }
  // Legs.
  if (!pose.sitting) {
    for (const side of [-1, 1]) {
      const lift = walking ? sw * side * 1.6 : 0;
      ctx.beginPath(); ctx.roundRect(side * 2.6 - 1.7, -6.4 - Math.max(0, lift) * 0.4, 3.4, 6.2 - Math.max(0, lift) * 0.5, 1.2);
      paint(ctx, pants, 0.5);
      ellipse(ctx, side * 2.6, -0.4 - Math.max(0, lift) * 0.6, 2, 1.1); paint(ctx, '#3a2a22', 0.4);
    }
  }
  // Arms behind body (swing).
  const armSwing = walking ? sw * 1.8 : pose.working ? Math.sin(pose.t * 10) * 0.8 : 0;
  for (const side of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(side * 6, -10.4 + side * armSwing * 0.4, 1.7, 3.4, side * 0.25, 0, Math.PI * 2);
    paint(ctx, tone(l.c1, -0.12), 0.45);
    ellipse(ctx, side * 6.2, -7.4 + side * armSwing * 0.4, 1.3, 1.2); paint(ctx, s.base, 0.4);
  }
  // Body.
  ctx.beginPath();
  ctx.moveTo(-5.2, -15.6); ctx.lineTo(5.2, -15.6); ctx.quadraticCurveTo(6.6, -10, 5.8, -5.8); ctx.lineTo(-5.8, -5.8); ctx.quadraticCurveTo(-6.6, -10, -5.2, -15.6); ctx.closePath();
  paint(ctx, vgrad(ctx, -16, -5, tone(l.c1, 0.08), tone(l.c1, -0.16)), 0.5);
  if (f !== 'up') {
    ctx.fillStyle = l.c2;
    if (l.outfit === 'armor') { ctx.fillRect(-3.6, -14, 7.2, 6); }
    else if (l.outfit === 'dress' || l.outfit === 'robe' || l.outfit === 'cloak') { poly(ctx, [[-3.6, -15.6], [0, -10.6], [3.6, -15.6]]); ctx.fill(); }
    else { ctx.fillRect(-0.8, -15.4, 1.6, 9.4); }
    ctx.fillStyle = l.accent; ellipse(ctx, 0, -12.6, 0.9, 0.9); ctx.fill();
  }
  // Head.
  const hy = -23;
  ellipse(ctx, 0, hy, 8.4, 7.8); paint(ctx, s.base, 0.55);
  // Hair: back of head when facing up, cap + fringe otherwise.
  const hc = l.hairColor;
  const hfill = vgrad(ctx, hy - 9, hy + 4, tone(hc, 0.15), tone(hc, -0.1));
  if (f === 'up') {
    ellipse(ctx, 0, hy - 0.6, 8.9, 8.3); paint(ctx, hfill, 0.55);
    if (longBack) {
      ctx.beginPath(); ctx.moveTo(-7, hy); ctx.quadraticCurveTo(-7.6, hy + 12, -4.6, hy + 15); ctx.lineTo(4.6, hy + 15); ctx.quadraticCurveTo(7.6, hy + 12, 7, hy); ctx.closePath();
      paint(ctx, hfill, 0.5);
    }
  } else {
    const ox = f === 'left' ? -1.2 : f === 'right' ? 1.2 : 0;
    // Eyes.
    const eyes = f === 'down' ? [-3.1, 3.1] : [f === 'left' ? -3.6 : 3.6];
    for (const ex of eyes) {
      ellipse(ctx, ex + ox, hy + 1.8, 1.5, 2); ctx.fillStyle = tone(l.eyeColor, -0.35); ctx.fill();
      ellipse(ctx, ex + ox, hy + 2.4, 1.1, 1.2); ctx.fillStyle = tone(l.eyeColor, 0.15); ctx.fill();
      ellipse(ctx, ex + ox - 0.5, hy + 1.1, 0.55, 0.6); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(ex + ox - 1.8, hy - 0.1); ctx.lineTo(ex + ox + 1.8, hy - 0.1); ctx.lineWidth = 0.7; ctx.strokeStyle = INK; ctx.stroke();
    }
    if (l.blush && f === 'down') {
      ctx.fillStyle = 'rgba(240,120,130,0.4)';
      ellipse(ctx, -5, hy + 4.2, 1.4, 0.7); ctx.fill(); ellipse(ctx, 5, hy + 4.2, 1.4, 0.7); ctx.fill();
    }
    if (l.glasses) {
      ctx.lineWidth = 0.5; ctx.strokeStyle = '#3a3540';
      for (const ex of eyes) { ellipse(ctx, ex + ox, hy + 1.9, 2.4, 2.3); ctx.stroke(); }
    }
    // Hair cap with a jagged fringe.
    ctx.beginPath();
    ctx.moveTo(-8.8, hy + 2.6);
    ctx.bezierCurveTo(-10.6, hy - 11.6, 10.6, hy - 11.6, 8.8, hy + 2.6);
    const spiky = l.hair === 'spiky' || l.hair === 'wild' || l.hair === 'messy';
    const n = spiky ? 6 : 4;
    for (let i = 0; i <= n; i++) {
      const px = 8.8 - (17.6 * i) / n + ox * 0.6;
      const py = hy - (i % 2 === 0 ? 1.4 : spiky ? -1.6 : -0.6);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    paint(ctx, hfill, 0.55);
    if (l.hair === 'spiky' || l.hair === 'wild') {
      poly(ctx, [[-6, hy - 6], [-7.6, hy - 11], [-3, hy - 8.4], [-1, hy - 13], [1.6, hy - 8.4], [5.6, hy - 11.6], [6.4, hy - 6]]);
      paint(ctx, hfill, 0.5);
    }
    // Side locks.
    if (!spiky && l.hair !== 'neat') {
      for (const sd of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(sd * 8.6, hy - 2); ctx.quadraticCurveTo(sd * 9.6, hy + 6, sd * 7.6, hy + 9); ctx.lineTo(sd * 6.4, hy + 3); ctx.closePath();
        paint(ctx, hfill, 0.45);
      }
    }
    ctx.beginPath(); ctx.ellipse(0, hy - 4.6, 5.6, 2.2, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.stroke();
  }
  // Twin tails / ponytail stick out on the sides.
  if (l.hair === 'twintails') {
    for (const sd of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(sd * 7.6, hy - 5); ctx.quadraticCurveTo(sd * 14, hy + 2, sd * 11, hy + 13); ctx.quadraticCurveTo(sd * 9.6, hy + 4, sd * 7, hy - 1); ctx.closePath();
      paint(ctx, hfill, 0.5);
    }
  } else if (l.hair === 'ponytail' && f !== 'down') {
    ctx.beginPath(); ctx.moveTo(-1.6, hy - 6); ctx.quadraticCurveTo(4, hy + 2, 1.6, hy + 12); ctx.quadraticCurveTo(0, hy + 3, -3, hy - 3); ctx.closePath();
    paint(ctx, hfill, 0.5);
  }
  if (l.acc === 'ribbon') {
    poly(ctx, [[4.6, hy - 7.6], [8.6, hy - 10.4], [8.4, hy - 5.6]]); paint(ctx, l.accent, 0.4);
    poly(ctx, [[4.6, hy - 7.6], [1.2, hy - 10.4], [1.4, hy - 5.4]]); paint(ctx, l.accent, 0.4);
  }
  ctx.restore();
}
