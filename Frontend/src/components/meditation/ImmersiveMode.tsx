"use client";

import { useEffect, useState } from "react";

type Props = {
  onFallback: () => void;
};

export function ImmersiveMode({ onFallback }: Props) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const xr = navigator.xr;
    if (!xr) {
      setSupported(false);
      return;
    }
    Promise.all([
      xr.isSessionSupported("immersive-vr").catch(() => false),
      xr.isSessionSupported("immersive-ar").catch(() => false),
    ]).then(([vr, ar]) => setSupported(Boolean(vr || ar)));
  }, []);

  const enter = async () => {
    const xr = navigator.xr;
    if (!xr) {
      setMessage("Immersive mode isn't supported on this device.");
      return;
    }
    try {
      const vr = await xr.isSessionSupported("immersive-vr").catch(() => false);
      const ar = await xr.isSessionSupported("immersive-ar").catch(() => false);
      const mode = vr ? "immersive-vr" : ar ? "immersive-ar" : null;
      if (!mode) {
        setMessage("Immersive mode isn't supported on this device.");
        return;
      }
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl", { xrCompatible: true }) as WebGLRenderingContext | null;
      if (!gl) throw new Error("WebGL unavailable");
      const session = await xr.requestSession(mode, { optionalFeatures: ["local-floor"] });
      const layerCtor = window.XRWebGLLayer;
      if (!layerCtor) throw new Error("XR layer unavailable");
      await (gl as WebGLRenderingContext & { makeXRCompatible?: () => Promise<void> }).makeXRCompatible?.();
      session.updateRenderState({ baseLayer: new layerCtor(session, gl) });
      setActive(true);
      session.addEventListener("end", () => setActive(false));
      const onXRFrame: XRFrameRequestCallback = (_time, frame) => {
        session.requestAnimationFrame(onXRFrame);
        const layer = session.renderState.baseLayer;
        if (!layer) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
        const pulse = 0.08 + Math.sin(_time / 1800) * 0.04;
        gl.clearColor(0.12 + pulse, 0.08, 0.2 + pulse, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        void frame;
      };
      session.requestAnimationFrame(onXRFrame);
    } catch {
      setMessage("Immersive mode isn't supported on this device.");
    }
  };

  return (
    <div className="immersive-wrap">
      <button type="button" className="mindful-pill" onClick={enter} disabled={supported === false}>
        Enter Immersive Mode
      </button>
      {supported === false && (
        <p className="mindful-fineprint">Immersive mode isn&apos;t supported on this device.</p>
      )}
      {message && (
        <div className="mindful-inline-actions">
          <p className="mindful-fineprint">{message}</p>
          <button type="button" className="mindful-ghost" onClick={onFallback}>
            Continue in Camera Mode
          </button>
        </div>
      )}
      {active && <p className="mindful-fineprint">Immersive session active. End it from your headset.</p>}
    </div>
  );
}
