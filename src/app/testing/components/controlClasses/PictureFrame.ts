import { Dimensions } from "../../types";
import {
  CanvasProgram,
  ProgramControl2D,
  ScreenTransform,
} from "../ProgramControl";
import { ProgramState } from "../ProgramState";

const basePath = "/";

class PictureFrameState extends ProgramState {
  image: HTMLImageElement;

  constructor(
    public sizeInPixel: Dimensions,
    public screenLayout: (Dimensions & { x: number; y: number })[],
    protected imageSrc: string
  ) {
    super(sizeInPixel, screenLayout);

    this.image = new Image();
    this.image.src = basePath + imageSrc;

    if (this.image.complete) this.requestUpdate();
    else this.image.onload = () => this.requestUpdate();
  }
}

class PictureFrameControl extends ProgramControl2D {
  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: PictureFrameState,
    protected transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);
  }

  draw(): void {
    const { image } = this.sharedState;
    if (!image.complete) return;

    const { w, h } = this.sharedState.sizeInPixel;
    // Clear the canvas
    this.ctx.clearRect(0, 0, w, h);

    // Scale to fit screen without changing aspect ratio
    const scale = Math.max(w / image.width, h / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;

    this.ctx.drawImage(
      image,
      (w - scaledWidth) / 2,
      (h - scaledHeight) / 2,
      scaledWidth,
      scaledHeight
    );
  }
}

const handle = {
  create: (imageSrc: string): CanvasProgram => ({
    createState: (sizeInPixel, screenLayout) => {
      return new PictureFrameState(sizeInPixel, screenLayout, imageSrc);
    },
    createControl: (canvas, sharedState, transform) => {
      return new PictureFrameControl(
        canvas,
        sharedState as PictureFrameState,
        transform
      );
    },
  }),
};
export default handle;
