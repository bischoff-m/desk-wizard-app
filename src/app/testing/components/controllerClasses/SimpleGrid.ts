import { CanvasController } from "../CanvasController";
import { CanvasProvider } from "../CanvasProvider";

export class SimpleGrid extends CanvasController {
  constructor(public canvas: CanvasProvider) {
    super(canvas);
  }

  update(): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    const size = this.canvas.size;
    // Clear the canvas
    ctx.clearRect(0, 0, size.w, size.h);

    // Draw minor grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x < size.w; x += 10) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.h);
    }
    for (let y = 0; y < size.h; y += 10) {
      ctx.moveTo(0, y);
      ctx.lineTo(size.w, y);
    }
    ctx.stroke();

    // Draw major grid lines
    ctx.strokeStyle = "rgba(255,60,60,0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < size.w; x += 100) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.h);
    }
    for (let y = 0; y < size.h; y += 100) {
      ctx.moveTo(0, y);
      ctx.lineTo(size.w, y);
    }
    ctx.stroke();

    // Draw major major grid lines
    ctx.strokeStyle = "rgba(100,200,100,1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < size.w; x += 250) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.h);
    }
    for (let y = 0; y < size.h; y += 250) {
      ctx.moveTo(0, y);
      ctx.lineTo(size.w, y);
    }
    ctx.stroke();

    // Draw major major major grid lines
    ctx.strokeStyle = "rgba(100,100,255,1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < size.w; x += 1000) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.h);
    }
    for (let y = 0; y < size.h; y += 1000) {
      ctx.moveTo(0, y);
      ctx.lineTo(size.w, y);
    }
    ctx.stroke();
  }
}
