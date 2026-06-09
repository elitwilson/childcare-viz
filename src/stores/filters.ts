import { ref } from 'vue';
import { defineStore } from 'pinia';
import { LicenseType } from '../types/provider';

export const useFilterStore = defineStore('filters', () => {
  const activeTypes = ref<Record<LicenseType, boolean>>(
    Object.values(LicenseType).reduce(
      (acc, type) => ({ ...acc, [type]: true }),
      {} as Record<LicenseType, boolean>,
    ),
  );

  const minCapacity = ref<number>(0);

  return { activeTypes, minCapacity };
});
