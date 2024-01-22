import Lenis from "@studio-freight/lenis";
import { gsap } from "../utils/gsap";

export default defineNuxtPlugin({
  name: "scroll",
  parallel: true,
  async setup(nuxtApp) {
    const lenis = new Lenis();

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    //  methods
    const scrollToTop = () => {
      lenis.scrollTo(0, 0, 500);
    };

    nuxtApp.provide("scroll", {
      lenis,
      scrollToTop,
    });
  },
});
