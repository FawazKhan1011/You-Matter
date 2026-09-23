import { Button } from '@/components/ui/button';
import type { MeditationStats } from '@/lib/meditation/types';

type Props = { stats: MeditationStats };

export function MeditationStatsCard({ stats }: Props) {
  return (
    <section className="ya-card meditation-card">
      <h2 className="text-2xl font-bold mb-2">Meditation</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Practice deep breathing and mindful focus.
      </p>
      <div className="meditation-stat-row">
        <div>
          <small>Meditation</small>
          <strong>{stats.lastDuration ? `${Math.max(1, Math.round(stats.lastDuration / 60))} min` : '—'}</strong>
        </div>
        <div>
          <small>Posture</small>
          <strong>{stats.lastPostureScore ? `${stats.lastPostureScore}%` : '—'}</strong>
        </div>
        <div>
          <small>Sessions</small>
          <strong>{stats.sessionsCompleted ? `+${stats.sessionsCompleted}` : '0'}</strong>
        </div>
      </div>
      {stats.badges.length > 0 && (
        <div className="summary-badges" style={{ marginTop: '0.5rem' }}>
          {stats.badges.map((badge) => (
            <em key={badge}>{badge}</em>
          ))}
        </div>
      )}
      {stats.streakDays > 0 && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>🔥 {stats.streakDays}-day mindfulness streak</p>
      )}
      <Button size="lg" className="w-full" style={{ marginTop: '1rem' }} onClick={() => window.location.assign('/meditation')}>Begin Meditation</Button>
    </section>
  );
}