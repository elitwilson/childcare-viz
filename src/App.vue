<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppSidebar from './components/AppSidebar.vue';
import MapView from './components/MapView.vue';
import DevDataView from './components/DevDataView.vue';
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
  <p v-if="store.loading">Loading…</p>
  <p v-else-if="store.error">Error: {{ store.error }}</p>
  <DevDataView v-else />
</template>
