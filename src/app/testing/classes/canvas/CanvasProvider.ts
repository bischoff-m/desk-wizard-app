import { ProgramState } from "../state/ProgramState";
import { CanvasProgram } from "../CanvasProgram";

export abstract class CanvasProvider {
  public abstract sharedState: ProgramState;

  constructor(public program: CanvasProgram<any, any>) {}

  public destroy(): void {
    // Stop animation if it's running
    this.sharedState.stop();
  }
}
