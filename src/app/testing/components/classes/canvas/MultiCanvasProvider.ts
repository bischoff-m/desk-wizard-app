import Victor from "victor";
import { Screen } from "../../../types";
import { CanvasProgram } from "../CanvasProgram";
import { ProgramControl } from "../control/ProgramControl";
import { CanvasProvider } from "./CanvasProvider";

export class MultiCanvasProvider extends CanvasProvider {
  public controls: ProgramControl<any>[];
  public sharedState: any;

  constructor(
    public program: CanvasProgram<any>,
    public screens: Screen[],
    public canvasElements: HTMLCanvasElement[]
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
    this.sharedState = program.createState(coordinates);

    // Initialize controls
    this.controls = [];
    for (let idx = 0; idx < this.canvasElements.length; idx++) {
      const canvas = this.canvasElements[idx];
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
