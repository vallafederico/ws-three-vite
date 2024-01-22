<script setup>
  definePageMeta({
    pageTransition: {
      ...transition,
    },
  });

  const { $webgl } = useNuxtApp();

  onBeforeMount(() => {
    $webgl.gl.onPageChange("about");
  });
</script>

<template>
  <div class="min-h-[300vh] py-10">
    <div ref="text" data-a="alpha" class="">About</div>
  </div>
</template>
