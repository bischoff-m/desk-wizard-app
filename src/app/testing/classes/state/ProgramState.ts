import { Size, AnimationSettings, ScreenLayout } from "../../types";

export class ProgramState {
  public time: DOMHighResTimeStamp = 0;
  public timeDelta: number = 0;
  public totalSize: Size;
  private updateNextFrameFlag: boolean = false;
  private missedFrameFlag: boolean = false;
  private animationFrame?: number;
  private fpsInterval?: NodeJS.Timeout;
  private updateControl?: (time?: DOMHighResTimeStamp) => void;

  constructor(
    public screenLayout: ScreenLayout,
    protected animationSettings: AnimationSettings
  ) {
    const boundingRect = screenLayout.reduce(
      (acc, screen) => ({
        minX: Math.min(acc.minX, screen.x),
        minY: Math.min(acc.minY, screen.y),
        maxX: Math.max(acc.maxX, screen.x + screen.w),
        maxY: Math.max(acc.maxY, screen.y + screen.h),
      }),
      { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    );
    this.totalSize = {
      w: boundingRect.maxX - boundingRect.minX,
      h: boundingRect.maxY - boundingRect.minY,
    };

    this.onEveryFrame();
  }

  protected updateShared(): void {}

  private onEveryFrame(time?: DOMHighResTimeStamp): void {
    this.animationFrame = requestAnimationFrame(this.onEveryFrame.bind(this));
    if (!time || !this.updateNextFrameFlag) return;

    if (this.time === time) return;

    if (this.missedFrameFlag) {
      // Skip to avoid large time deltas
      this.missedFrameFlag = false;
      this.time = time;
      return;
    }

    this.timeDelta = time - this.time;
    this.time = time;

    // These calls both can be resource intensive
    this.updateShared();
    if (this.updateControl) this.updateControl(time);

    this.updateNextFrameFlag = false;
  }

  public start(onUpdate: (time?: DOMHighResTimeStamp) => void): void {
    this.updateControl = onUpdate;
    if (!this.animationSettings.animate) {
      // Do single manual update when animationSettings is undefined
      this.updateShared();
      onUpdate();
    } else {
      if (!this.animationSettings.fps)
        throw new Error("Program is animating but fps is undefined");

      // Start animation interval
      this.fpsInterval = setInterval(() => {
        if (this.updateNextFrameFlag) this.missedFrameFlag = true;
        else this.requestUpdate();
      }, 1000 / this.animationSettings.fps);
      this.requestUpdate();
    }
  }

  public stop(): void {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.fpsInterval) clearInterval(this.fpsInterval);
  }

  public requestUpdate(): void {
    this.updateNextFrameFlag = true;
  }
}
