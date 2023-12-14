import { CanvasControl2D } from "../CanvasControl";

export class SimpleGradient extends CanvasControl2D {
  constructor(
    public canvas: HTMLCanvasElement,
    public requestUpdate: () => void
  ) {
    super(canvas, requestUpdate);
  }

  update(time: DOMHighResTimeStamp): void {
    if (!this.ctx || !this.transform) return;
    const size = this.transform.size;
    // Clear the canvas
    this.ctx.clearRect(0, 0, size.w, size.h);

    // Create a linear gradient
    const gradient = this.ctx.createLinearGradient(0, 0, size.w, size.h);

    // Add three color stops
    gradient.addColorStop(0, "#22c1c3");
    gradient.addColorStop(0.333, "#833ab4");
    gradient.addColorStop(0.667, "#fd1d1d");
    gradient.addColorStop(1, "#fdbb2d");

    // Set the fill style and draw a rectangle
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, size.w, size.h);
  }
}
