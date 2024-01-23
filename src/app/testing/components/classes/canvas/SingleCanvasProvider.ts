import Victor from "victor";
import { ProgramState } from "../ProgramState";
import { ProgramControl } from "../control/ProgramControl";
import { CanvasProvider } from "./CanvasProvider";
import { CanvasProgram } from "../CanvasProgram";

export class SingleCanvasProvider extends CanvasProvider {
  public control: ProgramControl<any>;
  public sharedState: ProgramState;

  constructor(
    public program: CanvasProgram<any>,
    public canvas: HTMLCanvasElement
  ) {
    super(program);

    // Initialize state
    this.sharedState = program.createState([
      {
        x: 0,
        y: 0,
        w: canvas.width,
        h: canvas.height,
      },
    ]);
    // this.sharedState = program.createState(size, [
    //   {
    //     x: 0,
    //     y: 0,
    //     w: size.w,
    //     h: size.h,
    //   },
    // ]);

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
