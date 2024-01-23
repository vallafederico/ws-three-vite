<script setup>
  definePageMeta({
    pageTransition: {
      ...transition,
    },
  });

  const { $bus, $webgl } = useNuxtApp();

  onBeforeMount(() => {
    $webgl.gl.onPageChange("home");
  });
</script>

<template>
  <div @click="$webgl.gl.onClick" class="h-screen py-10">
    <!-- !3.2 add the onclick event on the homepage only -->
    Home

    <div class="flex items-center justify-center">
      <!-- <Clicky /> -->
    </div>
  </div>
</template>
