import { Dimensions, ScreenLayout, ScreenTransform } from "../../types";
import { ProgramControl2D } from "../ProgramControl";
import { ProgramState } from "../ProgramState";

class MyState extends ProgramState {
  constructor(
    public sizeInPixel: Dimensions,
    public screenLayout: ScreenLayout
  ) {
    super(sizeInPixel, screenLayout, { fps: 60 });
  }

  protected updateShared(): void {}
}

class MyControl extends ProgramControl2D {
  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: ProgramState,
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
  create: () => ({
    createState: (sizeInPixel: Dimensions, screenLayout: ScreenLayout) =>
      new MyState(sizeInPixel, screenLayout),
    createControl: (
      canvas: HTMLCanvasElement,
      state: ProgramState,
      transform: ScreenTransform
    ) => new MyControl(canvas, state, transform),
  }),
};
