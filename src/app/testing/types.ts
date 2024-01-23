import Victor from "victor";

export type Dimensions = {
  w: number;
  h: number;
};

export type Screen = {
  screenSize: Dimensions;
  canvasOffset: Victor;
  physicalSize: Dimensions & { sizeInches: number };
  pageSize: Dimensions & { topLeft: Victor };
};

export const screens: Screen[] = [
  {
    screenSize: { w: 1920, h: 1080 },
    canvasOffset: new Victor(0, 140),
    physicalSize: { w: 0.5977264, h: 0.3362211, sizeInches: 27 },
    pageSize: { w: 1536, h: 864, topLeft: new Victor(0, 388) },
  },
  {
    screenSize: { w: 2560, h: 1440 },
    canvasOffset: new Victor(80, 200),
    physicalSize: { w: 0.5977264, h: 0.3362211, sizeInches: 27 },
    pageSize: { w: 2048, h: 1152, topLeft: new Victor(1536, 249) },
  },
  {
    screenSize: { w: 1200, h: 1920 },
    canvasOffset: new Victor(80, 0),
    physicalSize: { w: 0.324, h: 0.5184, sizeInches: 24 },
    pageSize: { w: 960, h: 1536, topLeft: new Victor(3584, 0) },
  },
];

export type AnimationSettings = {
  animate: boolean;
  fps?: number;
};

export type ScreenTransform = {
  translate: Victor;
  scale: Victor;
};

export type ScreenRect = Dimensions & { x: number; y: number };
export type ScreenLayout = ScreenRect[];

// TODO: Maybe use this to unify with WebGLCanvasProvider
// export type ScreenLayout = {physical: ScreenRect, emulated: ScreenRect}[];
