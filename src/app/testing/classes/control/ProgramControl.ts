import { ScreenInfo } from "../../types";
import { ProgramState } from "../state/ProgramState";

export abstract class ProgramControl<TState extends ProgramState> {
  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: TState
  ) {}

  protected abstract draw(): void;

  protected beforeDraw(): void {}
  protected afterDraw(): void {}
  public fullUpdate(): void {
    this.beforeDraw();
    this.draw();
    this.afterDraw();
  }
}

export abstract class PerScreenControl<
  TState extends ProgramState
> extends ProgramControl<TState> {
  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: TState,
    protected screenIdx: number
  ) {
    super(canvas, sharedState);
  }
}

export abstract class SpanningControl<
  TState extends ProgramState
> extends ProgramControl<TState> {
  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: TState
  ) {
    super(canvas, sharedState);
  }
}
