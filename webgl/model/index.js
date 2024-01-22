import { Group, ShaderMaterial, DoubleSide } from "three";
import vertexShader from "./vertex.vert";
import fragmentShader from "./fragment.frag";

export class Model extends Group {
  constructor({ geometry }) {
    super();
    this.create(geometry);
  }

  create(geometry) {
    const group = findGroup(geometry);

    this.material = new Material();
    // in this instance we're creating a single material for all
    // you might want to IE create a material per mesh (inside the loop)
    // and pass different textures, or match by
    // item.name === 'some name' and assign a different material
    // based on the name

    group.traverse((item) => {
      if (item.isMesh) {
        item.material = this.material;
      }
    });

    this.add(...group.children);
  }

  resize() {}

  update(t) {
    this.material.time = t;
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

/** Utils */
function findGroup(obj) {
  if (obj.isGroup === true) {
    return obj;
  }

  for (const key in obj) {
    if (typeof obj[key] === "object") {
      const result = findGroup(obj[key]);
      if (result) {
        return result;
      }
    }
  }

  return null;
}
