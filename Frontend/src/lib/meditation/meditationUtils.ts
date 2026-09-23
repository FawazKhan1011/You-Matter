import type { BreathConfig, DetectionStatus, PostureBreakdown } from "./types";

export const isDemoModeEnabled = () => process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

export const postureLabel = (score: number) => {
  if (score >= 86) return "Excellent alignment";
  if (score >= 72) return "Good alignment";
  if (score >= 58) return "Needs a gentle reset";
  return "Adjust your posture";
};

export const detectionCopy = (status: DetectionStatus) => {
  switch (status) {
    case "none":
      return "Move into the camera frame.";
    case "incomplete":
      return "Move slightly farther from the camera.";
    case "ready":
      return "You're ready.";
    case "lost":
      return "Tracking paused — return to frame.";
    case "good":
      return "Excellent alignment.";
    case "poor":
      return "Adjust your posture.";
    case "low-light":
      return "Lighting is low. A brighter space helps tracking.";
    default:
      return "Preparing your space.";
  }
};

export const cycleLength = (config: BreathConfig) => config.inhale + config.hold + config.exhale;

export const feedbackForBreakdown = (scores: PostureBreakdown) => {
  if (scores.overallScore >= 86) return scores.overallScore >= 92 ? "Nice posture" : "Great alignment";
  if (scores.torsoAlignment < 68) return "Sit upright";
  if (scores.shoulderAlignment < 70) return "Relax your shoulders";
  if (scores.headAlignment < 70) return "Center your head";
  if (scores.stability < 68) return "Keep your torso stable";
  if (scores.hipStability < 68) return "Return to your center";
  return "Stay relaxed";
};

export const recommendMeditation = (stats?: { averagePostureScore?: number; lastDuration?: number }) => {
  const last = stats?.lastDuration ?? 300;
  const score = stats?.averagePostureScore ?? 80;
  if (score > 0 && score < 70) {
    return { minutes: 5, note: "A shorter seated session can help you settle without strain." };
  }
  if (last >= 600) {
    return { minutes: 10, note: "You already held a longer session — keep that rhythm if it feels good." };
  }
  if (last >= 120 && last < 240) {
    return { minutes: 5, note: "You completed a short sit. Five minutes is a natural next step." };
  }
  return { minutes: 5, note: "A five-minute guided breath is a steady next step." };
};

export const highlightRegions = (scores: PostureBreakdown) => ({
  shoulders: scores.shoulderAlignment < 70,
  head: scores.headAlignment < 70,
  torso: scores.torsoAlignment < 68,
  hips: scores.hipStability < 68,
});
