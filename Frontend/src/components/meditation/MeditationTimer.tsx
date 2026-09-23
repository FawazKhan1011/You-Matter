"use client";

import { formatTime } from "@/lib/meditation/meditationUtils";

type Props = {
  timeLeft: number;
  subtitle?: string;
};

export function MeditationTimer({ timeLeft, subtitle = "Mindful Breathing" }: Props) {
  return (
    <div className="mindful-timer-hud">
      <div className="mindful-timer-value" aria-live="polite">
        {formatTime(timeLeft)}
      </div>
      <div className="mindful-timer-sub">{subtitle}</div>
    </div>
  );
}
