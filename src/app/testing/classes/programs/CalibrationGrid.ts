import { ScreenTransform } from "../../types";
import { createDefaultProgram } from "../CanvasProgram";
import { ProgramControl2D } from "../control/ProgramControl2D";
import { ProgramState } from "../ProgramState";

const margin = 50;

class CalibrationGridControl extends ProgramControl2D<ProgramState> {
  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: ProgramState,
    protected transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);
  }

  draw(): void {
    const size = this.sharedState.totalSize;
    const coordinates = this.sharedState.screenLayout;

    // Clear the canvas
    this.ctx.clearRect(0, 0, size.w, size.h);

    // Draw the screens
    this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
    this.ctx.font = "28px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "rgba(255,255,255,1)";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    for (const coord of coordinates) {
      // Draw edges clockwise
      this.ctx.moveTo(coord.x + margin, coord.y + margin);
      this.ctx.lineTo(coord.x + coord.w - margin, coord.y + margin);
      this.ctx.lineTo(coord.x + coord.w - margin, coord.y + coord.h - margin);
      this.ctx.lineTo(coord.x + margin, coord.y + coord.h - margin);
      this.ctx.lineTo(coord.x + margin, coord.y + margin);

      // Draw X in the middle
      this.ctx.moveTo(coord.x, coord.y);
      this.ctx.lineTo(coord.x + coord.w, coord.y + coord.h);
      this.ctx.moveTo(coord.x + coord.w, coord.y);
      this.ctx.lineTo(coord.x, coord.y + coord.h);

      // Show coord dimensions text
      this.ctx.fillText(
        `${Math.round(coord.w)} x ${Math.round(coord.h)}`,
        coord.x + coord.w / 2,
        coord.y + 100
      );
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }
}

export const CalibrationGrid = {
  create: createDefaultProgram(
    "per-screen",
    { animate: false },
    CalibrationGridControl
  ),
};
