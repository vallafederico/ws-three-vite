// import { Vector2 } from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { MixPass } from "./mix";

export class Post extends EffectComposer {
  // !5.1 enable post
  isOn = true;
  constructor({ renderer, scene, camera }) {
    super(renderer);
    this.renderer = renderer;

    // 5.1 we can avoid a useless render now because we're doing this manually
    // this.renderPass = new RenderPass(scene, camera);
    // this.addPass(this.renderPass);

    this.createPasses();
  }

  createPasses() {
    // 5.1 restructure to access
    this.mixpass = new MixPass();
    this.addPass(this.mixpass);
  }

  renderPasses(t, { rings }) {
    // !5.1 get ring texture from scene and pass it to shader
    this.mixpass.uniforms.u_rings.value = rings;
  }
}
