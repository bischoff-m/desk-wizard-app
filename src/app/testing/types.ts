export type Vector2D = {
  x: number;
  y: number;
};

export type Size = {
  w: number;
  h: number;
};

export type AnimationSettings = {
  animate: boolean;
  fps?: number;
};

export type Rect = Size & Vector2D;

export type ScreenInfo = {
  realSize: Size;
  virtual: Rect;
  // This is set manually
  boundingRect: Rect;
  realToVirtualScale: number;
};

export type DisplayTimings = {
  timestamp: DOMHighResTimeStamp;
  fps: number;
  totalDelta: number;
  stateDelta: number;
  controlDelta: number;
};
