import { Rect, ScreenInfo } from "../types";

export const RESOLUTION = 1;

export function mergeRects(rects: Rect[]): Rect {
    const minX = Math.min(...rects.map((r) => r.x));
    const minY = Math.min(...rects.map((r) => r.y));
    const maxX = Math.max(...rects.map((r) => r.x + r.w));
    const maxY = Math.max(...rects.map((r) => r.y + r.h));
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function loadScreens(): ScreenInfo[] {
    const partialScreenInfo = [
        {
            realSize: { w: 1920, h: 1080 },
            diagonalInches: 27,
            virtualOffset: { x: 0, y: 460 },
            boundingRect: { x: 0, y: 388 * 1.25, w: 1920, h: 1080 },
            // boundingRect: { x: 0, y: 388, w: 1536, h: 864 },
        },
        {
            realSize: { w: 2560, h: 1440 },
            diagonalInches: 27,
            virtualOffset: { x: 70, y: 450 },
            boundingRect: { x: 1536 * 1.25, y: 249 * 1.25, w: 2560, h: 1440 },
            // boundingRect: { x: 1536, y: 249, w: 2048, h: 1152 },
        },
        {
            realSize: { w: 1200, h: 1920 },
            diagonalInches: 24,
            virtualOffset: { x: 70, y: 0 },
            boundingRect: { x: 3584 * 1.25, y: 0, w: 1200, h: 1920 },
            // boundingRect: { x: 3584, y: 0, w: 960, h: 1536 },
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
            idx === 0 ? 0 : screenInfo[idx - 1].virtual.x + screenInfo[idx - 1].virtual.w;
        const screenToCanvas = maxPixelRatio / getPixelRatio(partialScreen);

        screenInfo.push({
            realSize: {
                w: partialScreen.realSize.w * RESOLUTION,
                h: partialScreen.realSize.h * RESOLUTION,
            },
            virtual: {
                x: partialScreen.virtualOffset.x * RESOLUTION + leftEdge,
                y: partialScreen.virtualOffset.y * RESOLUTION,
                w: partialScreen.realSize.w * screenToCanvas * RESOLUTION,
                h: partialScreen.realSize.h * screenToCanvas * RESOLUTION,
            },
            boundingRect: partialScreen.boundingRect,
            realToVirtualScale: screenToCanvas,
            scaledRect: {
                x: partialScreen.boundingRect.x * RESOLUTION,
                y: partialScreen.boundingRect.y * RESOLUTION,
                w: partialScreen.boundingRect.w * RESOLUTION,
                h: partialScreen.boundingRect.h * RESOLUTION,
            },
        });
    }
    return screenInfo;
}
