import { ScreenTransform } from "@/app/testing/types";
import { mat4 } from "gl-matrix";
import { createDefaultProgram } from "../../CanvasProgram";
import { ProgramState } from "../../ProgramState";
import { NaiveWebGLControl } from "../../control/WebGLControl";
import fsSource from "./fragment.glsl";
import vsSource from "./vertex.glsl";

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context

// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(gl: WebGLRenderingContext) {
  const vertexShader = loadShader(
    gl,
    gl.VERTEX_SHADER,
    vsSource
  ) as WebGLShader;
  const fragmentShader = loadShader(
    gl,
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
function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type) as WebGLShader;

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initBuffers(gl: WebGLRenderingContext) {
  const positionBuffer = initPositionBuffer(gl);
  const colorBuffer = initColorBuffer(gl);
  const indexBuffer = initIndexBuffer(gl);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

function initPositionBuffer(gl: WebGLRenderingContext) {
  // Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
    // Front face
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,

    // Back face
    -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1,

    // Top face
    -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,

    // Bottom face
    -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,

    // Right face
    1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,

    // Left face
    -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}

function initColorBuffer(gl: WebGLRenderingContext) {
  const faceColors = [
    [1, 1, 1, 1], // Front face: white
    [1, 0, 0, 1], // Back face: red
    [0, 1, 0, 1], // Top face: green
    [0, 0, 1, 1], // Bottom face: blue
    [1, 1, 0, 1], // Right face: yellow
    [1, 0, 1, 1], // Left face: purple
  ];

  // Convert the array of colors into a table for all the vertices.
  let colors: number[] = [];
  for (let j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];
    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return colorBuffer;
}

function initIndexBuffer(gl: WebGLRenderingContext) {
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.
  const indices = [
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // back
    8,
    9,
    10,
    8,
    10,
    11, // top
    12,
    13,
    14,
    12,
    14,
    15, // bottom
    16,
    17,
    18,
    16,
    18,
    19, // right
    20,
    21,
    22,
    20,
    22,
    23, // left
  ];

  // Now send the element array to GL
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  return indexBuffer;
}

function drawScene(
  gl: WebGLRenderingContext,
  programInfo: any,
  buffers: any,
  cubeRotation: number
) {
  gl.clearColor(0, 0, 0, 1); // Clear to black, fully opaque
  gl.clearDepth(1); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

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

  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation, // amount to rotate in radians
    [0, 0, 1] // axis to rotate around (Z)
  );
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.7, // amount to rotate in radians
    [0, 1, 0] // axis to rotate around (Y)
  );
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.3, // amount to rotate in radians
    [1, 0, 0] // axis to rotate around (X)
  );

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  setPositionAttribute(gl, buffers, programInfo);
  setColorAttribute(gl, buffers, programInfo);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  const vertexCount = 36;
  const type = gl.UNSIGNED_SHORT;
  const offset = 0;
  gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(
  gl: WebGLRenderingContext,
  buffers: any,
  programInfo: any
) {
  const numComponents = 3; // pull out 3 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

// Tell WebGL how to pull out the colors from the color buffer
// into the vertexColor attribute.
function setColorAttribute(
  gl: WebGLRenderingContext,
  buffers: any,
  programInfo: any
) {
  const numComponents = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}

class RotatingBoxControl extends NaiveWebGLControl<ProgramState> {
  buffers: {
    position: WebGLBuffer | null;
    color: WebGLBuffer | null;
    indices: WebGLBuffer | null;
  };
  programInfo: {
    program: WebGLProgram;
    attribLocations: { vertexPosition: number; vertexColor: number };
    uniformLocations: {
      projectionMatrix: WebGLUniformLocation | null;
      modelViewMatrix: WebGLUniformLocation | null;
    };
  };
  cubeRotation = 0;

  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: ProgramState,
    override transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(this.ctx);
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

    this.buffers = initBuffers(this.ctx);
  }

  override draw(): void {
    drawScene(this.ctx, this.programInfo, this.buffers, this.cubeRotation);
    this.cubeRotation += this.sharedState.timeDelta * 0.001;
  }
}

export const RotatingBox = {
  create: createDefaultProgram(
    "per-screen",
    { animate: true, fps: 60 },
    RotatingBoxControl
  ),
};
