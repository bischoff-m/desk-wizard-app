import {
  AnimationSettings,
  ScreenInfo,
  ScreenLayout,
} from "@/app/testing/types";
import { vec3, vec4 } from "gl-matrix";
import * as twgl from "twgl.js";
import { createDefaultProgram } from "../../CanvasProgram";
import { PlaneGeometry } from "../../PlaneGeometry";
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
  constructor(
    override screenLayout: ScreenLayout,
    override animationSettings: AnimationSettings
  ) {
    super(screenLayout, animationSettings, vsSource, fsSource);
  }

  override getMeshArrays(): twgl.Arrays {
    const mesh: {
      vertices: number[];
      triangles: number[];
      colors: number[];
    } = {
      vertices: [],
      triangles: [],
      colors: [],
    };

    const screenColors = [
      vec4.fromValues(0.78, 0.39, 0.39, 1),
      vec4.fromValues(0.39, 0.78, 0.39, 1),
      vec4.fromValues(0.39, 0.39, 0.78, 1),
    ];

    let prevNumVertices = 0;
    for (const screen of this.screenLayout) {
      const center = vec3.fromValues(
        screen.x + screen.w / 2,
        screen.y + screen.h / 2,
        0
      );
      const mapped = {
        x: center[0] * 1,
        y: center[1] * 1,
        w: screen.w * 1,
        h: screen.h * 1,
      };
      const plane = new PlaneGeometry(mapped.w, mapped.h);
      plane.setPosition([mapped.x, mapped.y, -1]);
      plane.setColor(screenColors.pop() as vec4);

      // Shift indices by the number of vertices in the previous screen
      mesh.triangles.push(
        ...plane.getTriangles().map((index) => index + prevNumVertices)
      );
      const colors = plane.getColors();
      mesh.vertices.push(...plane.getVertices());
      mesh.colors.push(...colors);
      prevNumVertices += colors.length / 4;
    }
    return {
      position: { numComponents: 3, data: mesh.vertices },
      indices: { numComponents: 3, data: mesh.triangles },
      color: { numComponents: 4, data: mesh.colors },
    };
  }
}

class CalibrationWebGLControl extends OrthographicWebGLControl<CalibrationWebGLState> {
  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: CalibrationWebGLState,
    override screens: ScreenInfo[]
  ) {
    super(canvas, sharedState, screens);
  }

  override draw(): void {
    // Setup canvas
    this.gl.clearColor(0.13, 0.13, 0.19, 1);
    this.gl.clearDepth(1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  override getCustomUniforms() {
    // const zNear = 0.1;
    // const zFar = 100;
    // const projectionMatrix = twgl.m4.ortho(
    //   -this.canvas.width / 2,
    //   this.canvas.width / 2,
    //   -this.canvas.height / 2,
    //   this.canvas.height / 2,
    //   zNear,
    //   zFar
    // );

    // return {
    //   projectionMatrix,
    //   modelViewMatrix: twgl.m4.identity(),
    // };
    return {};
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
