// The 2D guild hall: a canvas view of the agents living in the guild.
//
// Pure component (no store access) so it can be previewed on its own. Working
// agents sit at their desks in the work hall, idle ones drift to the tavern,
// courtyard, great hall and library; errors stand at the desk with a red "!".
// Runs at most 30 fps and stops completely while hidden or covered.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { drawAnimeSprite, lookFor, type Facing } from '@/scene/office/animeArt';
import {
  BOSS_SEAT, DESKS, GATE, IDLE_SPOTS, LIGHTS, WORLD_H, WORLD_W, buildSortProps, findPath, renderBase,
  type SortProp, type Spot
} from './guildMap';

export interface GuildAgent {
  id: string;
  name: string;
  subtitle?: string | null;
  /** Cast sprite id (michael, jim, ...). */
  character: string;
  status: 'working' | 'idle' | 'error';
  /** What it is doing right now ("$ npm test"), shown while working. */
  activity?: string | null;
  isBoss?: boolean;
  /** Accent colour (hex) for the selection ring and name plate. */
  accent: string;
}

export interface GuildBubble { id: string; text: string; ts: number }

export interface GuildLabels {
  title: string;
  recruit: string;
  working: string;
  idle: string;
  error: string;
  waiting: string;
  fullscreen: string;
  resetView: string;
}

export interface GuildHall2DProps {
  agents: GuildAgent[];
  selectedId?: string | null;
  bubbles?: GuildBubble[];
  /** Stop drawing (e.g. a full-screen terminal covers the hall). */
  paused?: boolean;
  /** Idle small talk; return null to stay quiet. */
  chatter?: (agentId: string, seed: number) => string | null;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onAddAgent?: () => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  labels: GuildLabels;
}

type Pt = { x: number; y: number };
interface Sim {
  id: string;
  x: number; y: number;
  path: Pt[];
  facing: Facing;
  phase: number;
  moving: boolean;
  sitting: boolean;
  spot: Spot | null;
  spotKey: string | null;
  until: number;
  bubble: { text: string; until: number } | null;
}

const SPEED = 48;            // units per second
const FRAME_MS = 1000 / 30;  // 30 fps cap
const BASE_SCALE = 2;
const LS_DESKS = 'aiguild.guild2d.desks';

const COLORS = { working: '#22c55e', waiting: '#f59e0b', idle: '#94a3b8', error: '#ef4444' };
const BRAND = {
  lime: '#CDF252', dark: '#181C17', panel: 'rgba(24, 28, 23, 0.9)', line: 'rgba(205, 242, 82, 0.28)',
  text: '#E6ECDD', muted: '#9AA38F', gold: '#d8b45a'
};

const shortName = (n: string) => n.split(' - ')[0].trim() || n;
const readDesks = (): Record<string, number> => {
  try { return JSON.parse(localStorage.getItem(LS_DESKS) ?? '{}') as Record<string, number>; } catch { return {}; }
};

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, lines: number): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width > max && cur) {
      out.push(cur); cur = w;
      if (out.length === lines) break;
    } else cur = next;
  }
  if (out.length < lines && cur) out.push(cur);
  if (out.length === lines && words.join(' ').length > out.join(' ').length) out[lines - 1] = `${out[lines - 1].replace(/.{0,2}$/, '')}…`;
  return out;
}

