import Victor from "victor";
import { CanvasProvider } from "./CanvasProvider";
import { TriangleGradientCanvas } from "./TriangleGradientCanvas";
import { CanvasController } from "./CanvasController";

export type CanvasControllerName =
  | "TriangleGradientCanvas"
  | "GridPattern"
  | "GradientPattern"
  | "RandomBalls"
  | "ScreenOutlines"
  | "WideImage";

export function createCanvasController(
  name: CanvasControllerName,
  canvas: CanvasProvider
) {
  switch (name) {
    case "TriangleGradientCanvas":
      return new TriangleGradientCanvas(canvas);
    case "GridPattern":
      return new GridPattern(canvas);
    case "GradientPattern":
      return new GradientPattern(canvas);
    case "RandomBalls":
      return new RandomBalls(canvas);
    case "ScreenOutlines":
      return new ScreenOutlines(canvas);
    case "WideImage":
      const image = new Image();
      image.src = "/blackjiage.jpg";
      return new WideImage(canvas, image);
    default:
      throw new Error(`Unknown canvas controller: ${name}`);
  }
}

export class WideImage extends CanvasController {
  constructor(public canvas: CanvasProvider, public image: HTMLImageElement) {
    super(canvas);
    if (image.complete) this.runOnce();
    else image.onload = () => this.runOnce();
  }
  update(): void {}
  draw(ctx: CanvasRenderingContext2D): void {
    const size = this.canvas.size();
    // Clear the canvas
    ctx.clearRect(0, 0, size.w, size.h);

    // Scale without changing aspect ratio
    const scale = Math.max(
      size.w / this.image.width,
      size.h / this.image.height
    );
    const scaledWidth = this.image.width * scale;
    const scaledHeight = this.image.height * scale;

    ctx.drawImage(
      this.image,
      (size.w - scaledWidth) / 2,
      (size.h - scaledHeight) / 2,
      scaledWidth,
      scaledHeight
    );
  }
}

export class ScreenOutlines extends CanvasController {
  boundingPolygon: Victor[];

  constructor(public canvas: CanvasProvider) {
    super(canvas);
    this.boundingPolygon = canvas.boundingPolygon();
    this.runOnce();
  }
  update(): void {}
  draw(ctx: CanvasRenderingContext2D): void {
    const size = this.canvas.size();
    // Clear the canvas
    ctx.clearRect(0, 0, size.w, size.h);

    // Draw the screens
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.boundingPolygon[0].x, this.boundingPolygon[0].y);
    for (let i = 1; i < this.boundingPolygon.length; i++) {
      ctx.lineTo(this.boundingPolygon[i].x, this.boundingPolygon[i].y);
    }
    ctx.closePath();
  }
}

export class RandomBalls extends CanvasController {
  boundingPolygon: Victor[];
  balls: {
    x: number;
    y: number;
    r: number;
    vx: number;
    vy: number;
    hue: number;
  }[];

  constructor(public canvas: CanvasProvider) {
    super(canvas);

    this.boundingPolygon = canvas.boundingPolygon();
    const size = this.canvas.size();
    for (const point of this.boundingPolygon) {
      point.x /= size.w;
      point.y /= size.h;
    }

    this.balls = Array.from({ length: 600 }, () => ({
      x: Math.random() * 0.5 + 0.25,
      y: Math.random() * 0.5 + 0.25,
      r: Math.random() * 0.005 + 0.005,
      vx: (2 * Math.random() - 1) * 0.00015,
      vy: (2 * Math.random() - 1) * 0.00015,
      hue: Math.random() * 360,
    }));

    this.runLoop();
  }
  update(): void {
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
  draw(ctx: CanvasRenderingContext2D): void {
    const size = this.canvas.size();
    // Clear the canvas
    ctx.clearRect(0, 0, size.w, size.h);

    // Draw the balls
    for (const ball of this.balls) {
      // Fill with a random color
      ctx.beginPath();
      ctx.arc(
        ball.x * size.w,
        ball.y * size.h,
        ball.r * size.w,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = `hsl(${ball.hue}, 60%, 60%)`;
      ctx.fill();
      ctx.stroke();
    }
  }
}

export class GradientPattern extends CanvasController {
  constructor(public canvas: CanvasProvider) {
    super(canvas);
    this.runOnce();
  }
  update(): void {}
  draw(ctx: CanvasRenderingContext2D): void {
    const size = this.canvas.size();
    // Clear the canvas
    ctx.clearRect(0, 0, size.w, size.h);

    // Create a linear gradient
    const gradient = ctx.createLinearGradient(0, 0, size.w, size.h);

    // Add three color stops
    gradient.addColorStop(0, "#22c1c3");
    gradient.addColorStop(0.333, "#833ab4");
    gradient.addColorStop(0.667, "#fd1d1d");
    gradient.addColorStop(1, "#fdbb2d");

    // Set the fill style and draw a rectangle
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size.w, size.h);
  }
}

export class GridPattern extends CanvasController {
  constructor(public canvas: CanvasProvider) {
    super(canvas);
    this.runOnce();
  }
  update(): void {}
  draw(ctx: CanvasRenderingContext2D): void {
    const size = this.canvas.size();
    // Clear the canvas
    ctx.clearRect(0, 0, size.w, size.h);

    // Draw minor grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x < size.w; x += 10) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.h);
    }
    for (let y = 0; y < size.h; y += 10) {
      ctx.moveTo(0, y);
      ctx.lineTo(size.w, y);
    }
    ctx.stroke();

    // Draw major grid lines
    ctx.strokeStyle = "rgba(255,60,60,0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < size.w; x += 100) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.h);
    }
    for (let y = 0; y < size.h; y += 100) {
      ctx.moveTo(0, y);
      ctx.lineTo(size.w, y);
    }
    ctx.stroke();

    // Draw major major grid lines
    ctx.strokeStyle = "rgba(100,200,100,1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < size.w; x += 250) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.h);
    }
    for (let y = 0; y < size.h; y += 250) {
      ctx.moveTo(0, y);
      ctx.lineTo(size.w, y);
    }
    ctx.stroke();

    // Draw major major major grid lines
    ctx.strokeStyle = "rgba(100,100,255,1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < size.w; x += 1000) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.h);
    }
    for (let y = 0; y < size.h; y += 1000) {
      ctx.moveTo(0, y);
      ctx.lineTo(size.w, y);
    }
    ctx.stroke();
  }
}
