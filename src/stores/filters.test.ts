import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { computed } from 'vue';
import { useFilterStore } from './filters';

describe('useFilterStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes activeTypes with all three license types set to true', () => {
    const store = useFilterStore();
    expect(store.activeTypes).toEqual({ center: true, group_home: true, family_home: true });
  });

  it('initializes minCapacity to 0', () => {
    const store = useFilterStore();
    expect(store.minCapacity).toBe(0);
  });

  it('toggling a license type is reactive — a computed observes the change', () => {
    const store = useFilterStore();
    const centerActive = computed(() => store.activeTypes.center);
    expect(centerActive.value).toBe(true);
    store.activeTypes.center = false;
    expect(centerActive.value).toBe(false);
  });

  it('updating minCapacity is reactive — a computed observes the change', () => {
    const store = useFilterStore();
    const cap = computed(() => store.minCapacity);
    expect(cap.value).toBe(0);
    store.minCapacity = 25;
    expect(cap.value).toBe(25);
  });
});
