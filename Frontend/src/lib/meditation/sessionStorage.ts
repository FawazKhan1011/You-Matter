import { useEffect, useState } from "react";
import type { MeditationSessionRecord, MeditationStats } from "./types";

const keyFor = (userId: string | undefined, suffix: string) => `${suffix}_${userId || "guest"}`;

export const loadMeditationSessions = (userId?: string): MeditationSessionRecord[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(keyFor(userId, "meditation_sessions"));
    return raw ? (JSON.parse(raw) as MeditationSessionRecord[]) : [];
  } catch {
    return [];
  }
};

export const loadMeditationStats = (userId?: string): MeditationStats => {
  if (typeof window === "undefined") return emptyStats();
  try {
    const raw = localStorage.getItem(keyFor(userId, "meditation_stats"));
    return raw ? { ...emptyStats(), ...(JSON.parse(raw) as MeditationStats) } : emptyStats();
  } catch {
    return emptyStats();
  }
};

export const saveMeditationSession = (
  session: MeditationSessionRecord,
  userId?: string
): MeditationStats => {
  const previous = loadMeditationStats(userId);
  const sessions = [session, ...loadMeditationSessions(userId)].slice(0, 40);
  localStorage.setItem(keyFor(userId, "meditation_sessions"), JSON.stringify(sessions));
  const stats = computeStats(sessions);
  const earned = stats.badges.filter((badge) => !previous.badges.includes(badge));
  session.earnedBadges = earned;
  session.badges = stats.badges;
  localStorage.setItem(keyFor(userId, "meditation_stats"), JSON.stringify(stats));
  window.dispatchEvent(new CustomEvent("youmatter:meditation-updated", { detail: stats }));
  return stats;
};

export const emptyStats = (): MeditationStats => ({
  sessionsCompleted: 0,
  averagePostureScore: 0,
  lastDuration: 0,
  lastPostureScore: 0,
  streakDays: 0,
  badges: [],
  totalMinutes: 0,
});

const computeStats = (sessions: MeditationSessionRecord[]): MeditationStats => {
  if (sessions.length === 0) return emptyStats();
  const averagePostureScore = Math.round(
    sessions.reduce((sum, item) => sum + item.postureScore, 0) / sessions.length
  );
  const streakDays = computeStreak(sessions);
  const badges = collectBadges(sessions, averagePostureScore, streakDays);
  return {
    sessionsCompleted: sessions.length,
    averagePostureScore,
    lastDuration: sessions[0].meditationDuration,
    lastPostureScore: sessions[0].postureScore,
    streakDays,
    badges,
    totalMinutes: Math.round(sessions.reduce((sum, item) => sum + item.meditationDuration, 0) / 60),
  };
};

const dayKey = (iso: string) => {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const computeStreak = (sessions: MeditationSessionRecord[]) => {
  const days = new Set(sessions.map((item) => dayKey(item.completedAt)));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor.toISOString()))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor.toISOString()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const collectBadges = (sessions: MeditationSessionRecord[], average: number, streak: number) => {
  const badges: string[] = [];
  if (sessions.length >= 1) badges.push("First Mindful Session");
  if (sessions.length >= 5) badges.push("5 Sessions Completed");
  if (streak >= 5) badges.push("5-Day Mindfulness Streak");
  if (average >= 85 && sessions.length >= 2) badges.push("Posture Master");
  return badges;
};

export function useMeditationStatsUpdater(userId?: string): MeditationStats {
  const [stats, setStats] = useState<MeditationStats>(() => loadMeditationStats(userId));

  useEffect(() => {
    setStats(loadMeditationStats(userId));
  }, [userId]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<MeditationStats>).detail;
      setStats(detail);
    };
    window.addEventListener("youmatter:meditation-updated", handler);
    return () => window.removeEventListener("youmatter:meditation-updated", handler);
  }, []);

  return stats;
}
