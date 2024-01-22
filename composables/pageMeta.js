export function transitionMeta() {
  return definePageMeta({
    pageTransition: {
      // name: 'custom-flip',
      // mode: 'out-in',
      onBeforeEnter: (el) => {
        console.log("Before enter...");
      },
      onEnter: (el, done) => {
        console.log("Enter...");
        done();
      },
      onAfterEnter: (el) => {
        console.log("After enter...");
      },
    },
  });
}

// export { definePageMeta };
