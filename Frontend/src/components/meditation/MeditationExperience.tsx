"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Circle, Pause, Play, Settings2, Square } from "lucide-react";
import { useBreathingCycle } from "@/hooks/useBreathingCycle";
import { useCamera } from "@/hooks/useCamera";
import { useMeditationTimer } from "@/hooks/useMeditationTimer";
import { usePoseTracking } from "@/hooks/usePoseTracking";
import { usePostureAnalysis } from "@/hooks/usePostureAnalysis";
import {
  generateSessionInsight,
  startMeditationSession,
  updateWellnessProfile,
} from "@/lib/meditation/agents";
import { isDemoModeEnabled, recommendMeditation } from "@/lib/meditation/meditationUtils";
import { loadMeditationStats } from "@/lib/meditation/sessionStorage";
import type {
  BreathConfig,
  DetectionStatus,
  MeditationPhase,
  MeditationSessionRecord,
} from "@/lib/meditation/types";
import { DEFAULT_BREATH } from "@/lib/meditation/types";
import { BreathingOrb } from "./BreathingOrb";
import { CalibrationScreen } from "./CalibrationScreen";
import { CameraView } from "./CameraView";
import { ImmersiveMode } from "./ImmersiveMode";
import { MeditationBackground } from "./MeditationBackground";
import { MeditationControls } from "./MeditationControls";
import { MeditationTimer } from "./MeditationTimer";
import { PrivacyIndicator } from "./PrivacyIndicator";
import { PostureFeedback } from "./PostureFeedback";
import { PostureScore } from "./PostureScore";
import { SessionSummary } from "./SessionSummary";

