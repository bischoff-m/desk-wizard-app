import Victor from "victor";
import { Dimensions } from "../types";
import { ProgramState } from "./ProgramState";

export type AnimationSettings = {
  fps: number;
};

export type ScreenTransform = {
  translate: Victor;
  scale: Victor;
};

export type CanvasProgram = {
  createState: (
    sizeInPixel: Dimensions,
    screenLayout: (Dimensions & { x: number; y: number })[]
  ) => ProgramState;
  createControl: (
    canvas: HTMLCanvasElement,
    sharedState: ProgramState,
    transform: ScreenTransform
  ) => ProgramControl;
};

export function createDefaultProgram(
  controlClass: { new (...args: any[]): ProgramControl },
  stateClass?: { new (...args: any[]): ProgramState }
): CanvasProgram {
  return {
    createControl: (...args) => new controlClass(...args),
    createState: (...args) => {
      if (stateClass) return new stateClass(...args);
      // Default to stateless program
      else return new ProgramState(...args);
    },
  };
}

export abstract class ProgramControl {
  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: ProgramState,
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

export abstract class ProgramControl2D extends ProgramControl {
  protected ctx: CanvasRenderingContext2D;

  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: ProgramState,
    protected transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);

    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  beforeDraw(): void {
    const { translate, scale } = this.transform;
    this.ctx.save();
    this.ctx.scale(scale.x, scale.y);
    this.ctx.translate(translate.x, translate.y);
  }

  afterDraw(): void {
    this.ctx.restore();
  }
}

export abstract class WebGLControl extends ProgramControl {
  protected ctx: WebGLRenderingContext;

  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: ProgramState,
    protected transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);
    this.ctx = this.canvas.getContext("webgl") as WebGLRenderingContext;
  }
}
