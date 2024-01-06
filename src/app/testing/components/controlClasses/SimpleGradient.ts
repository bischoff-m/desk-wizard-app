import { ProgramControl2D, createDefaultProgram } from "../ProgramControl";
import { ProgramState } from "../ProgramState";
import { ScreenTransform } from "../../types";

class SimpleGradientControl extends ProgramControl2D {
  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: ProgramState,
    protected transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);
  }

  draw(): void {
    const size = this.sharedState.sizeInPixel;
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
  create: createDefaultProgram(SimpleGradientControl),
};
