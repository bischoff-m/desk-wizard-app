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

    // Initialize state
    this.sharedState = program.createState(screens);

    // Initialize control
    this.control = program.createControl(canvas, this.sharedState);

    // Start animation
    this.sharedState.start(() => {
      this.control.fullUpdate();
    });
  }
}
