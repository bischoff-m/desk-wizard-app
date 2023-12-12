import { CanvasController } from "../CanvasController";
import { CanvasProvider } from "../CanvasProvider";

export class PictureFrame extends CanvasController {
  image: HTMLImageElement;

  constructor(public canvas: CanvasProvider, public imageSrc: string) {
    super(canvas);
    this.image = new Image();
    this.image.src = imageSrc;
  }

  run(): void {
    if (this.image.complete) super.run();
    else this.image.onload = () => super.run();
  }

  update(): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    const size = this.canvas.size;
    // Clear the canvas
    ctx.clearRect(0, 0, size.w, size.h);

    // Scale without changing aspect ratio
    const scale = Math.max(
      size.w / this.image.width,
      size.h / this.image.height
    );
    const scaledWidth = this.image.width * scale;
    const scaledHeight = this.image.height * scale;

    ctx.drawImage(
      this.image,
      (size.w - scaledWidth) / 2,
      (size.h - scaledHeight) / 2,
      scaledWidth,
      scaledHeight
    );
  }
}
