<script setup>
  const nav = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
  ];
</script>

<template>
  <div class="fixed top-0 w-full p-5 z-2">
    <ul class="flex gap-2 text-xs">
      <li>
        <NuxtLink to="/">Home</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/about">About</NuxtLink>
      </li>
    </ul>
  </div>
</template>
