import { vec3, vec4 } from "gl-matrix";

export class PlaneGeometry {
    public position: vec3;
    public rotation: vec3;
    public scale: vec3;
    public color: vec4;

    constructor(public width: number, public height: number) {
        this.position = vec3.create();
        this.rotation = vec3.create();
        this.scale = vec3.fromValues(1, 1, 1);
        this.color = vec4.fromValues(1, 1, 1, 1);
    }

    public setPosition(position: vec3) {
        this.position = position;
    }
    public setRotation(rotation: vec3) {
        this.rotation = rotation;
    }
    public setScale(scale: vec3) {
        this.scale = scale;
    }
    public setColor(color: vec4) {
        this.color = color;
    }

    getVertices(): number[] {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const vertices = [
            vec3.fromValues(-halfWidth, -halfHeight, 0),
            vec3.fromValues(halfWidth, -halfHeight, 0),
            vec3.fromValues(-halfWidth, halfHeight, 0),
            vec3.fromValues(halfWidth, halfHeight, 0),
        ];

        return vertices.reduce<number[]>((acc, vertex) => {
            const newVertex = vec3.clone(vertex);

            newVertex[0] += this.position[0];
            newVertex[1] += this.position[1];
            newVertex[2] += this.position[2];
            vec3.rotateX(newVertex, newVertex, this.position, this.rotation[0]);
            vec3.rotateY(newVertex, newVertex, this.position, this.rotation[1]);
            vec3.rotateZ(newVertex, newVertex, this.position, this.rotation[2]);
            newVertex[0] *= this.scale[0];
            newVertex[1] *= this.scale[1];
            newVertex[2] *= this.scale[2];

            return acc.concat(...newVertex);
        }, []);
    }
    getTriangles(): number[] {
        return [0, 1, 2, 1, 2, 3];
    }
    getColors(): number[] {
        return Array(4)
            .fill([...this.color])
            .flat();
    }
}
