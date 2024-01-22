export const transition = {
  onBeforeEnter: (el, els) => {
    // console.log("::before-enter", el);
  },
  onEnter: (el, done) => {
    // console.log("::enter");
    done();
  },
  onAfterEnter: (el) => {
    // console.log("::after-enter");
  },
  onLeave: (el, done) => {
    // console.log("::leave");

    setTimeout(() => {
      done();
    }, 0);
  },
};
