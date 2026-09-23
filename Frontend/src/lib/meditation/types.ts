export type MeditationPhase =
  | "setup"
  | "calibrating"
  | "ready"
  | "running"
  | "paused"
  | "tracking-lost"
  | "completed";

export type DetectionStatus =
  | "idle"
  | "none"
  | "incomplete"
  | "ready"
  | "lost"
  | "good"
  | "poor"
  | "low-light";

export type CameraStatus =
  | "idle"
  | "requesting"
  | "active"
  | "denied"
  | "unavailable"
  | "unsupported";

export type BreathPhase = "inhale" | "hold" | "exhale";

export type Landmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
};

export type PostureBreakdown = {
  headAlignment: number;
  shoulderAlignment: number;
  torsoAlignment: number;
  hipStability: number;
  stability: number;
  overallScore: number;
};

export type PostureCue = {
  id: string;
  label: string;
  ok: boolean;
};

export type PoseFrame = {
  landmarks: Landmark[];
  timestamp: number;
  simulated?: boolean;
};

export type MeditationSessionRecord = {
  id: string;
  meditationDuration: number;
  plannedDuration: number;
  postureScore: number;
  averagePostureScore: number;
  sessionType: "guided";
  completedAt: string;
  insights: string[];
  reflection: string;
  badges: string[];
  consistency: number;
  earnedBadges: string[];
};

export type MeditationStats = {
  sessionsCompleted: number;
  averagePostureScore: number;
  lastDuration: number;
  lastPostureScore: number;
  streakDays: number;
  badges: string[];
  totalMinutes: number;
};

export type BreathConfig = {
  inhale: number;
  hold: number;
  exhale: number;
};

export const DEFAULT_BREATH: BreathConfig = {
  inhale: 4,
  hold: 2,
  exhale: 6,
};

export const POSE_CONNECTIONS: Array<[number, number]> = [
  [0, 2],
  [2, 7],
  [0, 5],
  [5, 8],
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

export const POSE_POINT_INDEXES = [0, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
