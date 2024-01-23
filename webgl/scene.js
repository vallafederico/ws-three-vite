import { Scene as ThreeScene, Group, WebGLRenderTarget } from "three";
import { Ring } from "./ring";

import { loadAssets } from "./utils/loader";

export class Scene extends ThreeScene {
  shouldRender = false;
  constructor({ vp }) {
    super({});
    this.vp = vp;
  }

  async load({ items }) {
    this.rings = new Group();
    this.target = new WebGLRenderTarget(
      this.vp.w * this.vp.dpr(),
      this.vp.h * this.vp.dpr()
    );

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

  update(t, x) {
    if (!this.shouldRender) return;

    this.rings.position.x = -x; // !4.2 move group by slider X
    // console.log(x);

    // !2 to rotate from the children update() we need to pass the time through
    // notice we don't rotate the group as that will have it's own matrix
    // and the rotation will not be correct
    this.rings?.children.forEach((ring) => ring.update(t));

    // !5.1 render to target and return from update function
    this.vp.renderer.setRenderTarget(this.target);
    this.vp.renderer.render(this.rings, this.vp.camera);
    this.vp.renderer.setRenderTarget(null);

    return this.target.texture;
  }

  resize(vp) {
    // !4.1 resize the render target
    this.vp = vp;
    this.target.setSize(this.vp.w * this.vp.dpr(), this.vp.h * this.vp.dpr());

    this.quad?.resize();
  }
}
