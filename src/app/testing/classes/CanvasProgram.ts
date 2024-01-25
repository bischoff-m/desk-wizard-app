import { AnimationSettings, ScreenInfo, ScreenLayout } from "../types";
import { PerScreenControl, SpanningControl } from "./control/ProgramControl";
import { ProgramState } from "./state/ProgramState";

export type CanvasProgram<
  TState extends ProgramState,
  TPlacement extends "per-screen" | "spanning"
> = {
  placement: TPlacement;
  createState: (screenLayout: ScreenLayout) => ProgramState;
  createControl: (
    canvas: HTMLCanvasElement,
    sharedState: TState,
    screens: TPlacement extends "per-screen" ? ScreenInfo : ScreenInfo[]
  ) => TPlacement extends "per-screen"
    ? PerScreenControl<TState>
    : SpanningControl<TState>;
};

export function createDefaultProgram<
  TState extends ProgramState,
  TPlacement extends "per-screen" | "spanning"
>(
  placement: TPlacement,
  animationSettings: AnimationSettings,
  controlClass: {
    new (
      ...args: Parameters<CanvasProgram<TState, TPlacement>["createControl"]>
    ): ReturnType<CanvasProgram<TState, TPlacement>["createControl"]>;
  },
  stateClass: {
    new (
      screenLayout: ScreenLayout,
      animationSettings: AnimationSettings
    ): ProgramState;
  } = ProgramState
): () => CanvasProgram<ProgramState, TPlacement> {
  return () => ({
    placement,
    createState: (screenLayout) => {
      return new stateClass(screenLayout, animationSettings);
    },
    createControl: (canvas, sharedState, screen) =>
      new controlClass(canvas, sharedState as TState, screen),
  });
}
