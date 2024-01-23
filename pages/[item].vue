<script setup>
  definePageMeta({
    pageTransition: {
      ...transition,
    },
  });

  const route = useRoute();
  const data = items.filter((item) => item.slug === route.params.item)[0];

  // !4.3 add the webgl context and pass mount function
  const { $webgl } = useNuxtApp();

  onMounted(() => {
    $webgl.gl.pageProduct(data.index);
  });
</script>

<template>
  <div class="min-h-[200vh] py-10">
    Item: {{ data.name }} {{ data.index }}

    <div class="flex items-center justify-center h-screen">
      <!-- <Clicky /> -->
    </div>
  </div>
</template>
