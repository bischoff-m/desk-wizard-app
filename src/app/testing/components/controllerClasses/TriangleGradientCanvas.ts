import Victor from "victor";
import { CanvasController } from "../CanvasController";
import { CanvasProvider } from "../CanvasProvider";
import { createNoise3D } from "simplex-noise";
import seedrandom from "seedrandom";
// import { matrix, Matrix } from "mathjs";

export class TriangleGradientCanvas extends CanvasController {
  gap: number = 30;
  nodeSize: number = 10;
  noiseScale: number = 5;
  // noise: Matrix = matrix();
  noiseFunction: (x: number, y: number, z: number) => number = (x, y, z) => 0;

  constructor(public canvas: CanvasProvider) {
    super(canvas);
    const prng = seedrandom("my seed");
    this.noiseFunction = createNoise3D(prng);
  }

  update(time: DOMHighResTimeStamp): void {
    const { w, h } = this.canvas.size;
    const numberX = Math.ceil(w / this.gap);
    const numberY = Math.ceil((h / this.gap) * 2);
    const timeScale = 0.0001;
    const timeOffset = 0;
    // for (let i = 0; i < numberX; i++) {
    //   for (let j = 0; j < numberY; j++) {
    //     this.noise.set(
    //       [i, j],
    //       this.noiseFunction(
    //         (i / numberX) * this.noiseScale,
    //         (j / 2 / numberY) * this.noiseScale,
    //         time * timeScale + timeOffset
    //       )
    //     );
    //   }
    // }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { w, h } = this.canvas.size;
    // Clear the canvas
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#2f2f2f";
    ctx.fillRect(0, 0, w, h);

    // Draw triangle for each node
    // for (let i = 0; i < this.noise.size()[0]; i++) {
    //   for (let j = 0; j < this.noise.size()[1]; j++) {
    //     const noiseValue = this.noise.get([i, j]);
    //     let node = new Victor(i * this.gap, j * (this.gap / 2));
    //     const cornerVector = new Victor(0, this.nodeSize * noiseValue);
    //     if (j % 2 === 0) node.addScalarX(this.gap / 2);

    //     ctx.fillStyle = `rgba(200, 100, 100, 1)`;
    //     // ctx.strokeStyle = "black";
    //     ctx.beginPath();
    //     const corner1 = node.clone().add(cornerVector);
    //     ctx.moveTo(corner1.x, corner1.y);
    //     cornerVector.rotateDeg(90);
    //     const corner2 = node.clone().add(cornerVector);
    //     ctx.lineTo(corner2.x, corner2.y);
    //     cornerVector.rotateDeg(90);
    //     const corner3 = node.clone().add(cornerVector);
    //     ctx.lineTo(corner3.x, corner3.y);
    //     cornerVector.rotateDeg(90);
    //     const corner4 = node.clone().add(cornerVector);
    //     ctx.lineTo(corner4.x, corner4.y);
    //     ctx.closePath();
    //     ctx.fill();
    //     // ctx.stroke();
    //   }
    // }
  }
}
