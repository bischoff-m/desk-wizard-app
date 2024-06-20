import { ScreenInfo } from "../../types";
import { CanvasProgram } from "../CanvasProgram";
import { ProgramControl } from "../control/ProgramControl";
import { ProgramState } from "../state/ProgramState";
import { CanvasProvider } from "./CanvasProvider";

export class PerScreenCanvasProvider extends CanvasProvider {
  override sharedState: ProgramState;
  public controls: ProgramControl<ProgramState>[];

  constructor(
    override program: CanvasProgram<ProgramState, "per-screen">,
    public canvasElements: HTMLCanvasElement[],
    public screens: ScreenInfo[]
  ) {
    super(program);

    if (screens.length !== canvasElements.length)
      throw new Error("screens and canvasElements must have the same length");

    // Initialize state
    this.sharedState = program.createState(screens);

    // Initialize controls
    this.controls = screens.map((screen, idx) =>
      program.createControl(canvasElements[idx], this.sharedState, idx)
    );

    // Start animation
    this.sharedState.start(() => {
      for (const control of this.controls) control.fullUpdate();
    });
  }
}
