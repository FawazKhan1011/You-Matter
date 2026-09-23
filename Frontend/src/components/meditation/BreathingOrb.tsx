"use client";

import { motion } from "framer-motion";
import type { BreathPhase } from "@/lib/meditation/types";

type Props = {
  phase: BreathPhase;
  remaining: number;
  active: boolean;
  compact?: boolean;
};

const labels: Record<BreathPhase, string> = {
  inhale: "Breathe in",
  hold: "Hold",
  exhale: "Breathe out",
};

export function BreathingOrb({ phase, remaining, active, compact }: Props) {
  const scale = phase === "inhale" ? 1.12 : phase === "hold" ? 1.08 : 0.88;

  return (
    <div className={`breath-orb-wrap ${compact ? "compact" : ""}`}>
      <motion.div
        className={`breath-orb ${phase} ${active ? "is-live" : ""}`}
        animate={{ scale: active ? scale : 0.94 }}
        transition={{ duration: 1.05, ease: "easeInOut" }}
      >
        <span className="breath-orb-label">{labels[phase]}</span>
        <strong>{remaining}</strong>
      </motion.div>
    </div>
  );
}
