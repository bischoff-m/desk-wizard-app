import Victor from "victor";
import { CanvasController } from "./CanvasController";
import { CanvasProvider } from "./CanvasProvider";

export class TriangleGradientCanvas extends CanvasController {
  nodes: Victor[] = [];
  gap: number = 60;
  nodeSize: number = 30;

  constructor(public canvas: CanvasProvider) {
    super(canvas);
    const { w, h } = this.canvas.size;

    for (let i = 0; i < w; i += this.gap) {
      for (let j = 0; j < h; j += this.gap) {
        this.nodes.push(new Victor(i, j));
      }
    }
    console.log(this.nodes.length);
    console.log("Called constructor");
    // this.runOnce();
  }

  update(): void {}

  draw(ctx: CanvasRenderingContext2D): void {
    const { w, h } = this.canvas.size;
    // Clear the canvas
    ctx.clearRect(0, 0, w, h);

    // Draw triangle for each node
    for (let i = 0; i < this.nodes.length; i++) {
      let node = this.nodes[i];
      const cornerVector = new Victor(0, this.nodeSize);
      if (i % 2 === 0) {
        cornerVector.rotateDeg(180);
        node.add(new Victor(40, 0));
      }
      // console.log(screenPos);
      ctx.fillStyle = `rgba(${(node.x / w) * 255},${(node.y / h) * 255},0,1)`;
      ctx.beginPath();
      const corner1 = node.clone().add(cornerVector);
      ctx.moveTo(corner1.x, corner1.y);
      cornerVector.rotateDeg(120);
      const corner2 = node.clone().add(cornerVector);
      ctx.lineTo(corner2.x, corner2.y);
      cornerVector.rotateDeg(120);
      const corner3 = node.clone().add(cornerVector);
      ctx.lineTo(corner3.x, corner3.y);
      ctx.closePath();
      ctx.fill();
    }
  }
}
