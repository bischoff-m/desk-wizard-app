import { CanvasProvider } from "./CanvasProvider";

export abstract class CanvasController {
  protected animationFrame: number | null = null;

  constructor(public canvas: CanvasProvider) {}

  abstract update(time?: DOMHighResTimeStamp): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;

  run(time?: DOMHighResTimeStamp): void {
    this.update(time);
    this.canvas.apply((ctx) => this.draw(ctx));
  }

  stopLoop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}
