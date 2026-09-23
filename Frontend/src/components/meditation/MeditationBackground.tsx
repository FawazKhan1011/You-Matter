"use client";

import { Sparkles } from "lucide-react";

export function MeditationBackground() {
  return (
    <div className="mindful-bg" aria-hidden>
      <div className="mindful-orb mindful-orb-a" />
      <div className="mindful-orb mindful-orb-b" />
      <div className="mindful-wave" />
      <div className="mindful-particles">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.7}s` }} />
        ))}
      </div>
      <Sparkles className="mindful-sparkle" size={18} />
    </div>
  );
}
