// import { Vector2 } from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { Shader } from "./pass";

export class Post extends EffectComposer {
  // isOn = true;
  constructor({ renderer, scene, camera }) {
    super(renderer);
    this.renderer = renderer;

    this.renderPass = new RenderPass(scene, camera);
    this.addPass(this.renderPass);

    this.createPasses();
  }

  createPasses() {
    this.addPass(new Shader());
  }

  renderPasses(t) {}
}
