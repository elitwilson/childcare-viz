import L from 'leaflet';
import { watch } from 'vue';
import { LicenseType } from '../types/provider';
import type { useProviderStore } from '../stores/providers';
import type { useFilterStore } from '../stores/filters';

function resolveColors(): Record<string, string> {
  const style = getComputedStyle(document.documentElement);
  return {
    [LicenseType.Center]: style.getPropertyValue('--center').trim(),
    [LicenseType.FamilyHome]: style.getPropertyValue('--family').trim(),
    [LicenseType.GroupHome]: style.getPropertyValue('--group').trim(),
  };
}

function markerRadius(capacity: number): number {
  return 4 + Math.sqrt(capacity) * 1.15;
}

export function useMapMarkers(
  map: L.Map,
  providerStore: ReturnType<typeof useProviderStore>,
  filterStore: ReturnType<typeof useFilterStore>,
): Record<string, L.LayerGroup> {
  const renderer = L.canvas();
  const colors = resolveColors();

  const groups: Record<string, L.LayerGroup> = {
    [LicenseType.Center]: L.layerGroup(),
    [LicenseType.FamilyHome]: L.layerGroup(),
    [LicenseType.GroupHome]: L.layerGroup(),
  };

  function buildGroup(type: string): void {
    const group = groups[type];
    group.clearLayers();
    const minCap = filterStore.minCapacity;
    for (const p of providerStore.providers) {
      if (p.licenseType !== type) continue;
      if (p.capacity < minCap) continue;
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: markerRadius(p.capacity),
        color: colors[type],
        fillColor: colors[type],
        fillOpacity: 0.55,
        opacity: 0.9,
        weight: 1.4,
        renderer,
      });
      group.addLayer(marker);
    }
  }

  function hasProvidersOfType(type: string): boolean {
    return providerStore.providers.some(p => p.licenseType === type);
  }

  function rebuildVisible(): void {
    for (const type of Object.values(LicenseType)) {
      if (filterStore.activeTypes[type] && hasProvidersOfType(type)) {
        buildGroup(type);
      }
    }
  }

  function addActiveGroups(): void {
    for (const type of Object.values(LicenseType)) {
      if (filterStore.activeTypes[type]) {
        map.addLayer(groups[type]);
      }
    }
  }

  // Watch providers: build and add groups once data is available
  watch(
    () => providerStore.providers,
    (providers) => {
      if (providers.length === 0) return;
      rebuildVisible();
      addActiveGroups();
    },
    { immediate: true, deep: false },
  );

  // Watch activeTypes: only act on changed types
  watch(
    () => ({ ...filterStore.activeTypes }),
    (newVal, oldVal) => {
      for (const type of Object.values(LicenseType)) {
        const wasActive = oldVal?.[type] ?? true;
        const isActive = newVal[type];
        if (wasActive === isActive) continue;
        if (isActive) {
          buildGroup(type);
          map.addLayer(groups[type]);
        } else {
          map.removeLayer(groups[type]);
        }
      }
    },
    { deep: true },
  );

  // Watch minCapacity: rebuild active groups that have providers
  watch(
    () => filterStore.minCapacity,
    () => {
      rebuildVisible();
    },
  );

  return groups;
}
