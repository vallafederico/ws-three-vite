import {
  Group,
  ShaderMaterial,
  DoubleSide,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
} from "three";
import vertexShader from "./vertex.vert";
import fragmentShader from "./fragment.frag";
import { loadAssets } from "../utils/loader";

import { gsap } from "../utils/gsap";

export class Ring extends Group {
  constructor({ data, index }) {
    super();

    this.data = data;
    this.index = index;
  }

  async load({ matcap }) {
    // !1 load assets
    // !3.2 only pass the webgl to the loader
    const { model, diffuse } = await loadAssets(this.data.webgl);

    this.create({ geometry: model, diffuse, matcap }); // !2 pass matcap to create
  }

  create({ geometry, diffuse, matcap }) {
    // !1 change the pipeline
    const group = findGroup(geometry);

    this.material = new Material({
      // !2 pass diffuse texture to the material
      u_t1: diffuse,
      u_matcap: matcap,
    });

    group.traverse((item) => {
      if (item.isMesh) {
        item.material = this.material;
      }
    });

    // !1 use the index to move items
    this.position.x = this.index;

    this.target = new Mesh(
      new BoxGeometry(0.5, 0.5, 0.5),
      new MeshBasicMaterial({ color: 0xff0000 })
    );
    this.target.visible = false;

    this.add(...group.children, this.target);

    // this.add(...group.children);
  }

  resize() {}

  update(t) {
    this.material.time = t;

    // !2 add simple movement to check out the light
    this.rotation.y = t * 0.8;
    this.rotation.x = t * 0.8;
  }

  /** Animation */
  onHover(val = 0) {
    // console.log("hover", val);

    // (!4.1) hover state with gsap
    gsap.to(this.material.uniforms.u_a_hover, {
      value: val,
      duration: 0.9,
    });
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
        u_t1: { value: options?.u_t1 || null }, // !2 this was already here, now has data
        u_matcap: { value: options?.u_matcap || null }, // !2 add matcap to uniforms
        // (!4.1) animation uniforms
        u_a_hover: { value: 0 },
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
