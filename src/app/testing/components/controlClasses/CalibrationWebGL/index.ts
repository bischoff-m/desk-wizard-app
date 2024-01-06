import { Dimensions, ScreenLayout, ScreenTransform } from "@/app/testing/types";
import { mat4 } from "gl-matrix";
import { WebGLControl, createDefaultProgram } from "../../ProgramControl";
import { ProgramState } from "../../ProgramState";
import fsSource from "./fragment.glsl";
import vsSource from "./vertex.glsl";

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
/**
 * x: left to right
 * y: bottom to top
 * z: far to near
 */

class CalibrationWebGLState extends ProgramState {
  mesh: { vertices: number[]; triangles: number[]; colors: number[] };

  constructor(
    public sizeInPixel: Dimensions,
    public screenLayout: ScreenLayout
  ) {
    super(sizeInPixel, screenLayout);

    const vertices = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];

    const triangles = [0, 1, 2, 1, 2, 3];

    const colors = Array(4).fill([0.78, 0.39, 0.39, 1]).flat();
    this.mesh = { vertices, triangles, colors };
  }

  protected updateShared(): void {}
}

class CalibrationWebGLControl extends WebGLControl {
  buffers: {
    position: WebGLBuffer | null;
    color: WebGLBuffer | null;
    indices: WebGLBuffer | null;
  };
  programInfo: {
    program: WebGLProgram;
    attribLocations: {
      vertexPosition: number;
      vertexColor: number;
    };
    uniformLocations: {
      projectionMatrix: WebGLUniformLocation | null;
      modelViewMatrix: WebGLUniformLocation | null;
    };
  };

  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: CalibrationWebGLState,
    protected transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = this.initShaderProgram();
    if (!shaderProgram) {
      throw new Error("Failed to initialize shader program");
    }
    // Collect all the info needed to use the shader program.
    // Look up which attribute our shader program is using
    // for aVertexPosition and look up uniform locations.
    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: this.ctx.getAttribLocation(
          shaderProgram,
          "aVertexPosition"
        ),
        vertexColor: this.ctx.getAttribLocation(shaderProgram, "aVertexColor"),
      },
      uniformLocations: {
        projectionMatrix: this.ctx.getUniformLocation(
          shaderProgram,
          "uProjectionMatrix"
        ),
        modelViewMatrix: this.ctx.getUniformLocation(
          shaderProgram,
          "uModelViewMatrix"
        ),
      },
    };

    this.buffers = {
      position: this.initPositionBuffer(),
      color: this.initColorBuffer(),
      indices: this.initIndexBuffer(),
    };
  }

  draw(): void {
    const gl = this.ctx;

    // Setup canvas
    gl.clearColor(0.13, 0.13, 0.19, 1);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.width / gl.canvas.height;
    const zNear = 0.1;
    const zFar = 100;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [0, 0, -6] // amount to translate
    );

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    this.setPositionAttribute();
    this.setColorAttribute();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

    // Tell WebGL to use our program when drawing
    gl.useProgram(this.programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );
    gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );
    // length of index buffer * 3
    const vertexCount = this.sharedState.mesh.triangles.length;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  setPositionAttribute() {
    const gl = this.ctx;
    const numComponents = 3; // pull out 3 values per iteration
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
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

  // Initialize a shader program, so WebGL knows how to draw our data
  initShaderProgram() {
    const gl = this.ctx;
    const vertexShader = this.loadShader(
      gl.VERTEX_SHADER,
      vsSource
    ) as WebGLShader;
    const fragmentShader = this.loadShader(
      gl.FRAGMENT_SHADER,
      fsSource
    ) as WebGLShader;

    // Create the shader program
    const shaderProgram = gl.createProgram() as WebGLProgram;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
          shaderProgram
        )}`
      );
      return null;
    }

    return shaderProgram;
  }

  // Creates a shader of the given type, uploads the source and compiles it.
  loadShader(type: number, source: string) {
    const gl = this.ctx;
    const shader = gl.createShader(type) as WebGLShader;

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(
        `An error occurred compiling the shaders: ${gl.getShaderInfoLog(
          shader
        )}`
      );
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  initPositionBuffer() {
    const gl = this.ctx;
    // Create a buffer for the square's positions.
    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.sharedState.mesh.vertices),
      gl.STATIC_DRAW
    );

    return positionBuffer;
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

  initIndexBuffer() {
    const gl = this.ctx;
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.sharedState.mesh.triangles),
      gl.STATIC_DRAW
    );

    return indexBuffer;
  }
}

export const CalibrationWebGL = {
  create: createDefaultProgram(CalibrationWebGLControl, CalibrationWebGLState),
};
