import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useMapStore = defineStore('map', () => {
  const activeView = ref<'facilities' | 'density'>('facilities');

  return { activeView };
});
