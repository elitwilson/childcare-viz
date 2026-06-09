import 'leaflet.heat';
import L from 'leaflet';
import { watch } from 'vue';
import { LicenseType } from '../types/provider';
import type { useProviderStore } from '../stores/providers';
import type { useFilterStore } from '../stores/filters';
import type { useMapStore } from '../stores/map';

const HEAT_OPTIONS: L.HeatMapOptions = {
  radius: 28,
  blur: 22,
  maxZoom: 11,
  minOpacity: 0.25,
  gradient: { 0.0: '#3b6fb0', 0.4: '#4fae7a', 0.7: '#d9b13f', 1.0: '#d96a4a' },
};

export function useHeatLayer(
  map: L.Map,
  providerStore: ReturnType<typeof useProviderStore>,
  filterStore: ReturnType<typeof useFilterStore>,
  mapStore: ReturnType<typeof useMapStore>,
  groups: Record<string, L.LayerGroup>,
): void {
  function filteredPoints(): L.HeatLatLngTuple[] {
    return providerStore.providers
      .filter(p => p.capacity >= filterStore.minCapacity && filterStore.activeTypes[p.licenseType])
      .map(p => [p.lat, p.lng, Math.min(1, p.capacity / 120)]);
  }

  const heatLayer = L.heatLayer(filteredPoints(), HEAT_OPTIONS);

  function applyVisibility(): void {
    if (mapStore.activeView === 'density') {
      map.addLayer(heatLayer);
      for (const type of Object.values(LicenseType)) {
        map.removeLayer(groups[type]);
      }
    } else {
      map.removeLayer(heatLayer);
      for (const type of Object.values(LicenseType)) {
        if (filterStore.activeTypes[type]) {
          map.addLayer(groups[type]);
        }
      }
    }
  }

  watch(
    () => providerStore.providers,
    () => {
      heatLayer.setLatLngs(filteredPoints());
    },
  );

  watch(
    () => [filterStore.minCapacity, { ...filterStore.activeTypes }] as const,
    () => {
      heatLayer.setLatLngs(filteredPoints());
    },
    { deep: true },
  );

  watch(
    () => mapStore.activeView,
    () => {
      applyVisibility();
    },
    { immediate: true },
  );

  map.on('zoomend', () => {
    mapStore.activeView = map.getZoom() <= 8 ? 'density' : 'facilities';
  });
}
