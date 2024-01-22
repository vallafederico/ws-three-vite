<script setup>
  const { $webgl } = useNuxtApp();
</script>

<template>
  <div class="">
    <button @click="$webgl.gl.onClick">Click me</button>
    <!-- <button @click="() => $bus.$emit("clicky")">Click me</button> -->
  </div>
</template>
