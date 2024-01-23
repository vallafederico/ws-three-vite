<script setup>
  definePageMeta({
    pageTransition: {
      ...transition,
    },
  });

  const { $webgl } = useNuxtApp();

  onMounted(() => {
    $webgl.gl.pageAbout("about");
  });
</script>

<template>
  <div class="min-h-[300vh] py-10">
    <div ref="text" data-a="alpha" class="">About</div>
  </div>
</template>
