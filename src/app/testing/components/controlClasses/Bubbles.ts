import seedrandom from "seedrandom";
import Victor from "victor";
import { Dimensions, ScreenLayout, ScreenTransform } from "../../types";
import { ProgramControl2D, createDefaultProgram } from "../ProgramControl";
import { ProgramState } from "../ProgramState";

class BubblesState extends ProgramState {
  balls: {
    x: number;
    y: number;
    r: number;
    vx: number;
    vy: number;
    hue: number;
  }[];
  // All corner points in clockwise order (not normalized)
  boundingPolygon: Victor[];

  constructor(
    public sizeInPixel: Dimensions,
    public screenLayout: ScreenLayout
  ) {
    super(sizeInPixel, screenLayout, { fps: 60 });

    // Intialize the bounding polygon
    this.boundingPolygon = [];
    for (const screen of screenLayout) {
      this.boundingPolygon.push(new Victor(screen.x, screen.y));
      this.boundingPolygon.push(new Victor(screen.x + screen.w, screen.y));
    }
    for (const screen of screenLayout.toReversed()) {
      this.boundingPolygon.push(
        new Victor(screen.x + screen.w, screen.y + screen.h)
      );
      this.boundingPolygon.push(new Victor(screen.x, screen.y + screen.h));
    }
    for (const point of this.boundingPolygon) {
      point.x /= sizeInPixel.w;
      point.y /= sizeInPixel.h;
    }

    // Initialize the balls
    const random = seedrandom("bubbles");
    this.balls = Array.from({ length: 600 }, () => ({
      x: random(),
      y: random(),
      r: random() * 0.005 + 0.005,
      vx: ((2 * random() - 1) * 0.001) / 20,
      vy: ((2 * random() - 1) * 0.001) / 20,
      hue: random() * 360,
    }));
  }

  updateShared(): void {
    // Update the balls
    for (const ball of this.balls) {
      ball.x += ball.vx * this.timeDelta;
      ball.y += ball.vy * this.timeDelta;
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
        // Check if ball is inside the wall
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
}

class BubblesControl extends ProgramControl2D {
  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: BubblesState,
    protected transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);
  }

  beforeDraw(): void {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    super.beforeDraw();
  }

  draw(): void {
    // Draw the balls
    const size = this.sharedState.sizeInPixel;
    for (const ball of this.sharedState.balls) {
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

export const Bubbles = {
  create: createDefaultProgram(BubblesControl, BubblesState),
};
