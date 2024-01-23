import { ScreenTransform, AnimationSettings, ScreenLayout } from "../types";
import { ProgramState } from "./ProgramState";
import { ProgramControl } from "./control/ProgramControl";

export type CanvasProgram<TState extends ProgramState> = {
  createState: (screenLayout: ScreenLayout) => TState;
  createControl: (
    canvas: HTMLCanvasElement,
    sharedState: TState,
    transform: ScreenTransform
  ) => ProgramControl<TState>;
  canvasPlacement: "per-screen" | "spanning";
};

export function createDefaultProgram<TState extends ProgramState>(
  canvasPlacement: CanvasProgram<TState>["canvasPlacement"],
  animationSettings: AnimationSettings,
  controlClass: {
    new (...args: any[]): ProgramControl<TState>;
  },
  stateClass: {
    new (screenLayout: ScreenLayout, ...args: any[]): ProgramState;
  } = ProgramState
): () => CanvasProgram<ProgramState> {
  return () => ({
    createState: (screenLayout) => {
      return new stateClass(screenLayout, animationSettings);
    },
    createControl: (canvas, sharedState, transform) =>
      new controlClass(canvas, sharedState, transform),
    canvasPlacement: canvasPlacement,
  });
}
