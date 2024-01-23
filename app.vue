<script setup>
  const { $webgl } = useNuxtApp();
</script>

<template>
  <Canvas />

  <main @mousemove="$webgl.gl.onMouseMove" class="relative z-10">
    <Preloader />
    <Nav />

    <div class="min-h-screen px-5">
      <NuxtPage :transition="{ name: 'hello', mode: 'out-in' }" />
    </div>
  </main>
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
