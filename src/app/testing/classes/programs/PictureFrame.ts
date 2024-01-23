import { AnimationSettings, ScreenLayout, ScreenTransform } from "../../types";
import { CanvasProgram } from "../CanvasProgram";
import { ProgramState } from "../ProgramState";
import { ProgramControl2D } from "../control/ProgramControl2D";

const basePath = "/";

class PictureFrameState extends ProgramState {
  image: HTMLImageElement;

  constructor(
    override screenLayout: ScreenLayout,
    override animationSettings: AnimationSettings,
    imageSrc: string
  ) {
    super(screenLayout, animationSettings);

    this.image = new Image();
    this.image.src = basePath + imageSrc;

    if (this.image.complete) this.requestUpdate();
    else this.image.onload = () => this.requestUpdate();
  }
}

class PictureFrameControl extends ProgramControl2D<PictureFrameState> {
  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: PictureFrameState,
    override transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);
  }

  override draw(): void {
    const { image } = this.sharedState;
    if (!image.complete) return;

    const { w, h } = this.sharedState.totalSize;
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

export const PictureFrame = {
  create: (imageSrc: string): CanvasProgram<PictureFrameState> => ({
    createState: (screenLayout) => {
      return new PictureFrameState(screenLayout, { animate: false }, imageSrc);
    },
    createControl: (canvas, sharedState, transform) => {
      return new PictureFrameControl(
        canvas,
        sharedState as PictureFrameState,
        transform
      );
    },
    canvasPlacement: "per-screen",
  }),
};
