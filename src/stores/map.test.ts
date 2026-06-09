import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { computed } from 'vue';
import { useMapStore } from './map';

describe('useMapStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('defaults activeView to "facilities"', () => {
    const store = useMapStore();
    expect(store.activeView).toBe('facilities');
  });

  it('writing "density" to activeView updates the value', () => {
    const store = useMapStore();
    store.activeView = 'density';
    expect(store.activeView).toBe('density');
  });

  it('activeView is reactive — a computed observes the change', () => {
    const store = useMapStore();
    const view = computed(() => store.activeView);
    expect(view.value).toBe('facilities');
    store.activeView = 'density';
    expect(view.value).toBe('density');
  });
});
