"use client";

import { MutableRefObject, useEffect, useRef } from "react";
import { POSE_CONNECTIONS } from "@/lib/meditation/types";
import type { Landmark } from "@/lib/meditation/types";

type Props = {
  landmarksRef: MutableRefObject<Landmark[]>;
  poorShoulders: boolean;
};

export function PoseOverlay({ landmarksRef, poorShoulders }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const draw = (time: number) => {
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const points = landmarksRef.current;
      if (points.length) {
        const pulse = 3.2 + Math.sin(time / 280) * 1.1;
        ctx.lineWidth = 2.4;
        ctx.shadowBlur = 12;
        ctx.shadowColor = poorShoulders ? "rgba(244, 166, 166, 0.7)" : "rgba(196, 168, 255, 0.7)";
        ctx.strokeStyle = poorShoulders
          ? "rgba(244, 180, 180, 0.85)"
          : "rgba(214, 196, 255, 0.72)";
        POSE_CONNECTIONS.forEach(([from, to]) => {
          const a = points[from];
          const b = points[to];
          if (!a || !b) return;
          ctx.beginPath();
          ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
          ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
          ctx.stroke();
        });
        points.forEach((point, index) => {
          ctx.beginPath();
          ctx.fillStyle =
            index === 11 || index === 12
              ? poorShoulders
                ? "rgba(255, 196, 196, 0.95)"
                : "rgba(232, 220, 255, 0.95)"
              : "rgba(255, 255, 255, 0.9)";
          ctx.arc(point.x * canvas.width, point.y * canvas.height, pulse, 0, Math.PI * 2);
          ctx.fill();
        });
        if (poorShoulders && points[11] && points[12]) {
          ctx.setLineDash([8, 8]);
          ctx.strokeStyle = "rgba(255, 210, 210, 0.9)";
          ctx.beginPath();
          ctx.moveTo(points[11].x * canvas.width, points[11].y * canvas.height);
          ctx.lineTo(points[12].x * canvas.width, points[12].y * canvas.height);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(255,255,255,0.88)";
          ctx.font = "12px Inter, sans-serif";
          ctx.fillText(
            "Align your shoulders",
            ((points[11].x + points[12].x) / 2) * canvas.width - 54,
            Math.min(points[11].y, points[12].y) * canvas.height - 16
          );
        }
      }
      raf = window.requestAnimationFrame(draw);
    };

    raf = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(raf);
  }, [landmarksRef, poorShoulders]);

  return <canvas ref={canvasRef} className="pose-overlay" />;
}
