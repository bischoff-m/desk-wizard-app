import Victor from "victor";
import { CanvasController } from "../CanvasController";
import { MultiCanvasProvider } from "../CanvasProvider";

const margin = 50;

export class CalibrationGrid extends CanvasController {
  boundingPolygon: Victor[];

  constructor(public canvas: MultiCanvasProvider) {
    super(canvas);
    this.boundingPolygon = canvas.boundingPolygon();
  }

  update(): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    const size = this.canvas.size;
    // Clear the canvas
    ctx.clearRect(0, 0, size.w, size.h);

    // Draw the screens
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    this.canvas.coordinates.forEach((screen) => {
      // Draw edges clockwise
      ctx.moveTo(screen.x + margin, screen.y + margin);
      ctx.lineTo(screen.x + screen.w - margin, screen.y + margin);
      ctx.lineTo(screen.x + screen.w - margin, screen.y + screen.h - margin);
      ctx.lineTo(screen.x + margin, screen.y + screen.h - margin);
      ctx.lineTo(screen.x + margin, screen.y + margin);

      // Draw X in the middle
      ctx.moveTo(screen.x, screen.y);
      ctx.lineTo(screen.x + screen.w, screen.y + screen.h);
      ctx.moveTo(screen.x + screen.w, screen.y);
      ctx.lineTo(screen.x, screen.y + screen.h);

      // Show screen dimensions text
      ctx.fillText(
        `${Math.round(screen.w)} x ${Math.round(screen.h)}`,
        screen.x + screen.w / 2,
        screen.y + 100
      );
    });
    ctx.closePath();
    ctx.stroke();
  }
}
