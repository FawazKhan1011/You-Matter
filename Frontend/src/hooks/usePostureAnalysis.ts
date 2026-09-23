"use client";

import { useEffect, useRef, useState } from "react";
import { feedbackForBreakdown, postureLabel } from "@/lib/meditation/meditationUtils";
import {
  analyzePostureFrame,
  bodyCoverage,
  isUpperBodyVisible,
  smoothBreakdown,
} from "@/lib/pose/postureAnalysis";
import type { DetectionStatus, Landmark, PostureBreakdown, PostureCue } from "@/lib/meditation/types";

const EMPTY: PostureBreakdown = {
  headAlignment: 0,
  shoulderAlignment: 0,
  torsoAlignment: 0,
  hipStability: 0,
  stability: 0,
  overallScore: 0,
};

export function usePostureAnalysis(landmarks: Landmark[], active: boolean) {
  const previousMid = useRef<{ x: number; y: number; z: number } | null>(null);
  const smoothed = useRef<PostureBreakdown | null>(null);
  const lastFeedbackAt = useRef(0);
  const [breakdown, setBreakdown] = useState<PostureBreakdown>(EMPTY);
  const [status, setStatus] = useState<DetectionStatus>("idle");
  const [feedback, setFeedback] = useState("Preparing your space.");
  const samples = useRef<number[]>([]);

  useEffect(() => {
    if (!active) {
      previousMid.current = null;
      return;
    }
    if (!landmarks.length) {
      setStatus("none");
      return;
    }

    const coverage = bodyCoverage(landmarks);
    if (coverage < 0.4) {
      setStatus("none");
      return;
    }
    if (!isUpperBodyVisible(landmarks) || coverage < 0.8) {
      setStatus("incomplete");
      return;
    }

    const { breakdown: raw, shoulderMid } = analyzePostureFrame(landmarks, previousMid.current);
    previousMid.current = shoulderMid;
    const next = smoothBreakdown(smoothed.current, raw, 0.15);
    smoothed.current = next;
    samples.current = [...samples.current.slice(-180), next.overallScore];
    setBreakdown(next);

    const nextStatus: DetectionStatus = next.overallScore >= 72 ? "good" : "poor";
    setStatus(nextStatus);

    const now = Date.now();
    if (now - lastFeedbackAt.current > 1600) {
      lastFeedbackAt.current = now;
      setFeedback(feedbackForBreakdown(next));
    }
  }, [active, landmarks]);

  const cues: PostureCue[] = [
    { id: "head", label: "Head aligned", ok: breakdown.headAlignment >= 72 },
    { id: "shoulders", label: "Shoulders relaxed", ok: breakdown.shoulderAlignment >= 72 },
    { id: "torso", label: "Torso stable", ok: breakdown.torsoAlignment >= 72 },
  ];

  const averageScore =
    samples.current.length === 0
      ? 0
      : Math.round(samples.current.reduce((sum, value) => sum + value, 0) / samples.current.length);

  return {
    breakdown,
    status,
    feedback,
    label: postureLabel(breakdown.overallScore),
    cues,
    averageScore,
    resetSamples: () => {
      samples.current = [];
      smoothed.current = null;
    },
  };
}
