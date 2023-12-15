import Victor from "victor";
import { Dimensions, Screen, screens } from "../types";
import { CanvasControl, ScreenTransform } from "./CanvasControl";

export type ControlFactory = (
  canvas: HTMLCanvasElement,
  requestUpdate: () => void
) => CanvasControl;

const highestDpiScale = screens.reduce((acc, screen) => {
  const dpi = screen.screenSize.w / screen.physicalSize.w;
  return dpi > acc ? dpi : acc;
}, 0);

function getScreenScale(screen: Screen) {
  const dpi = screen.screenSize.w / screen.physicalSize.w;
  return highestDpiScale / dpi;
}

export abstract class CanvasProvider {
  abstract size: Dimensions;

  constructor(public createControl: ControlFactory) {}

  public abstract destroy(): void;
}

export class SingleCanvasProvider extends CanvasProvider {
  size: Dimensions;
  control: CanvasControl | null = null;

  constructor(
    public createControl: ControlFactory,
    public canvas: HTMLCanvasElement
  ) {
    super(createControl);
    this.size = {
      w: canvas.width,
      h: canvas.height,
    };
    const requestUpdate = () => {
      requestAnimationFrame((time) => {
        if (!this.control) return;
        this.control.fullUpdate(time);
      });
    };
    this.control = createControl(canvas, requestUpdate);
    this.control.setTransform({
      translate: new Victor(0, 0),
      scale: new Victor(1, 1),
      size: this.size,
      coordinates: [
        {
          x: 0,
          y: 0,
          w: this.size.w,
          h: this.size.h,
        },
      ],
    });

    this.control.start();
  }

  destroy(): void {
    if (!this.control) return;
    this.control.stop();
  }
}

export class MultiCanvasProvider extends CanvasProvider {
  controls: CanvasControl[] = [];
  size: Dimensions;
  coordinates: (Dimensions & { x: number; y: number })[] = [];

  constructor(
    public createControl: ControlFactory,
    public screens: Screen[],
    public canvasRefs: React.MutableRefObject<HTMLCanvasElement[]>
  ) {
    super(createControl);

    // Calculate size
    this.size = {
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

    // Calculate coordinates
    this.coordinates = [];
    let currentX = 0;
    for (let idx = 0; idx < screens.length; idx++) {
      const screen = screens[idx];
      const screenToCanvas = getScreenScale(screen);

      this.coordinates.push({
        x: currentX + screen.canvasOffset.x,
        y:
          (this.size.h - screen.screenSize.h * screenToCanvas) / 2 +
          screen.canvasOffset.y,
        w: screen.screenSize.w * screenToCanvas,
        h: screen.screenSize.h * screenToCanvas,
      });

      currentX += screen.screenSize.w * screenToCanvas + screen.canvasOffset.x;
    }

    // Initialize controls
    for (let idx = 0; idx < this.canvasRefs.current.length; idx++) {
      const canvas = this.canvasRefs.current[idx];
      const screenScale = getScreenScale(screens[idx]);

      const control = createControl(canvas, () => {
        // Trigger update only on the current control
        requestAnimationFrame((time) => {
          if (!this.controls[idx]) return;
          this.controls[idx].fullUpdate(time);
        });
        // TODO
        // Trigger update on all controls
        // How do I synchronize the different controls?
        // If there is shared state, all controls should be updated
        //
        // for (const control of this.controls) {
        //   requestAnimationFrame((time) => {
        //     if (!control) return;
        //     control.fullUpdate(time, {
        //       size: this.size,
        //       coordinates: this.coordinates,
        //     });
        //   });
        // }
      });
      control.setTransform({
        translate: new Victor(
          -this.coordinates[idx].x,
          -this.coordinates[idx].y
        ),
        scale: new Victor(1 / screenScale, 1 / screenScale),
        size: this.size,
        coordinates: this.coordinates,
      });

      this.controls.push(control);
    }
    // Trigger update on all controls
    for (const control of this.controls) control.start();
  }

  destroy(): void {
    for (const control of this.controls) control.stop();
  }
}
