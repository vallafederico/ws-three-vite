<script setup>
  definePageMeta({
    pageTransition: {
      ...transition,
    },
  });

  const route = useRoute();
  const data = items.filter((item) => item.slug === route.params.item)[0];
  //   console.log(data);
</script>

<template>
  <div class="min-h-[200vh]">
    Item: {{ data.name }}

    <div class="flex items-center justify-center h-screen">
      <Clicky />
    </div>
  </div>
</template>
