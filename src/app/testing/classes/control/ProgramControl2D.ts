import { ScreenInfo } from "../../types";
import { ProgramState } from "../state/ProgramState";
import { PerScreenControl } from "./ProgramControl";

export abstract class ProgramControl2D<
  TState extends ProgramState
> extends PerScreenControl<TState> {
  protected ctx: CanvasRenderingContext2D;

  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: TState,
    protected screen: ScreenInfo
  ) {
    super(canvas, sharedState, screen);

    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  override beforeDraw(): void {
    this.ctx.save();
    this.ctx.scale(
      1 / this.screen.physicalToVirtualScale,
      1 / this.screen.physicalToVirtualScale
    );
    this.ctx.translate(-this.screen.virtual.x, -this.screen.virtual.y);
  }

  override afterDraw(): void {
    this.ctx.restore();
  }
}
