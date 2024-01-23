#define GLSLIFY 1

attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
attribute float aVertexNoise;
attribute vec3 aVertexNodePosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

void main(void) {
    vec4 pos = aVertexPosition;
    pos.xy += 0.5 * (aVertexNoise + 1.0) * (aVertexNodePosition.xy - aVertexPosition.xy);
    gl_Position = uProjectionMatrix * uModelViewMatrix * pos;
    vColor = aVertexColor;
}