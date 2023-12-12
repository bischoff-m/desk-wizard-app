import { CanvasProvider } from "./CanvasProvider";

export abstract class CanvasController {
  protected animationFrame: number | null = null;

  constructor(public canvas: CanvasProvider) {}

  abstract update(): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;

  runOnce(): void {
    this.update();
    this.canvas.apply((ctx) => this.draw(ctx));
  }

  runLoop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    const updateLoop = () => {
      this.runOnce();
      this.animationFrame = requestAnimationFrame(updateLoop);
    };
    updateLoop();
  }

  stopLoop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}
