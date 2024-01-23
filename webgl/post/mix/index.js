import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import fragmentShader from "./fragment.frag";
import vertexShader from "./vertex.vert";

export class MixPass extends ShaderPass {
  constructor() {
    super({
      uniforms: {
        tDiffuse: { value: null },
        opacity: { value: 1.0 },
        // !5.1 read passed texture
        u_rings: { value: null },
      },
      vertexShader,
      fragmentShader,
    });
  }
}
