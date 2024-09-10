import { AnimationSettings, ScreenInfo, Vector2D } from "../../types";
import { CanvasProgram } from "../CanvasProgram";
import { ProgramControl2D } from "../control/ProgramControl2D";
import { ProgramState } from "../state/ProgramState";

const basePath = "/";

class PictureFrameState extends ProgramState {
  image: HTMLImageElement;

  constructor(
    override screens: ScreenInfo[],
    override animationSettings: AnimationSettings,
    imageSrc: string
  ) {
    super(screens, animationSettings);

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
    override screenIdx: number,
    private offset: Vector2D = { x: 0, y: 0 },
    private mirrorX: boolean = false
  ) {
    super(canvas, sharedState, screenIdx);
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

    if (this.mirrorX) {
      this.ctx.save();
      this.ctx.translate(w, 0);
      this.ctx.scale(-1, 1);
    }

    this.ctx.drawImage(
      image,
      (w - scaledWidth) / 2 + this.offset.x,
      (h - scaledHeight) / 2 + this.offset.y,
      scaledWidth,
      scaledHeight
    );

    if (this.mirrorX) {
      this.ctx.restore();
    }
  }
}

export const PictureFrame = {
  create: (
    imageSrc: string,
    offset: Vector2D = { x: 0, y: 0 },
    mirrorX: boolean = false
  ): CanvasProgram<PictureFrameState, "per-screen"> => ({
    createState: (screenLayout) => {
      return new PictureFrameState(screenLayout, { animate: false }, imageSrc);
    },
    createControl: (canvas, sharedState, transform) => {
      return new PictureFrameControl(
        canvas,
        sharedState,
        transform,
        offset,
        mirrorX
      );
    },
    placement: "per-screen",
  }),
};
