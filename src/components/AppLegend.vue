<script setup lang="ts">
defineProps<{ activeView: 'facilities' | 'density' }>();
</script>

<template>
  <div class="legend">
    <div v-if="activeView === 'facilities'" data-test="legend-facilities">
      <div class="swatch-row">
        <span class="swatch" :style="{ background: 'var(--center)' }"></span>
        <span class="label">Licensed Center</span>
      </div>
      <div class="swatch-row">
        <span class="swatch" :style="{ background: 'var(--group)' }"></span>
        <span class="label">Group Home</span>
      </div>
      <div class="swatch-row">
        <span class="swatch" :style="{ background: 'var(--family)' }"></span>
        <span class="label">Family Home</span>
      </div>
      <p class="note">Marker size scales with capacity</p>
    </div>
    <div v-else data-test="legend-density">
      <div class="gradient-row">
        <span class="end-label">sparse</span>
        <span class="gradient-bar"></span>
        <span class="end-label">dense</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legend {
  position: absolute;
  bottom: 24px;
  left: 12px;
  z-index: 1000;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 10px 12px;
  color: var(--ink);
  font-size: 0.75rem;
  min-width: 160px;
}

.swatch-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.label {
  color: var(--ink);
}

.note {
  margin: 8px 0 0;
  color: var(--ink-dim);
  font-size: 0.7rem;
}

.gradient-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gradient-bar {
  flex: 1;
  height: 10px;
  border-radius: 4px;
  background: linear-gradient(to right, #3b6fb0, #4fae7a, #d9b13f, #d96a4a);
}

.end-label {
  color: var(--ink-dim);
  font-size: 0.7rem;
  white-space: nowrap;
}
</style>
