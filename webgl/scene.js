import { Scene as ThreeScene } from "three";
import { Quad } from "./quad";
// import { Model as Duck } from "./model";
// import { Instance } from "./instance";

import { loadAssets } from "./utils/loader";

export class Scene extends ThreeScene {
  shouldRender = false;
  constructor() {
    super({
      // frustumCulled: false,
    });
  }

  async load() {
    // this.assets = await loadAssets();
    // console.log(this.assets);

    this.create();
  }

  create() {
    this.quad = new Quad();
    this.add(this.quad);

    // this.duck = new Duck({ geometry: this.assets.duck_model });
    // this.add(this.duck);

    // this.instance = new Instance({});
    // this.add(this.instance);

    this.shouldRender = true;
  }

  update(t) {
    if (!this.shouldRender) return;
    this.quad?.update(t);

    this.quad.rotation.x = t;
    this.quad.rotation.y = t;
    this.quad.rotation.z = t;
  }

  resize(vp) {
    this.quad?.resize();
  }
}
