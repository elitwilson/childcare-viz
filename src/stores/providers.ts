import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Provider } from '../types/provider';
import { fetchAllProviders } from '../services/childcareApi';
import { transformProvider } from '../services/childcareTransform';

export const useProviderStore = defineStore('providers', () => {
  const providers = ref<Provider[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  async function init(): Promise<void> {
    if (initialized.value) return;
    loading.value = true;
    error.value = null;
    try {
      const raw = await fetchAllProviders();
      providers.value = raw.map(transformProvider).filter((p): p is Provider => p !== null);
      initialized.value = true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  return { providers, loading, error, initialized, init };
});
