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

const filteredProviders = computed(() =>
  providerStore.providers.filter(
    p => filterStore.activeTypes[p.licenseType] && p.capacity >= filterStore.minCapacity
  )
);

const facilityCount = computed(() => filteredProviders.value.length);
const totalSeats = computed(() => filteredProviders.value.reduce((sum, p) => sum + p.capacity, 0));

function toggleType(type: string) {
  (filterStore.activeTypes as Record<string, boolean>)[type] = !(filterStore.activeTypes as Record<string, boolean>)[type];
}

function resetFilters() {
  filterStore.minCapacity = 0;
  for (const key of Object.keys(filterStore.activeTypes)) {
    (filterStore.activeTypes as Record<string, boolean>)[key] = true;
  }
}
</script>

<template>
  <aside>
    <div class="section" data-test="section-map-view">
      <h2>Map view</h2>
      <div class="seg">
        <button data-test="btn-facilities" :aria-pressed="mapStore.activeView === 'facilities'" @click="mapStore.activeView = 'facilities'"><span class="dot" aria-hidden="true"></span>Facilities</button>
        <button data-test="btn-density" :aria-pressed="mapStore.activeView === 'density'" @click="mapStore.activeView = 'density'"><span class="dot" aria-hidden="true"></span>Density</button>
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
          :aria-checked="filterStore.activeTypes[type]"
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

    <div class="section" data-test="section-showing">
      <h2>Showing</h2>
      <div class="stat-row">
        <span class="stat-value" data-test="stat-facility-count">{{ facilityCount.toLocaleString() }}</span>
        <span class="stat-label">facilities on map</span>
      </div>
      <div class="stat-row">
        <span class="stat-value" data-test="stat-total-seats">{{ totalSeats.toLocaleString() }}</span>
        <span class="stat-label">licensed seats</span>
      </div>
    </div>

    <button class="reset" data-test="btn-reset" @click="resetFilters">Reset all filters</button>
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  background: var(--bg);
  padding: 4px;
  border-radius: 9px;
  border: 1px solid var(--line);
}

.seg button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.5rem;
  font-size: 0.8rem;
  background: transparent;
  border: 0;
  border-radius: 6px;
  color: var(--ink, #ddd);
  cursor: pointer;
}

.seg button[aria-pressed="true"] {
  background: var(--panel-2);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
  flex-shrink: 0;
}

.seg button[aria-pressed="true"] .dot {
  color: var(--accent);
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

.chip:hover {
  border-color: var(--ink-faint);
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

/* Showing stats */
.stat-row {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  margin-bottom: 0.25rem;
}

.stat-row:last-child {
  margin-bottom: 0;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ink, #ddd);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--ink-dim, #888);
}

/* Reset button */
.reset {
  display: block;
  width: calc(100% - 2rem);
  margin: 0.75rem 1rem;
  padding: 0.45rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--ink, #ddd);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
}

.reset:hover {
  border-color: var(--accent, #4a9);
  color: var(--accent, #4a9);
}
</style>
