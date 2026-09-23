"use client";

import { MutableRefObject, RefObject } from "react";
import { PoseOverlay } from "./PoseOverlay";
import type { Landmark } from "@/lib/meditation/types";

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>;
  landmarksRef: MutableRefObject<Landmark[]>;
  cameraActive: boolean;
  poorShoulders: boolean;
  statusText: string;
};

export function CameraView({ videoRef, landmarksRef, cameraActive, poorShoulders, statusText }: Props) {
  return (
    <div className="camera-frame">
      <video ref={videoRef} className="camera-video" autoPlay muted playsInline />
      {!cameraActive && <div className="camera-fallback" />}
      <PoseOverlay landmarksRef={landmarksRef} poorShoulders={poorShoulders} />
      <div className="camera-vignette" />
      <div className="camera-status">{statusText}</div>
    </div>
  );
}
