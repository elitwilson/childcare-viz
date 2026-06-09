<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useProviderStore } from '../stores/providers';
import { useFilterStore } from '../stores/filters';
import { useMapStore } from '../stores/map';
import { useMapMarkers } from '../composables/useMapMarkers';
import { useHeatLayer } from '../composables/useHeatLayer';
import { useTheme } from '../composables/useTheme';
import AppLegend from './AppLegend.vue';

const mapEl = ref<HTMLElement>();
let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;

const providerStore = useProviderStore();
const filterStore = useFilterStore();
const mapStore = useMapStore();
const { theme } = useTheme();

const CARTO_URLS: Record<'dark' | 'light', string> = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
};

const isMapEmpty = computed(() =>
  providerStore.providers.length > 0 &&
  !providerStore.providers.some(
    p => p.capacity >= filterStore.minCapacity && filterStore.activeTypes[p.licenseType],
  ),
);

function setBasemap(t: 'dark' | 'light'): void {
  if (!map) return;
  if (tileLayer) {
    map.removeLayer(tileLayer);
    tileLayer = null;
  }
  tileLayer = L.tileLayer(CARTO_URLS[t], {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);
}

onMounted(() => {
  map = L.map(mapEl.value!, {
    zoomControl: true,
    attributionControl: true,
    minZoom: 5,
    maxZoom: 13,
  }).setView([44.6, -85.6], 6);

  // Suppress scroll-wheel zoom while the mouse button is held down.
  // Prevents accidental zoom on Magic Mouse / trackpad where slight finger
  // movement during a drag fires scroll events.
  map.on('mousedown', () => { if (map) map.scrollWheelZoom.disable(); });
  map.on('mouseup', () => { if (map) map.scrollWheelZoom.enable(); });
  map.getContainer().addEventListener('mouseleave', () => { if (map) map.scrollWheelZoom.enable(); });

  setBasemap(theme.value);

  providerStore.init();
  const groups = useMapMarkers(map, providerStore, filterStore);
  useHeatLayer(map, providerStore, filterStore, mapStore, groups);
});

watch(theme, (t) => setBasemap(t));

onUnmounted(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div class="map-wrap">
    <div id="map" ref="mapEl"></div>
    <AppLegend :active-view="mapStore.activeView" />
    <div v-if="isMapEmpty" data-test="empty-note" class="empty-note">
      No facilities match these filters.
    </div>
  </div>
</template>

<style scoped>
.empty-note {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 500;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--ink-dim);
}
</style>
