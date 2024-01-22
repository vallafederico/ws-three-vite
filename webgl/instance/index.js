import {
  ShaderMaterial,
  DoubleSide,
  InstancedMesh,
  PlaneGeometry,
  InstancedBufferAttribute,
} from "three";

import vertexShader from "./vertex.vert";
import fragmentShader from "./fragment.frag";

function calcAttributes(num) {
  const a_rot = new Float32Array(num * 1);
  const a_pos = new Float32Array(num * 3);

  for (let i = 0; i < num; i++) {
    a_rot.set([Math.random() - 0.5], i * 1);
    a_pos.set(
      [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
      i * 3
    );
  }

  return {
    a_rotation: {
      name: "a_rotation",
      data: new InstancedBufferAttribute(a_rot, 1),
    },
    a_position: {
      name: "a_position",
      data: new InstancedBufferAttribute(a_pos, 3),
    },
  };
}

export class Instance extends InstancedMesh {
  constructor() {
    super();

    this.count = 10;
    this.geometry = new PlaneGeometry(1, 1, 1, 1);
    this.setAttributes();
    this.material = new Material();
  }

  setAttributes() {
    const attributes = calcAttributes(this.count);
    for (const key in attributes) {
      const { name, data } = attributes[key];
      this.geometry.setAttribute(name, data);
    }
  }

  render(t) {}

  resize() {}
}

class Material extends ShaderMaterial {
  constructor(options) {
    super({
      vertexShader,
      fragmentShader,
      //   side: DoubleSide,
    });

    this.uniforms = {
      u_time: { value: options?.u_time || 0 },
      u_t1: { value: options?.u_t1 || null },
    };

    this.side = DoubleSide;
    // this.wireframe= true;
    // this.transparent= true;
  }

  set time(t) {
    this.uniforms.u_time.value = t;
  }
}
