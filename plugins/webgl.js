import { Gl } from "../webgl/gl";
// import { gsap } from "../utils/gsap";

export default defineNuxtPlugin({
  name: "webgl",
  //   parallel: true,
  dependsOn: ["scroll"],
  async setup(nuxtApp) {
    const gl = new Gl({ $nuxt: nuxtApp });

    // add to gsap ticker
    gsap.ticker.add((time) => {
      gl.render(time * 1000);
    });

    nuxtApp.provide("webgl", {
      gl,
    });
  },
});
