import { ProgramState } from "../ProgramState";
import { CanvasProgram } from "../CanvasProgram";

export abstract class CanvasProvider {
  public abstract sharedState: ProgramState;

  constructor(public program: CanvasProgram<any>) {}

  public destroy(): void {
    // Stop animation if it's running
    this.sharedState.stop();
  }
}
