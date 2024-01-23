import {
  AnimationSettings,
  ScreenLayout,
  ScreenTransform,
} from "@/app/testing/types";
import { vec3, vec4 } from "gl-matrix";
import { createDefaultProgram } from "../../CanvasProgram";
import { PlaneGeometry } from "../../PlaneGeometry";
import { ProgramState } from "../../ProgramState";
import { NaiveWebGLControl } from "../../control/WebGLControl";
import fsSource from "./fragment.glsl";
import vsSource from "./vertex.glsl";

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
/**
 * x: left to right
 * y: bottom to top
 * z: far to near
 */

class CalibrationWebGLState extends ProgramState {
  public mesh: { vertices: number[]; triangles: number[]; colors: number[] };

  constructor(
    override screenLayout: ScreenLayout,
    override animationSettings: AnimationSettings
  ) {
    super(screenLayout, animationSettings);

    this.mesh = {
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
    for (const screen of screenLayout) {
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
      plane.setPosition([mapped.x - 2000, -mapped.y + 1000, -1]);
      plane.setColor(screenColors.pop() as vec4);

      // Shift indices by the number of vertices in the previous screen
      this.mesh.triangles.push(
        ...plane.getTriangles().map((index) => index + prevNumVertices)
      );
      const colors = plane.getColors();
      this.mesh.vertices.push(...plane.getVertices());
      this.mesh.colors.push(...colors);
      prevNumVertices += colors.length / 4;
    }
  }

  override updateShared(): void {
    // this.mesh = {
    //   vertices: this.plane.getVertices(),
    //   triangles: this.plane.getTriangles(),
    //   colors: this.plane.getColors(),
    // };
    // console.log(this.mesh.vertices);
  }
}

class CalibrationWebGLControl extends NaiveWebGLControl<CalibrationWebGLState> {
  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: CalibrationWebGLState,
    override transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform, vsSource, fsSource);
  }

  override draw(): void {
    const gl = this.ctx;

    // Setup canvas
    gl.clearColor(0.13, 0.13, 0.19, 1);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.setColorAttribute();
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  setColorAttribute() {
    const gl = this.ctx;
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);
  }

  initColorBuffer() {
    const gl = this.ctx;
    const colorBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.sharedState.mesh.colors),
      gl.STATIC_DRAW
    );

    return colorBuffer;
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
