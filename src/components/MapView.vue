<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useProviderStore } from '../stores/providers';
import { useFilterStore } from '../stores/filters';
import { useMapStore } from '../stores/map';
import { useMapMarkers } from '../composables/useMapMarkers';
import { useHeatLayer } from '../composables/useHeatLayer';
import AppLegend from './AppLegend.vue';

const mapEl = ref<HTMLElement>();
let map: L.Map | null = null;

const providerStore = useProviderStore();
const filterStore = useFilterStore();
const mapStore = useMapStore();

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
  const groups = useMapMarkers(map, providerStore, filterStore);
  useHeatLayer(map, providerStore, filterStore, mapStore, groups);
});

onUnmounted(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div class="map-wrap">
    <div id="map" ref="mapEl"></div>
    <AppLegend :active-view="mapStore.activeView" />
  </div>
</template>
