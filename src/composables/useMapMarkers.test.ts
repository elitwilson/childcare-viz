import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { nextTick } from 'vue';

// --- Leaflet mock (hoisted so vi.mock factory can reference them) ---
type MockGroup = {
  addLayer: ReturnType<typeof vi.fn>;
  clearLayers: ReturnType<typeof vi.fn>;
  _uid: number;
};

const {
  mockMapAddLayer,
  mockMapRemoveLayer,
  mockCircleMarkerObj,
  mockCircleMarker,
  mockCanvas,
  mockLayerGroup,
  createdGroups,
  getGroupCounter,
  resetGroupCounter,
} = vi.hoisted(() => {
  const createdGroups: MockGroup[] = [];
  let groupCounter = 0;
  const mockCircleMarkerObj = { options: {} };
  return {
    mockMapAddLayer: vi.fn(),
    mockMapRemoveLayer: vi.fn(),
    mockCircleMarkerObj,
    mockCircleMarker: vi.fn(() => mockCircleMarkerObj),
    mockCanvas: vi.fn(() => ({})),
    mockLayerGroup: vi.fn(() => {
      const g: MockGroup = {
        addLayer: vi.fn(),
        clearLayers: vi.fn(),
        _uid: groupCounter++,
      };
      createdGroups.push(g);
      return g;
    }),
    createdGroups,
    getGroupCounter: () => groupCounter,
    resetGroupCounter: () => { groupCounter = 0; },
  };
});

const mockMap = {
  addLayer: mockMapAddLayer,
  removeLayer: mockMapRemoveLayer,
};

vi.mock('leaflet', () => ({
  default: {
    canvas: mockCanvas,
    circleMarker: mockCircleMarker,
    layerGroup: mockLayerGroup,
    map: vi.fn(),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
  },
}));

void getGroupCounter;

// Stub getComputedStyle for CSS var resolution
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn(() => ({
    getPropertyValue: (prop: string) => {
      const cssVarMap: Record<string, string> = {
        '--center': ' oklch(0.70 0.13 250)',
        '--family': ' oklch(0.74 0.13 145)',
        '--group': ' oklch(0.78 0.13 85)',
      };
      return cssVarMap[prop] ?? '';
    },
  })),
});

import { useMapMarkers } from './useMapMarkers';
import { useProviderStore } from '../stores/providers';
import { useFilterStore } from '../stores/filters';
import { LicenseType } from '../types/provider';
import type { Provider } from '../types/provider';

function makeProvider(overrides: Partial<Provider> = {}): Provider {
  return {
    id: '1',
    name: 'Test Provider',
    licenseType: LicenseType.Center,
    capacity: 25,
    lat: 42.3,
    lng: -83.0,
    address: '123 Main St',
    city: 'Detroit',
    county: 'Wayne',
    zipCode: '48201',
    rating: null,
    ...overrides,
  };
}

