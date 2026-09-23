"use client";

import { useEffect, useState } from "react";
import { DEFAULT_BREATH } from "@/lib/meditation/types";
import type { BreathConfig, BreathPhase } from "@/lib/meditation/types";

export function useBreathingCycle(active: boolean, config: BreathConfig = DEFAULT_BREATH) {
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [remaining, setRemaining] = useState(config.inhale);

  useEffect(() => {
    if (!active) {
      setPhase("inhale");
      setRemaining(config.inhale);
      return;
    }

    const sequence: BreathPhase[] = ["inhale", "hold", "exhale"];
    let index = 0;
    let left = config[sequence[0]];
    setPhase(sequence[0]);
    setRemaining(left);

    const id = window.setInterval(() => {
      left -= 1;
      if (left <= 0) {
        index = (index + 1) % sequence.length;
        left = config[sequence[index]];
        setPhase(sequence[index]);
      }
      setRemaining(left);
    }, 1000);

    return () => window.clearInterval(id);
  }, [active, config]);

  return { phase, remaining, config };
}
