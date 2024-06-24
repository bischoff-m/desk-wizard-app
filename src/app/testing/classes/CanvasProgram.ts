import { AnimationSettings, ScreenInfo } from "../types";
import { PerScreenControl, SpanningControl } from "./control/ProgramControl";
import { ProgramState } from "./state/ProgramState";

export type CanvasProgram<
  TState extends ProgramState,
  TPlacement extends "per-screen" | "spanning"
> = {
  placement: TPlacement;
  createState: (screens: ScreenInfo[]) => TState;
  createControl: (
    canvas: HTMLCanvasElement,
    sharedState: TState,
    ...screenIdx: TPlacement extends "per-screen" ? [number] : []
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
      screens: ScreenInfo[],
      animationSettings: AnimationSettings
    ): ProgramState;
  } = ProgramState
): () => CanvasProgram<ProgramState, TPlacement> {
  return () => ({
    placement,
    createState: (screens) => {
      return new stateClass(screens, animationSettings);
    },
    createControl: (canvas, sharedState, ...args) =>
      new controlClass(canvas, sharedState as TState, ...args),
  });
}
