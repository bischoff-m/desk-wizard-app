#define GLSLIFY 1

attribute vec4 position;
attribute vec4 color;

uniform mat4 viewProjectionMatrix;

varying lowp vec4 v_color;

void main(void) {
    gl_Position = viewProjectionMatrix * position;
    v_color = color;
}