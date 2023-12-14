import Victor from "victor";
import {
  CanvasControl,
  CanvasControl2D,
  ScreenTransform,
} from "../CanvasControl";
import { CanvasProvider } from "../CanvasProvider";

export class Bubbles extends CanvasControl2D {
  animationSettings: { fps: number } = { fps: 60 };
  // All corner points in clockwise order (not normalized)
  boundingPolygon: Victor[] | null = null;
  balls: {
    x: number;
    y: number;
    r: number;
    vx: number;
    vy: number;
    hue: number;
  }[];

  constructor(
    public canvas: HTMLCanvasElement,
    public requestUpdate: () => void
  ) {
    super(canvas, requestUpdate);

    this.balls = Array.from({ length: 600 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 0.005 + 0.005,
      vx: ((2 * Math.random() - 1) * 0.001) / 4,
      vy: ((2 * Math.random() - 1) * 0.001) / 4,
      hue: Math.random() * 360,
    }));
  }

  setTransform(transform: ScreenTransform): void {
    super.setTransform(transform);

    this.boundingPolygon = [];
    for (const screen of transform.coordinates) {
      this.boundingPolygon.push(new Victor(screen.x, screen.y));
      this.boundingPolygon.push(new Victor(screen.x + screen.w, screen.y));
    }
    for (const screen of transform.coordinates.toReversed()) {
      this.boundingPolygon.push(
        new Victor(screen.x + screen.w, screen.y + screen.h)
      );
      this.boundingPolygon.push(new Victor(screen.x, screen.y + screen.h));
    }
    for (const point of this.boundingPolygon) {
      point.x /= transform.size.w;
      point.y /= transform.size.h;
    }
  }

  updateState(): void {
    if (!this.boundingPolygon) return;
    // Update the balls
    for (const ball of this.balls) {
      ball.x += ball.vx;
      ball.y += ball.vy;
      // Check for collisions with walls of bounding box
      for (let i = 0; i < this.boundingPolygon.length; i++) {
        // First connection point of current line
        const pointA = {
          x: this.boundingPolygon[i].x,
          y: this.boundingPolygon[i].y,
        };
        // Second connection point of current line
        const pointB = {
          x: this.boundingPolygon[(i + 1) % this.boundingPolygon.length].x,
          y: this.boundingPolygon[(i + 1) % this.boundingPolygon.length].y,
        };

        // Line relative to point A
        const lineVector = [pointB.x - pointA.x, pointB.y - pointA.y];
        // Ball relative to point A
        const ballVector = [ball.x - pointA.x, ball.y - pointA.y];
        // Projection of ball vector on line vector
        // P = AB/BB * B (point on line closest to ball)
        const dotAB =
          lineVector[0] * ballVector[0] + lineVector[1] * ballVector[1];
        const dotBB =
          lineVector[0] * lineVector[0] + lineVector[1] * lineVector[1];
        // Check if P is on the line
        // TODO: If not, the ball could bounce off one of the line points if part of a convex corner
        if (dotAB / dotBB < 0) continue;
        if (dotAB / dotBB > 1) continue;

        const projection = {
          x: pointA.x + (dotAB / dotBB) * lineVector[0],
          y: pointA.y + (dotAB / dotBB) * lineVector[1],
        };
        const ortho = { x: ball.x - projection.x, y: ball.y - projection.y };
        const dist = Math.sqrt(ortho.x ** 2 + ortho.y ** 2);
        if (dist > ball.r) continue;

        const normal = { x: ortho.x / dist, y: ortho.y / dist };
        // Let ball bounce off the wall flipped by the normal
        const dotNV = normal.x * ball.vx + normal.y * ball.vy;
        ball.vx -= 2 * dotNV * normal.x;
        ball.vy -= 2 * dotNV * normal.y;

        // Move ball out of wall
        ball.x += (ball.r - dist) * normal.x;
        ball.y += (ball.r - dist) * normal.y;
      }
    }
  }

  update(time: number): void {
    if (!this.ctx || !this.transform) return;
    const size = this.transform.size;
    this.updateState();
    // Clear the canvas
    this.ctx.clearRect(0, 0, size.w, size.h);

    // Draw the balls
    for (const ball of this.balls) {
      // Fill with a random color
      this.ctx.beginPath();
      this.ctx.arc(
        ball.x * size.w,
        ball.y * size.h,
        ball.r * size.w,
        0,
        2 * Math.PI
      );
      this.ctx.fillStyle = `hsl(${ball.hue}, 60%, 60%)`;
      this.ctx.fill();
      this.ctx.stroke();
    }
  }
}
