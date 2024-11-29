import { AnimationSettings, ScreenInfo } from "@/widgets/Wallpaper/types";
import { mat4, vec3 } from "gl-matrix";
import seedrandom from "seedrandom";
import { createNoise3D } from "simplex-noise";
import { createDefaultProgram } from "../../CanvasProgram";
import { NaiveWebGLControl } from "../../control/WebGLControl";
import { ProgramState } from "../../state/ProgramState";
import fsSource from "./fragment.glsl";
import vsSource from "./vertex.glsl";

// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
/**
 * x: left to right
 * y: bottom to top
 * z: far to near
 */

/**
 * Cannot set the gap to 0.08 or lower because otherwise, the size of the vertex array
 * exceeds the maximum allowed size (2^16). This seems to be a limitation of
 * gl.drawElements compared to gl.drawArrays.
 * https://stackoverflow.com/questions/4998278/is-there-a-limit-of-vertices-in-webgl
 *
 * Here is an example that uses gl.drawArrays
 * https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html
 *
 * I wanted to do an all-shader implementation regardless, so I'll just leave this here.
 */

class WavesWebGLState extends ProgramState {
    gap: number = 0.1;
    nodeSize: number = 0.8; // Percentage of gap
    noiseScale: number = 5;
    numberX: number;
    numberY: number;
    noise: Float32Array;
    noiseFunction: (x: number, y: number, z: number) => number;
    nodes: vec3[];
    cubeRotation: number = 0;
    mesh: { vertices: number[]; triangles: number[]; colors: number[] };

    constructor(
        override screens: ScreenInfo[],
        override animationSettings: AnimationSettings
    ) {
        super(screens, animationSettings);

        const prng = seedrandom("my seed");
        this.noiseFunction = createNoise3D(prng);

        const viewportSize = { w: 9, h: 6 };
        this.numberX = Math.ceil(viewportSize.w / this.gap);
        this.numberY = Math.ceil((viewportSize.h / this.gap) * 2);
        this.noise = new Float32Array(this.numberX * this.numberY * 4);

        this.nodes = [];
        for (let i = 0; i < this.numberX; i++) {
            for (let j = 0; j < this.numberY; j++) {
                // Center point
                let x = i * this.gap - viewportSize.w / 2;
                let y = j * (this.gap / 2) - viewportSize.h / 2;
                if (j % 2 === 0) x += this.gap / 2;
                this.nodes.push(vec3.fromValues(x, y, 0));
            }
        }

        const vertices = [];
        for (let i = 0; i < this.numberX; i++) {
            for (let j = 0; j < this.numberY; j++) {
                // Center point
                let x = i * this.gap - viewportSize.w / 2;
                let y = j * (this.gap / 2) - viewportSize.h / 2;
                if (j % 2 === 0) x += this.gap / 2;

                // Diamond around the center point
                vertices.push(x - (this.gap * this.nodeSize) / 2, y, 0); // left
                vertices.push(x, y + (this.gap * this.nodeSize) / 2, 0); // top
                vertices.push(x + (this.gap * this.nodeSize) / 2, y, 0); // right
                vertices.push(x, y - (this.gap * this.nodeSize) / 2, 0); // bottom
            }
        }

        const triangles = [];
        for (let i = 0; i < this.numberX; i++) {
            for (let j = 0; j < this.numberY; j++) {
                const index = i * this.numberY + j;
                triangles.push(
                    index * 4,
                    index * 4 + 1,
                    index * 4 + 2,
                    index * 4,
                    index * 4 + 2,
                    index * 4 + 3
                );
            }
        }

        const colors = [];
        for (let i = 0; i < this.numberX; i++) {
            for (let j = 0; j < this.numberY; j++) {
                for (let k = 0; k < 4; k++) {
                    colors.push(0.78, 0.39, 0.39, 1);
                }
            }
        }
        this.mesh = { vertices, triangles, colors };
    }

    override updateShared(): void {
        const timeScale = 0.0002;
        const timeOffset = 0;

        for (let i = 0; i < this.numberX; i++) {
            for (let j = 0; j < this.numberY; j++) {
                const index = i * this.numberY * 4 + j * 4;
                const value = this.noiseFunction(
                    (i / this.numberX) * this.noiseScale,
                    (j / 2 / this.numberY) * this.noiseScale,
                    this.time * timeScale + timeOffset
                );
                for (let k = 0; k < 4; k++) this.noise[index + k] = value;
            }
        }
    }
}

