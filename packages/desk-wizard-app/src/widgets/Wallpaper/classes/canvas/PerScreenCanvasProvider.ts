import { ScreenInfo } from "../../types";
import { CanvasProgram } from "../CanvasProgram";
import { ProgramControl } from "../control/ProgramControl";
import { ProgramState } from "../state/ProgramState";
import { CanvasProvider } from "./CanvasProvider";

export class PerScreenCanvasProvider<
  TState extends ProgramState,
> extends CanvasProvider<TState> {
  override sharedState: TState;
  public controls: ProgramControl<TState>[];

  constructor(
    override program: CanvasProgram<TState, "per-screen">,
    public canvasElements: HTMLCanvasElement[],
    public screens: ScreenInfo[],
  ) {
    super(program);

    if (screens.length !== canvasElements.length)
      throw new Error("screens and canvasElements must have the same length");

    // Initialize state
    this.sharedState = program.createState(screens);

    // Initialize controls
    this.controls = screens.map((_screen, idx) =>
      program.createControl(canvasElements[idx], this.sharedState, idx),
    );

    // Start animation
    this.sharedState.start(() => {
      for (const control of this.controls) control.fullUpdate();
    });
  }
}
