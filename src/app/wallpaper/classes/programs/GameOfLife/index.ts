import { AnimationSettings, ScreenInfo } from "@/app/wallpaper/types";
import * as twgl from "twgl.js";
import { createDefaultProgram } from "../../CanvasProgram";
import { OrthographicWebGLControl } from "../../control/WebGLControl";
import { WebGLState } from "../../state/WebGLState";
import fsSource from "./fragment.glsl";
import vsSource from "./vertex.glsl";

class GameOfLifeState extends WebGLState {
  override meshArrays: twgl.Arrays;
  constructor(
    override screens: ScreenInfo[],
    override animationSettings: AnimationSettings
  ) {
    super(screens, animationSettings, vsSource, fsSource);
    this.meshArrays = this.getMeshArrays();
  }

  private getMeshArrays(): twgl.Arrays {
    const plane = twgl.primitives.createPlaneVertices(
      this.totalSize.w,
      this.totalSize.h
    );
    twgl.primitives.reorientVertices(plane, twgl.m4.rotationX(Math.PI * 0.5));
    twgl.primitives.reorientVertices(
      plane,
      twgl.m4.translation([this.totalSize.w / 2, this.totalSize.h / 2, -1])
    );
    return plane;
  }
}

class GameOfLifeControl extends OrthographicWebGLControl<GameOfLifeState> {
  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: GameOfLifeState
  ) {
    super(canvas, sharedState);
  }

  override drawScreen(): void {
    // Setup canvas
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  override getCustomUniforms(): object {
    return {
      u_time: this.sharedState.time,
    };
  }
}

/**
 * Benchmark:
 * - (tested in Vivaldi)
 * - (60 FPS, full resolution)
 * - Total pixel count: 8064000
 */
export const GameOfLife = {
  create: createDefaultProgram(
    "spanning",
    { animate: true, fps: 60 },
    GameOfLifeControl,
    GameOfLifeState
  ),
};
