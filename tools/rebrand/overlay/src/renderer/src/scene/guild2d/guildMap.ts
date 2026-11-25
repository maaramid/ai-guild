// The AI Guild hall: a hand-built top-down map, drawn procedurally.
//
// Everything is in map units (one tile = T units). The static floor, walls and
// wall-side furniture are painted ONCE into an offscreen canvas (renderBase);
// furniture that people can stand behind is cached per prop and depth-sorted
// with the agents each frame. No images, no WebGL: cheap on any machine.

export const T = 16;
export const MAP_W = 60;
export const MAP_H = 38;
export const WORLD_W = MAP_W * T;
export const WORLD_H = MAP_H * T;

const enum Tile { OUT, STONE, WOOD, CARPET, WALL, TAVERN, PATH, DOOR }

type Ctx = CanvasRenderingContext2D;
export type Facing = 'down' | 'up' | 'left' | 'right';
export interface Spot { x: number; y: number; facing: Facing; sit?: boolean; room: string }
export interface Light { x: number; y: number; r: number; color: string; flicker: number; deskIndex?: number }
export interface SortProp { y: number; x0: number; y0: number; canvas: HTMLCanvasElement; w: number; h: number; deskIndex?: number }

// ─── seeded randomness so the map looks the same every time ───────────────
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── layout ──────────────────────────────────────────────────────────────────
const grid = new Uint8Array(MAP_W * MAP_H);
const blocked = new Uint8Array(MAP_W * MAP_H);
const at = (x: number, y: number) => grid[y * MAP_W + x];
const setT = (x: number, y: number, t: Tile) => { if (x >= 0 && y >= 0 && x < MAP_W && y < MAP_H) grid[y * MAP_W + x] = t; };
const fill = (x0: number, y0: number, x1: number, y1: number, t: Tile) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setT(x, y, t);
};
const block = (x0: number, y0: number, x1: number, y1: number) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) blocked[y * MAP_W + x] = 1;
};

fill(0, 0, MAP_W - 1, MAP_H - 1, Tile.OUT);
fill(2, 2, 57, 36, Tile.WALL);
fill(2, 32, 6, 36, Tile.OUT); fill(12, 32, 15, 36, Tile.OUT);   // street on both sides of the gate
// Rooms.
fill(3, 3, 15, 10, Tile.WOOD);        // guild master's office
fill(5, 4, 13, 9, Tile.CARPET);
fill(3, 12, 15, 30, Tile.STONE);      // courtyard
fill(3, 12, 15, 12, Tile.PATH); fill(3, 30, 15, 30, Tile.PATH); fill(3, 12, 3, 30, Tile.PATH); fill(15, 12, 15, 30, Tile.PATH);
fill(7, 31, 11, 37, Tile.PATH);       // gate
fill(17, 3, 25, 10, Tile.WOOD);       // library
fill(27, 3, 34, 10, Tile.WOOD);       // workshop
fill(17, 12, 34, 13, Tile.CARPET);    // corridor
fill(17, 15, 34, 27, Tile.WOOD);      // work hall
fill(17, 29, 34, 35, Tile.WOOD);      // barracks
fill(36, 3, 56, 17, Tile.WOOD);       // great hall
fill(38, 5, 54, 15, Tile.CARPET);
fill(36, 19, 56, 35, Tile.TAVERN);    // tavern
// Doors.
for (const [x, y] of [
  [9, 11], [16, 6], [16, 12], [16, 13], [16, 20], [21, 11], [30, 11], [26, 7], [21, 14], [30, 14],
  [35, 12], [35, 13], [25, 28], [35, 22], [35, 23], [40, 18], [41, 18], [35, 32],
] as const) setT(x, y, Tile.DOOR);

export const walkable = (x: number, y: number): boolean => {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return false;
  const t = at(x, y);
  return t !== Tile.WALL && t !== Tile.OUT && !blocked[y * MAP_W + x];
};

// ─── spots ───────────────────────────────────────────────────────────────────
const C = (tx: number) => (tx + 0.5) * T;   // tile centre → units

/** Work hall desks: 4 columns x 4 rows. The agent sits north of the desk, facing the viewer. */
const DESK_COLS = [19, 23, 27, 31];
const DESK_ROWS = [17, 20, 23, 26];
export const DESKS: { seat: Spot; cx: number; row: number }[] = [];
for (const row of DESK_ROWS) for (const cx of DESK_COLS) {
  DESKS.push({ seat: { x: C(cx), y: row * T - 1, facing: 'down', sit: true, room: 'hall' }, cx, row });
  block(cx - 1, row, cx + 1, row);
}
export const BOSS_SEAT: Spot = { x: C(10), y: 6 * T - 1, facing: 'down', sit: true, room: 'office' };
block(8, 6, 12, 6);

export const IDLE_SPOTS: Spot[] = [];
const idle = (x: number, y: number, facing: Facing, room: string, sit = false) => IDLE_SPOTS.push({ x: x * T, y: y * T, facing, room, sit });

// Tavern round tables with stools on four sides.
const TAVERN_TABLES: [number, number][] = [[40, 24], [46.5, 25], [53, 24], [40, 30.5], [53, 30.5]];
for (const [cx, cy] of TAVERN_TABLES) {
  block(Math.floor(cx - 0.9), Math.floor(cy - 0.9), Math.floor(cx + 0.4), Math.floor(cy + 0.4));
  idle(cx - 1.55, cy + 0.35, 'right', 'tavern', true);
  idle(cx + 1.55, cy + 0.35, 'left', 'tavern', true);
  idle(cx, cy - 1.0, 'down', 'tavern', true);
  idle(cx, cy + 1.75, 'up', 'tavern', true);
}
idle(43.5, 33.2, 'down', 'tavern'); idle(46, 33.2, 'down', 'tavern'); idle(48.5, 31, 'left', 'tavern');
// Great hall: around the map table and the quest board.
block(44, 8, 48, 9);
idle(43.3, 9.2, 'right', 'hall'); idle(49.7, 9.2, 'left', 'hall'); idle(46.5, 7.6, 'down', 'hall'); idle(46.5, 11.2, 'up', 'hall');
idle(45, 5.2, 'up', 'hall'); idle(48, 5.2, 'up', 'hall');
// Courtyard.
block(8, 19, 10, 21);
idle(5.5, 16.4, 'up', 'court', true); idle(12.5, 16.4, 'up', 'court', true);
idle(5.5, 27, 'up', 'court', true); idle(12.5, 27, 'up', 'court', true);
idle(11.6, 22.6, 'right', 'court'); idle(9.5, 23.6, 'up', 'court'); idle(7, 18, 'right', 'court');
// Library reading table.
block(20, 6, 23, 7);
idle(21, 6.2, 'down', 'library', true); idle(22.5, 8.9, 'up', 'library', true);
// Workshop.
idle(30.5, 7, 'right', 'workshop');
// Barracks.
idle(20, 32.4, 'down', 'barracks'); idle(27.5, 32.4, 'down', 'barracks');

