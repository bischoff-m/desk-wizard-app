#define GLSLIFY 1
precision mediump float;

attribute vec4 position;

uniform mat4 viewProjectionMatrix;

varying vec4 v_color;
varying vec4 v_position;

void main(void) {
    gl_Position = viewProjectionMatrix * position;
    v_color = vec4(1.0, 1.0, 0.0, 1.0);
    v_position = position;
}