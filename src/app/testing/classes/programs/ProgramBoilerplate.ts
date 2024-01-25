import { AnimationSettings, ScreenInfo, ScreenLayout } from "../../types";
import { CanvasProgram } from "../CanvasProgram";
import { ProgramControl2D } from "../control/ProgramControl2D";
import { ProgramState } from "../state/ProgramState";

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
    override screen: ScreenInfo
  ) {
    super(canvas, sharedState, screen);
  }

  override draw(): void {}
}

export const MyProgram = {
  // You can also use `createDefaultProgram` if neither state nor control need parameters
  create: (): CanvasProgram<MyState, "per-screen"> => ({
    createState: (screenLayout: ScreenLayout) =>
      new MyState(screenLayout, { animate: false }),
    createControl: (
      canvas: HTMLCanvasElement,
      state: MyState,
      screen: ScreenInfo
    ) => new MyControl(canvas, state, screen),
    placement: "per-screen",
  }),
};
