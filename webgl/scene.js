import { Scene as ThreeScene, Group } from "three";
import { Ring } from "./ring";

import { loadAssets } from "./utils/loader";

export class Scene extends ThreeScene {
  shouldRender = false;
  constructor() {
    super({});
  }

  async load({ items }) {
    this.rings = new Group();

    // !1 create rings and load them
    this.rings.add(
      ...items.map((item, index) => {
        return new Ring({
          // !3.2 pass the shole info to the ring
          data: item,
          index,
        });
      })
    );

    this.add(this.rings);

    console.time("load::scene");
    const { matcap } = await loadAssets(); // !2 add matcap to loading pipeline
    await Promise.all(this.rings.children.map((ring) => ring.load({ matcap })));
    console.timeEnd("load::scene");

    this.create();
  }

  create() {
    this.shouldRender = true;
  }

  update(t) {
    if (!this.shouldRender) return;

    // !2 to rotate from the children update() we need to pass the time through
    // notice we don't rotate the group as that will have it's own matrix
    // and the rotation will not be correct
    this.rings?.children.forEach((ring) => ring.update(t));
  }

  resize(vp) {
    this.quad?.resize();
  }
}
