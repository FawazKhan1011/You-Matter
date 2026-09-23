import { clamp } from "@/lib/meditation/meditationUtils";
import type { Landmark, PostureBreakdown } from "@/lib/meditation/types";

const NOSE = 0;
const LEFT_EAR = 7;
const RIGHT_EAR = 8;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;

const visible = (point?: Landmark, min = 0.35) =>
  Boolean(point && (point.visibility === undefined || point.visibility >= min));

const midpoint = (a: Landmark, b: Landmark): Landmark => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
  z: (a.z + b.z) / 2,
});

const scoreFromError = (error: number, gentle = 0.04, harsh = 0.16) => {
  if (error <= gentle) return 100;
  if (error >= harsh) return 38;
  return 100 - ((error - gentle) / (harsh - gentle)) * 62;
};

export const bodyCoverage = (landmarks: Landmark[]) => {
  const needed = [NOSE, LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP];
  const seen = needed.filter((index) => visible(landmarks[index], 0.25)).length;
  return seen / needed.length;
};

export const isUpperBodyVisible = (landmarks: Landmark[]) =>
  visible(landmarks[LEFT_SHOULDER]) &&
  visible(landmarks[RIGHT_SHOULDER]) &&
  (visible(landmarks[NOSE]) || (visible(landmarks[LEFT_EAR]) && visible(landmarks[RIGHT_EAR])));

export function analyzePostureFrame(
  landmarks: Landmark[],
  previousMid?: Landmark | null
): { breakdown: PostureBreakdown; shoulderMid: Landmark | null } {
  const leftShoulder = landmarks[LEFT_SHOULDER];
  const rightShoulder = landmarks[RIGHT_SHOULDER];
  const leftHip = landmarks[LEFT_HIP];
  const rightHip = landmarks[RIGHT_HIP];
  const nose = landmarks[NOSE];
  const leftEar = landmarks[LEFT_EAR];
  const rightEar = landmarks[RIGHT_EAR];

  if (!visible(leftShoulder) || !visible(rightShoulder)) {
    return {
      breakdown: {
        headAlignment: 50,
        shoulderAlignment: 50,
        torsoAlignment: 50,
        hipStability: 50,
        stability: 50,
        overallScore: 50,
      },
      shoulderMid: null,
    };
  }

  const shoulderMid = midpoint(leftShoulder, rightShoulder);
  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
  const shoulderAlignment = scoreFromError(shoulderTilt, 0.015, 0.09);

  let headAlignment = 78;
  if (visible(nose)) {
    headAlignment = scoreFromError(Math.abs(nose.x - shoulderMid.x), 0.02, 0.12);
  }
  if (visible(leftEar) && visible(rightEar)) {
    const earTilt = Math.abs(leftEar.y - rightEar.y);
    headAlignment = (headAlignment + scoreFromError(earTilt, 0.015, 0.08)) / 2;
  }

  let torsoAlignment = 76;
  if (visible(leftHip) && visible(rightHip)) {
    const hipMid = midpoint(leftHip, rightHip);
    const lean = Math.abs(shoulderMid.x - hipMid.x);
    const collapse = Math.max(0, hipMid.y - shoulderMid.y);
    torsoAlignment = scoreFromError(lean, 0.02, 0.12) * 0.7 + clamp(40 + collapse * 180, 40, 100) * 0.3;
  }

  let hipStability = 80;
  if (visible(leftHip) && visible(rightHip)) {
    hipStability = scoreFromError(Math.abs(leftHip.y - rightHip.y), 0.02, 0.1);
  }

  let stability = 86;
  if (previousMid) {
    const travel = Math.hypot(shoulderMid.x - previousMid.x, shoulderMid.y - previousMid.y);
    stability = scoreFromError(travel, 0.004, 0.035);
  }

  const overallScore =
    headAlignment * 0.22 +
    shoulderAlignment * 0.24 +
    torsoAlignment * 0.28 +
    hipStability * 0.12 +
    stability * 0.14;

  return {
    breakdown: {
      headAlignment: clamp(headAlignment),
      shoulderAlignment: clamp(shoulderAlignment),
      torsoAlignment: clamp(torsoAlignment),
      hipStability: clamp(hipStability),
      stability: clamp(stability),
      overallScore: clamp(overallScore),
    },
    shoulderMid,
  };
}

export function smoothBreakdown(
  previous: PostureBreakdown | null,
  current: PostureBreakdown,
  amount = 0.15
): PostureBreakdown {
  if (!previous) return current;
  const mix = (key: keyof PostureBreakdown) => previous[key] * (1 - amount) + current[key] * amount;
  return {
    headAlignment: mix("headAlignment"),
    shoulderAlignment: mix("shoulderAlignment"),
    torsoAlignment: mix("torsoAlignment"),
    hipStability: mix("hipStability"),
    stability: mix("stability"),
    overallScore: mix("overallScore"),
  };
}

export function createSimulatedLandmarks(t: number, quality = 0.86): Landmark[] {
  const sway = Math.sin(t / 2200) * (0.012 - quality * 0.008);
  const bob = Math.sin(t / 2600) * 0.006;
  const shoulderDrop = (1 - quality) * 0.045;
  const points: Array<[number, number]> = [
    [0.5 + sway * 0.4, 0.18 + bob],
    [0.485 + sway * 0.4, 0.168 + bob],
    [0.47 + sway * 0.35, 0.172 + bob],
    [0.455 + sway * 0.3, 0.178 + bob],
    [0.515 + sway * 0.4, 0.168 + bob],
    [0.53 + sway * 0.35, 0.172 + bob],
    [0.545 + sway * 0.3, 0.178 + bob],
    [0.445 + sway * 0.2, 0.188 + bob],
    [0.555 + sway * 0.2, 0.19 + bob + shoulderDrop * 0.15],
    [0.478 + sway, 0.23 + bob],
    [0.522 + sway, 0.232 + bob],
    [0.39 + sway, 0.34],
    [0.61 + sway, 0.34 + shoulderDrop],
    [0.34 + sway * 0.4, 0.48],
    [0.66 + sway * 0.4, 0.5],
    [0.33, 0.6],
    [0.67, 0.61],
    [0.32, 0.62],
    [0.68, 0.63],
    [0.325, 0.61],
    [0.675, 0.62],
    [0.335, 0.58],
    [0.665, 0.59],
    [0.43 + sway * 0.3, 0.62],
    [0.57 + sway * 0.3, 0.625],
    [0.42, 0.78],
    [0.58, 0.785],
    [0.41, 0.92],
    [0.59, 0.92],
    [0.405, 0.95],
    [0.595, 0.95],
    [0.415, 0.91],
    [0.585, 0.91],
  ];

  return points.map(([x, y], index) => ({
    x,
    y,
    z: 0,
    visibility: index >= 25 ? 0.72 : 0.96,
  }));
}
