import {
  AnimationSettings,
  DisplayTimings,
  ScreenInfo,
  Size,
} from "../../types";
import { mergeRects } from "../ScreenInfo";

export class ProgramState {
  public time: DOMHighResTimeStamp = 0;
  public timeDelta: number = 0;
  public totalSize: Size;
  public scaledSize: Size;
  private updateNextFrameFlag: boolean = false;
  private missedFrameFlag: boolean = false;
  private animationFrame?: number;
  private fpsInterval?: NodeJS.Timeout;
  private updateControl?: (time?: DOMHighResTimeStamp) => void;
  private onUpdateListeners: (() => void)[] = [];
  private timings: DisplayTimings = {
    timestamp: 0,
    fps: 0,
    totalDelta: 0,
    stateDelta: 0,
    controlDelta: 0,
  };

  constructor(
    public screens: ScreenInfo[],
    public animationSettings: AnimationSettings
  ) {
    this.totalSize = mergeRects(screens.map((s) => s.virtual));
    this.scaledSize = mergeRects(screens.map((s) => s.scaledRect));

    this.requestFrame();
  }

  protected updateShared(): void {}

  private requestFrame(time?: DOMHighResTimeStamp): void {
    this.animationFrame = requestAnimationFrame(this.requestFrame.bind(this));
    if (!time || !this.updateNextFrameFlag) return;

    if (this.time === time) return;

    if (this.missedFrameFlag) {
      // Skip one frame because either the program was paused due to the window
      // not being visible or the update took longer than the frame time
      this.missedFrameFlag = false;
      // If the time difference is more than 3 frames, reset the time to avoid
      // too much state change in one frame
      if (time - this.time > (1000 / this.animationSettings.fps!) * 3)
        this.time = time;
      return;
    }

    this.timeDelta = time - this.time;
    this.time = time;

    // These calls both can be resource intensive
    let stateStart = performance.now();
    this.updateShared();
    let stateEnd = performance.now();
    if (this.updateControl) this.updateControl(time);
    let controlEnd = performance.now();
    this.timings = {
      timestamp: time,
      fps: 1000 / this.timeDelta,
      totalDelta: this.timeDelta,
      stateDelta: stateEnd - stateStart,
      controlDelta: controlEnd - stateEnd,
    };

    this.onUpdateListeners.forEach((l) => l());
    this.updateNextFrameFlag = false;
    this.missedFrameFlag = false;
  }

  public start(onUpdate: (time?: DOMHighResTimeStamp) => void): void {
    this.updateControl = onUpdate;
    if (!this.animationSettings.animate) {
      // Do single manual update when animationSettings is undefined
      let stateStart = performance.now();
      this.updateShared();
      let stateEnd = performance.now();
      this.updateControl();
      let controlEnd = performance.now();
      this.timings = {
        timestamp: performance.now(),
        fps: NaN,
        totalDelta: controlEnd - stateStart,
        stateDelta: stateEnd - stateStart,
        controlDelta: controlEnd - stateEnd,
      };
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

  public addUpdateListener(listener: () => void): void {
    this.onUpdateListeners.push(listener);
  }

  public removeUpdateListener(listener: () => void): void {
    this.onUpdateListeners = this.onUpdateListeners.filter(
      (l) => l !== listener
    );
  }

  public getTimings(): DisplayTimings {
    return this.timings;
  }
}