describe('useMapMarkers', () => {
  let providerStore: ReturnType<typeof useProviderStore>;
  let filterStore: ReturnType<typeof useFilterStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    resetGroupCounter();
    createdGroups.length = 0;
    providerStore = useProviderStore();
    filterStore = useFilterStore();
  });

  // --- Radius formula ---
  it('computes marker radius as 4 + Math.sqrt(capacity) * 1.15', async () => {
    const capacity = 36;
    providerStore.providers = [makeProvider({ capacity })];
    useMapMarkers(mockMap as unknown as import('leaflet').Map, providerStore, filterStore);
    await nextTick();

    const expectedRadius = 4 + Math.sqrt(capacity) * 1.15;
    expect(mockCircleMarker).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ radius: expectedRadius }),
    );
  });

  // --- Type-to-group assignment ---
  it('assigns a center provider to the center layer group', async () => {
    providerStore.providers = [makeProvider({ licenseType: LicenseType.Center, id: 'c1' })];
    useMapMarkers(mockMap as unknown as import('leaflet').Map, providerStore, filterStore);
    await nextTick();

    // Exactly one group should have had a marker added
    const groupsWithMarkers = createdGroups.filter(g => g.addLayer.mock.calls.length > 0);
    expect(groupsWithMarkers).toHaveLength(1);
  });

  it('assigns a family_home provider to the family layer group', async () => {
    providerStore.providers = [makeProvider({ licenseType: LicenseType.FamilyHome, id: 'f1' })];
    useMapMarkers(mockMap as unknown as import('leaflet').Map, providerStore, filterStore);
    await nextTick();

    const groupsWithMarkers = createdGroups.filter(g => g.addLayer.mock.calls.length > 0);
    expect(groupsWithMarkers).toHaveLength(1);
  });

  it('assigns a group_home provider to the group layer group', async () => {
    providerStore.providers = [makeProvider({ licenseType: LicenseType.GroupHome, id: 'g1' })];
    useMapMarkers(mockMap as unknown as import('leaflet').Map, providerStore, filterStore);
    await nextTick();

    const groupsWithMarkers = createdGroups.filter(g => g.addLayer.mock.calls.length > 0);
    expect(groupsWithMarkers).toHaveLength(1);
  });

  // --- Initial build when providers are already present ---
  it('builds markers immediately when providerStore.providers is already populated', async () => {
    providerStore.providers = [
      makeProvider({ id: 'a', licenseType: LicenseType.Center }),
      makeProvider({ id: 'b', licenseType: LicenseType.FamilyHome }),
    ];
    useMapMarkers(mockMap as unknown as import('leaflet').Map, providerStore, filterStore);
    await nextTick();

    expect(mockCircleMarker).toHaveBeenCalledTimes(2);
  });

  // --- Async providers-loaded watcher ---
  it('builds markers after providerStore.providers populates asynchronously', async () => {
    useMapMarkers(mockMap as unknown as import('leaflet').Map, providerStore, filterStore);
    await nextTick();
    expect(mockCircleMarker).not.toHaveBeenCalled();

    providerStore.providers = [makeProvider({ id: 'late' })];
    await nextTick();

    expect(mockCircleMarker).toHaveBeenCalledTimes(1);
  });

  // --- Capacity filtering ---
  it('only includes providers with capacity >= minCapacity in active groups', async () => {
    providerStore.providers = [
      makeProvider({ id: 'low', capacity: 10 }),
      makeProvider({ id: 'high', capacity: 100 }),
    ];
    filterStore.minCapacity = 50;
    useMapMarkers(mockMap as unknown as import('leaflet').Map, providerStore, filterStore);
    await nextTick();

    expect(mockCircleMarker).toHaveBeenCalledTimes(1);
    expect(mockCircleMarker).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ radius: 4 + Math.sqrt(100) * 1.15 }),
    );
  });

  it('restoring minCapacity to 0 makes all providers visible again', async () => {
    providerStore.providers = [
      makeProvider({ id: 'low', capacity: 10 }),
      makeProvider({ id: 'high', capacity: 100 }),
    ];
    filterStore.minCapacity = 50;
    useMapMarkers(mockMap as unknown as import('leaflet').Map, providerStore, filterStore);
    await nextTick();
    expect(mockCircleMarker).toHaveBeenCalledTimes(1);

    filterStore.minCapacity = 0;
    await nextTick();

    const totalGroupAddLayerCalls = createdGroups.reduce(
      (sum, g) => sum + g.addLayer.mock.calls.length,
      0,
    );
    expect(totalGroupAddLayerCalls).toBe(3); // 1 initial + 2 after restore
  });

  // --- Type toggle watcher: O(1) group add/remove ---
  it('removes the group from the map when activeTypes for that type is set false', async () => {
    providerStore.providers = [makeProvider({ licenseType: LicenseType.Center })];
    useMapMarkers(mockMap as unknown as import('leaflet').Map, providerStore, filterStore);
    await nextTick();

    filterStore.activeTypes[LicenseType.Center] = false;
    await nextTick();

    expect(mockMapRemoveLayer).toHaveBeenCalledTimes(1);
    const removedArg = mockMapRemoveLayer.mock.calls[0][0];
    // Must be a group (has clearLayers), not a circle marker
    expect(removedArg).toHaveProperty('clearLayers');
  });

  it('adds the group back to the map when activeTypes for that type is set back to true', async () => {
    providerStore.providers = [makeProvider({ licenseType: LicenseType.Center })];
    useMapMarkers(mockMap as unknown as import('leaflet').Map, providerStore, filterStore);
    await nextTick();

    filterStore.activeTypes[LicenseType.Center] = false;
    await nextTick();
    mockMapAddLayer.mockClear();

    filterStore.activeTypes[LicenseType.Center] = true;
    await nextTick();

    expect(mockMapAddLayer).toHaveBeenCalledTimes(1);
    const addedArg = mockMapAddLayer.mock.calls[0][0];
    expect(addedArg).toHaveProperty('clearLayers');
  });

  it('toggling one type does not affect other types groups', async () => {
    providerStore.providers = [
      makeProvider({ id: 'c', licenseType: LicenseType.Center }),
      makeProvider({ id: 'f', licenseType: LicenseType.FamilyHome }),
    ];
    useMapMarkers(mockMap as unknown as import('leaflet').Map, providerStore, filterStore);
    await nextTick();

    mockMapRemoveLayer.mockClear();
    filterStore.activeTypes[LicenseType.Center] = false;
    await nextTick();

    expect(mockMapRemoveLayer).toHaveBeenCalledTimes(1);
  });

  // --- Capacity-change watcher rebuilds active groups ---
  it('clears and repopulates active groups when minCapacity changes', async () => {
    providerStore.providers = [
      makeProvider({ id: 'a', capacity: 20, licenseType: LicenseType.Center }),
      makeProvider({ id: 'b', capacity: 80, licenseType: LicenseType.Center }),
    ];
    useMapMarkers(mockMap as unknown as import('leaflet').Map, providerStore, filterStore);
    await nextTick();

    // Clear all group mock state after initial build
    createdGroups.forEach(g => {
      g.clearLayers.mockClear();
      g.addLayer.mockClear();
    });

    filterStore.minCapacity = 50;
    await nextTick();

    const totalClears = createdGroups.reduce((sum, g) => sum + g.clearLayers.mock.calls.length, 0);
    expect(totalClears).toBeGreaterThan(0); // at least the center group is cleared

    const totalAdds = createdGroups.reduce((sum, g) => sum + g.addLayer.mock.calls.length, 0);
    // Only capacity>=50 provider re-added; 1 out of 2
    expect(totalAdds).toBe(1);
  });

  it('does not repopulate inactive groups when minCapacity changes', async () => {
    providerStore.providers = [
      makeProvider({ id: 'c', capacity: 80, licenseType: LicenseType.Center }),
      makeProvider({ id: 'f', capacity: 80, licenseType: LicenseType.FamilyHome }),
    ];
    useMapMarkers(mockMap as unknown as import('leaflet').Map, providerStore, filterStore);
    await nextTick();

    filterStore.activeTypes[LicenseType.FamilyHome] = false;
    await nextTick();

    // Clear all mock state after setup
    createdGroups.forEach(g => {
      g.clearLayers.mockClear();
      g.addLayer.mockClear();
    });

    filterStore.minCapacity = 50;
    await nextTick();

    const totalClears = createdGroups.reduce((sum, g) => sum + g.clearLayers.mock.calls.length, 0);
    // Only the active center group should be cleared (1), not the inactive family group
    expect(totalClears).toBe(1);
  });
});
