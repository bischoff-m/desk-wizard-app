import { ScreenInfo } from "../types";

export function loadScreens(): ScreenInfo[] {
  const partialScreenInfo = [
    {
      realSize: { w: 1920, h: 1080 },
      diagonalInches: 27,
      virtualOffset: { x: 0, y: 530 },
      boundingRect: { x: 0, y: 388, w: 1536, h: 864 },
    },
    {
      realSize: { w: 2560, h: 1440 },
      diagonalInches: 27,
      virtualOffset: { x: 80, y: 590 },
      boundingRect: { x: 1536, y: 249, w: 2048, h: 1152 },
    },
    {
      realSize: { w: 1200, h: 1920 },
      diagonalInches: 24,
      virtualOffset: { x: 80, y: 0 },
      boundingRect: { x: 3584, y: 0, w: 960, h: 1536 },
    },
  ];

  const getPixelRatio = (screen: (typeof partialScreenInfo)[0]) =>
    Math.sqrt(screen.realSize.w ** 2 + screen.realSize.h ** 2) /
    screen.diagonalInches;

  const maxPixelRatio = Math.max(...partialScreenInfo.map(getPixelRatio));

  const screenInfo: ScreenInfo[] = [];
  for (let idx = 0; idx < partialScreenInfo.length; idx++) {
    const partialScreen = partialScreenInfo[idx];
    const leftEdge: number =
      idx === 0
        ? 0
        : screenInfo[idx - 1].virtual.x + screenInfo[idx - 1].virtual.w;
    const screenToCanvas = maxPixelRatio / getPixelRatio(partialScreen);

    screenInfo.push({
      realSize: partialScreen.realSize,
      virtual: {
        x: partialScreen.virtualOffset.x + leftEdge,
        y: partialScreen.virtualOffset.y,
        w: partialScreen.realSize.w * screenToCanvas,
        h: partialScreen.realSize.h * screenToCanvas,
      },
      boundingRect: partialScreen.boundingRect,
      realToVirtualScale: screenToCanvas,
    });
  }
  return screenInfo;
}
