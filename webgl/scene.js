import { Scene as ThreeScene, Group } from "three";
import { Ring } from "./ring";

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
          data: item.webgl,
          index,
        });
      })
    );

    this.add(this.rings);

    console.time("load::scene");
    await Promise.all(this.rings.children.map((ring) => ring.load()));
    console.timeEnd("load::scene");

    this.create();
  }

  create() {
    this.shouldRender = true;
  }

  update(t) {
    if (!this.shouldRender) return;
  }

  resize(vp) {
    this.quad?.resize();
  }
}
