import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Provider } from '../types/provider';
import { fetchAllProviders } from '../services/childcareApi';
import { transformProvider } from '../services/childcareTransform';

const TTL_MS = 86_400_000;

export const useProviderStore = defineStore('providers', () => {
  const providers = ref<Provider[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);
  const fetchedAt = ref<number | null>(null);

  async function init(): Promise<void> {
    if (initialized.value && fetchedAt.value !== null && Date.now() - fetchedAt.value < TTL_MS) return;
    loading.value = true;
    error.value = null;
    try {
      const raw = await fetchAllProviders();
      providers.value = raw.map(transformProvider).filter((p): p is Provider => p !== null);
      initialized.value = true;
      fetchedAt.value = Date.now();
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  return { providers, loading, error, initialized, fetchedAt, init };
}, {
  persist: {
    key: 'mca-providers',
    pick: ['providers', 'initialized', 'fetchedAt'],
  },
});
