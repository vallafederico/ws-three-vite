import { Group, ShaderMaterial, DoubleSide } from "three";
import vertexShader from "./vertex.vert";
import fragmentShader from "./fragment.frag";
import { loadAssets } from "../utils/loader";

export class Ring extends Group {
  constructor({ data, index }) {
    super();

    this.data = data;
    this.index = index;
  }

  async load() {
    // !1 load assets
    const { model, diffuse } = await loadAssets(this.data);
    this.create(model, diffuse);
  }

  create(geometry, diffuse) {
    // !1 change the pipeline
    const group = findGroup(geometry);

    this.material = new Material();

    group.traverse((item) => {
      if (item.isMesh) {
        item.material = this.material;
      }
    });

    // !1 use the index to move items
    this.position.x = this.index;

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
