'use client';

import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Brain, Flame, Timer } from 'lucide-react';
import { loadActivityLog, type ActivityEvent } from '@/lib/activityTracker';
import { loadMeditationSessions, loadMeditationStats } from '@/lib/meditation/sessionStorage';

const COLORS = ['#7357d9', '#20a39e', '#f08a5d', '#4d96ff', '#e76f9a'];

type AssessmentResult = { id: string; score: number; date: string; note?: string };

function readAssessments(): AssessmentResult[] {
  try {
    const raw = JSON.parse(localStorage.getItem('you-matter-assessment-results') || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function formatDay(date: Date) {
  return date.toLocaleDateString('en', { weekday: 'short' });
}

export function WellnessInsights({ userId }: { userId?: string }) {
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState(() => loadMeditationStats(userId));
  const [sessions, setSessions] = useState(() => loadMeditationSessions(userId));

  useEffect(() => {
    const refresh = () => {
      setAssessments(readAssessments());
      setActivity(loadActivityLog());
      setStats(loadMeditationStats(userId));
      setSessions(loadMeditationSessions(userId));
    };
    refresh();
    window.addEventListener('youmatter:activity-updated', refresh);
    window.addEventListener('youmatter:meditation-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('youmatter:activity-updated', refresh);
      window.removeEventListener('youmatter:meditation-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [userId]);

  const activityByDay = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toDateString();
    return {
      day: formatDay(date),
      interactions: activity.filter((event) => new Date(event.timestamp).toDateString() === key).length,
    };
  });

  const featureUsage = Object.entries(
    activity
      .filter((event) => event.eventName === 'page_visit')
      .reduce<Record<string, number>>((counts, event) => {
        const page = String(event.meta?.page || 'other');
        counts[page] = (counts[page] || 0) + 1;
        return counts;
      }, {})
  ).map(([name, value]) => ({ name, value }));

  const assessmentData = assessments.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    score: item.score,
    type: item.id.toUpperCase().includes('GAD') ? 'GAD-7' : 'PHQ-9',
  }));
  const postureData = sessions.slice(0, 10).reverse().map((session) => ({
    date: new Date(session.completedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    score: session.postureScore,
  }));

  const chart = (title: string, children: React.ReactNode, empty: boolean) => (
    <article className="insight-chart">
      <div className="insight-chart-heading"><h3>{title}</h3></div>
      {empty ? <p className="insight-empty">Complete an activity to start building this view.</p> : children}
    </article>
  );

  return (
    <section className="wellness-insights" aria-labelledby="wellness-insights-title">
      <div className="insights-heading">
        <div><p className="insights-eyebrow">Your wellbeing at a glance</p><h2 id="wellness-insights-title">Wellness insights</h2></div>
        <span className="insights-live"><Activity size={15} /> Live from your activity</span>
      </div>
      <div className="insight-stats">
        <div><Timer size={20} /><span><strong>{stats.totalMinutes}</strong> meditation minutes</span></div>
        <div><Brain size={20} /><span><strong>{stats.sessionsCompleted}</strong> sessions completed</span></div>
        <div><Flame size={20} /><span><strong>{stats.streakDays}</strong> day streak</span></div>
      </div>
      <div className="insight-chart-grid">
        {chart('Assessment history', <ResponsiveContainer width="100%" height={210}><LineChart data={assessmentData}><CartesianGrid strokeDasharray="3 3" stroke="#e8e5f0" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="score" stroke="#7357d9" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer>, assessmentData.length === 0)}
        {chart('Meditation posture', <ResponsiveContainer width="100%" height={210}><AreaChart data={postureData}><CartesianGrid strokeDasharray="3 3" stroke="#e8e5f0" /><XAxis dataKey="date" /><YAxis domain={[0, 100]} /><Tooltip /><Area type="monotone" dataKey="score" stroke="#20a39e" fill="#20a39e" fillOpacity={0.2} strokeWidth={3} /></AreaChart></ResponsiveContainer>, postureData.length === 0)}
        {chart('Weekly activity', <ResponsiveContainer width="100%" height={210}><BarChart data={activityByDay}><CartesianGrid strokeDasharray="3 3" stroke="#e8e5f0" /><XAxis dataKey="day" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="interactions" fill="#f08a5d" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>, false)}
        {chart('Feature usage', <ResponsiveContainer width="100%" height={210}><PieChart><Pie data={featureUsage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>{featureUsage.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>, featureUsage.length === 0)}
      </div>
    </section>
  );
}