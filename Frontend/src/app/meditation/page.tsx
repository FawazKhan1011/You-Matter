"use client";

import { Suspense, useEffect } from "react";
import { MeditationExperience } from "@/components/meditation/MeditationExperience";
import "../../styles/meditation.css";
import { trackEvent } from "@/lib/activityTracker";

function MeditationFallback() {
  return (
    <main className="mindful-shell">
      <p className="mindful-fineprint" style={{ padding: "2rem" }}>
        Opening Mindful Space…
      </p>
    </main>
  );
}

export default function MeditationPage() {
  useEffect(() => {
    trackEvent('page_visit', { page: 'meditation' });
  }, []);

  return (
    <Suspense fallback={<MeditationFallback />}>
      <MeditationExperience />
    </Suspense>
  );
}
