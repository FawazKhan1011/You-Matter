import { saveMeditationSession } from "./sessionStorage";
import type { MeditationSessionRecord, MeditationStats, PostureBreakdown } from "./types";

export function startMeditationSession(durationSeconds: number) {
  return {
    sessionType: "guided" as const,
    plannedDuration: durationSeconds,
    startedAt: new Date().toISOString(),
    agent: "wellness-coach",
  };
}

export function analyzePosture(breakdown: PostureBreakdown) {
  return {
    ...breakdown,
    source: "local-pose" as const,
    medicalClaim: false as const,
  };
}

export function generateSessionInsight(input: {
  duration: number;
  plannedDuration: number;
  averageScore: number;
  breakdown: PostureBreakdown;
  simulated?: boolean;
}) {
  const insights: string[] = [];
  if (input.breakdown.stability >= 75) insights.push("Stable posture");
  else insights.push("Slight movement throughout the sit");

  if (input.breakdown.shoulderAlignment >= 75) insights.push("Good shoulder alignment");
  else insights.push("Shoulders asked for a few resets");

  if (input.breakdown.headAlignment >= 75) insights.push("Head stayed centered");
  if (input.duration >= Math.min(60, input.plannedDuration)) insights.push("Consistent breathing");
  else insights.push("A short, complete practice");

  const minutes = Math.max(1, Math.round(input.duration / 60));
  let reflection =
    "You completed a guided breathing session. Short practices like this may help you build a consistent wellness routine. This is a session insight, not a medical conclusion.";

  if (input.averageScore >= 86) {
    reflection =
      "You maintained stable posture throughout most of the session. Short breathing sessions like this may help you build a consistent wellness routine.";
  } else if (input.averageScore < 68) {
    reflection =
      "This session is a wellness observation, not a diagnosis. Next time, try sitting a little taller and letting the shoulders soften.";
  } else if (minutes >= 8) {
    reflection =
      "You stayed with a longer sit. That consistency is a useful wellness observation for your routine.";
  }

  if (input.simulated) {
    reflection = `${reflection} Guidance used a local posture estimate when live tracking was unavailable.`;
  }

  return { insights: insights.slice(0, 3), reflection };
}

export function updateWellnessProfile(session: MeditationSessionRecord, userId?: string): MeditationStats {
  return saveMeditationSession(session, userId);
}
