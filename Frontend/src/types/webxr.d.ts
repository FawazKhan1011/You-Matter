interface XRWebGLLayerInit {
  antialias?: boolean;
  depth?: boolean;
  stencil?: boolean;
  alpha?: boolean;
  framebufferScaleFactor?: number;
}

interface XRRenderStateInit {
  baseLayer?: XRWebGLLayer | null;
  depthFar?: number;
  depthNear?: number;
  inlineVerticalFieldOfView?: number;
}

interface XRRenderState {
  baseLayer: XRWebGLLayer | null;
}

interface XRWebGLLayer {
  framebuffer: WebGLFramebuffer | null;
  framebufferWidth: number;
  framebufferHeight: number;
}

interface XRWebGLLayerConstructor {
  new (session: XRSession, context: WebGLRenderingContext | WebGL2RenderingContext, layerInit?: XRWebGLLayerInit): XRWebGLLayer;
}

interface XRFrame {
  session: XRSession;
}

type XRFrameRequestCallback = (time: number, frame: XRFrame) => void;

interface XRSession extends EventTarget {
  renderState: XRRenderState;
  requestAnimationFrame(callback: XRFrameRequestCallback): number;
  cancelAnimationFrame(handle: number): void;
  updateRenderState(state: XRRenderStateInit): void;
  end(): Promise<void>;
}

interface XRSystem {
  isSessionSupported(mode: string): Promise<boolean>;
  requestSession(mode: string, options?: { optionalFeatures?: string[] }): Promise<XRSession>;
}

interface Navigator {
  xr?: XRSystem;
}

interface Window {
  XRWebGLLayer?: XRWebGLLayerConstructor;
}

interface WebGLRenderingContext {
  makeXRCompatible?: () => Promise<void>;
}
