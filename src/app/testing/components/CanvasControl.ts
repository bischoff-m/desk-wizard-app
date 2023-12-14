import Victor from "victor";
import { Dimensions } from "../types";

export type AnimationSettings = {
  fps: number;
};

export type ScreenTransform = {
  translate: Victor;
  scale: Victor;
  size: Dimensions;
  coordinates: (Dimensions & { x: number; y: number })[];
};

export abstract class CanvasControl {
  protected abstract ctx: RenderingContext;
  protected abstract transform: ScreenTransform | null;
  // TODO: Implement animation
  public readonly animationSettings: AnimationSettings | null = null;

  // NOTE: requestUpdate should not be called recursively, it is only intended for event
  // based updates. To do interval based updates, override the animationSettings property.
  constructor(
    public canvas: HTMLCanvasElement,
    public requestUpdate: () => void
  ) {}

  abstract update(time: DOMHighResTimeStamp): void;
  abstract setTransform(transform: ScreenTransform): void;

  protected beforeUpdate(): void {}
  protected afterUpdate(): void {}
  fullUpdate(time: DOMHighResTimeStamp): void {
    this.beforeUpdate();
    this.update(time);
    this.afterUpdate();
  }
}

export abstract class CanvasControl2D extends CanvasControl {
  protected ctx: CanvasRenderingContext2D;
  protected transform: ScreenTransform | null = null;

  constructor(
    public canvas: HTMLCanvasElement,
    public requestUpdate: () => void
  ) {
    super(canvas, requestUpdate);
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  beforeUpdate(): void {
    if (!this.ctx || !this.transform) return;
    const { translate, scale } = this.transform;
    this.ctx.save();
    this.ctx.scale(scale.x, scale.y);
    this.ctx.translate(translate.x, translate.y);
  }

  afterUpdate(): void {
    if (!this.ctx) return;
    this.ctx.restore();
  }

  setTransform(transform: ScreenTransform): void {
    this.transform = transform;
  }
}

export abstract class WebGLControl extends CanvasControl {
  protected ctx: WebGLRenderingContext;
  protected transform: ScreenTransform | null = null;

  constructor(
    public canvas: HTMLCanvasElement,
    public requestUpdate: () => void
  ) {
    super(canvas, requestUpdate);
    this.ctx = this.canvas.getContext("webgl") as WebGLRenderingContext;
  }

  setTransform(transform: ScreenTransform): void {
    // TODO: Implement
    this.transform = transform;
  }
}
