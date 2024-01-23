import { ScreenTransform } from "../../types";
import { ProgramState } from "../ProgramState";

export abstract class ProgramControl<TState extends ProgramState> {
  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: TState,
    protected transform: ScreenTransform
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
