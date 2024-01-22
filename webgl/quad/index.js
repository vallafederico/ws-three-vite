import { PlaneGeometry, Mesh, ShaderMaterial, DoubleSide } from "three";
import vertexShader from "./vertex.vert";
import fragmentShader from "./fragment.frag";

export class Quad extends Mesh {
  constructor() {
    super();
    this.geometry = new PlaneGeometry(1, 1);
    this.material = new Material();
  }

  resize() {}

  update(t) {
    this.material.time = t;

    // this.rotation.x = t;
  }
}

class Material extends ShaderMaterial {
  constructor(options) {
    super({
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      uniforms: {
        u_time: { value: options?.u_time || 0 },
        u_t1: { value: options?.u_t1 || null },
      },
    });
  }

  set time(t) {
    this.uniforms.u_time.value = t;
  }
}
