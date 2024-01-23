import { ScreenTransform } from "../../types";
import { ProgramState } from "../ProgramState";

export abstract class ProgramControl<
  TState extends ProgramState = ProgramState
> {
  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: TState,
    protected transform: ScreenTransform
  ) {}

  abstract draw(): void;

  protected beforeDraw(): void {}
  protected afterDraw(): void {}
  fullUpdate(): void {
    this.beforeDraw();
    this.draw();
    this.afterDraw();
  }
}
