import { CanvasControl2D } from "../CanvasControl";

export class PictureFrame extends CanvasControl2D {
  image: HTMLImageElement;

  constructor(
    public canvas: HTMLCanvasElement,
    public requestUpdate: () => void,
    public imageSrc: string
  ) {
    super(canvas, requestUpdate);
    this.image = new Image();
    this.image.src = imageSrc;
    if (this.image.complete) requestUpdate();
    else this.image.onload = () => requestUpdate();
  }

  update(time: DOMHighResTimeStamp): void {
    if (!this.ctx || !this.transform) return;
    if (!this.image.complete) return;

    const size = this.transform.size;
    // Clear the canvas
    this.ctx.clearRect(0, 0, size.w, size.h);

    // Scale to fit screen without changing aspect ratio
    const scale = Math.max(
      size.w / this.image.width,
      size.h / this.image.height
    );
    const scaledWidth = this.image.width * scale;
    const scaledHeight = this.image.height * scale;

    this.ctx.drawImage(
      this.image,
      (size.w - scaledWidth) / 2,
      (size.h - scaledHeight) / 2,
      scaledWidth,
      scaledHeight
    );
  }
}
