import Victor from "victor";
import { Screen } from "../../types";
import { CanvasProgram } from "../CanvasProgram";
import { ProgramState } from "../ProgramState";
import { ProgramControl } from "../control/ProgramControl";
import { CanvasProvider } from "./CanvasProvider";

export class SpanningCanvasProvider extends CanvasProvider {
  override sharedState: ProgramState;
  public control: ProgramControl<any>;

  constructor(
    public program: CanvasProgram<any>,
    public canvas: HTMLCanvasElement
  ) {
    super(program);

    const screenLayout = [
      {
        x: 0,
        y: 0,
        w: canvas.width,
        h: canvas.height,
      },
    ];

    // Initialize state
    this.sharedState = program.createState(screenLayout);

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
