// Connects the 2D guild hall to the live agent store.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, type Agent } from '@/store/store';
import { accentByName } from '@/design/tokens';
import { EditAgentModal } from '@/components/EditAgentModal';
import { useFeatures } from '@/lib/useFeatures';
import { featureOn } from '@shared/features';
import { activityBubble } from '@shared/office/activityBubble';
import { BUSY_STATUSES } from '@shared/office/officeActivity';
import { pickSoloLine, type BreakSpot, type CafeteriaLines } from '@/scene/office/cafeteriaLines';
import { useOfficeFeed } from '@/scene/office3d/useOfficeFeed';
import { GuildHall2D, type GuildAgent, type GuildBubble } from './GuildHall2D';

const isBoss = (a: Agent) => a.id === 'god' || !!a.isGod;
const SPOTS: BreakSpot[] = ['coffee', 'table', 'snack', 'vending'];

const toGuildAgent = (a: Agent): GuildAgent => ({
  id: a.id,
  name: a.name,
  subtitle: isBoss(a) ? null : a.description || null,
  character: a.character,
  status: a.status === 'blocked' ? 'error' : BUSY_STATUSES.has(a.status) ? 'working' : 'idle',
  activity: BUSY_STATUSES.has(a.status) ? activityBubble(a.action) || null : null,
  isBoss: isBoss(a),
  accent: `#${(accentByName[a.accent] ?? 0x888888).toString(16).padStart(6, '0')}`,
});

export function GuildHallView() {
  const { t, i18n } = useTranslation();
  const features = useFeatures();
  const agents = useStore((s) => s.agents);
  const selectedId = useStore((s) => s.selectedId);
  const covered = useStore((s) => Boolean(s.fullscreenAgentId) || s.ideOpen);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = useStore((s) => (editingId ? s.agents.find((a) => a.id === editingId) : undefined));
  const [fullscreen, setFullscreen] = useState(false);

  const guildAgents = useMemo(() => {
    const list = [...agents.filter(isBoss), ...agents.filter((a) => !isBoss(a))];
    return list.map(toGuildAgent);
  }, [agents]);

  const { feedEvents } = useOfficeFeed(agents);
  const bubbles = useMemo<GuildBubble[]>(
    () => feedEvents.filter((e) => e.kind === 'reply').map((e) => ({ id: e.id, text: e.text, ts: e.ts })),
    [feedEvents]
  );

  const chatterFollows = featureOn(features, 'chatterFollowsLanguage');
  const chatter = useCallback((agentId: string, seed: number): string | null => {
    const ct = chatterFollows ? t : i18n.getFixedT('en');
    const a = useStore.getState().agents.find((x) => x.id === agentId);
    if (!a) return null;
    if (seed % 3 === 0) {
      const pool = ct('office.gossip', { returnObjects: true }) as unknown;
      const count = Array.isArray(pool) && pool.length > 0 ? pool.length : 0;
      return count ? ct(`office.gossip.${seed % count}`) : null;
    }
    const lines = ct('office.cafeteria', { returnObjects: true }) as CafeteriaLines | undefined;
    return pickSoloLine(lines, a.character, SPOTS[seed % SPOTS.length], seed) || null;
  }, [t, i18n, chatterFollows]);

  const toggleFullscreen = useCallback(() => {
    if (fullscreen) {
      setFullscreen(false);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    } else {
      setFullscreen(true);
      void document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, [fullscreen]);
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreen(false); };
    const onChange = () => { if (!document.fullscreenElement) setFullscreen(false); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onChange);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onChange); };
  }, [fullscreen]);

  const labels = useMemo(() => ({
    title: t('office.guild.title', 'Guild Hall'),
    recruit: t('office.guild.recruit', 'Recruit'),
    working: t('office.guild.working', 'working'),
    idle: t('office.guild.idle', 'idle'),
    error: t('office.guild.error', 'needs a look'),
    waiting: t('office.guild.waiting', 'waiting'),
    fullscreen: t('office.guild.fullscreen', 'Full screen'),
    resetView: t('office.guild.resetView', 'Reset view'),
  }), [t]);

  return (
    <div style={{ position: fullscreen ? 'fixed' : 'absolute', inset: 0, zIndex: fullscreen ? 900 : undefined }}>
      <GuildHall2D
        agents={guildAgents}
        selectedId={selectedId}
        bubbles={bubbles}
        paused={covered}
        chatter={chatter}
        onSelect={(id) => useStore.getState().select(id)}
        onEdit={setEditingId}
        onAddAgent={() => useStore.getState().setAddAgentOpen(true)}
        fullscreen={fullscreen}
        onToggleFullscreen={toggleFullscreen}
        labels={labels}
      />
      {editing && <EditAgentModal agent={editing} onClose={() => setEditingId(null)} />}
    </div>
  );
}
