// import { Vector2 } from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { MixPass } from "./mix";

// !5.2 import needed passes from three
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";

import { gsap } from "../utils/gsap";

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
    // !5.1 restructure to access
    this.mixpass = new MixPass();
    this.addPass(this.mixpass);

    // !5.2 create the pass (needs to be the last one)
    this.fxaa = new ShaderPass(FXAAShader);
    this.addPass(this.fxaa);
  }

  renderPasses(t, { rings, about }) {
    // !5.1 get ring texture from scene and pass it to shader
    this.mixpass.uniforms.u_rings.value = rings;
    this.mixpass.uniforms.u_about.value = about;
  }

  resize(vp) {
    // !5.2 resize passes
    this.vp = vp;

    // pass resolution as uniforms (copied form the example)
    this.fxaa.material.uniforms["resolution"].value.x =
      1 / (this.vp.w * this.vp.dpr());
    this.fxaa.material.uniforms["resolution"].value.y =
      1 / (this.vp.w.h * this.vp.dpr());
  }

  /** Animation */
  toPage(val) {
    // !5.3 animate scen page transition
    return new Promise((resolve) => {
      gsap.to(this.mixpass.uniforms.u_page, {
        value: val,
        duration: 1,
        onComplete: () => {
          resolve();
        },
      });
    });
  }
}
