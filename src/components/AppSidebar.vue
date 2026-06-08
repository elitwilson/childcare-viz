<script setup lang="ts">
</script>

<template>
  <aside></aside>
</template>

<style scoped>
aside {
  width: 320px;
  background: var(--panel);
  border-right: 1px solid var(--line);
  padding: 1rem 0;
  overflow-y: auto;
  min-height: 0;
}

aside::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb {
  background: var(--line);
  border-radius: 3px;
}
</style>
