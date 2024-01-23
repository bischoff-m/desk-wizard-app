import { ScreenTransform } from "../../types";
import { ProgramState } from "../ProgramState";
import { ProgramControl } from "./ProgramControl";

export abstract class ProgramControl2D<
  TState extends ProgramState
> extends ProgramControl<TState> {
  protected ctx: CanvasRenderingContext2D;

  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: TState,
    override transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);

    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  override beforeDraw(): void {
    const { translate, scale } = this.transform;
    this.ctx.save();
    this.ctx.scale(scale.x, scale.y);
    this.ctx.translate(translate.x, translate.y);
  }

  override afterDraw(): void {
    this.ctx.restore();
  }
}
