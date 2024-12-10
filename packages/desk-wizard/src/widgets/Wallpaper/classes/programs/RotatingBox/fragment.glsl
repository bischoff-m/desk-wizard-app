#define GLSLIFY 1

varying lowp vec4 vColor;

void main() {
    gl_FragColor = vColor;
}