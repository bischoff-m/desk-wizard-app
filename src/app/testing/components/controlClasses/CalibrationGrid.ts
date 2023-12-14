import { CanvasControl2D } from "../CanvasControl";

const margin = 50;

export class CalibrationGrid extends CanvasControl2D {
  // boundingPolygon: Victor[] | null = null;

  constructor(
    public canvas: HTMLCanvasElement,
    public requestUpdate: () => void
  ) {
    super(canvas, requestUpdate);
  }

  update(time: DOMHighResTimeStamp): void {
    if (!this.ctx || !this.transform) return;
    const { size, coordinates } = this.transform;

    // Clear the canvas
    this.ctx.clearRect(0, 0, size.w, size.h);

    // Draw the screens
    this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
    this.ctx.font = "28px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "rgba(255,255,255,1)";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    for (const coord of coordinates) {
      // Draw edges clockwise
      this.ctx.moveTo(coord.x + margin, coord.y + margin);
      this.ctx.lineTo(coord.x + coord.w - margin, coord.y + margin);
      this.ctx.lineTo(coord.x + coord.w - margin, coord.y + coord.h - margin);
      this.ctx.lineTo(coord.x + margin, coord.y + coord.h - margin);
      this.ctx.lineTo(coord.x + margin, coord.y + margin);

      // Draw X in the middle
      this.ctx.moveTo(coord.x, coord.y);
      this.ctx.lineTo(coord.x + coord.w, coord.y + coord.h);
      this.ctx.moveTo(coord.x + coord.w, coord.y);
      this.ctx.lineTo(coord.x, coord.y + coord.h);

      // Show coord dimensions text
      this.ctx.fillText(
        `${Math.round(coord.w)} x ${Math.round(coord.h)}`,
        coord.x + coord.w / 2,
        coord.y + 100
      );
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }
}
