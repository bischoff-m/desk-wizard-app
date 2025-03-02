import { createDefaultProgram } from "../CanvasProgram";
import { ProgramControl2D } from "../control/ProgramControl2D";
import { ProgramState } from "../state/ProgramState";

class SimpleGradientControl extends ProgramControl2D<ProgramState> {
  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: ProgramState,
    override screenIdx: number,
  ) {
    super(canvas, sharedState, screenIdx);
  }

  override draw(): void {
    const size = this.sharedState.totalSize;
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

export const SimpleGradient = {
  create: createDefaultProgram("per-screen", { animate: false }, SimpleGradientControl),
};