export function GuildHall2D(props: GuildHall2DProps) {
  const { agents, selectedId, bubbles, paused, labels } = props;
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef(props);
  live.current = props;
  const sims = useRef(new Map<string, Sim>());
  const firstSync = useRef(true);
  const desks = useRef<Record<string, number>>(readDesks());
  const view = useRef({ zoom: 1, panX: 0, panY: 0 });
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const seenBubble = useRef(0);

  const base = useMemo(() => renderBase(BASE_SCALE), []);
  const sortProps = useMemo<SortProp[]>(() => buildSortProps(BASE_SCALE), []);

  // Stable desk per agent (boss uses the office desk).
  const deskOf = (a: GuildAgent): Spot => {
    if (a.isBoss) return BOSS_SEAT;
    const map = desks.current;
    let i = map[a.id];
    const taken = new Set(Object.entries(map).filter(([id]) => id !== a.id && live.current.agents.some((x) => x.id === id)).map(([, v]) => v));
    if (i === undefined || i >= DESKS.length || taken.has(i)) {
      i = DESKS.findIndex((_, k) => !taken.has(k));
      if (i === -1) i = Math.abs([...a.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)) % DESKS.length;
      map[a.id] = i;
      try { localStorage.setItem(LS_DESKS, JSON.stringify(map)); } catch { /* storage blocked */ }
    }
    return DESKS[i].seat;
  };

  // New speech bubbles from the feed.
  useEffect(() => {
    if (!bubbles) return;
    const now = performance.now();
    for (const b of bubbles) {
      if (b.ts <= seenBubble.current) continue;
      const s = sims.current.get(b.id);
      if (s) s.bubble = { text: b.text, until: now + Math.min(12000, 5000 + b.text.length * 60) };
    }
    seenBubble.current = Math.max(seenBubble.current, ...bubbles.map((b) => b.ts));
  }, [bubbles]);

  // Main loop.
  useEffect(() => {
    const canvas = canvasRef.current, wrapEl = wrapRef.current;
    if (!canvas || !wrapEl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0, last = 0, acc = 0, nextChatter = performance.now() + 6000, chatterSeed = 1;
    let cw = 0, ch = 0;

    const resize = () => {
      const r = wrapEl.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cw = r.width; ch = r.height;
      canvas.width = Math.max(1, Math.round(cw * dpr));
      canvas.height = Math.max(1, Math.round(ch * dpr));
      canvas.style.width = `${cw}px`; canvas.style.height = `${ch}px`;
    };
    const ro = new ResizeObserver(() => { resize(); draw(performance.now()); });
    ro.observe(wrapEl);
    resize();

    const occupied = () => new Set([...sims.current.values()].map((s) => s.spotKey).filter(Boolean) as string[]);

    const goTo = (s: Sim, spot: Spot, key: string, instant: boolean) => {
      s.spot = spot; s.spotKey = key; s.sitting = false;
      if (instant) { s.x = spot.x; s.y = spot.y; s.path = []; s.facing = spot.facing; return; }
      s.path = findPath(s.x, s.y, spot.x, spot.y);
      s.moving = true;
    };

    const plan = (a: GuildAgent, s: Sim, now: number, instant: boolean) => {
      const desk = deskOf(a);
      const deskKey = `desk:${a.id}`;
      if (a.status !== 'idle') {
        if (s.spotKey !== deskKey) goTo(s, desk, deskKey, instant);
        return;
      }
      if (now < s.until && s.spotKey) return;
      const roll = Math.random();
      if (roll < (a.isBoss ? 0.55 : 0.3)) {
        if (s.spotKey !== deskKey) goTo(s, desk, deskKey, instant);
      } else {
        const busy = occupied();
        const free = IDLE_SPOTS.map((sp, i) => ({ sp, key: `idle:${i}` })).filter((o) => !busy.has(o.key) && (!a.isBoss || o.sp.room === 'hall'));
        const pick = free[Math.floor(Math.random() * free.length)];
        if (pick) goTo(s, pick.sp, pick.key, instant);
      }
      s.until = now + 9000 + Math.random() * 16000;
    };

    const step = (dt: number, now: number) => {
      const list = live.current.agents;
      const ids = new Set(list.map((a) => a.id));
      for (const id of [...sims.current.keys()]) if (!ids.has(id)) sims.current.delete(id);
      for (const a of list) {
        let s = sims.current.get(a.id);
        const fresh = !s;
        if (!s) {
          s = { id: a.id, x: GATE.x, y: GATE.y, path: [], facing: 'up', phase: Math.random() * 6, moving: false, sitting: false, spot: null, spotKey: null, until: 0, bubble: null };
          sims.current.set(a.id, s);
        }
        plan(a, s, now, fresh && firstSync.current);
        // Walk.
        if (s.path.length) {
          let budget = SPEED * dt;
          while (budget > 0 && s.path.length) {
            const p = s.path[0];
            const dx = p.x - s.x, dy = p.y - s.y;
            const d = Math.hypot(dx, dy);
            if (d > 0.01) s.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
            if (d <= budget) { s.x = p.x; s.y = p.y; s.path.shift(); budget -= d; }
            else { s.x += (dx / d) * budget; s.y += (dy / d) * budget; budget = 0; }
          }
          s.phase += dt * 11;
          s.moving = s.path.length > 0;
          if (!s.moving && s.spot) { s.facing = s.spot.facing; }
        } else s.moving = false;
        s.sitting = !s.moving && Boolean(s.spot?.sit) && a.status !== 'error';
        if (s.bubble && now > s.bubble.until) s.bubble = null;
      }
      firstSync.current = false;
      // Idle small talk.
      const talk = live.current.chatter;
      if (talk && now > nextChatter) {
        nextChatter = now + 7000 + Math.random() * 9000;
        const idlers = list.filter((a) => a.status === 'idle' && !sims.current.get(a.id)?.moving && !sims.current.get(a.id)?.bubble);
        const who = idlers[Math.floor(Math.random() * idlers.length)];
        const line = who ? talk(who.id, chatterSeed++) : null;
        const s = who && sims.current.get(who.id);
        if (s && line) s.bubble = { text: line, until: now + 5200 };
      }
    };

    const camera = () => {
      const fit = Math.min(cw / WORLD_W, ch / WORLD_H);
      const v = view.current;
      const scale = fit * v.zoom;
      const ox = (cw - WORLD_W * scale) / 2 + v.panX;
      const oy = (ch - WORLD_H * scale) / 2 + v.panY;
      return { scale, ox, oy };
    };

    const draw = (now: number) => {
      const dpr = canvas.width / Math.max(1, cw);
      const { scale, ox, oy } = camera();
      const t = now / 1000;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#14110e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(base, 0, 0, WORLD_W, WORLD_H);

      const list = live.current.agents;
      const byId = new Map(list.map((a) => [a.id, a]));
      const deskOwners = new Map<number, GuildAgent>();
      for (const a of list) { const i = desks.current[a.id]; if (i !== undefined && !a.isBoss) deskOwners.set(i, a); }

      // Depth-sorted props + agents.
      type D = { y: number; prop?: SortProp; sim?: Sim };
      const drawables: D[] = sortProps.map((p) => ({ y: p.y, prop: p }));
      for (const s of sims.current.values()) drawables.push({ y: s.y + (s.sitting ? 0.5 : 0), sim: s });
      drawables.sort((a, b) => a.y - b.y);
      for (const d of drawables) {
        if (d.prop) { ctx.drawImage(d.prop.canvas, d.prop.x0, d.prop.y0, d.prop.w, d.prop.h); continue; }
        const s = d.sim!;
        const a = byId.get(s.id);
        if (!a) continue;
        if (a.id === live.current.selectedId) {
          const pulse = 0.5 + Math.sin(t * 4) * 0.25;
          ctx.beginPath(); ctx.ellipse(s.x, s.y, 10, 3.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = a.accent; ctx.globalAlpha = 0.6 + pulse * 0.4; ctx.lineWidth = 1.6; ctx.stroke(); ctx.globalAlpha = 1;
        }
        drawAnimeSprite(ctx, lookFor(a.character), s.x, s.y, {
          facing: s.moving ? s.facing : s.facing,
          walk: s.moving ? s.phase : null,
          sitting: s.sitting,
          working: a.status === 'working' && !s.moving,
          t: t + s.phase,
        });
      }

      // Lights (desk orbs glow only while their owner works).
      ctx.globalCompositeOperation = 'lighter';
      for (const L of LIGHTS) {
        if (L.deskIndex !== undefined && deskOwners.get(L.deskIndex)?.status !== 'working') continue;
        const f = 1 - L.flicker * 0.5 + Math.sin(t * 7.3 + L.x) * L.flicker * 0.25 + Math.sin(t * 13.1 + L.y) * L.flicker * 0.15;
        const g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r * f);
        g.addColorStop(0, `rgba(${L.color},0.32)`);
        g.addColorStop(1, `rgba(${L.color},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
      }
      ctx.globalCompositeOperation = 'source-over';

      // Labels on top.
      ctx.textBaseline = 'middle';
      for (const s of sims.current.values()) {
        const a = byId.get(s.id);
        if (!a) continue;
        const lift = s.sitting ? 2.6 : 0;
        // Name plate.
        ctx.font = '700 6.4px "Inter", system-ui, sans-serif';
        const name = (a.isBoss ? '♛ ' : '') + shortName(a.name);
        const nw = ctx.measureText(name).width + 12;
        const py = s.y + 6;
        ctx.beginPath(); ctx.roundRect(s.x - nw / 2, py, nw, 9, 4.5);
        ctx.fillStyle = a.isBoss ? 'rgba(60,36,8,0.92)' : 'rgba(20,18,16,0.82)'; ctx.fill();
        ctx.lineWidth = 0.7; ctx.strokeStyle = a.isBoss ? BRAND.gold : a.id === live.current.selectedId ? a.accent : 'rgba(255,255,255,0.14)'; ctx.stroke();
        const state = a.status === 'error' ? 'error' : a.status === 'working' ? 'working' : s.spotKey?.startsWith('desk:') ? 'waiting' : 'idle';
        ctx.fillStyle = COLORS[state];
        ctx.beginPath(); ctx.arc(s.x - nw / 2 + 5, py + 4.5, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = a.isBoss ? '#f3dc96' : '#f2efe8';
        ctx.textAlign = 'left';
        ctx.fillText(name, s.x - nw / 2 + 8.4, py + 4.7);
        // Above the head: error mark, bubble, or live activity.
        const top = s.y - 36 + lift;
        if (a.status === 'error') {
          const b = Math.sin(t * 6) * 1.2;
          ctx.beginPath(); ctx.arc(s.x, top - 4 + b, 5, 0, Math.PI * 2); ctx.fillStyle = '#ef4444'; ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = '900 7px system-ui'; ctx.textAlign = 'center'; ctx.fillText('!', s.x, top - 3.6 + b);
        } else if (s.bubble) {
          ctx.font = '500 6px "Inter", system-ui, sans-serif';
          const lines = wrap(ctx, s.bubble.text, 96, 3);
          const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 10;
          const bh = lines.length * 7.6 + 6;
          const bx = s.x - bw / 2, by = top - bh - 4;
          ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 4);
          ctx.moveTo(s.x - 3, by + bh); ctx.lineTo(s.x, by + bh + 4); ctx.lineTo(s.x + 3, by + bh);
          ctx.fillStyle = 'rgba(255,252,244,0.96)'; ctx.fill();
          ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(60,40,20,0.5)'; ctx.stroke();
          ctx.fillStyle = '#2a2018'; ctx.textAlign = 'left';
          lines.forEach((l, i) => ctx.fillText(l, bx + 5, by + 6.6 + i * 7.6));
        } else if (a.status === 'working' && a.activity) {
          ctx.font = '600 5.4px ui-monospace, "JetBrains Mono", monospace';
          const txt = a.activity.length > 30 ? `${a.activity.slice(0, 29)}…` : a.activity;
          const tw = ctx.measureText(txt).width + 8;
          ctx.beginPath(); ctx.roundRect(s.x - tw / 2, top - 9, tw, 8, 3);
          ctx.fillStyle = 'rgba(16,30,20,0.85)'; ctx.fill();
          ctx.lineWidth = 0.5; ctx.strokeStyle = 'rgba(34,197,94,0.7)'; ctx.stroke();
          ctx.fillStyle = '#b8f5c8'; ctx.textAlign = 'center'; ctx.fillText(txt, s.x, top - 4.8);
        }
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (live.current.paused || document.hidden) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      acc += now - last;
      last = now;
      if (acc >= FRAME_MS) {
        acc %= FRAME_MS;
        step(dt, now);
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    const onVis = () => { if (!document.hidden) start(); };
    document.addEventListener('visibilitychange', onVis);
    start();
    (canvas as HTMLCanvasElement & { __restart?: () => void }).__restart = start;

    // ── input ──
    const toWorld = (ev: { clientX: number; clientY: number }) => {
      const r = canvas.getBoundingClientRect();
      const { scale, ox, oy } = camera();
      return { x: (ev.clientX - r.left - ox) / scale, y: (ev.clientY - r.top - oy) / scale, sx: ev.clientX - r.left, sy: ev.clientY - r.top };
    };
    const hit = (wx: number, wy: number): string | null => {
      let best: string | null = null, bestY = -Infinity;
      for (const s of sims.current.values()) {
        if (wx > s.x - 9 && wx < s.x + 9 && wy > s.y - 34 && wy < s.y + 15 && s.y > bestY) { best = s.id; bestY = s.y; }
      }
      return best;
    };
    let drag: { x: number; y: number; px: number; py: number; moved: boolean } | null = null;
    const onDown = (e: PointerEvent) => { drag = { x: e.clientX, y: e.clientY, px: view.current.panX, py: view.current.panY, moved: false }; };
    const onMove = (e: PointerEvent) => {
      if (drag && (e.buttons & 1)) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        if (drag.moved && view.current.zoom > 1) { view.current.panX = drag.px + dx; view.current.panY = drag.py + dy; clampPan(); }
      }
      const w = toWorld(e);
      const id = hit(w.x, w.y);
      canvas.style.cursor = id ? 'pointer' : view.current.zoom > 1 ? 'grab' : 'default';
      setHover((h) => (id ? { id, x: w.sx, y: w.sy } : h ? null : h));
    };
    const onUp = (e: PointerEvent) => {
      const wasDrag = drag?.moved;
      drag = null;
      if (wasDrag) return;
      const w = toWorld(e);
      const id = hit(w.x, w.y);
      if (id) live.current.onSelect?.(id);
    };
    const onDbl = (e: MouseEvent) => {
      const w = toWorld(e);
      const id = hit(w.x, w.y);
      if (id) live.current.onEdit?.(id);
      else { view.current = { zoom: 1, panX: 0, panY: 0 }; }
    };
    const clampPan = () => {
      const v = view.current;
      const fit = Math.min(cw / WORLD_W, ch / WORLD_H);
      const mx = Math.max(0, (WORLD_W * fit * v.zoom - cw) / 2 + 40), my = Math.max(0, (WORLD_H * fit * v.zoom - ch) / 2 + 40);
      v.panX = Math.max(-mx, Math.min(mx, v.panX)); v.panY = Math.max(-my, Math.min(my, v.panY));
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const v = view.current;
      const before = toWorld(e);
      v.zoom = Math.max(1, Math.min(3, v.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
      if (v.zoom === 1) { v.panX = 0; v.panY = 0; return; }
      const after = toWorld(e);
      const { scale } = camera();
      v.panX += (after.x - before.x) * scale; v.panY += (after.y - before.y) * scale;
      clampPan();
    };
    const onLeave = () => setHover(null);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('dblclick', onDbl);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('dblclick', onDbl);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('pointerleave', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one loop for the component's life; it reads live props
  }, [base, sortProps]);

  // Restart the loop when un-paused.
  useEffect(() => {
    if (!paused) (canvasRef.current as (HTMLCanvasElement & { __restart?: () => void }) | null)?.__restart?.();
  }, [paused]);

  const counts = useMemo(() => {
    let working = 0, idle = 0, error = 0;
    for (const a of agents) { if (a.status === 'working') working++; else if (a.status === 'error') error++; else idle++; }
    return { working, idle, error };
  }, [agents]);
  const hovered = hover ? agents.find((a) => a.id === hover.id) : undefined;

  const btn: CSSProperties = {
    padding: '6px 10px', borderRadius: 7, cursor: 'pointer', border: `1px solid ${BRAND.line}`,
    background: BRAND.panel, color: BRAND.text, font: '700 12px/1 var(--cth-font-display, system-ui)', whiteSpace: 'nowrap'
  };

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#14110e' }}>
      <canvas ref={canvasRef} style={{ display: 'block', touchAction: 'none' }} />
      {/* Title + live counts. */}
      <div style={{
        position: 'absolute', left: 10, top: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px',
        borderRadius: 9, background: BRAND.panel, border: `1px solid ${BRAND.line}`, color: BRAND.text,
        font: '800 13px/1 var(--cth-font-display, system-ui)', pointerEvents: 'none'
      }}>
        <span style={{ color: BRAND.gold }}>⚔</span>
        <span>{labels.title}</span>
        <span style={{ display: 'flex', gap: 8, font: '600 11px/1 var(--cth-font-ui, system-ui)', color: BRAND.muted }}>
          <span><span style={{ color: COLORS.working }}>●</span> {counts.working} {labels.working}</span>
          <span><span style={{ color: COLORS.idle }}>●</span> {counts.idle} {labels.idle}</span>
          {counts.error > 0 && <span><span style={{ color: COLORS.error }}>●</span> {counts.error} {labels.error}</span>}
        </span>
      </div>
      <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', gap: 6 }}>
        {props.onAddAgent && (
          <button type="button" style={{ ...btn, color: BRAND.dark, background: BRAND.lime, border: 'none' }} onClick={props.onAddAgent}>
            + {labels.recruit}
          </button>
        )}
        <button type="button" style={btn} title={labels.resetView} aria-label={labels.resetView}
          onClick={() => { view.current = { zoom: 1, panX: 0, panY: 0 }; }}>⟲</button>
        {props.onToggleFullscreen && (
          <button type="button" style={btn} title={labels.fullscreen} aria-label={labels.fullscreen} aria-pressed={props.fullscreen}
            onClick={props.onToggleFullscreen}>⛶</button>
        )}
      </div>
      {hovered && hover && (
        <div style={{
          position: 'absolute', left: Math.min(hover.x + 14, (wrapRef.current?.clientWidth ?? 9999) - 240), top: hover.y + 12, maxWidth: 230,
          padding: '8px 10px', borderRadius: 8, background: 'rgba(20,18,16,0.95)', border: `1px solid ${hovered.accent}`,
          color: BRAND.text, font: '500 12px/1.35 var(--cth-font-ui, system-ui)', pointerEvents: 'none', zIndex: 5
        }}>
          <div style={{ font: '800 13px/1.2 var(--cth-font-display, system-ui)' }}>{hovered.name}</div>
          {hovered.subtitle && <div style={{ color: BRAND.muted, marginTop: 3 }}>{hovered.subtitle.length > 120 ? `${hovered.subtitle.slice(0, 119)}…` : hovered.subtitle}</div>}
          <div style={{ marginTop: 5, color: COLORS[hovered.status === 'error' ? 'error' : hovered.status === 'working' ? 'working' : 'idle'] }}>
            ● {hovered.status === 'error' ? labels.error : hovered.status === 'working' ? labels.working : labels.idle}
          </div>
        </div>
      )}
    </div>
  );
}
