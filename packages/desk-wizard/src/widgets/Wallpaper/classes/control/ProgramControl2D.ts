import { ProgramState } from "../state/ProgramState";
import { PerScreenControl } from "./ProgramControl";

export abstract class ProgramControl2D<
    TState extends ProgramState
> extends PerScreenControl<TState> {
    protected ctx: CanvasRenderingContext2D;

    constructor(
        override canvas: HTMLCanvasElement,
        override sharedState: TState,
        protected screenIdx: number
    ) {
        super(canvas, sharedState, screenIdx);

        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    override beforeDraw(): void {
        const screen = this.sharedState.screens[this.screenIdx];
        this.ctx.save();
        this.ctx.scale(1 / screen.realToVirtualScale, 1 / screen.realToVirtualScale);
        this.ctx.translate(-screen.virtual.x, -screen.virtual.y);
    }

    override afterDraw(): void {
        this.ctx.restore();
    }
}