class WavesWebGLControl extends NaiveWebGLControl<WavesWebGLState> {
    buffers: {
        position: WebGLBuffer | null;
        color: WebGLBuffer | null;
        indices: WebGLBuffer | null;
        noise: WebGLBuffer | null;
        nodePosition: WebGLBuffer | null;
    };
    programInfo: {
        program: WebGLProgram;
        attribLocations: {
            vertexPosition: number;
            vertexColor: number;
            vertexNoise: number;
            vertexNodePosition: number;
        };
        uniformLocations: {
            projectionMatrix: WebGLUniformLocation | null;
            modelViewMatrix: WebGLUniformLocation | null;
        };
    };

    constructor(
        override canvas: HTMLCanvasElement,
        override sharedState: WavesWebGLState,
        override screenIdx: number
    ) {
        super(canvas, sharedState, screenIdx);

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
                vertexPosition: this.gl.getAttribLocation(
                    shaderProgram,
                    "aVertexPosition"
                ),
                vertexColor: this.gl.getAttribLocation(shaderProgram, "aVertexColor"),
                vertexNoise: this.gl.getAttribLocation(shaderProgram, "aVertexNoise"),
                vertexNodePosition: this.gl.getAttribLocation(
                    shaderProgram,
                    "aVertexNodePosition"
                ),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(
                    shaderProgram,
                    "uProjectionMatrix"
                ),
                modelViewMatrix: this.gl.getUniformLocation(
                    shaderProgram,
                    "uModelViewMatrix"
                ),
            },
        };

        this.buffers = {
            position: this.initPositionBuffer(),
            color: this.initColorBuffer(),
            indices: this.initIndexBuffer(),
            noise: this.initNoiseBuffer(),
            nodePosition: this.initNodePositionBuffer(),
        };
    }

    override draw(): void {
        const gl = this.gl;

        gl.clearColor(0.13, 0.13, 0.19, 1); // Clear to black, fully opaque
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
            this.sharedState.cubeRotation, // amount to rotate in radians
            [0, 0, 1] // axis to rotate around (Z)
        );
        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            this.sharedState.cubeRotation * 0.7, // amount to rotate in radians
            [0, 1, 0] // axis to rotate around (Y)
        );
        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            this.sharedState.cubeRotation * 0.3, // amount to rotate in radians
            [1, 0, 0] // axis to rotate around (X)
        );

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        this.setPositionAttribute();
        this.setColorAttribute();
        this.setNoiseAttribute();
        this.setNodePositionAttribute();
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
        const gl = this.gl;
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
        const gl = this.gl;
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

    setNoiseAttribute() {
        const gl = this.gl;
        const numComponents = 1;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.noise);
        gl.bufferData(gl.ARRAY_BUFFER, this.sharedState.noise, gl.STATIC_DRAW);
        gl.vertexAttribPointer(
            this.programInfo.attribLocations.vertexNoise,
            numComponents,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexNoise);
    }

    setNodePositionAttribute() {
        const gl = this.gl;
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.nodePosition);
        gl.vertexAttribPointer(
            this.programInfo.attribLocations.vertexNodePosition,
            numComponents,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexNodePosition);
    }

    // Initialize a shader program, so WebGL knows how to draw our data
    initShaderProgram() {
        const gl = this.gl;
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource) as WebGLShader;
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
        const gl = this.gl;
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

    initPositionBuffer() {
        const gl = this.gl;
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
        const gl = this.gl;
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
        const gl = this.gl;
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.sharedState.mesh.triangles),
            gl.STATIC_DRAW
        );

        return indexBuffer;
    }

    initNoiseBuffer() {
        const gl = this.gl;
        const noiseBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, noiseBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.sharedState.noise, gl.STATIC_DRAW);

        return noiseBuffer;
    }

    initNodePositionBuffer() {
        const gl = this.gl;
        const nodeBuffer = gl.createBuffer();

        // Flatten the array of nodes
        const flatNodes = new Float32Array(this.sharedState.nodes.length * 4 * 3);
        this.sharedState.nodes.forEach((node, index) => {
            for (let i = 0; i < 4; i++) {
                flatNodes[index * 12 + i * 3] = node[0];
                flatNodes[index * 12 + i * 3 + 1] = node[1];
                flatNodes[index * 12 + i * 3 + 2] = node[2];
            }
        });

        gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatNodes, gl.STATIC_DRAW);

        return nodeBuffer;
    }
}

/**
 * Benchmark:
 * - (tested in Vivaldi)
 * - (60 FPS, full resolution)
 * - Total pixel count: 8064000
 * - FPS: 65
 * - Total delta time: 16.000 ms
 * - State delta time: 0.420 ms
 * - Control delta time: 0.075 ms
 * - GPU Usage: 11%
 */
export const WavesWebGL = {
    create: createDefaultProgram(
        "per-screen",
        { animate: true, fps: 60 },
        WavesWebGLControl,
        WavesWebGLState
    ),
};
