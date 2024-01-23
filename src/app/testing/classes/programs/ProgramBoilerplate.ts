import { AnimationSettings, ScreenLayout, ScreenTransform } from "../../types";
import { CanvasProgram } from "../CanvasProgram";
import { ProgramControl2D } from "../control/ProgramControl2D";
import { ProgramState } from "../ProgramState";

class MyState extends ProgramState {
  constructor(
    override screenLayout: ScreenLayout,
    override animationSettings: AnimationSettings
  ) {
    super(screenLayout, animationSettings);
  }

  override updateShared(): void {}
}

class MyControl extends ProgramControl2D<MyState> {
  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: MyState,
    override transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);
  }

  override draw(): void {}
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
