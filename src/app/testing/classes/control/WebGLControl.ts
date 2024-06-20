"use client";

import * as twgl from "twgl.js";
import { ScreenInfo } from "../../types";
import { ProgramState } from "../state/ProgramState";
import { WebGLState } from "../state/WebGLState";
import { PerScreenControl, SpanningControl } from "./ProgramControl";

export abstract class NaiveWebGLControl<
  TState extends ProgramState
> extends PerScreenControl<TState> {
  protected gl: WebGL2RenderingContext;

  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: TState,
    override screenIdx: number
  ) {
    super(canvas, sharedState, screenIdx);
    this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;
  }
}

export abstract class OrthographicWebGLControl<
  TState extends WebGLState
> extends SpanningControl<TState> {
  protected gl: WebGL2RenderingContext;
  private programInfo: twgl.ProgramInfo;
  private bufferInfo: twgl.BufferInfo;

  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: TState
  ) {
    super(canvas, sharedState);

    this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;
    this.programInfo = twgl.createProgramInfo(this.gl, [
      sharedState.vsSource,
      sharedState.fsSource,
    ]);
    this.bufferInfo = twgl.createBufferInfoFromArrays(
      this.gl,
      sharedState.meshArrays
    );
  }

  protected getCustomUniforms(): object {
    return {};
  }
  protected abstract drawScreen(screen: ScreenInfo): void;

  private getUniforms(
    screen: ScreenInfo
  ): { viewProjectionMatrix: twgl.m4.Mat4 } & object {
    return {
      viewProjectionMatrix: this.getViewProjectionMatrix(screen),
      ...this.getCustomUniforms(),
    };
  }

  protected getViewProjectionMatrix(screen: ScreenInfo): twgl.m4.Mat4 {
    /**
     * This took some time to figure out. The orthographic projection makes the given
     * coordinates fit the whole canvas (independent of scissors). To make every screen
     * fit its element, the canvas size is scaled from bounding to virtual size.
     *
     * To get the correct translation, the bounding margin is subtracted from the virtual
     * margin. Also, WebGL has its origin in the bottom left corner, so the y axis is
     * flipped. To get the correct y-translation, the margin from the bottom to the screen
     * is calculated.
     */

    const { h: th } = this.sharedState.totalSize;
    const { x: vx, y: vy, w: vw, h: vh } = screen.virtual;
    const { x: bx, y: by, w: bw, h: bh } = screen.boundingRect;
    const { clientWidth: cw, clientHeight: ch } = this.canvas;

    // https://webglfundamentals.org/webgl/lessons/webgl-3d-orthographic.html
    // https://webglfundamentals.org/webgl/lessons/webgl-3d-perspective.html
    // Othographic projection
    const near = 0.01;
    const far = 1000;
    const projectionMatrix = twgl.m4.ortho(
      0,
      cw * (vw / bw),
      0,
      ch * (vh / bh),
      near,
      far
    );

    // https://webglfundamentals.org/webgl/lessons/webgl-3d-camera.html
    const cameraMatrix = twgl.m4.translate(twgl.m4.identity(), [
      vx - bx * (vw / bw),
      th - vy - vh - (ch - by - bh) * (vh / bh),
      0,
    ]);
    const viewMatrix = twgl.m4.inverse(cameraMatrix);
    return twgl.m4.multiply(projectionMatrix, viewMatrix);
  }

  override beforeDraw(): void {
    this.gl.enable(this.gl.SCISSOR_TEST);
    this.gl.useProgram(this.programInfo.program);
    twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
  }

  override draw(): void {
    for (const screen of this.sharedState.screens) {
      this.gl.scissor(
        screen.boundingRect.x,
        this.canvas.clientHeight -
          screen.boundingRect.y -
          screen.boundingRect.h,
        screen.boundingRect.w,
        screen.boundingRect.h
      );

      twgl.setUniforms(this.programInfo, this.getUniforms(screen));
      this.drawScreen(screen);
      twgl.drawBufferInfo(this.gl, this.bufferInfo);
    }
  }

  override afterDraw(): void {}
}
