<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppSidebar from './components/AppSidebar.vue';
import MapView from './components/MapView.vue';
import { useProviderStore } from './stores/providers';

const store = useProviderStore();

onMounted(() => {
  store.init();
});
</script>

<template>
  <AppHeader />
  <main>
    <AppSidebar />
    <MapView />
  </main>
</template>
