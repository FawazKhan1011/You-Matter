"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  duration: number;
  running: boolean;
  accelerated?: boolean;
  onComplete: () => void;
};

export function useMeditationTimer({ duration, running, accelerated, onComplete }: Options) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const durationRef = useRef(duration);

  useEffect(() => {
    if (durationRef.current !== duration) {
      durationRef.current = duration;
      if (!running) setTimeLeft(duration);
    }
  }, [duration, running]);

  useEffect(() => {
    if (!running) return;
    const intervalMs = accelerated ? 120 : 1000;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          completeRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [running, accelerated]);

  const skipToEnd = useCallback(() => {
    setTimeLeft(0);
    completeRef.current();
  }, []);

  return { timeLeft, skipToEnd, setTimeLeft };
}
