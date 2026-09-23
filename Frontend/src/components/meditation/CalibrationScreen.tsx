"use client";

import { Check } from "lucide-react";
import { detectionCopy } from "@/lib/meditation/meditationUtils";
import type { DetectionStatus } from "@/lib/meditation/types";

type Props = {
  status: DetectionStatus;
  cameraDenied: boolean;
  modelLoading: boolean;
  onCalibrate: () => void;
  onBegin: () => void;
  onSkip: () => void;
  ready: boolean;
};

export function CalibrationScreen({
  status,
  cameraDenied,
  modelLoading,
  onCalibrate,
  onBegin,
  onSkip,
  ready,
}: Props) {
  return (
    <div className="mindful-calibrate">
      <h2>Prepare Your Space</h2>
      <p>Sit comfortably. Keep your upper body visible in the frame.</p>
      <p className="mindful-status-copy">{detectionCopy(status)}</p>
      {modelLoading && <p className="mindful-fineprint">Loading pose guidance on this device…</p>}
      <div className="mindful-checks">
        <span className={status !== "none" && status !== "idle" ? "ok" : ""}>
          <Check size={14} /> Body detected
        </span>
        <span className={ready ? "ok" : ""}>
          <Check size={14} /> Pose tracking ready
        </span>
        <span className={ready ? "ok" : ""}>
          <Check size={14} /> Camera positioned correctly
        </span>
      </div>
      <div className="mindful-inline-actions">
        <button type="button" className="mindful-pill" onClick={onCalibrate}>
          Calibrate Position
        </button>
        <button type="button" className="mindful-cta" onClick={onBegin} disabled={modelLoading && !cameraDenied}>
          Begin Meditation
        </button>
      </div>
      {cameraDenied && (
        <button type="button" className="mindful-ghost" onClick={onSkip}>
          Continue Without Camera
        </button>
      )}
    </div>
  );
}
