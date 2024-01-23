<script setup>
  definePageMeta({
    pageTransition: {
      ...transition,
    },
  });

  const { $bus, $webgl } = useNuxtApp();

  onBeforeMount(() => {
    // 4.3 change pages method
    $webgl.gl.pageHome("home");
  });
</script>

<template>
  <div
    @click="$webgl.gl.onClick"
    @mousedown="$webgl.gl.onMouseDown"
    @mouseup="$webgl.gl.onMouseUp"
    class="h-screen py-10"
  >
    <!-- !3.2 add the onclick event on the homepage only -->
    <!-- !4.2 add add slider events on the homepage only -->
    Home

    <div class="flex items-center justify-center">
      <!-- <Clicky /> -->
    </div>
  </div>
</template>
