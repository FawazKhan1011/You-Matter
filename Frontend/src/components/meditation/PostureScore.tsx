"use client";

import { Check, Pause } from "lucide-react";
import type { DetectionStatus, PostureCue } from "@/lib/meditation/types";

type Props = {
  score: number;
  label: string;
  cues: PostureCue[];
  status: DetectionStatus;
  message: string;
};

export function PostureScore({ score, label, cues, status, message }: Props) {
  const adjusting = status === "poor" || status === "lost" || status === "none";
  return (
    <aside className={`posture-card ${adjusting ? "warn" : "calm"}`}>
      <div className="posture-card-kicker">{adjusting ? "Posture Adjustment" : "Posture"}</div>
      <div className="posture-card-score">
        {Math.round(score)} <span>/ 100</span>
      </div>
      <p>{label}</p>
      <p className="posture-card-msg">{message}</p>
      <ul>
        {cues.map((cue) => (
          <li key={cue.id} className={cue.ok ? "ok" : ""}>
            {cue.ok ? <Check size={14} /> : <Pause size={14} />}
            {cue.label}
          </li>
        ))}
      </ul>
    </aside>
  );
}
