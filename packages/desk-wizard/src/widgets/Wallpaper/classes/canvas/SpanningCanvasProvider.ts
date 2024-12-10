import { ScreenInfo } from "../../types";
import { CanvasProgram } from "../CanvasProgram";
import { SpanningControl } from "../control/ProgramControl";
import { ProgramState } from "../state/ProgramState";
import { CanvasProvider } from "./CanvasProvider";

export class SpanningCanvasProvider<
    TState extends ProgramState
> extends CanvasProvider<TState> {
    override sharedState: TState;
    public control: SpanningControl<TState>;

    constructor(
        override program: CanvasProgram<TState, "spanning">,
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
