import {
  Scene as ThreeScene,
  Group,
  WebGLRenderTarget,
  BoxGeometry,
  MeshNormalMaterial,
  Mesh,
} from "three";

import { loadAssets } from "./utils/loader";

// !5.3 create another scene

export class AboutScene extends ThreeScene {
  shouldRender = false;
  constructor(vp) {
    super({});
    this.vp = vp;

    // !5.3 auto load
    this.load();
  }

  async load() {
    this.target = new WebGLRenderTarget(
      this.vp.w * this.vp.dpr(),
      this.vp.h * this.vp.dpr()
    );

    this.mesh = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshNormalMaterial({ wireframe: true })
    );

    this.add(this.mesh);

    this.create();
  }

  create() {
    this.shouldRender = true;
  }

  update(t) {
    if (!this.shouldRender) return;

    this.mesh.rotation.x = t;

    this.vp.renderer.setRenderTarget(this.target);
    this.vp.renderer.render(this, this.vp.camera);
    this.vp.renderer.setRenderTarget(null);

    return this.target.texture;
  }

  resize(vp) {
    this.vp = vp;
    this.target.setSize(this.vp.w * this.vp.dpr(), this.vp.h * this.vp.dpr());
  }
}
