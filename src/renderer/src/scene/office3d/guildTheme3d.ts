/**
 * AI Guild: the "Guild Hall" look for the optional 3D office, laid out like the
 * 2D guild hall (courtyard, guild master's office, library, work hall, great
 * hall, tavern) on the 1800 × 720 floor.
 *
 * Every floor gets it once, automatically (ensureGuildTheme); after that the
 * Theme panel can undo it or switch to another preset as usual.
 */
import { validateOfficeTheme, type OfficeThemeItem } from '@shared/officeTheme';
import { applyTheme } from './themeStore';

type Item = OfficeThemeItem;
const WOOD = '#7a4a26';
const DOOR = '#5c3b20';
const GOLD = '#e8b24c';
const FIRE = '#ff8a3a';

/** Vertical wall at x from y0 to y1, with a 40-unit door at each gap start. */
function vwall(x: number, y0: number, y1: number, gaps: number[]): Item[] {
  const out: Item[] = [];
  let y = y0;
  for (const g of [...gaps].sort((a, b) => a - b)) {
    if (g > y) out.push({ type: 'wall', x, y, w: 8, h: g - y });
    out.push({ type: 'door', x: x - 10, y: g + 10, w: 40, h: 8, facing: 90, color: DOOR });
    y = g + 40;
  }
  if (y1 > y) out.push({ type: 'wall', x, y, w: 8, h: y1 - y });
  return out;
}

/** Horizontal wall at y from x0 to x1, with a 40-unit door at each gap start. */
function hwall(y: number, x0: number, x1: number, gaps: number[]): Item[] {
  const out: Item[] = [];
  let x = x0;
  for (const g of [...gaps].sort((a, b) => a - b)) {
    if (g > x) out.push({ type: 'wall', x, y, w: g - x, h: 8 });
    out.push({ type: 'door', x: g, y, w: 40, h: 8, color: DOOR });
    x = g + 40;
  }
  if (x1 > x) out.push({ type: 'wall', x, y, w: x1 - x, h: 8 });
  return out;
}

/** A writing desk with its (magic) terminal and chair, like the stock workstation. */
function workstation(x: number, y: number, id: string): Item[] {
  return [
    { type: 'desk_cubicle', x, y, id, color: WOOD },
    { type: 'computer', x: x + 18, y: y + 14 },
    { type: 'keyboard', x: x + 20, y: y + 24 },
    { type: 'mouse', x: x + 44, y: y + 26 },
    { type: 'chair', x: x + 20, y: y + 22, facing: 180, color: '#5a3a22' },
  ];
}

/** Round tavern table with four chairs. */
function tavernTable(x: number, y: number): Item[] {
  return [
    { type: 'round_table', x, y, r: 45, color: '#9a6838' },
    { type: 'chair', x: x + 36, y: y - 8, facing: 0, color: '#6b4424' },
    { type: 'chair', x: x + 36, y: y + 74, facing: 180, color: '#6b4424' },
    { type: 'chair', x: x - 12, y: y + 32, facing: 90, color: '#6b4424' },
    { type: 'chair', x: x + 76, y: y + 32, facing: 270, color: '#6b4424' },
  ];
}

