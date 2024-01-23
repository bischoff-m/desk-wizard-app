import {
  AnimationSettings,
  ScreenLayout,
  ScreenTransform,
} from "../../../types";
import { CanvasProgram } from "../CanvasProgram";
import { ProgramControl2D } from "../control/ProgramControl2D";
import { ProgramState } from "../ProgramState";

class MyState extends ProgramState {
  constructor(
    public screenLayout: ScreenLayout,
    protected animationSettings: AnimationSettings
  ) {
    super(screenLayout, animationSettings);
  }

  protected updateShared(): void {}
}

class MyControl extends ProgramControl2D<MyState> {
  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: MyState,
    protected transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);
  }

  draw(): void {
    this.sharedState.requestUpdate();
  }
}

export const MyProgram = {
  // You can also use `createDefaultProgram` if neither state nor control need parameters
  create: (): CanvasProgram<MyState> => ({
    createState: (screenLayout: ScreenLayout) =>
      new MyState(screenLayout, { animate: false }),
    createControl: (
      canvas: HTMLCanvasElement,
      state: MyState,
      transform: ScreenTransform
    ) => new MyControl(canvas, state, transform),
    canvasPlacement: "per-screen",
  }),
};