export function MeditationExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [phase, setPhase] = useState<MeditationPhase>("setup");
  const [minutes, setMinutes] = useState(5);
  const [custom, setCustom] = useState("5");
  const [demo, setDemo] = useState(isDemoModeEnabled());
  const [skipCamera, setSkipCamera] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [breath, setBreath] = useState<BreathConfig>(DEFAULT_BREATH);
  const [summary, setSummary] = useState<MeditationSessionRecord | null>(null);
  const [liveStatus, setLiveStatus] = useState<DetectionStatus>("idle");
  const startedAt = useRef<number | null>(null);
  const sessionMeta = useRef(startMeditationSession(300));
  const lostSince = useRef<number | null>(null);
  const completedLock = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoStartRequested = useRef(false);

  useEffect(() => {
    const audio = new Audio("/breath.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.45;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  const cameraOn = phase !== "setup" && phase !== "completed" && !skipCamera;
  const camera = useCamera({ enabled: cameraOn });
  const simulatePose =
    skipCamera ||
    camera.status === "denied" ||
    camera.status === "unavailable" ||
    camera.status === "unsupported";
  const poseOn = phase !== "setup" && phase !== "completed";
  const pose = usePoseTracking({
    videoRef: camera.videoRef,
    enabled: poseOn,
    simulate: simulatePose,
    preferSimulation: demo,
  });
  const analyzing = phase === "calibrating" || phase === "ready" || phase === "running" || phase === "paused";
  const posture = usePostureAnalysis(pose.landmarks, analyzing);
  const sessionActive = phase === "running";
  const duration = minutes * 60;

  const completeSession = () => {
    if (completedLock.current) return;
    completedLock.current = true;
    const elapsed = startedAt.current
      ? Math.max(15, Math.round((Date.now() - startedAt.current) / 1000))
      : duration;
    const usedDuration = Math.min(duration, elapsed);
    const average = posture.averageScore || Math.round(posture.breakdown.overallScore) || 82;
    const insight = generateSessionInsight({
      duration: usedDuration,
      plannedDuration: duration,
      averageScore: average,
      breakdown: posture.breakdown,
    });
        const record: MeditationSessionRecord = {
      id: `med-${Date.now()}`,
      meditationDuration: usedDuration,
      plannedDuration: duration,
      postureScore: average,
      averagePostureScore: average,
      sessionType: "guided",
      completedAt: new Date().toISOString(),
      insights: insight.insights,
      reflection: insight.reflection,
      badges: [],
      consistency: Math.min(100, Math.max(0, Math.round(average + (usedDuration >= duration ? 6 : 0)))),
      earnedBadges: [],
    };
    const stats = updateWellnessProfile(record, user?.id);
    record.badges = stats.badges;
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setSummary(record);
    setPhase("completed");
  };

  const timer = useMeditationTimer({
    duration,
    running: sessionActive,
    accelerated: demo,
    onComplete: completeSession,
  });
  const breathing = useBreathingCycle(sessionActive, breath);
  const recommendation = useMemo(
    () => recommendMeditation(loadMeditationStats(user?.id)),
    [user?.id]
  );

  useEffect(() => {
    const durationParam = Number(searchParams?.get("duration"));
    if (Number.isFinite(durationParam) && durationParam > 0) {
      const next = Math.max(1, Math.min(45, Math.round(durationParam / 60)));
      setMinutes(next);
      setCustom(String(next));
    }
    if (searchParams?.get("autostart") === "true") {
      autoStartRequested.current = true;
      setPhase("calibrating");
    }
  }, [searchParams]);

  useEffect(() => {
    document.title = "Mindful Space | You Matter AI";
  }, []);

  useEffect(() => {
    if (!analyzing) return;
    if (posture.status === "none" || posture.status === "incomplete") {
      if (!lostSince.current) lostSince.current = Date.now();
      if (phase === "running" && Date.now() - (lostSince.current || 0) > 1200) {
        setLiveStatus("lost");
      } else {
        setLiveStatus(posture.status);
      }
    } else {
      lostSince.current = null;
      setLiveStatus(posture.status);
    }
  }, [analyzing, phase, posture.status]);

  const readyToBegin =
    skipCamera ||
    simulatePose ||
    liveStatus === "ready" ||
    liveStatus === "good" ||
    liveStatus === "poor";
  const canBegin = pose.modelStatus !== "loading" && camera.status !== "requesting";

  useEffect(() => {
    if (phase === "calibrating" && (readyToBegin || canBegin)) setPhase("ready");
  }, [canBegin, phase, readyToBegin]);

  const begin = useCallback(() => {
    completedLock.current = false;
    startedAt.current = Date.now();
    sessionMeta.current = startMeditationSession(duration);
    posture.resetSamples();
    setPhase("running");
    void audioRef.current?.play().catch(() => undefined);
  }, [duration, posture]);

  useEffect(() => {
    if (phase === "calibrating" && canBegin && autoStartRequested.current) {
      autoStartRequested.current = false;
      begin();
    }
  }, [begin, canBegin, phase]);

  useEffect(() => {
    if (sessionActive) {
      void audioRef.current?.play().catch(() => undefined);
    } else if (phase === "paused") {
      audioRef.current?.pause();
    }
  }, [phase, sessionActive]);

  const resetToSetup = () => {
    completedLock.current = false;
    setSummary(null);
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPhase("setup");
    setSkipCamera(false);
  };

  const cameraChip =
    camera.status === "active"
      ? "Camera local"
      : skipCamera
        ? "Camera off"
        : camera.status === "denied"
          ? "Camera blocked"
          : pose.modelStatus === "loading"
            ? "Loading guidance"
            : "Standby";

  const trackingLabel = poseOn
    ? pose.usingSimulation
      ? "Guided demo tracking"
      : pose.modelStatus === "ready"
        ? "Pose tracking active"
        : pose.modelStatus === "loading"
          ? "Preparing pose model"
          : "Camera mode"
    : "Idle";

  return (
    <main className="mindful-shell">
      <MeditationBackground />
      <header className="mindful-nav">
        <button type="button" className="mindful-brand" onClick={() => router.push("/dashboard")}>
          You Matter AI
          <span>Mindful Space</span>
        </button>
        <div className="mindful-nav-title">Meditation Session</div>
        <div className="mindful-nav-right">
          <PrivacyIndicator />
          <span className="mindful-chip live">
            <Circle size={10} fill="currentColor" />
            {cameraChip}
          </span>
          <button type="button" className="mindful-icon-btn" onClick={() => setSettingsOpen((value) => !value)}>
            <Settings2 size={16} />
          </button>
        </div>
      </header>

      {settingsOpen && (
        <div className="mindful-settings">
          <label>
            Inhale
            <input
              type="number"
              min={2}
              max={8}
              value={breath.inhale}
              onChange={(event) => setBreath((current) => ({ ...current, inhale: Number(event.target.value) || 4 }))}
            />
          </label>
          <label>
            Hold
            <input
              type="number"
              min={1}
              max={6}
              value={breath.hold}
              onChange={(event) => setBreath((current) => ({ ...current, hold: Number(event.target.value) || 2 }))}
            />
          </label>
          <label>
            Exhale
            <input
              type="number"
              min={3}
              max={10}
              value={breath.exhale}
              onChange={(event) => setBreath((current) => ({ ...current, exhale: Number(event.target.value) || 6 }))}
            />
          </label>
          <label className="mindful-toggle">
            <input type="checkbox" checked={demo} onChange={(event) => setDemo(event.target.checked)} />
            Demo Mode
          </label>
        </div>
      )}

      <section className="mindful-workspace">
        <div className="mindful-stage">
          <MeditationTimer
            timeLeft={phase === "running" || phase === "paused" ? timer.timeLeft : duration}
            subtitle={phase === "setup" ? recommendation.note : "Mindful Breathing"}
          />
          <CameraView
            videoRef={camera.videoRef}
            landmarksRef={pose.landmarksRef}
            cameraActive={camera.status === "active"}
            poorShoulders={posture.breakdown.shoulderAlignment < 70 && analyzing}
            statusText={
              liveStatus === "lost"
                ? "Tracking paused — return to frame."
                : camera.status === "denied"
                  ? "Camera unavailable"
                  : trackingLabel
            }
          />
          {(phase === "running" || phase === "paused") && <PostureFeedback message={posture.feedback} />}
        </div>

        <aside className="mindful-side">
          <div className="mindful-live-card">
            <strong>
              <Circle size={8} fill="currentColor" /> {phase === "running" ? "LIVE" : phase}
            </strong>
            <p>{trackingLabel}</p>
            <p className="mindful-fineprint">Camera processing happens locally on your device.</p>
          </div>

          <div className="mindful-side-aura" aria-label="Breathing guidance">
            <BreathingOrb
              phase={breathing.phase}
              remaining={breathing.remaining}
              active={sessionActive}
              compact
            />
          </div>

          {phase === "setup" && (
            <MeditationControls
              minutes={minutes}
              onMinutes={setMinutes}
              custom={custom}
              onCustom={setCustom}
              onStart={() => setPhase("calibrating")}
              demo={demo}
              canSkipCamera
            />
          )}

          {(phase === "calibrating" || phase === "ready") && (
            <CalibrationScreen
              status={liveStatus === "good" || liveStatus === "poor" ? "ready" : liveStatus}
              cameraDenied={camera.status === "denied" || camera.status === "unavailable"}
              modelLoading={pose.modelStatus === "loading"}
              ready={readyToBegin}
              onCalibrate={() => setPhase("calibrating")}
              onBegin={begin}
              onSkip={() => {
                setSkipCamera(true);
                setDemo(true);
                setPhase("ready");
              }}
            />
          )}

          {(phase === "running" || phase === "paused") && (
            <>
              <PostureScore
                score={posture.breakdown.overallScore}
                label={posture.label}
                cues={posture.cues}
                status={liveStatus}
                message={posture.feedback}
              />
              <div className="session-actions">
                {phase === "running" ? (
                  <button type="button" className="mindful-pill" onClick={() => setPhase("paused")}>
                    <Pause size={14} /> Pause
                  </button>
                ) : (
                  <button type="button" className="mindful-pill active" onClick={() => setPhase("running")}>
                    <Play size={14} /> Resume
                  </button>
                )}
                <button type="button" className="mindful-ghost" onClick={completeSession}>
                  <Square size={14} /> End Session
                </button>
                {demo && (
                  <button type="button" className="mindful-ghost" onClick={timer.skipToEnd}>
                    Complete demo
                  </button>
                )}
              </div>
            </>
          )}

          {camera.status === "denied" && phase !== "setup" && phase !== "completed" && (
            <div className="mindful-warn">
              <h4>Camera unavailable</h4>
              <p>You can continue meditation without posture tracking.</p>
              <button
                type="button"
                className="mindful-ghost"
                onClick={() => {
                  setSkipCamera(true);
                  setDemo(true);
                }}
              >
                Continue Without Camera
              </button>
            </div>
          )}

          <ImmersiveMode onFallback={() => undefined} />
        </aside>
      </section>

      {summary && phase === "completed" && (
        <SessionSummary
          session={summary}
          onDone={() => router.push("/dashboard")}
          onAgain={resetToSetup}
        />
      )}
    </main>
  );
}