export function guildHallThemeRaw(): unknown {
  const items: Item[] = [];
  const add = (...xs: Item[]) => items.push(...xs);

  // ── Courtyard (x 0–300): stone paving, statue, trees, log benches, dummy.
  add({ type: 'path', x: 0, y: 0, w: 300, h: 720, color: '#8f8b83' });
  add({ type: 'path', x: 110, y: 0, w: 80, h: 720, color: '#a8a39a' });
  add({ type: 'rock', x: 120, y: 330, w: 60, h: 60, color: '#c9c5bc' });
  add({ type: 'flower_bed', x: 100, y: 400, w: 100, h: 24, color: '#c9a24a' });
  for (const [x, y] of [[20, 20], [240, 20], [20, 640], [240, 640]]) add({ type: 'tree', x, y, w: 50, h: 50, color: '#3f7d3a' });
  for (const [x, y] of [[30, 200], [210, 200], [30, 500], [210, 500]]) add({ type: 'log', x, y, w: 60, h: 18, color: '#7a5030' });
  add({ type: 'stump', x: 240, y: 360, w: 24, h: 24, color: '#b8955a' });
  for (const y of [120, 600]) { add({ type: 'lantern', x: 40, y, color: FIRE }); add({ type: 'lantern', x: 250, y, color: FIRE }); }

  // ── Walls between the wings.
  add(...vwall(300, 0, 720, [140, 520]));
  add(...vwall(560, 0, 720, [120, 540]));
  add(...vwall(1180, 0, 720, [150, 560]));
  add(...hwall(300, 300, 560, [410]));
  add(...hwall(330, 1180, 1800, [1440, 1480]));

  // ── Guild master's office (x 300–560, y 0–300): Roy's desk on a red rug.
  add({ type: 'path', x: 340, y: 70, w: 180, h: 150, color: '#7a2a2a' });
  add(...workstation(400, 110, 'desk_boss'));
  add({ type: 'bookshelf', x: 312, y: 12, w: 90, h: 28 });
  add({ type: 'bookshelf', x: 456, y: 12, w: 90, h: 28 });
  add({ type: 'couch', x: 330, y: 240, w: 100, h: 40, color: '#7a2a30' });
  add({ type: 'lamp', x: 520, y: 60 });
  add({ type: 'plant', x: 525, y: 260 });
  add({ type: 'lantern', x: 380, y: 90, color: GOLD });

  // ── Library (x 300–560, y 300–720).
  for (const y of [340, 440, 600]) add({ type: 'bookshelf', x: 310, y, w: 28, h: 90 });
  add({ type: 'bookshelf', x: 400, y: 684, w: 90, h: 28 });
  add({ type: 'table_rect', x: 410, y: 470, w: 100, h: 50, color: '#8a5a2e' });
  add({ type: 'chair', x: 440, y: 450, facing: 0, color: '#2b4a7a' });
  add({ type: 'chair', x: 440, y: 530, facing: 180, color: '#2b4a7a' });
  add({ type: 'lantern', x: 455, y: 480, color: GOLD });
  add({ type: 'plant', x: 525, y: 690 });

  // ── Work hall (x 560–1180): 16 desks, lanterns between the rows.
  add({ type: 'path', x: 568, y: 0, w: 612, h: 40, color: '#7a2a2a' });
  let n = 0;
  for (const y of [70, 220, 370, 520]) for (const x of [600, 740, 880, 1020]) add(...workstation(x, y, `desk_${n++}`));
  for (const y of [180, 330, 480]) for (const x of [700, 980]) add({ type: 'lantern', x, y, color: GOLD });
  add({ type: 'plant', x: 575, y: 690 }, { type: 'plant', x: 1160, y: 690 });
  add({ type: 'whiteboard', x: 1166, y: 300, w: 10, h: 64 });

  // ── Great hall (x 1180–1800, y 0–330): green carpet, map table, quest board.
  add({ type: 'path', x: 1220, y: 40, w: 540, h: 260, color: '#2d6a3b' });
  add({ type: 'kanban_board', x: 1450, y: 10 });
  add({ type: 'table_rect', x: 1420, y: 150, w: 150, h: 60, color: '#8a5a2e' });
  add({ type: 'chair', x: 1470, y: 128, facing: 0, color: '#8a2a32' });
  add({ type: 'chair', x: 1470, y: 222, facing: 180, color: '#8a2a32' });
  add({ type: 'chair', x: 1400, y: 170, facing: 90, color: '#8a2a32' });
  add({ type: 'chair', x: 1580, y: 170, facing: 270, color: '#8a2a32' });
  add({ type: 'bookshelf', x: 1190, y: 60, w: 28, h: 90 });
  add({ type: 'bookshelf', x: 1764, y: 60, w: 28, h: 90 });
  add({ type: 'bookshelf', x: 1764, y: 180, w: 28, h: 90 });
  add({ type: 'couch', x: 1240, y: 250, w: 90, h: 40, color: '#8a2a32' });
  add({ type: 'couch', x: 1640, y: 250, w: 90, h: 40, color: '#8a2a32' });
  for (const x of [1300, 1700]) add({ type: 'lantern', x, y: 80, color: GOLD });
  add({ type: 'plant', x: 1200, y: 300 }, { type: 'plant', x: 1770, y: 300 });

  // ── Tavern (x 1180–1800, y 330–720): round tables, bar, fireplace, jukebox.
  for (const [x, y] of [[1240, 400], [1410, 400], [1580, 400], [1240, 560], [1580, 560]]) add(...tavernTable(x, y));
  add({ type: 'path', x: 1390, y: 560, w: 120, h: 80, color: '#6b4423' });
  add({ type: 'cabinet', x: 1300, y: 680, w: 260, h: 30, color: '#5a3618' });
  add({ type: 'coffee_machine', x: 1330, y: 684, elevation: 0.56 });
  add({ type: 'coffee_machine', x: 1480, y: 684, elevation: 0.56 });
  for (const x of [1320, 1400, 1480]) add({ type: 'chair', x, y: 650, facing: 180, color: '#6b4424' });
  for (const [x, y] of [[1764, 460], [1764, 490], [1764, 520]]) add({ type: 'rock', x, y, w: 28, h: 28, color: '#5c5852' });
  add({ type: 'lantern', x: 1750, y: 495, color: FIRE });
  add({ type: 'jukebox', x: 1740, y: 650 });
  for (const [x, y] of [[1200, 690], [1225, 690], [1590, 690]]) add({ type: 'stump', x, y, w: 22, h: 22, color: '#6e4521' });
  add({ type: 'plant', x: 1770, y: 360 });

  return {
    spec: 'aiguild/office-theme@1',
    name: 'Guild Hall',
    description: 'The AI Guild hall: courtyard, guild master office, library, work hall, great hall and tavern.',
    scene: {
      ground: 'planks', groundColor: '#8b5a33', walls: 'wood', wallColor: '#5c3b20',
      sky: '#120d09', lightColor: '#ffd6a0', lightIntensity: 1, ambient: 'fireflies', hideDefaults: true,
    },
    items,
  };
}

const MARK = 'aiguild.guild3d.v1:';

/** Apply the Guild Hall theme to a floor once. True when it was applied now
 *  (the caller then drops that floor's stale desk assignments). */
export function ensureGuildTheme(namespace: string): boolean {
  try {
    if (localStorage.getItem(MARK + namespace)) return false;
    localStorage.setItem(MARK + namespace, '1');
    const v = validateOfficeTheme(guildHallThemeRaw());
    if (!v.ok || !v.theme) return false;
    applyTheme(localStorage, namespace, v.theme);
    return true;
  } catch {
    return false;
  }
}
