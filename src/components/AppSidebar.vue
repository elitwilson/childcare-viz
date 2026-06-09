<script setup lang="ts">
import { computed } from 'vue';
import { useFilterStore } from '../stores/filters';
import { useProviderStore } from '../stores/providers';
import { useMapStore } from '../stores/map';
import { LicenseType } from '../types/provider';

const filterStore = useFilterStore();
const providerStore = useProviderStore();
const mapStore = useMapStore();

const licenseTypes = [
  { type: LicenseType.Center, label: 'Licensed Center', colorVar: '--center' },
  { type: LicenseType.GroupHome, label: 'Group Home', colorVar: '--group' },
  { type: LicenseType.FamilyHome, label: 'Family Home', colorVar: '--family' },
] as const;

const typeCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const { type } of licenseTypes) {
    counts[type] = providerStore.providers.filter(p => p.licenseType === type).length;
  }
  return counts;
});

function toggleType(type: string) {
  (filterStore.activeTypes as Record<string, boolean>)[type] = !(filterStore.activeTypes as Record<string, boolean>)[type];
}
</script>

<template>
  <aside>
    <div class="section" data-test="section-map-view">
      <h2>Map view</h2>
      <div class="seg">
        <button data-test="btn-facilities" :aria-pressed="String(mapStore.activeView === 'facilities')" @click="mapStore.activeView = 'facilities'">Facilities</button>
        <button data-test="btn-density" :aria-pressed="String(mapStore.activeView === 'density')" @click="mapStore.activeView = 'density'">Density</button>
      </div>
    </div>

    <div class="section" data-test="section-facility-type">
      <h2>Facility type</h2>
      <div class="chips">
        <div
          v-for="{ type, label, colorVar } in licenseTypes"
          :key="type"
          class="chip"
          role="checkbox"
          :data-test="`chip-${type}`"
          :aria-checked="String(filterStore.activeTypes[type])"
          @click="toggleType(type)"
        >
          <span class="sw" :style="{ background: `var(${colorVar})` }"></span>
          <span class="nm">{{ label }}</span>
          <span class="ct" data-test="count">{{ typeCounts[type] }}</span>
        </div>
      </div>
    </div>

    <div class="section" data-test="section-filters">
      <h2>Filters</h2>
      <div class="slider-row">
        <span class="lab">Min capacity</span>
        <input
          type="range"
          data-test="slider-capacity"
          min="0"
          max="150"
          step="5"
          v-model.number="filterStore.minCapacity"
        />
        <span class="lab" data-test="capacity-value">{{ filterStore.minCapacity }}</span>
      </div>
    </div>
  </aside>
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

.section {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--line);
}

.section:last-child {
  border-bottom: none;
}

.section h2 {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-dim, #888);
  margin: 0 0 0.6rem;
}

/* Map view segmented control */
.seg {
  display: flex;
  gap: 0;
  pointer-events: none;
}

.seg button {
  flex: 1;
  padding: 0.35rem 0.5rem;
  font-size: 0.8rem;
  background: var(--panel);
  border: 1px solid var(--line);
  color: var(--ink, #ddd);
  cursor: not-allowed;
  opacity: 0.7;
}

.seg button:first-child {
  border-radius: 4px 0 0 4px;
}

.seg button:last-child {
  border-radius: 0 4px 4px 0;
  border-left: none;
}

.seg button[aria-pressed="true"] {
  background: var(--accent, #4a9);
  color: #fff;
  opacity: 1;
}

/* Chips */
.chips {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  border: 1px solid var(--line);
}

.chip[aria-checked="false"] {
  opacity: 0.4;
}

.chip[aria-checked="false"] .sw {
  background: #555 !important;
}

.sw {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.nm {
  flex: 1;
  font-size: 0.82rem;
  color: var(--ink, #ddd);
}

.ct {
  font-size: 0.75rem;
  color: var(--ink-dim, #888);
  font-variant-numeric: tabular-nums;
}

/* Slider */
.slider-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lab {
  font-size: 0.78rem;
  color: var(--ink-dim, #888);
  white-space: nowrap;
}

input[type="range"] {
  flex: 1;
  accent-color: var(--accent, #4a9);
}
</style>
