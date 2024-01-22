<script setup>
  const { $bus } = useNuxtApp();

  const loading = ref(true);

  onMounted(() => {
    $bus.$on("app:ready", () => {
      console.log("app:ready - preloader");
      loading.value = false;
    });
  });

  onUnmounted(() => {
    $bus.$off("app:ready");
  });
</script>

<template>
  <div
    v-if="loading"
    class="fixed top-0 left-0 flex items-center justify-center w-screen h-screen"
  >
    preloader
  </div>
</template>
