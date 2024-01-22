import gsap from "gsap";

// should we?

const defaults = {
  duration: 1.2,
  ease: "expo.out",
};

gsap.defaults({ ...defaults });
gsap.ticker.lagSmoothing(0); // for smooth scroll sync

export { gsap, defaults };