export const GATE: Spot = { x: C(9), y: 36.5 * T, facing: 'up', room: 'gate' };

// Furniture blocks that don't host spots.
block(3, 3, 6, 3); block(12, 3, 15, 3); block(3, 5, 3, 8);        // office shelves + couch
block(13, 4, 14, 5);                                               // globe
block(17, 3, 25, 3); block(17, 4, 17, 5); block(17, 8, 17, 9);      // library shelves
block(27, 3, 31, 3); block(32, 5, 33, 7); block(33, 9, 34, 10); block(27, 9, 28, 10); // workshop
block(36, 3, 37, 5); block(55, 3, 56, 5); block(44, 3, 48, 3);       // stairs, quest board
block(36, 7, 36, 10); block(56, 7, 56, 13);                        // hall shelves
block(46, 19, 50, 19); block(38, 34, 48, 34);                      // fireplace, bar
for (const bx of [18, 21, 24, 27, 30, 33]) { block(bx, 29, bx + 1, 30); block(bx, 34, bx + 1, 35); } // bunks
block(3, 13, 4, 13); block(14, 13, 15, 13); block(3, 29, 4, 29); block(14, 29, 15, 29); // planters
block(13, 21, 13, 21);                                             // training dummy

// ─── pathfinding (BFS on tiles, 8-way without corner cutting) ─────────────
export function findPath(fx: number, fy: number, tx: number, ty: number): { x: number; y: number }[] {
  const sx = Math.max(0, Math.min(MAP_W - 1, Math.floor(fx / T)));
  const sy = Math.max(0, Math.min(MAP_H - 1, Math.floor(fy / T)));
  const ex = Math.max(0, Math.min(MAP_W - 1, Math.floor(tx / T)));
  const ey = Math.max(0, Math.min(MAP_H - 1, Math.floor(ty / T)));
  const start = sy * MAP_W + sx, end = ey * MAP_W + ex;
  const prev = new Int32Array(MAP_W * MAP_H).fill(-1);
  const pass = (x: number, y: number, i: number) => i === end || i === start || walkable(x, y);
  const q = [start];
  prev[start] = start;
  let head = 0;
  while (head < q.length) {
    const cur = q[head++];
    if (cur === end) break;
    const cx = cur % MAP_W, cy = (cur / MAP_W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
      const ni = ny * MAP_W + nx;
      if (prev[ni] !== -1 || !pass(nx, ny, ni)) continue;
      if (dx && dy && (!walkable(cx + dx, cy) || !walkable(cx, cy + dy))) continue;
      prev[ni] = cur;
      q.push(ni);
    }
  }
  if (prev[end] === -1) return [{ x: tx, y: ty }];
  const tiles: number[] = [];
  for (let i = end; i !== start; i = prev[i]) tiles.push(i);
  tiles.reverse();
  const pts = tiles.slice(0, -1).map((i) => ({ x: C(i % MAP_W), y: C((i / MAP_W) | 0) }));
  pts.push({ x: tx, y: ty });
  return pts;
}

