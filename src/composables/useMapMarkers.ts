import L from 'leaflet';
import { watch } from 'vue';
import { LicenseType } from '../types/provider';
import type { Provider } from '../types/provider';
import type { useProviderStore } from '../stores/providers';
import type { useFilterStore } from '../stores/filters';

const LICENSE_META: Record<string, { label: string; cssVar: string }> = {
  [LicenseType.Center]:     { label: 'Licensed Center', cssVar: '--center' },
  [LicenseType.FamilyHome]: { label: 'Family Home',     cssVar: '--family' },
  [LicenseType.GroupHome]:  { label: 'Group Home',      cssVar: '--group'  },
};

function resolveColors(): Record<string, string> {
  const style = getComputedStyle(document.documentElement);
  return {
    [LicenseType.Center]:     style.getPropertyValue(LICENSE_META[LicenseType.Center].cssVar).trim(),
    [LicenseType.FamilyHome]: style.getPropertyValue(LICENSE_META[LicenseType.FamilyHome].cssVar).trim(),
    [LicenseType.GroupHome]:  style.getPropertyValue(LICENSE_META[LicenseType.GroupHome].cssVar).trim(),
  };
}

export function buildPopupHtml(provider: Provider, color: string): string {
  const { label } = LICENSE_META[provider.licenseType];
  const ratingRow = provider.rating !== null
    ? `<span class="k">Rating</span><span class="vv">${provider.rating}</span>`
    : '';
  return `<div class="pop">
  <div class="pt"><span class="sw" style="background:${color}"></span>${label}</div>
  <div class="nm">${provider.name}</div>
  <div class="grid">
    <span class="k">Location</span><span class="vv">${provider.city}</span>
    <span class="k">Capacity</span><span class="vv">${provider.capacity} seats</span>
    ${ratingRow}
  </div>
</div>`;
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
      }).bindPopup(buildPopupHtml(p, colors[type]));
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
