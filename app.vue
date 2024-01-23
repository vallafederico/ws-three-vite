<script setup>
  // !3 add mouse move from app.vue
  const { $webgl } = useNuxtApp();
</script>

<template>
  <!-- !3.1 add mouse move from app.vue -->
  <main @mousemove="$webgl.gl.onMouseMove" class="relative z-10">
    <Preloader />
    <Nav />

    <div class="min-h-screen px-5">
      <NuxtPage :transition="{ name: 'hello', mode: 'out-in' }" />
    </div>
  </main>

  <Canvas />
</template>

<style>
  body {
    background-color: black;
    color: white;

    /* no selection */
    user-select: none;
    -webkit-user-select: none; /*Safari*/
    -moz-user-select: none; /*Firefox*/
  }
</style>
