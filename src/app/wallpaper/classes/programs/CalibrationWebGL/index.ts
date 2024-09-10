import { AnimationSettings, ScreenInfo } from "@/app/wallpaper/types";
import * as twgl from "twgl.js";
import { createDefaultProgram } from "../../CanvasProgram";
import { OrthographicWebGLControl } from "../../control/WebGLControl";
import { WebGLState } from "../../state/WebGLState";
import fsSource from "./fragment.glsl";
import vsSource from "./vertex.glsl";

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
/**
 * x: left to right
 * y: bottom to top
 * z: far to near
 */

class CalibrationWebGLState extends WebGLState {
  override meshArrays: twgl.Arrays;
  constructor(
    override screens: ScreenInfo[],
    override animationSettings: AnimationSettings
  ) {
    super(screens, animationSettings, vsSource, fsSource);
    this.meshArrays = this.getMeshArrays();
  }

  private getMeshArrays(): twgl.Arrays {
    const screenColors = [
      [0.39, 0.39, 0.78, 1],
      [0.39, 0.78, 0.39, 1],
      [0.78, 0.39, 0.39, 1],
    ];
    const arrays = [];
    for (let i = 0; i < this.screens.length; i++) {
      const { x, y, w, h } = this.screens[i].virtual;
      const translation = twgl.m4.translation([
        x + w / 2,
        this.totalSize.h - (y + h / 2),
        -1,
      ]);
      const plane = twgl.primitives.createPlaneVertices(w, h);
      twgl.primitives.reorientVertices(plane, twgl.m4.rotationX(Math.PI * 0.5));
      twgl.primitives.reorientVertices(plane, translation);
      plane.color = new Float32Array(
        Array(4)
          .fill(screenColors[i % screenColors.length])
          .flat()
      );
      arrays.push(plane);
    }
    return twgl.primitives.concatVertices(arrays);
  }
}

class CalibrationWebGLControl extends OrthographicWebGLControl<CalibrationWebGLState> {
  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: CalibrationWebGLState
  ) {
    super(canvas, sharedState);
  }

  override drawScreen(): void {
    // Setup canvas
    this.gl.clearColor(0.13, 0.13, 0.19, 1);
    this.gl.clearDepth(1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}

export const CalibrationWebGL = {
  create: createDefaultProgram(
    "spanning",
    { animate: false },
    CalibrationWebGLControl,
    CalibrationWebGLState
  ),
};
