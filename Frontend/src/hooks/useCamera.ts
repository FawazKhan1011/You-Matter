"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraStatus } from "@/lib/meditation/types";

type UseCameraOptions = {
  enabled: boolean;
};

export function useCamera({ enabled }: UseCameraOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const start = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      setError("This browser does not support camera access.");
      return false;
    }
    setStatus("requesting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      }
      setStatus("active");
      return true;
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setStatus("denied");
        setError("Camera permission was declined.");
      } else {
        setStatus("unavailable");
        setError("A camera could not be started on this device.");
      }
      return false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      setStatus("idle");
      return;
    }
    void start();
    return () => stop();
  }, [enabled, start, stop]);

  return { videoRef, status, error, start, stop };
}
