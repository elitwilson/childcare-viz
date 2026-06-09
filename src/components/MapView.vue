<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useProviderStore } from '../stores/providers';
import { useFilterStore } from '../stores/filters';
import { useMapMarkers } from '../composables/useMapMarkers';

const mapEl = ref<HTMLElement>();
let map: L.Map | null = null;

const providerStore = useProviderStore();
const filterStore = useFilterStore();

onMounted(() => {
  map = L.map(mapEl.value!, {
    zoomControl: true,
    attributionControl: true,
    minZoom: 5,
    maxZoom: 13,
  }).setView([44.6, -85.6], 6);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  providerStore.init();
  useMapMarkers(map, providerStore, filterStore);
});

onUnmounted(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div class="map-wrap">
    <div id="map" ref="mapEl"></div>
  </div>
</template>
