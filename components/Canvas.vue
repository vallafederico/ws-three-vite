<script setup>
  const { $webgl } = useNuxtApp();
  import { items } from "../utils/items.js";

  const canvas = ref(null);

  useWindowResize((entry) => $webgl.gl.resize(entry[0]), canvas);
  onMounted(() => {
    // start when we have the canvas
    $webgl.gl.start({ canvas: canvas.value, items });
  });
</script>

<template>
  <div class="fixed top-[0px] left-[0px] w-screen h-screen" ref="canvas"></div>
</template>

<style>
  canvas {
    width: 100vw;
    height: 100svh;
    box-sizing: border-box;
    pointer-events: none;
    /* border: 3px solid pink; */
  }
</style>
