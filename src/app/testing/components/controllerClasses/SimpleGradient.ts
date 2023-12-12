import { CanvasController } from "../CanvasController";
import { CanvasProvider } from "../CanvasProvider";

export class SimpleGradient extends CanvasController {
  constructor(public canvas: CanvasProvider) {
    super(canvas);
  }

  update(): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    const size = this.canvas.size;
    // Clear the canvas
    ctx.clearRect(0, 0, size.w, size.h);

    // Create a linear gradient
    const gradient = ctx.createLinearGradient(0, 0, size.w, size.h);

    // Add three color stops
    gradient.addColorStop(0, "#22c1c3");
    gradient.addColorStop(0.333, "#833ab4");
    gradient.addColorStop(0.667, "#fd1d1d");
    gradient.addColorStop(1, "#fdbb2d");

    // Set the fill style and draw a rectangle
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size.w, size.h);
  }
}
