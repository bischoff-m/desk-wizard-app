import { ScreenInfo } from "../../types";
import { CanvasProgram } from "../CanvasProgram";
import { SpanningControl } from "../control/ProgramControl";
import { ProgramState } from "../state/ProgramState";
import { CanvasProvider } from "./CanvasProvider";

export class SpanningCanvasProvider extends CanvasProvider {
  override sharedState: ProgramState;
  public control: SpanningControl<any>;

  constructor(
    override program: CanvasProgram<any, "spanning">,
    public canvas: HTMLCanvasElement,
    public screens: ScreenInfo[]
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
    this.control = program.createControl(canvas, this.sharedState, screens);

    // Start animation
    this.sharedState.start(() => {
      this.control.fullUpdate();
    });
  }
}
