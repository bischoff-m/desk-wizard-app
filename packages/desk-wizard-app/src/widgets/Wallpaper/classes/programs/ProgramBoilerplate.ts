import { AnimationSettings, ScreenInfo } from "../../types";
import { CanvasProgram } from "../CanvasProgram";
import { ProgramControl2D } from "../control/ProgramControl2D";
import { ProgramState } from "../state/ProgramState";

class MyState extends ProgramState {
  constructor(
    override screens: ScreenInfo[],
    override animationSettings: AnimationSettings,
  ) {
    super(screens, animationSettings);
  }

  override updateShared(): void {}
}

class MyControl extends ProgramControl2D<MyState> {
  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: MyState,
    override screenIdx: number,
  ) {
    super(canvas, sharedState, screenIdx);
  }

  override draw(): void {}
}

/**
 * Benchmark:
 * - (tested in Vivaldi)
 * - (60 FPS, full resolution)
 * - Total pixel count: 8064000
 * - FPS: ?
 * - Total delta time: ? ms
 * - State delta time: ? ms
 * - Control delta time: ? ms
 * - GPU Usage: ?%
 */
export const MyProgram = {
  create: (): CanvasProgram<MyState, "per-screen"> => ({
    createState: (screens: ScreenInfo[]) => new MyState(screens, { animate: false }),
    createControl: (canvas: HTMLCanvasElement, state: MyState, screenIdx: number) =>
      new MyControl(canvas, state, screenIdx),
    placement: "per-screen",
  }),
  // ALTERANTIVE:
  // You can also use `createDefaultProgram` if neither state nor control need parameters
  //   create: createDefaultProgram(
  //     "per-screen",
  //     { animate: true, fps: 60 },
  //     MyControl,
  //     MyState
  //   ),
};
