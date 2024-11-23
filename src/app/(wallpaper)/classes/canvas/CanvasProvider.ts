import { ProgramState } from "../state/ProgramState";
import { CanvasProgram } from "../CanvasProgram";

export abstract class CanvasProvider<TState extends ProgramState> {
    public abstract sharedState: TState;

    constructor(public program: CanvasProgram<TState, any>) {}

    public destroy(): void {
        // Stop animation if it's running
        this.sharedState.stop();
    }
}
