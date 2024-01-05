import Victor from "victor";
import { Screen } from "../types";
import { CanvasProgram, ProgramControl } from "./ProgramControl";
import { ProgramState } from "./ProgramState";

export abstract class CanvasProvider {
  public abstract sharedState: ProgramState;

  constructor(public program: CanvasProgram) {}

  public destroy(): void {
    this.sharedState.stop();
  }
}

export class SingleCanvasProvider extends CanvasProvider {
  public control: ProgramControl;
  public sharedState: ProgramState;

  constructor(public program: CanvasProgram, public canvas: HTMLCanvasElement) {
    super(program);
    const size = {
      w: canvas.width,
      h: canvas.height,
    };

    // Initialize state
    this.sharedState = program.createState(size, [
      {
        x: 0,
        y: 0,
        w: size.w,
        h: size.h,
      },
    ]);

    // Initialize control
    this.control = program.createControl(canvas, this.sharedState, {
      translate: new Victor(0, 0),
      scale: new Victor(1, 1),
    });

    // Start animation
    this.sharedState.start(() => {
      this.control.fullUpdate();
    });
  }
}

export class MultiCanvasProvider extends CanvasProvider {
  public controls: ProgramControl[];
  public sharedState: ProgramState;

  constructor(
    public program: CanvasProgram,
    public screens: Screen[],
    public canvasRefs: React.MutableRefObject<HTMLCanvasElement[]>
  ) {
    super(program);

    const highestDpiScale = screens.reduce((acc, screen) => {
      const dpi = screen.screenSize.w / screen.physicalSize.w;
      return dpi > acc ? dpi : acc;
    }, 0);

    const getScreenScale = (screen: Screen) => {
      const dpi = screen.screenSize.w / screen.physicalSize.w;
      return highestDpiScale / dpi;
    };

    // Calculate size
    const size = {
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
    const coordinates = [];
    let currentX = 0;
    for (let idx = 0; idx < screens.length; idx++) {
      const screen = screens[idx];
      const screenToCanvas = getScreenScale(screen);

      coordinates.push({
        x: currentX + screen.canvasOffset.x,
        y:
          (size.h - screen.screenSize.h * screenToCanvas) / 2 +
          screen.canvasOffset.y,
        w: screen.screenSize.w * screenToCanvas,
        h: screen.screenSize.h * screenToCanvas,
      });

      currentX += screen.screenSize.w * screenToCanvas + screen.canvasOffset.x;
    }

    // Initialize state
    this.sharedState = program.createState(size, coordinates);

    // Initialize controls
    this.controls = [];
    for (let idx = 0; idx < this.canvasRefs.current.length; idx++) {
      const canvas = this.canvasRefs.current[idx];
      const screenScale = getScreenScale(screens[idx]);
      const transform = {
        translate: new Victor(-coordinates[idx].x, -coordinates[idx].y),
        scale: new Victor(1 / screenScale, 1 / screenScale),
      };

      this.controls.push(
        program.createControl(canvas, this.sharedState, transform)
      );
    }

    // Start animation
    this.sharedState.start(() => {
      for (const control of this.controls) control.fullUpdate();
    });
  }
}
