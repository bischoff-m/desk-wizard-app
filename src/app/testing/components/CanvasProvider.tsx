import { Dimensions, Screen, screens } from "../types";
import Victor from "victor";

const highestDpiScale = screens.reduce((acc, screen) => {
  const dpi = screen.screenSize.w / screen.physicalSize.w;
  return dpi > acc ? dpi : acc;
}, 0);

function getScreenScale(screen: Screen) {
  const dpi = screen.screenSize.w / screen.physicalSize.w;
  return highestDpiScale / dpi;
}

export class CanvasContent {
  constructor() {}
  draw(ctx: CanvasRenderingContext2D) {}
  update() {}
}

export abstract class CanvasProvider {
  abstract apply(drawMethod: (ctx: CanvasRenderingContext2D) => void): void;

  abstract size(): Dimensions;

  // All corner points in clockwise order (not normalized)
  abstract boundingPolygon(): Victor[];
}

export class SingleCanvasProvider extends CanvasProvider {
  constructor(public canvas: HTMLCanvasElement) {
    super();
  }

  apply(drawMethod: (ctx: CanvasRenderingContext2D) => void) {
    const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    drawMethod(ctx);
  }

  size() {
    return {
      w: this.canvas.width,
      h: this.canvas.height,
    };
  }

  boundingPolygon() {
    return [
      new Victor(0, 0),
      new Victor(this.canvas.width, 0),
      new Victor(this.canvas.width, this.canvas.height),
      new Victor(0, this.canvas.height),
    ];
  }
}

export class MultiCanvasProvider extends CanvasProvider {
  coordinates: (Dimensions & { x: number; y: number })[] = [];
  emulatedCanvasSize: Dimensions;

  constructor(
    public screens: Screen[],
    public canvasRefs: React.MutableRefObject<HTMLCanvasElement[]>
  ) {
    super();
    this.emulatedCanvasSize = {
      w: screens.reduce((acc, screen) => {
        return (
          acc +
          screen.screenSize.w * getScreenScale(screen) +
          screen.canvasOffset.x
        );
      }, 0),
      h: screens.reduce((acc, screen) => {
        return Math.max(
          acc,
          screen.screenSize.h * getScreenScale(screen) + screen.canvasOffset.y
        );
      }, 0),
    };

    this.coordinates = [];
    let currentX = 0;
    for (let idx = 0; idx < screens.length; idx++) {
      const screen = screens[idx];
      const screenToCanvas = getScreenScale(screen);

      // const pageToScreenScale = screen.screenSize.w / screen.pageSize.w;
      // const pageOriginY = screen.pageSize.topLeft[1] + screen.pageSize.h / 2;
      // const screenOriginY = pageOriginY * pageToScreenScale;

      this.coordinates.push({
        x: currentX + screen.canvasOffset.x,
        y:
          (this.emulatedCanvasSize.h - screen.screenSize.h * screenToCanvas) /
            2 +
          screen.canvasOffset.y,
        w: screen.screenSize.w * screenToCanvas,
        h: screen.screenSize.h * screenToCanvas,
      });

      currentX += screen.screenSize.w * screenToCanvas + screen.canvasOffset.x;
    }
  }

  apply(drawMethod: (ctx: CanvasRenderingContext2D) => void) {
    for (let idx = 0; idx < this.canvasRefs.current.length; idx++) {
      const canvas = this.canvasRefs.current[idx];
      const coord = this.coordinates[idx];
      const screenScale = getScreenScale(screens[idx]);
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      ctx.save();
      ctx.scale(1 / screenScale, 1 / screenScale);
      ctx.translate(-coord.x, -coord.y);

      drawMethod(ctx);

      ctx.restore();
    }
  }

  size() {
    return this.emulatedCanvasSize;
  }

  boundingPolygon() {
    const polygon: Victor[] = [];
    for (const screen of this.coordinates) {
      polygon.push(new Victor(screen.x, screen.y));
      polygon.push(new Victor(screen.x + screen.w, screen.y));
    }
    for (const screen of this.coordinates.toReversed()) {
      polygon.push(new Victor(screen.x + screen.w, screen.y + screen.h));
      polygon.push(new Victor(screen.x, screen.y + screen.h));
    }
    return polygon;
  }
}
