import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('../services/childcareApi', () => ({
  fetchAllProviders: vi.fn(),
}));

vi.mock('../services/childcareTransform', () => ({
  transformProvider: vi.fn(),
}));

import { fetchAllProviders } from '../services/childcareApi';
import { transformProvider } from '../services/childcareTransform';
import { useProviderStore } from './providers';
import type { RawProvider } from '../services/childcareApi';
import type { Provider } from '../types/provider';

const mockFetch = vi.mocked(fetchAllProviders);
const mockTransform = vi.mocked(transformProvider);

const rawRecord = (id: string): RawProvider => ({
  LicenseNumber: id,
  FacilityName: `Facility ${id}`,
  FacilityType: 'Center',
  Capacity: 20,
  Latitude: 42.0,
  Longitude: -83.0,
  StreetAddress: '123 Main St',
  City: 'Detroit',
  CountyCode: 'WYN',
  ZIPCode: '48201',
});

const providerRecord = (id: string): Provider => ({
  id,
  name: `Facility ${id}`,
  licenseType: 'center',
  capacity: 20,
  lat: 42.0,
  lng: -83.0,
  address: '123 Main St',
  city: 'Detroit',
  county: 'WYN',
  zipCode: '48201',
  rating: null,
});

describe('useProviderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  it('populates providers from mocked transformed results after init()', async () => {
    const raw = [rawRecord('A'), rawRecord('B')];
    mockFetch.mockResolvedValue(raw);
    mockTransform.mockImplementation((r) => providerRecord(r.LicenseNumber));

    const store = useProviderStore();
    await store.init();

    expect(store.providers).toEqual([providerRecord('A'), providerRecord('B')]);
    expect(store.initialized).toBe(true);
  });

  it('does not call fetchAllProviders again when already initialized', async () => {
    mockFetch.mockResolvedValue([rawRecord('A')]);
    mockTransform.mockImplementation((r) => providerRecord(r.LicenseNumber));

    const store = useProviderStore();
    await store.init();
    await store.init();

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('sets loading true during fetch and false after success', async () => {
    let resolveFetch!: (value: RawProvider[]) => void;
    const pending = new Promise<RawProvider[]>((res) => { resolveFetch = res; });
    mockFetch.mockReturnValue(pending);
    mockTransform.mockImplementation((r) => providerRecord(r.LicenseNumber));

    const store = useProviderStore();
    const initPromise = store.init();
    expect(store.loading).toBe(true);

    resolveFetch([rawRecord('A')]);
    await initPromise;

    expect(store.loading).toBe(false);
  });

  it('sets loading false after a fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('network error'));

    const store = useProviderStore();
    await store.init();

    expect(store.loading).toBe(false);
  });

  it('sets error string and leaves providers empty on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('network error'));

    const store = useProviderStore();
    await store.init();

    expect(store.error).toBe('network error');
    expect(store.providers).toEqual([]);
  });

  it('filters out null results from transformProvider', async () => {
    const raw = [rawRecord('A'), rawRecord('B'), rawRecord('C')];
    mockFetch.mockResolvedValue(raw);
    mockTransform.mockImplementation((r) => {
      if (r.LicenseNumber === 'B') return null;
      return providerRecord(r.LicenseNumber);
    });

    const store = useProviderStore();
    await store.init();

    expect(store.providers).toEqual([providerRecord('A'), providerRecord('C')]);
    expect(store.providers).not.toContain(null);
  });
});
