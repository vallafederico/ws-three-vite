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
  <div class="h-screen py-10">
    Home

    <div class="flex items-center justify-center">
      <Clicky />
    </div>
  </div>
</template>
