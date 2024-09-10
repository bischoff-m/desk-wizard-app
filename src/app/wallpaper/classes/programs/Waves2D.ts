import { Matrix, matrix } from "mathjs";
import seedrandom from "seedrandom";
import { createNoise3D } from "simplex-noise";
import { AnimationSettings, ScreenInfo } from "../../types";
import { createDefaultProgram } from "../CanvasProgram";
import { ProgramControl2D } from "../control/ProgramControl2D";
import { ProgramState } from "../state/ProgramState";

class Waves2DState extends ProgramState {
  gap: number = 30;
  nodeSize: number = 10;
  noiseScale: number = 6;
  noise: Matrix = matrix();
  noiseFunction: (x: number, y: number, z: number) => number;

  constructor(
    override screens: ScreenInfo[],
    override animationSettings: AnimationSettings
  ) {
    super(screens, animationSettings);

    const prng = seedrandom("my seed");
    this.noiseFunction = createNoise3D(prng);
  }

  override updateShared(): void {
    const { w, h } = this.totalSize;
    const numberX = Math.ceil(w / this.gap);
    const numberY = Math.ceil((h / this.gap) * 2);
    const timeScale = 0.0001;
    const timeOffset = 0;

    for (let i = 0; i < numberX; i++) {
      for (let j = 0; j < numberY; j++) {
        this.noise.set(
          [i, j],
          this.noiseFunction(
            (i / numberX) * this.noiseScale * 2,
            (j / 2 / numberY) * this.noiseScale,
            this.time * timeScale + timeOffset
          )
        );
      }
    }
  }
}

class Waves2DControl extends ProgramControl2D<Waves2DState> {
  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: Waves2DState,
    override screenIdx: number
  ) {
    super(canvas, sharedState, screenIdx);
  }

  override draw(): void {
    const { w, h } = this.sharedState.totalSize;
    const { noise, gap, nodeSize } = this.sharedState;
    // Clear the canvas
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = "#222230";
    this.ctx.fillRect(0, 0, w, h);

    // Draw triangle for each node
    for (let i = 0; i < noise.size()[0]; i++) {
      for (let j = 0; j < noise.size()[1]; j++) {
        const distance = nodeSize * noise.get([i, j]);
        const node = { x: i * gap, y: j * (gap / 2) };
        if (j % 2 === 0) node.x += gap / 2;

        this.ctx.fillStyle = `rgba(200, 100, 100, 1)`;
        this.ctx.beginPath();
        const corner1 = {
          x: node.x,
          y: node.y + distance,
        };
        const corner2 = {
          x: node.x + distance,
          y: node.y,
        };
        const corner3 = {
          x: node.x,
          y: node.y - distance,
        };
        const corner4 = {
          x: node.x - distance,
          y: node.y,
        };
        this.ctx.moveTo(corner1.x, corner1.y);
        this.ctx.lineTo(corner2.x, corner2.y);
        this.ctx.lineTo(corner3.x, corner3.y);
        this.ctx.lineTo(corner4.x, corner4.y);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
  }
}

/**
 * Benchmark:
 * - (tested in Vivaldi)
 * - (60 FPS, full resolution)
 * - Total pixel count: 8064000
 * - FPS: 21
 * - Total delta time: 48.000 ms
 * - State delta time: 2.600 ms
 * - Control delta time: 30.500 ms
 * - GPU Usage: 7% (but CPU usage is the problem)
 */
export const Waves2D = {
  create: createDefaultProgram(
    "per-screen",
    { animate: true, fps: 60 },
    Waves2DControl,
    Waves2DState
  ),
};
