"use client";

import { mat4 } from "gl-matrix";
import { ScreenTransform } from "../../types";
import { ProgramControl } from "./ProgramControl";
import { ProgramState } from "../ProgramState";

/**
 * TODO: Use twgl
 * https://twgljs.org/
 * - Users should have control over
 *   - Meshes (saved in common WebGLState)
 *   - Shaders
 *   - Uniforms and attributes
 * - Goal is to set the camera to fit the screen
 */

// export abstract class WebGLState extends ProgramState {}

export abstract class WebGLControl<
  TState extends ProgramState = ProgramState
> extends ProgramControl<TState> {
  protected ctx: WebGLRenderingContext;

  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: TState,
    protected transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);
    this.ctx = this.canvas.getContext("webgl") as WebGLRenderingContext;
  }
}

// export abstract class WebGLControl2<
//   TState extends ProgramState = ProgramState
// > extends ProgramControl<TState> {
//   protected ctx: WebGLRenderingContext;
//   private positionBuffer: WebGLBuffer | null;
//   private indexBuffer: WebGLBuffer | null;
//   // private buffers: {
//   //   position: WebGLBuffer | null;
//   //   color: WebGLBuffer | null;
//   //   indices: WebGLBuffer | null;
//   // };
//   private shaderProgram: WebGLProgram;
//   private attribLocations: {
//     vertexPosition: number;
//     vertexColor: number;
//   };
//   private uniformLocations: {
//     projectionMatrix: WebGLUniformLocation | null;
//     modelViewMatrix: WebGLUniformLocation | null;
//   };

//   constructor(
//     protected canvas: HTMLCanvasElement,
//     protected sharedState: TState,
//     protected transform: ScreenTransform,
//     protected vsSource: string,
//     protected fsSource: string
//   ) {
//     super(canvas, sharedState, transform);
//     this.ctx = this.canvas.getContext("webgl") as WebGLRenderingContext;
//     const gl = this.ctx;

//     // Load vertex and fragment shaders
//     const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
//     gl.shaderSource(vertexShader, vsSource);
//     gl.compileShader(vertexShader);

//     const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
//     gl.shaderSource(fragmentShader, fsSource);
//     gl.compileShader(fragmentShader);

//     if (
//       !gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) ||
//       !gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)
//     )
//       throw new Error("An error occurred compiling the shaders.");

//     // Create the shader program
//     this.shaderProgram = gl.createProgram() as WebGLProgram;
//     gl.attachShader(this.shaderProgram, vertexShader);
//     gl.attachShader(this.shaderProgram, fragmentShader);
//     gl.linkProgram(this.shaderProgram);

//     // If creating the shader program failed, alert
//     if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS))
//       throw new Error(
//         `Unable to initialize the shader program: ${gl.getProgramInfoLog(
//           this.shaderProgram
//         )}`
//       );

//     this.attribLocations = {
//       vertexPosition: gl.getAttribLocation(
//         this.shaderProgram,
//         "aVertexPosition"
//       ),
//       vertexColor: gl.getAttribLocation(this.shaderProgram, "aVertexColor"),
//     };
//     this.uniformLocations = {
//       projectionMatrix: gl.getUniformLocation(
//         this.shaderProgram,
//         "uProjectionMatrix"
//       ),
//       modelViewMatrix: gl.getUniformLocation(
//         this.shaderProgram,
//         "uModelViewMatrix"
//       ),
//     };

//     this.positionBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
//     gl.bufferData(
//       gl.ARRAY_BUFFER,
//       new Float32Array(this.sharedState.mesh.vertices),
//       gl.STATIC_DRAW
//     );

//     this.indexBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
//     gl.bufferData(
//       gl.ELEMENT_ARRAY_BUFFER,
//       new Uint16Array(this.sharedState.mesh.triangles),
//       gl.STATIC_DRAW
//     );
//   }

//   protected beforeDraw(): void {
//     const gl = this.ctx;

//     const zNear = 0.1;
//     const zFar = 100;
//     const projectionMatrix = mat4.create();

//     mat4.ortho(
//       projectionMatrix,
//       -this.canvas.width / 2,
//       this.canvas.width / 2,
//       -this.canvas.height / 2,
//       this.canvas.height / 2,
//       zNear,
//       zFar
//     );

//     this.setAttribute(
//       this.positionBuffer,
//       this.attribLocations.vertexPosition,
//       3,
//       gl.FLOAT
//     );
//     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

//     gl.useProgram(this.shaderProgram);

//     // Set the shader uniforms
//     const modelViewMatrix = mat4.create();
//     gl.uniformMatrix4fv(
//       this.uniformLocations.projectionMatrix,
//       false,
//       projectionMatrix
//     );
//     gl.uniformMatrix4fv(
//       this.uniformLocations.modelViewMatrix,
//       false,
//       modelViewMatrix
//     );
//     // length of index buffer * 3
//     const vertexCount = this.sharedState.mesh.triangles.length;
//     const type = gl.UNSIGNED_SHORT;
//     const offset = 0;
//     gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);

//     // const { translate, scale } = this.transform;
//     // console.log(translate, scale);
//   }

//   protected setAttribute(
//     buffer: WebGLBuffer | null,
//     attribPointerIndex: number,
//     numComponents: number,
//     type: number
//   ) {
//     const normalize = false;
//     const stride = 0; // how many bytes to get from one set of values to the next
//     // 0 = use type and numComponents above
//     const offset = 0; // how many bytes inside the buffer to start from
//     this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buffer);
//     this.ctx.vertexAttribPointer(
//       attribPointerIndex,
//       numComponents,
//       type,
//       normalize,
//       stride,
//       offset
//     );
//     this.ctx.enableVertexAttribArray(attribPointerIndex);
//   }
// }
