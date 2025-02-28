import { createDefaultProgram } from "../CanvasProgram";
import { ProgramControl2D } from "../control/ProgramControl2D";
import { ProgramState } from "../state/ProgramState";

class SimpleGridControl extends ProgramControl2D<ProgramState> {
    constructor(
        override canvas: HTMLCanvasElement,
        override sharedState: ProgramState,
        override screenIdx: number
    ) {
        super(canvas, sharedState, screenIdx);
    }

    override draw(): void {
        const size = this.sharedState.totalSize;
        // Clear the canvas
        this.ctx.clearRect(0, 0, size.w, size.h);

        // Draw minor grid lines
        this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        for (let x = 0; x < size.w; x += 10) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, size.h);
        }
        for (let y = 0; y < size.h; y += 10) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(size.w, y);
        }
        this.ctx.stroke();

        // Draw major grid lines
        this.ctx.strokeStyle = "rgba(255,60,60,0.8)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let x = 0; x < size.w; x += 100) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, size.h);
        }
        for (let y = 0; y < size.h; y += 100) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(size.w, y);
        }
        this.ctx.stroke();

        // Draw major major grid lines
        this.ctx.strokeStyle = "rgba(100,200,100,1)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let x = 0; x < size.w; x += 250) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, size.h);
        }
        for (let y = 0; y < size.h; y += 250) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(size.w, y);
        }
        this.ctx.stroke();

        // Draw major major major grid lines
        this.ctx.strokeStyle = "rgba(100,100,255,1)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let x = 0; x < size.w; x += 1000) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, size.h);
        }
        for (let y = 0; y < size.h; y += 1000) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(size.w, y);
        }
        this.ctx.stroke();
    }
}

export const SimpleGrid = {
    create: createDefaultProgram("per-screen", { animate: false }, SimpleGridControl),
};
