"use client";

import * as twgl from "twgl.js";
import { ScreenInfo } from "../../types";
import { ProgramState } from "../state/ProgramState";
import { WebGLState } from "../state/WebGLState";
import { PerScreenControl, SpanningControl } from "./ProgramControl";

export abstract class NaiveWebGLControl<
  TState extends ProgramState
> extends PerScreenControl<TState> {
  protected gl: WebGLRenderingContext;

  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: TState,
    override screen: ScreenInfo
  ) {
    super(canvas, sharedState, screen);
    this.gl = this.canvas.getContext("webgl") as WebGLRenderingContext;
  }
}

export abstract class OrthographicWebGLControl<
  TState extends WebGLState
> extends SpanningControl<TState> {
  protected gl: WebGLRenderingContext;
  private programInfo: twgl.ProgramInfo;
  private bufferInfo: twgl.BufferInfo;

  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: TState,
    override screens: ScreenInfo[]
  ) {
    super(canvas, sharedState, screens);

    this.gl = this.canvas.getContext("webgl") as WebGLRenderingContext;
    this.programInfo = twgl.createProgramInfo(this.gl, [
      sharedState.vsSource,
      sharedState.fsSource,
    ]);
    this.bufferInfo = twgl.createBufferInfoFromArrays(
      this.gl,
      sharedState.meshArrays
    );
  }

  protected abstract getCustomUniforms(): object;

  private getUniforms(): { viewProjectionMatrix: twgl.m4.Mat4 } & object {
    return {
      viewProjectionMatrix: this.getViewProjectionMatrix(),
      ...this.getCustomUniforms(),
    };
  }

  protected getViewProjectionMatrix(): twgl.m4.Mat4 {
    const screen = this.screens[0]; // TODO: Support multiple screens
    const { x, y } = screen.virtual;
    const scale = screen.physicalToVirtualScale;

    // https://webglfundamentals.org/webgl/lessons/webgl-3d-orthographic.html
    // https://webglfundamentals.org/webgl/lessons/webgl-3d-perspective.html
    // Othographic projection
    const { width, height } = this.canvas;
    const near = 0.01;
    const far = 1000;
    const projectionMatrix = twgl.m4.ortho(
      (-width / 2) * scale,
      (width / 2) * scale,
      (-height / 2) * scale,
      (height / 2) * scale,
      near,
      far
    );

    // https://webglfundamentals.org/webgl/lessons/webgl-3d-camera.html
    /**
     * TODO: Get scissors working
     */
    let cameraMatrix = twgl.m4.identity();
    cameraMatrix = twgl.m4.translate(cameraMatrix, [
      -x / scale + 1270,
      -y / scale + 540,
      0,
    ]);
    const viewMatrix = twgl.m4.inverse(cameraMatrix);
    return twgl.m4.multiply(projectionMatrix, viewMatrix);
  }

  override beforeDraw(): void {
    this.gl.useProgram(this.programInfo.program);
    twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
    twgl.setUniforms(this.programInfo, this.getUniforms());
  }

  override afterDraw(): void {
    twgl.drawBufferInfo(this.gl, this.bufferInfo);
  }
}