// ─── painting helpers ────────────────────────────────────────────────────
const INK = '#24180f';
function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}
function shadowed(ctx: Ctx, fn: () => void, blur = 6, ox = 2, oy = 3, a = 0.45): void {
  ctx.save();
  ctx.shadowColor = `rgba(0,0,0,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetX = ox; ctx.shadowOffsetY = oy;
  fn();
  ctx.restore();
}
function lin(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, a: string, b: string): CanvasGradient {
  const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g;
}

// Floors.
function planks(ctx: Ctx, x: number, y: number, pal: string[], r: () => number): void {
  for (let row = 0; row < 2; row++) {
    const py = y + row * 8;
    ctx.fillStyle = pal[Math.floor(r() * pal.length)];
    ctx.fillRect(x, py, T, 8);
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(x, py + 3 + r() * 3, T, 0.6);
    ctx.fillStyle = 'rgba(255,240,220,0.05)';
    ctx.fillRect(x, py + 0.6, T, 1);
    ctx.fillStyle = 'rgba(40,20,8,0.55)';
    ctx.fillRect(x, py + 7.4, T, 0.6);
    if (r() < 0.32) ctx.fillRect(x + Math.floor(r() * 14) + 1, py, 0.7, 8);
  }
}
function flagstones(ctx: Ctx, x: number, y: number, base: string[], mortar: string, r: () => number, size: number): void {
  ctx.fillStyle = mortar; ctx.fillRect(x, y, T, T);
  const n = T / size;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    ctx.fillStyle = base[Math.floor(r() * base.length)];
    const inset = 0.7;
    rr(ctx, x + i * size + inset, y + j * size + inset, size - inset * 2, size - inset * 2, size * 0.18);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(x + i * size + 1.4, y + j * size + 1.2, size - 3, 1);
  }
}
function carpet(ctx: Ctx, x: number, y: number, r: () => number): void {
  ctx.fillStyle = '#2d6a3b'; ctx.fillRect(x, y, T, T);
  for (let k = 0; k < 6; k++) {
    ctx.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.035)';
    ctx.fillRect(x + r() * T, y + r() * T, 2 + r() * 3, 1.4);
  }
}

function drawFloors(ctx: Ctx): void {
  const r = rng(7);
  const WOOD = ['#8b5a33', '#93623a', '#83542f', '#9a6a40', '#8f5e36'];
  const TAV = ['#a46d3d', '#ab7642', '#9b6537', '#b07c48', '#a1693a'];
  for (let ty = 0; ty < MAP_H; ty++) for (let tx = 0; tx < MAP_W; tx++) {
    const x = tx * T, y = ty * T;
    const t = at(tx, ty);
    switch (t) {
      case Tile.OUT: flagstones(ctx, x, y, ['#9d968a', '#a59f93', '#958e82', '#aaa498'], '#615b52', r, 5.333); break;
      case Tile.STONE: flagstones(ctx, x, y, ['#8e8a82', '#97938b', '#85817a', '#9d9991'], '#5d5a55', r, 8); break;
      case Tile.PATH: flagstones(ctx, x, y, ['#b4aea1','#bdb7aa', '#aca598', '#c3bdb0'], '#77716a', r, 16); break;
      case Tile.WOOD: case Tile.DOOR: planks(ctx, x, y, WOOD, r); break;
      case Tile.TAVERN: planks(ctx, x, y, TAV, r); break;
      case Tile.CARPET: carpet(ctx, x, y, r); break;
      case Tile.WALL: ctx.fillStyle = '#2c2520'; ctx.fillRect(x, y, T, T); break;
    }
  }
  // Gold border around each carpet area.
  ctx.strokeStyle = 'rgba(214, 178, 92, 0.75)';
  ctx.lineWidth = 1;
  for (const [x0, y0, x1, y1] of [[5, 4, 13, 9], [38, 5, 54, 15]]) ctx.strokeRect(x0 * T + 3, y0 * T + 3, (x1 - x0 + 1) * T - 6, (y1 - y0 + 1) * T - 6);
  ctx.strokeStyle = 'rgba(214, 178, 92, 0.45)';
  ctx.strokeRect(17 * T + 2, 12 * T + 2, 18 * T - 4, 2 * T - 4);
  // Work hall runner.
  ctx.fillStyle = 'rgba(120, 32, 38, 0.55)';
  ctx.fillRect(17 * T, 15 * T + 3, 18 * T, T - 6);
}

function drawWalls(ctx: Ctx): void {
  const isWall = (x: number, y: number) => x >= 0 && y >= 0 && x < MAP_W && y < MAP_H && at(x, y) === Tile.WALL;
  const isDoor = (x: number, y: number) => x >= 0 && y >= 0 && x < MAP_W && y < MAP_H && at(x, y) === Tile.DOOR;
  const W = 7;
  const stone = (tx: number) => tx <= 16;
  // Soft shadow cast by the walls onto the floors.
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.filter = 'blur(4px)';
  for (let ty = 0; ty < MAP_H; ty++) for (let tx = 0; tx < MAP_W; tx++) if (isWall(tx, ty) && !isWall(tx, ty + 1)) ctx.fillRect(tx * T, (ty + 1) * T - 4, T, 8);
  ctx.restore();
  for (let ty = 0; ty < MAP_H; ty++) for (let tx = 0; tx < MAP_W; tx++) {
    if (!isWall(tx, ty)) continue;
    const x = tx * T, y = ty * T;
    const solidAround = isWall(tx - 1, ty) && isWall(tx + 1, ty) && isWall(tx, ty - 1) && isWall(tx, ty + 1)
      && isWall(tx - 1, ty - 1) && isWall(tx + 1, ty + 1) && isWall(tx - 1, ty + 1) && isWall(tx + 1, ty - 1);
    if (solidAround) {
      // Wall mass: dark roof beams.
      ctx.fillStyle = '#3a2d24'; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(x, y + 7, T, 2);
      continue;
    }
    const base = stone(tx) ? '#7b776f' : '#5c3b20';
    const hi = stone(tx) ? '#9a958c' : '#83582f';
    const lo = stone(tx) ? '#57534d' : '#3e2714';
    ctx.fillStyle = lo; ctx.fillRect(x, y, T, T);
    ctx.fillStyle = base; ctx.fillRect(x + 1, y + 1, T - 2, T - 2);
    ctx.fillStyle = hi; ctx.fillRect(x + 1, y + 1, T - 2, 3);
    if (stone(tx)) {
      ctx.strokeStyle = 'rgba(40,36,32,0.6)'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x + T, y + 8); ctx.moveTo(x + (ty % 2 ? 5 : 11), y); ctx.lineTo(x + (ty % 2 ? 5 : 11), y + 8);
      ctx.moveTo(x + (ty % 2 ? 11 : 4), y + 8); ctx.lineTo(x + (ty % 2 ? 11 : 4), y + 16); ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(x + 1, y + 6, T - 2, 0.7); ctx.fillRect(x + 1, y + 11, T - 2, 0.7);
    }
    // Pale posts at corners and junctions, like timber frames.
    const n = +isWall(tx - 1, ty) + +isWall(tx + 1, ty) + +isWall(tx, ty - 1) + +isWall(tx, ty + 1);
    const corner = (isWall(tx - 1, ty) || isWall(tx + 1, ty)) && (isWall(tx, ty - 1) || isWall(tx, ty + 1));
    const nearDoor = isDoor(tx - 1, ty) || isDoor(tx + 1, ty) || isDoor(tx, ty - 1) || isDoor(tx, ty + 1);
    if (corner || n >= 3 || nearDoor || (tx + ty) % 5 === 0) {
      shadowed(ctx, () => { ctx.fillStyle = '#dcd6c9'; ctx.fillRect(x + (T - W) / 2, y + (T - W) / 2, W, W); }, 3, 1, 1.5, 0.5);
      ctx.fillStyle = '#b9b2a3'; ctx.fillRect(x + (T - W) / 2, y + (T + W) / 2 - 1.6, W, 1.6);
    }
  }
  // Door thresholds.
  for (let ty = 0; ty < MAP_H; ty++) for (let tx = 0; tx < MAP_W; tx++) {
    if (!isDoor(tx, ty)) continue;
    ctx.fillStyle = 'rgba(30,18,8,0.35)';
    ctx.fillRect(tx * T, ty * T, T, T);
  }
}

// ─── furniture ───────────────────────────────────────────────────────────
function bookshelf(ctx: Ctx, x: number, y: number, w: number, h: number, vertical = false): void {
  const r = rng(Math.floor(x * 13 + y * 7));
  shadowed(ctx, () => { ctx.fillStyle = '#4a2f19'; ctx.fillRect(x, y, w, h); });
  ctx.fillStyle = '#6b4424'; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  const BOOK = ['#7a2b2b', '#2b4a7a', '#2f6b3a', '#7a6a2b', '#5a2b6a', '#8a8a80', '#a0522d'];
  if (!vertical) {
    for (let bx = x + 2; bx < x + w - 2;) {
      const bw = 1.4 + r() * 1.6;
      ctx.fillStyle = BOOK[Math.floor(r() * BOOK.length)];
      ctx.fillRect(bx, y + 2.4 + r() * 1.5, bw - 0.3, h - 5);
      bx += bw;
    }
  } else {
    for (let by = y + 2; by < y + h - 2;) {
      const bh = 1.4 + r() * 1.6;
      ctx.fillStyle = BOOK[Math.floor(r() * BOOK.length)];
      ctx.fillRect(x + 2.4 + r() * 1.5, by, w - 5, bh - 0.3);
      by += bh;
    }
  }
}
function banner(ctx: Ctx, x: number, y: number, color: string, emblem: string): void {
  shadowed(ctx, () => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.lineTo(x + 5, y + 18); ctx.lineTo(x, y + 14); ctx.lineTo(x - 5, y + 18); ctx.closePath(); ctx.fill();
  });
  ctx.fillStyle = '#d8b45a'; ctx.fillRect(x - 6, y - 1, 12, 2);
  ctx.fillStyle = emblem;
  ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x + 3, y + 7.5); ctx.lineTo(x, y + 11); ctx.lineTo(x - 3, y + 7.5); ctx.closePath(); ctx.fill();
}
function plant(ctx: Ctx, x: number, y: number, s = 1): void {
  shadowed(ctx, () => { ctx.fillStyle = '#6b4a2e'; rr(ctx, x - 5 * s, y - 2 * s, 10 * s, 8 * s, 2); ctx.fill(); });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    ctx.fillStyle = i % 2 ? '#3f7d3a' : '#4f9446';
    ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 4 * s, y - 4 * s + Math.sin(a) * 3.4 * s, 4 * s, 2.4 * s, a, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#62ad55'; ctx.beginPath(); ctx.arc(x, y - 4.6 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
}
function chair(ctx: Ctx, x: number, y: number, color = '#7a2a2a', facing: Facing = 'down'): void {
  shadowed(ctx, () => { ctx.fillStyle = '#4b2e17'; rr(ctx, x - 5, y - 5, 10, 10, 2); ctx.fill(); }, 3, 1, 2);
  ctx.fillStyle = color; rr(ctx, x - 4, y - 4, 8, 8, 2); ctx.fill();
  ctx.fillStyle = '#4b2e17';
  if (facing === 'down') ctx.fillRect(x - 5, y - 6.5, 10, 3);
  else if (facing === 'up') ctx.fillRect(x - 5, y + 3.5, 10, 3);
  else if (facing === 'right') ctx.fillRect(x - 6.5, y - 5, 3, 10);
  else ctx.fillRect(x + 3.5, y - 5, 3, 10);
}
function stool(ctx: Ctx, x: number, y: number): void {
  shadowed(ctx, () => { ctx.fillStyle = '#5a381c'; ctx.beginPath(); ctx.arc(x, y, 4.4, 0, Math.PI * 2); ctx.fill(); }, 3, 1, 2);
  ctx.fillStyle = '#8a5a30'; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 2); ctx.fill();
}
function rug(ctx: Ctx, x: number, y: number, w: number, h: number, c1: string, c2: string): void {
  shadowed(ctx, () => { ctx.fillStyle = c1; rr(ctx, x, y, w, h, 2); ctx.fill(); }, 4, 1, 2, 0.3);
  ctx.strokeStyle = c2; ctx.lineWidth = 1.4; ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
  ctx.lineWidth = 0.7; ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  ctx.fillStyle = c2;
  ctx.beginPath(); ctx.moveTo(x + w / 2, y + 9); ctx.lineTo(x + w / 2 + 7, y + h / 2); ctx.lineTo(x + w / 2, y + h - 9); ctx.lineTo(x + w / 2 - 7, y + h / 2); ctx.closePath(); ctx.fill();
}
function hide(ctx: Ctx, x: number, y: number, s: number, c: string, spots: string | null): void {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  shadowed(ctx, () => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(0, -14); ctx.bezierCurveTo(6, -14, 7, -9, 12, -12); ctx.bezierCurveTo(13, -6, 9, -4, 10, 0);
    ctx.bezierCurveTo(9, 4, 13, 6, 12, 12); ctx.bezierCurveTo(7, 9, 6, 14, 0, 14); ctx.bezierCurveTo(-6, 14, -7, 9, -12, 12);
    ctx.bezierCurveTo(-13, 6, -9, 4, -10, 0); ctx.bezierCurveTo(-9, -4, -13, -6, -12, -12); ctx.bezierCurveTo(-7, -9, -6, -14, 0, -14);
    ctx.closePath(); ctx.fill();
  }, 3, 1, 2, 0.35);
  if (spots) { ctx.fillStyle = spots; for (const [a, b, r] of [[-4, -4, 3], [5, 2, 3.6], [-2, 7, 2.4]]) { ctx.beginPath(); ctx.arc(a, b, r, 0, Math.PI * 2); ctx.fill(); } }
  ctx.restore();
}
function barrel(ctx: Ctx, x: number, y: number): void {
  shadowed(ctx, () => { ctx.fillStyle = '#6e4521'; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); }, 3, 1, 2);
  ctx.strokeStyle = '#3c3a36'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 5.2, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#8a5a2e'; ctx.beginPath(); ctx.arc(x, y, 3.6, 0, Math.PI * 2); ctx.fill();
}
function crate(ctx: Ctx, x: number, y: number, s = 12): void {
  shadowed(ctx, () => { ctx.fillStyle = '#8a6034'; ctx.fillRect(x, y, s, s); }, 3, 1, 2);
  ctx.strokeStyle = '#5a3a1c'; ctx.lineWidth = 1; ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
  ctx.beginPath(); ctx.moveTo(x + 1, y + 1); ctx.lineTo(x + s - 1, y + s - 1); ctx.moveTo(x + s - 1, y + 1); ctx.lineTo(x + 1, y + s - 1); ctx.stroke();
}
function candle(ctx: Ctx, x: number, y: number): void {
  ctx.fillStyle = '#efe6cf'; ctx.fillRect(x - 1, y - 4, 2, 4);
  ctx.fillStyle = '#ffcf5a'; ctx.beginPath(); ctx.ellipse(x, y - 5.4, 0.9, 1.6, 0, 0, Math.PI * 2); ctx.fill();
}

function deskProp(ctx: Ctx, w: number, i: number): void {
  // Local coords: desk top-left at (0, 4); prop canvas has headroom above.
  const r = rng(100 + i);
  shadowed(ctx, () => { ctx.fillStyle = '#5a3818'; rr(ctx, 0, 4, w, 16, 2); ctx.fill(); });
  ctx.fillStyle = lin(ctx, 0, 4, 0, 14, '#a8743e', '#8a5a2e'); rr(ctx, 1, 5, w - 2, 9, 1.6); ctx.fill();
  ctx.fillStyle = '#4a2c12'; ctx.fillRect(1, 14, w - 2, 5);
  ctx.fillStyle = 'rgba(255,230,190,0.12)'; ctx.fillRect(2, 5.6, w - 4, 1);
  // Parchment, quill, book, crystal orb.
  ctx.save(); ctx.translate(w * 0.42, 9); ctx.rotate((r() - 0.5) * 0.3);
  ctx.fillStyle = '#efe3c2'; ctx.fillRect(-6, -3.4, 12, 7);
  ctx.strokeStyle = 'rgba(80,60,40,0.5)'; ctx.lineWidth = 0.4;
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-4.6, -1.6 + k * 1.8); ctx.lineTo(3 + r() * 1.4, -1.6 + k * 1.8); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = '#f4f1ea'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(w * 0.62, 6.4); ctx.lineTo(w * 0.7, 11.4); ctx.stroke();
  ctx.fillStyle = ['#7a2b2b', '#2b4a7a', '#2f6b3a', '#6a4a8a'][i % 4]; ctx.fillRect(4, 6.2, 6, 4.6);
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(4.6, 6.6, 0.8, 3.8);
  ctx.fillStyle = '#3a2a1a'; ctx.fillRect(w - 10, 10, 6, 2.4);
  const g = ctx.createRadialGradient(w - 7, 7.6, 0.5, w - 7, 8, 3.6);
  g.addColorStop(0, '#e6fbff'); g.addColorStop(0.5, '#62c6e6'); g.addColorStop(1, '#245a7a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(w - 7, 8, 3.4, 0, Math.PI * 2); ctx.fill();
}

function makeCanvas(w: number, h: number, scale: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * scale); c.height = Math.ceil(h * scale);
  const ctx = c.getContext('2d')!;
  ctx.scale(scale, scale);
  return [c, ctx];
}

/** Cache a prop: `draw` paints in local coords inside a (w, h) box placed at (x0, y0); sorted at baseline y. */
function cacheProp(scale: number, x0: number, y0: number, w: number, h: number, y: number, draw: (ctx: Ctx) => void, deskIndex?: number): SortProp {
  const pad = 6;
  const [canvas, ctx] = makeCanvas(w + pad * 2, h + pad * 2, scale);
  ctx.translate(pad, pad);
  draw(ctx);
  return { canvas, x0: x0 - pad, y0: y0 - pad, w: w + pad * 2, h: h + pad * 2, y, deskIndex };
}

export function buildSortProps(scale: number): SortProp[] {
  const props: SortProp[] = [];
  // Work hall desks.
  DESKS.forEach((d, i) => {
    const w = 3 * T - 4;
    const x0 = (d.cx - 1) * T + 2, y0 = d.row * T - 6;
    props.push(cacheProp(scale, x0, y0, w, 22, (d.row + 1) * T - 1, (ctx) => deskProp(ctx, w, i), i));
  });
  // Boss desk: bigger, with gold trim.
  props.push(cacheProp(scale, 8 * T + 2, 6 * T - 6, 5 * T - 4, 24, 7 * T - 1, (ctx) => {
    const w = 5 * T - 4;
    shadowed(ctx, () => { ctx.fillStyle = '#3f2410'; rr(ctx, 0, 4, w, 18, 3); ctx.fill(); });
    ctx.fillStyle = lin(ctx, 0, 4, 0, 15, '#8a4a22', '#6a3416'); rr(ctx, 1, 5, w - 2, 10, 2); ctx.fill();
    ctx.strokeStyle = '#d8b45a'; ctx.lineWidth = 0.8; ctx.strokeRect(2, 6, w - 4, 8);
    ctx.fillStyle = '#2a170a'; ctx.fillRect(1, 15, w - 2, 6);
    ctx.fillStyle = '#2d6a3b'; ctx.fillRect(w / 2 - 12, 7, 24, 6);
    ctx.fillStyle = '#efe3c2'; ctx.fillRect(w / 2 - 8, 7.6, 7, 4.6); ctx.fillRect(w / 2 + 1, 8, 6, 4);
    candle(ctx, 6, 12); candle(ctx, w - 6, 12);
    ctx.fillStyle = '#d8b45a'; ctx.beginPath(); ctx.arc(w - 16, 10, 2.4, 0, Math.PI * 2); ctx.fill();
  }));
  // Guest chairs + globe in the office.
  for (const cx of [9, 11]) props.push(cacheProp(scale, cx * T - 6 + 8, 8 * T - 6 + 8, 12, 12, 8.5 * T + 4, (ctx) => chair(ctx, 6, 6, '#7a2a2a', 'up')));
  props.push(cacheProp(scale, 13 * T, 4 * T, 2 * T, 2 * T, 6 * T, (ctx) => {
    shadowed(ctx, () => { ctx.fillStyle = '#5a3818'; ctx.fillRect(12, 24, 8, 4); });
    ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(16, 14, 10, -0.4, Math.PI + 0.4); ctx.stroke();
    const g = ctx.createRadialGradient(13, 11, 1, 16, 14, 8.6);
    g.addColorStop(0, '#9fd2e8'); g.addColorStop(1, '#2b5f7a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(16, 14, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5f9a4a'; ctx.beginPath(); ctx.ellipse(13, 12, 3.4, 2.2, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(19, 17, 2.6, 1.8, -0.3, 0, Math.PI * 2); ctx.fill();
  }));
  // Library reading table.
  props.push(cacheProp(scale, 20 * T, 6 * T - 4, 4 * T, 2 * T + 4, 8 * T, (ctx) => {
    shadowed(ctx, () => { ctx.fillStyle = '#5a3818'; rr(ctx, 0, 4, 4 * T, 2 * T, 3); ctx.fill(); });
    ctx.fillStyle = '#9a6a3a'; rr(ctx, 1.5, 5.5, 4 * T - 3, 2 * T - 6, 2); ctx.fill();
    ctx.fillStyle = '#efe3c2'; ctx.fillRect(14, 12, 12, 9); ctx.fillRect(34, 10, 10, 8);
    ctx.fillStyle = '#2b4a7a'; ctx.fillRect(46, 14, 8, 6);
    candle(ctx, 30, 18);
  }));
  // Workshop cauldron, crates, barrels.
  props.push(cacheProp(scale, 32 * T, 5 * T, 2 * T, 2.5 * T, 7.6 * T, (ctx) => {
    shadowed(ctx, () => { ctx.fillStyle = '#26262a'; ctx.beginPath(); ctx.ellipse(16, 24, 13, 11, 0, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#3a3a40'; ctx.beginPath(); ctx.ellipse(16, 22, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
    const g = ctx.createRadialGradient(16, 21, 1, 16, 21, 10);
    g.addColorStop(0, '#d6ff8a'); g.addColorStop(1, '#3f9a3a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(16, 21, 9.4, 6.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(230,255,190,0.7)'; for (const [a, b] of [[12, 19], [19, 22], [15, 23]]) { ctx.beginPath(); ctx.arc(a, b, 1.2, 0, Math.PI * 2); ctx.fill(); }
  }));
  props.push(cacheProp(scale, 33 * T, 9 * T, 2 * T, 2 * T, 11 * T - 2, (ctx) => { crate(ctx, 2, 4, 13); crate(ctx, 16, 12, 12); }));
  props.push(cacheProp(scale, 27 * T, 9 * T, 2 * T, 2 * T, 11 * T - 2, (ctx) => { barrel(ctx, 8, 10); barrel(ctx, 22, 18); }));
  // Great hall map table.
  props.push(cacheProp(scale, 44 * T, 8 * T - 4, 5 * T, 2 * T + 4, 10 * T, (ctx) => {
    const w = 5 * T;
    shadowed(ctx, () => { ctx.fillStyle = '#4a2c12'; rr(ctx, 0, 4, w, 2 * T, 3); ctx.fill(); }, 8, 2, 4);
    ctx.fillStyle = '#8a5a2e'; rr(ctx, 1.5, 5.5, w - 3, 2 * T - 6, 2); ctx.fill();
    const r = rng(42);
    for (let k = 0; k < 4; k++) {
      ctx.save(); ctx.translate(14 + k * 16, 18 + (k % 2) * 3); ctx.rotate((r() - 0.5) * 0.5);
      ctx.fillStyle = '#e9dcb8'; ctx.fillRect(-8, -7, 16, 13);
      ctx.strokeStyle = 'rgba(120,80,40,0.6)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(-6, -2); ctx.bezierCurveTo(-2, -6, 2, 2, 6, -3); ctx.stroke();
      ctx.fillStyle = '#b8323a'; ctx.beginPath(); ctx.arc(r() * 8 - 4, r() * 6 - 3, 1, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }));
  // Hall armchairs.
  for (const [cx, cy, f] of [[38, 12, 'right'], [54.5, 15.4, 'left'], [38, 15.4, 'right']] as const) {
    props.push(cacheProp(scale, cx * T - 6, cy * T - 6, 12, 12, cy * T + 6, (ctx) => chair(ctx, 6, 6, '#8a2a32', f)));
  }
  // Tavern tables and stools.
  for (const [cx, cy] of TAVERN_TABLES) {
    const x = cx * T, y = cy * T;
    for (const [sx, sy] of [[-1.55, 0.35], [1.55, 0.35], [0, -1.0], [0, 1.75]]) {
      props.push(cacheProp(scale, x + sx * T - 5, y + sy * T - 7, 10, 10, y + sy * T - 2, (ctx) => stool(ctx, 5, 5)));
    }
    props.push(cacheProp(scale, x - 18, y - 18, 36, 36, y + 12, (ctx) => {
      shadowed(ctx, () => { ctx.fillStyle = '#5a3818'; ctx.beginPath(); ctx.arc(18, 18, 15, 0, Math.PI * 2); ctx.fill(); }, 6, 2, 3);
      ctx.fillStyle = '#9a6838'; ctx.beginPath(); ctx.arc(18, 18, 13.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(60,35,15,0.5)'; ctx.lineWidth = 0.6;
      for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(6, 18 + k * 4.4); ctx.lineTo(30, 18 + k * 4.4); ctx.stroke(); }
      ctx.fillStyle = '#d8c090'; ctx.beginPath(); ctx.arc(13, 15, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c9a24a'; ctx.beginPath(); ctx.arc(23, 21, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f4e9c8'; ctx.beginPath(); ctx.arc(23, 20.4, 1.3, 0, Math.PI * 2); ctx.fill();
    }));
  }
  // Bar counter.
  props.push(cacheProp(scale, 38 * T, 34 * T - 6, 11 * T, 20, 35 * T - 1, (ctx) => {
    const w = 11 * T;
    shadowed(ctx, () => { ctx.fillStyle = '#3f2410'; rr(ctx, 0, 4, w, 16, 2); ctx.fill(); });
    ctx.fillStyle = lin(ctx, 0, 4, 0, 12, '#8a5228', '#6a3a18'); rr(ctx, 1, 5, w - 2, 8, 2); ctx.fill();
    ctx.fillStyle = '#2a170a'; ctx.fillRect(1, 13, w - 2, 6);
    for (let k = 0; k < 9; k++) {
      ctx.fillStyle = '#d8c090'; rr(ctx, 10 + k * 19, 6.4, 4, 5, 1); ctx.fill();
      ctx.fillStyle = '#f4e9c8'; ctx.fillRect(10.6 + k * 19, 6.6, 2.8, 1.2);
    }
  }));
  // Bottom-row bunks in the barracks (people stand north of them).
  for (const bx of [18, 21, 24, 27, 30, 33]) {
    props.push(cacheProp(scale, bx * T + 2, 34 * T, 2 * T - 4, 2 * T - 2, 36 * T - 2, (ctx) => bunk(ctx, 2 * T - 4, 2 * T - 2, bx, true)));
  }
  // Courtyard: statue, benches, dummy, planters.
  props.push(cacheProp(scale, 8 * T - 4, 18 * T - 8, 3 * T + 8, 4 * T + 4, 22 * T, (ctx) => statue(ctx)));
  for (const [bx, by] of [[4.5, 15.3], [11.5, 15.3], [4.5, 26], [11.5, 26]]) {
    props.push(cacheProp(scale, bx * T, by * T, 2 * T, 10, by * T + 9, (ctx) => {
      shadowed(ctx, () => { ctx.fillStyle = '#5a3818'; ctx.fillRect(0, 0, 2 * T, 9); }, 3, 1, 2);
      ctx.fillStyle = '#8a5a2e'; ctx.fillRect(1, 1, 2 * T - 2, 6);
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(1, 3.6, 2 * T - 2, 0.6);
    }));
  }
  props.push(cacheProp(scale, 13 * T - 2, 20 * T - 12, T + 4, T + 12, 22 * T - 2, (ctx) => {
    ctx.fillStyle = '#6b4424'; ctx.fillRect(9, 8, 2, 18);
    shadowed(ctx, () => { ctx.fillStyle = '#c9a86a'; rr(ctx, 3, 8, 14, 10, 4); ctx.fill(); });
    ctx.fillStyle = '#b8955a'; ctx.beginPath(); ctx.arc(10, 5, 4.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7a2a2a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(4, 12); ctx.lineTo(16, 12); ctx.stroke();
  }));
  for (const [px, py] of [[4, 13.4], [15, 13.4], [4, 29.4], [15, 29.4]]) props.push(cacheProp(scale, px * T - 12, py * T - 16, 24, 24, py * T + 6, (ctx) => plant(ctx, 12, 18, 1.3)));
  // Gate planters.
  props.push(cacheProp(scale, 17 * T - 10, 36 * T - 30, 20, 22, 36 * T - 6, (ctx) => plant(ctx, 10, 16, 1)));
  return props;
}

function bunk(ctx: Ctx, w: number, h: number, seed: number, headUp: boolean): void {
  const r = rng(seed * 3);
  shadowed(ctx, () => { ctx.fillStyle = '#4a2c12'; rr(ctx, 0, 0, w, h, 2); ctx.fill(); });
  const blanket = ['#8a3a34', '#7a5a3a', '#3a5a7a', '#6a6a4a'][Math.floor(r() * 4)];
  ctx.fillStyle = '#e8e0cc'; rr(ctx, 2, headUp ? 2 : h - 9, w - 4, 7, 2); ctx.fill();
  ctx.fillStyle = blanket; rr(ctx, 1.5, headUp ? 9 : 1.5, w - 3, h - 11, 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(2, headUp ? 10 : 3, w - 4, 1.2);
}

function statue(ctx: Ctx): void {
  const cx = T * 1.5 + 4, cy = T * 2.4;
  shadowed(ctx, () => { ctx.fillStyle = '#8f8b84'; ctx.beginPath(); ctx.arc(cx, cy, 21, 0, Math.PI * 2); ctx.fill(); }, 8, 3, 4, 0.5);
  ctx.fillStyle = '#a8a49c'; ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#77736c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, 15.4, 0, Math.PI * 2); ctx.stroke();
  // Hero raising a sword (stone).
  const st = '#c9c5bc', sh = '#8d8981';
  ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(cx, cy + 4, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = st;
  ctx.beginPath(); ctx.moveTo(cx - 7, cy + 4); ctx.lineTo(cx - 5, cy - 8); ctx.lineTo(cx + 5, cy - 8); ctx.lineTo(cx + 7, cy + 4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy - 12, 5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = st; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(cx + 5, cy - 6); ctx.lineTo(cx + 10, cy - 15); ctx.stroke();
  ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx + 10, cy - 15); ctx.lineTo(cx + 12, cy - 28); ctx.stroke();
  ctx.strokeStyle = sh; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + 7, cy - 15); ctx.lineTo(cx + 13, cy - 14); ctx.stroke();
  ctx.fillStyle = sh; ctx.beginPath(); ctx.moveTo(cx - 5, cy - 8); ctx.lineTo(cx - 11, cy + 2); ctx.lineTo(cx - 6, cy + 2); ctx.closePath(); ctx.fill();
}

// Static furniture painted into the base (people never stand south of it).
function drawBaseFurniture(ctx: Ctx): void {
  // Office.
  rug(ctx, 6 * T + 4, 4 * T + 2, 7 * T - 8, 4 * T + 6, '#7a2a2a', '#d8b45a');
  bookshelf(ctx, 3 * T + 1, 3 * T + 1, 4 * T - 2, 12);
  bookshelf(ctx, 12 * T + 1, 3 * T + 1, 4 * T - 2, 12);
  shadowed(ctx, () => { ctx.fillStyle = '#5a1e22'; rr(ctx, 3 * T + 1, 5 * T, 12, 4 * T, 3); ctx.fill(); });
  ctx.fillStyle = '#7a2a30'; rr(ctx, 3 * T + 3, 5 * T + 2, 8, 4 * T - 4, 2); ctx.fill();
  chair(ctx, 10 * T + 8, 5 * T + 6, '#8a2a32', 'down');
  plant(ctx, 3.8 * T, 10 * T, 1.1); plant(ctx, 14.6 * T, 10 * T, 1.1);
  banner(ctx, 10 * T, 2 * T + 6, '#25335c', '#d8b45a');
  // Library.
  bookshelf(ctx, 17 * T + 1, 3 * T + 1, 9 * T - 2, 12);
  bookshelf(ctx, 17 * T + 1, 4 * T, 12, 2 * T, true);
  bookshelf(ctx, 17 * T + 1, 8 * T, 12, 2 * T, true);
  for (const cx of [21, 22.5]) chair(ctx, cx * T, cx === 21 ? 5.7 * T : 9.2 * T, '#2b4a7a', cx === 21 ? 'down' : 'up');
  rug(ctx, 19 * T, 9 * T - 2, 6 * T, T + 4, '#2b3f5a', '#c9a24a');
  // Workshop bench with potions.
  shadowed(ctx, () => { ctx.fillStyle = '#4a2c12'; ctx.fillRect(27 * T + 1, 3 * T + 1, 5 * T - 2, 13); });
  ctx.fillStyle = '#7a5030'; ctx.fillRect(27 * T + 2, 3 * T + 2, 5 * T - 4, 10);
  const POT = ['#c0392b', '#2e86c1', '#28b463', '#8e44ad', '#f1c40f'];
  for (let k = 0; k < 9; k++) {
    ctx.fillStyle = POT[k % POT.length];
    ctx.beginPath(); ctx.arc(27 * T + 8 + k * 8, 3 * T + 8, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(27 * T + 7 + k * 8, 3 * T + 6, 1, 1);
  }
  hide(ctx, 30.5 * T, 6.6 * T, 0.9, '#c8a070', '#8a6038');
  // Corridor + work hall decor.
  plant(ctx, 17.5 * T, 12.6 * T, 0.9); plant(ctx, 34.4 * T, 12.6 * T, 0.9);
  for (const d of DESKS) chair(ctx, d.seat.x, d.seat.y - 2, '#5a3a22', 'down');
  banner(ctx, 21 * T, 14 * T + 4, '#7a2a2a', '#d8b45a'); banner(ctx, 30 * T, 14 * T + 4, '#7a2a2a', '#d8b45a');
  // Barracks: top-row bunks, rug, hides.
  for (const bx of [18, 21, 24, 27, 30, 33]) {
    ctx.save(); ctx.translate(bx * T + 2, 29 * T + 1); bunk(ctx, 2 * T - 4, 2 * T - 2, bx + 50, true); ctx.restore();
  }
  hide(ctx, 22.5 * T, 32.4 * T, 1, '#ece7dc', '#2a2420');
  hide(ctx, 29.5 * T, 32.4 * T, 1, '#b48a5a', null);
  // Great hall.
  for (const [sx, flip] of [[36, false], [55, true]] as const) {
    shadowed(ctx, () => { ctx.fillStyle = '#4a2c12'; ctx.fillRect(sx * T, 3 * T, 2 * T, 3 * T); });
    for (let k = 0; k < 6; k++) {
      ctx.fillStyle = k % 2 ? '#8a5a2e' : '#7a4e28';
      ctx.fillRect(sx * T + 1, 3 * T + 1 + k * 7.8, 2 * T - 2, 7);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(sx * T + 1, 3 * T + 7.4 + k * 7.8, 2 * T - 2, 1);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(sx * T + (flip ? 0 : 2 * T - 3), 3 * T, 3, 3 * T);
  }
  // Quest board.
  shadowed(ctx, () => { ctx.fillStyle = '#4a2c12'; ctx.fillRect(44 * T, 2 * T + 8, 5 * T, T + 6); });
  ctx.fillStyle = '#7a5434'; ctx.fillRect(44 * T + 2, 2 * T + 10, 5 * T - 4, T + 2);
  {
    const r = rng(9);
    for (let k = 0; k < 8; k++) {
      const nx = 44 * T + 5 + k * 9.4, ny = 2 * T + 12 + (k % 2) * 4;
      ctx.fillStyle = ['#efe3c2', '#e9d9a8', '#f2e6cc'][k % 3]; ctx.fillRect(nx, ny, 7.4, 8);
      ctx.fillStyle = '#b8323a'; ctx.beginPath(); ctx.arc(nx + 3.7, ny + 1, 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(60,40,20,0.5)'; ctx.fillRect(nx + 1.2, ny + 3.4, 4 + r(), 0.5); ctx.fillRect(nx + 1.2, ny + 5, 3 + r() * 2, 0.5);
    }
  }
  bookshelf(ctx, 36 * T + 1, 7 * T, 12, 4 * T, true);
  bookshelf(ctx, 56 * T + 3, 7 * T, 12, 7 * T, true);
  banner(ctx, 40 * T, 2 * T + 6, '#2d6a3b', '#d8b45a'); banner(ctx, 52 * T, 2 * T + 6, '#2d6a3b', '#d8b45a');
  plant(ctx, 38.4 * T, 16.6 * T, 1); plant(ctx, 54.6 * T, 16.6 * T, 1);
  // Tavern: fireplace + dragon trophy, bear rug, bottle shelves.
  shadowed(ctx, () => { ctx.fillStyle = '#5c5852'; ctx.fillRect(46 * T - 2, 18 * T + 6, 5 * T + 4, T + 12); }, 8, 2, 4);
  ctx.fillStyle = '#77736c'; ctx.fillRect(46 * T, 18 * T + 8, 5 * T, T + 8);
  ctx.fillStyle = '#1c1310'; rr(ctx, 47 * T, 19 * T - 2, 3 * T, T - 2, 4); ctx.fill();
  ctx.strokeStyle = '#4a4540'; ctx.lineWidth = 0.8;
  for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(46 * T + k * T, 18 * T + 8); ctx.lineTo(46 * T + k * T, 18 * T + 14); ctx.stroke(); }
  dragonHead(ctx, 48.5 * T, 18 * T + 2);
  hide(ctx, 46.5 * T, 29.6 * T, 1.9, '#7a4e2a', null);
  ctx.fillStyle = '#5a3a20'; ctx.beginPath(); ctx.arc(46.5 * T, 29.6 * T - 22, 6, 0, Math.PI * 2); ctx.fill();
  shadowed(ctx, () => { ctx.fillStyle = '#4a2c12'; ctx.fillRect(38 * T, 35 * T + 2, 11 * T, 12); });
  for (let k = 0; k < 20; k++) {
    ctx.fillStyle = ['#2f6b3a', '#7a2b2b', '#c9a24a', '#2b4a7a'][k % 4];
    rr(ctx, 38 * T + 4 + k * 8.6, 35 * T + 4, 3.4, 7, 1); ctx.fill();
  }
  for (const [bx, by] of [[55.2, 33.6], [55.2, 21], [37.2, 21]]) barrel(ctx, bx * T, by * T);
  banner(ctx, 37.2 * T, 18 * T + 4, '#7a2a2a', '#d8b45a');
  // Courtyard: well-kept edge, weapon rack.
  shadowed(ctx, () => { ctx.fillStyle = '#5a3818'; ctx.fillRect(3 * T + 2, 20 * T, 6, 3 * T); });
  for (let k = 0; k < 5; k++) { ctx.fillStyle = '#b8b4aa'; ctx.fillRect(3 * T + 1, 20 * T + 4 + k * 9, 9, 1.6); }
  // Gate banners.
  banner(ctx, 6 * T + 8, 31 * T + 2, '#7a2a2a', '#d8b45a');
  banner(ctx, 12 * T + 8, 31 * T + 2, '#7a2a2a', '#d8b45a');
}

function dragonHead(ctx: Ctx, x: number, y: number): void {
  shadowed(ctx, () => {
    ctx.fillStyle = '#3a3d44';
    ctx.beginPath(); ctx.moveTo(x - 10, y - 4); ctx.lineTo(x + 10, y - 4); ctx.lineTo(x + 6, y + 14); ctx.lineTo(x, y + 20); ctx.lineTo(x - 6, y + 14); ctx.closePath(); ctx.fill();
  }, 6, 2, 4);
  ctx.fillStyle = '#4c5058';
  ctx.beginPath(); ctx.moveTo(x - 7, y - 2); ctx.lineTo(x + 7, y - 2); ctx.lineTo(x + 4, y + 12); ctx.lineTo(x, y + 17); ctx.lineTo(x - 4, y + 12); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#d8d0bc'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x - 8, y - 2); ctx.quadraticCurveTo(x - 16, y - 6, x - 15, y + 4); ctx.moveTo(x + 8, y - 2); ctx.quadraticCurveTo(x + 16, y - 6, x + 15, y + 4); ctx.stroke();
  ctx.fillStyle = '#ff6a2a'; ctx.beginPath(); ctx.arc(x - 3, y + 4, 1.2, 0, Math.PI * 2); ctx.arc(x + 3, y + 4, 1.2, 0, Math.PI * 2); ctx.fill();
}

/** Paint the static map (floors, walls, wall-side furniture) at `scale` px per unit. */
export function renderBase(scale: number): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(WORLD_W, WORLD_H, scale);
  drawFloors(ctx);
  drawWalls(ctx);
  drawBaseFurniture(ctx);
  // Warm ambience + vignette.
  const g = ctx.createRadialGradient(WORLD_W / 2, WORLD_H / 2, WORLD_H * 0.3, WORLD_W / 2, WORLD_H / 2, WORLD_W * 0.62);
  g.addColorStop(0, 'rgba(255, 200, 120, 0.04)');
  g.addColorStop(1, 'rgba(10, 6, 2, 0.45)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  return canvas;
}

export const LIGHTS: Light[] = [
  { x: 48.5 * T, y: 19.6 * T, r: 120, color: '255,140,50', flicker: 0.35 },
  { x: 32.5 * T, y: 6.3 * T, r: 60, color: '140,255,110', flicker: 0.2 },
  { x: 22 * T, y: 7.4 * T, r: 46, color: '255,200,120', flicker: 0.25 },
  { x: 10.5 * T, y: 6.6 * T, r: 54, color: '255,200,120', flicker: 0.25 },
  { x: 7.5 * T, y: 31.4 * T, r: 40, color: '255,170,80', flicker: 0.3 },
  { x: 11.5 * T, y: 31.4 * T, r: 40, color: '255,170,80', flicker: 0.3 },
  { x: 46.5 * T, y: 9 * T, r: 90, color: '255,220,150', flicker: 0.08 },
  ...DESKS.map((d, i): Light => ({ x: (d.cx + 0.6) * T, y: d.row * T + 2, r: 26, color: '110,210,255', flicker: 0.15, deskIndex: i })),
];
