"use client";

import { useEffect, useRef, useState } from "react";
import { createSimulatedLandmarks } from "@/lib/pose/postureAnalysis";
import type { Landmark } from "@/lib/meditation/types";

type PoseLandmarkerInstance = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestamp: number
  ) => { landmarks?: Landmark[][] };
  close?: () => void;
};

type Options = {
  videoRef: { current: HTMLVideoElement | null };
  enabled: boolean;
  simulate: boolean;
  preferSimulation?: boolean;
};

export function usePoseTracking({ videoRef, enabled, simulate, preferSimulation }: Options) {
  const landmarkerRef = useRef<PoseLandmarkerInstance | null>(null);
  const rafRef = useRef<number | null>(null);
  const landmarksRef = useRef<Landmark[]>([]);
  const lastUi = useRef(0);
  const simRef = useRef(false);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [modelStatus, setModelStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [usingSimulation, setUsingSimulation] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!enabled || simulate) return;
      setModelStatus("loading");
      try {
        const vision = await import("@mediapipe/tasks-vision");
        const fileset = await vision.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
        );
        const create = async (delegate: "GPU" | "CPU") =>
          vision.PoseLandmarker.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
              delegate,
            },
            runningMode: "VIDEO",
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        let landmarker: PoseLandmarkerInstance;
        try {
          landmarker = await create("GPU");
        } catch {
          landmarker = await create("CPU");
        }
        if (cancelled) {
          landmarker.close?.();
          return;
        }
        landmarkerRef.current = landmarker;
        setModelStatus("ready");
      } catch (error) {
        console.warn("Pose model failed to load", error);
        if (!cancelled) setModelStatus("error");
      }
    };

    void load();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close?.();
      landmarkerRef.current = null;
    };
  }, [enabled, simulate]);

  useEffect(() => {
    if (!enabled) {
      landmarksRef.current = [];
      setLandmarks([]);
      setUsingSimulation(false);
      return;
    }

    const loop = () => {
      const now = performance.now();
      const simFlag = simRef.current;
      const video = videoRef.current;
      const videoReady = Boolean(video && video.readyState >= 2);
      const shouldSimulate = Boolean(
        simulate ||
        modelStatus === "error" ||
        (preferSimulation && (!videoReady || modelStatus === "loading" || modelStatus === "idle"))
      );
      if (shouldSimulate) {
        const quality = 0.82 + (Math.sin(now / 3800) * 0.5 + 0.5) * 0.1;
        landmarksRef.current = createSimulatedLandmarks(now, quality);
      } else if (video && landmarkerRef.current && videoReady) {
        try {
          const result = landmarkerRef.current.detectForVideo(video, now);
          landmarksRef.current = result.landmarks?.[0] ?? [];
        } catch {
          /* keep last frame */
        }
      }
      if (simFlag !== shouldSimulate) {
        simRef.current = shouldSimulate;
        setUsingSimulation(shouldSimulate);
      }

      if (now - lastUi.current > 160) {
        lastUi.current = now;
        setLandmarks(landmarksRef.current);
      }
      rafRef.current = window.requestAnimationFrame(loop);
    };

    rafRef.current = window.requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, modelStatus, preferSimulation, simulate, videoRef]);

  return { landmarks, landmarksRef, modelStatus, usingSimulation };
}
