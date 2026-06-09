import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { nextTick } from 'vue';

// --- Hoisted mocks ---
const {
  mockHeatLayerObj,
  mockHeatLayer,
  mockMapAddLayer,
  mockMapRemoveLayer,
  mockMapOn,
  mockGetZoom,
} = vi.hoisted(() => {
  const mockHeatLayerObj = {
    setLatLngs: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
  };
  return {
    mockHeatLayerObj,
    mockHeatLayer: vi.fn(() => mockHeatLayerObj),
    mockMapAddLayer: vi.fn(),
    mockMapRemoveLayer: vi.fn(),
    mockMapOn: vi.fn(),
    mockGetZoom: vi.fn(() => 6),
  };
});

vi.mock('leaflet', () => ({
  default: {
    heatLayer: mockHeatLayer,
    map: vi.fn(),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    layerGroup: vi.fn(() => ({ clearLayers: vi.fn(), addLayer: vi.fn() })),
    canvas: vi.fn(() => ({})),
    circleMarker: vi.fn(() => ({ bindPopup: vi.fn().mockReturnThis() })),
  },
}));

vi.mock('leaflet.heat', () => ({}));

const mockMap = {
  addLayer: mockMapAddLayer,
  removeLayer: mockMapRemoveLayer,
  on: mockMapOn,
  getZoom: mockGetZoom,
};

import { useHeatLayer } from './useHeatLayer';
import { useProviderStore } from '../stores/providers';
import { useFilterStore } from '../stores/filters';
import { useMapStore } from '../stores/map';
import { LicenseType } from '../types/provider';
import type { Provider } from '../types/provider';

function makeProvider(overrides: Partial<Provider> = {}): Provider {
  return {
    id: '1',
    name: 'Test Provider',
    licenseType: LicenseType.Center,
    capacity: 60,
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

function makeGroups() {
  return {
    [LicenseType.Center]: { clearLayers: vi.fn(), addLayer: vi.fn() } as unknown as import('leaflet').LayerGroup,
    [LicenseType.FamilyHome]: { clearLayers: vi.fn(), addLayer: vi.fn() } as unknown as import('leaflet').LayerGroup,
    [LicenseType.GroupHome]: { clearLayers: vi.fn(), addLayer: vi.fn() } as unknown as import('leaflet').LayerGroup,
  };
}

describe('useHeatLayer', () => {
  let providerStore: ReturnType<typeof useProviderStore>;
  let filterStore: ReturnType<typeof useFilterStore>;
  let mapStore: ReturnType<typeof useMapStore>;
  let groups: Record<string, import('leaflet').LayerGroup>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockGetZoom.mockReturnValue(6);
    providerStore = useProviderStore();
    filterStore = useFilterStore();
    mapStore = useMapStore();
    groups = makeGroups();
  });

  // --- Heat layer creation with exact options ---
  it('creates L.heatLayer with the exact required options', async () => {
    providerStore.providers = [makeProvider({ capacity: 60 })];
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);
    await nextTick();

    expect(mockHeatLayer).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        radius: 28,
        blur: 22,
        maxZoom: 11,
        minOpacity: 0.25,
        gradient: { 0.0: '#3b6fb0', 0.4: '#4fae7a', 0.7: '#d9b13f', 1.0: '#d96a4a' },
      }),
    );
  });

  // --- Heat point tuple construction ---
  it('builds [lat, lng, Math.min(1, capacity/120)] tuples for each filtered provider', async () => {
    providerStore.providers = [
      makeProvider({ id: 'a', lat: 42.3, lng: -83.0, capacity: 60 }),
      makeProvider({ id: 'b', lat: 44.0, lng: -85.0, capacity: 240 }),
    ];
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);
    await nextTick();

    const points = mockHeatLayer.mock.calls[0][0] as [number, number, number][];
    expect(points).toHaveLength(2);
    expect(points).toContainEqual([42.3, -83.0, 0.5]);
    expect(points).toContainEqual([44.0, -85.0, 1.0]);
  });

  it('caps intensity at 1.0 for providers with capacity >= 120', async () => {
    providerStore.providers = [makeProvider({ capacity: 300 })];
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);
    await nextTick();

    const points = mockHeatLayer.mock.calls[0][0] as [number, number, number][];
    expect(points[0][2]).toBe(1.0);
  });

  // --- Filtering: capacity ---
  it('excludes providers below minCapacity from heat points', async () => {
    providerStore.providers = [
      makeProvider({ id: 'low', capacity: 10 }),
      makeProvider({ id: 'high', capacity: 80 }),
    ];
    filterStore.minCapacity = 50;
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);
    await nextTick();

    const points = mockHeatLayer.mock.calls[0][0] as [number, number, number][];
    expect(points).toHaveLength(1);
    expect(points[0][2]).toBeCloseTo(80 / 120);
  });

  // --- Filtering: activeTypes ---
  it('excludes providers whose licenseType is toggled off in activeTypes', async () => {
    providerStore.providers = [
      makeProvider({ id: 'c', licenseType: LicenseType.Center }),
      makeProvider({ id: 'f', licenseType: LicenseType.FamilyHome }),
    ];
    filterStore.activeTypes[LicenseType.FamilyHome] = false;
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);
    await nextTick();

    const points = mockHeatLayer.mock.calls[0][0] as [number, number, number][];
    expect(points).toHaveLength(1);
  });

  // --- Filter reactivity: setLatLngs called on change ---
  it('calls setLatLngs when minCapacity changes', async () => {
    providerStore.providers = [
      makeProvider({ id: 'a', capacity: 20 }),
      makeProvider({ id: 'b', capacity: 80 }),
    ];
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);
    await nextTick();

    filterStore.minCapacity = 50;
    await nextTick();

    expect(mockHeatLayerObj.setLatLngs).toHaveBeenCalled();
    const lastCall = mockHeatLayerObj.setLatLngs.mock.calls.at(-1)![0] as [number, number, number][];
    expect(lastCall).toHaveLength(1);
  });

  it('calls setLatLngs when activeTypes changes', async () => {
    providerStore.providers = [
      makeProvider({ id: 'c', licenseType: LicenseType.Center }),
      makeProvider({ id: 'f', licenseType: LicenseType.FamilyHome }),
    ];
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);
    await nextTick();

    filterStore.activeTypes[LicenseType.FamilyHome] = false;
    await nextTick();

    expect(mockHeatLayerObj.setLatLngs).toHaveBeenCalled();
    const lastCall = mockHeatLayerObj.setLatLngs.mock.calls.at(-1)![0] as [number, number, number][];
    expect(lastCall).toHaveLength(1);
  });

  // --- providers watcher: points rebuilt when providers arrive late ---
  it('rebuilds points when providerStore.providers populates asynchronously', async () => {
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);
    await nextTick();
    const callsBefore = mockHeatLayerObj.setLatLngs.mock.calls.length;

    providerStore.providers = [makeProvider()];
    await nextTick();

    expect(mockHeatLayerObj.setLatLngs.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  // --- activeView visibility: density ---
  it('adds heat layer and removes all facility groups when activeView is density', async () => {
    providerStore.providers = [makeProvider()];
    mapStore.activeView = 'density';
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);
    await nextTick();

    expect(mockMapAddLayer).toHaveBeenCalledWith(mockHeatLayerObj);
    for (const group of Object.values(groups)) {
      expect(mockMapRemoveLayer).toHaveBeenCalledWith(group);
    }
  });

  // --- activeView visibility: facilities ---
  it('removes heat layer and adds active facility groups when activeView is facilities', async () => {
    providerStore.providers = [makeProvider({ licenseType: LicenseType.Center })];
    filterStore.activeTypes[LicenseType.FamilyHome] = false;
    mapStore.activeView = 'facilities';
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);
    await nextTick();

    expect(mockMapRemoveLayer).toHaveBeenCalledWith(mockHeatLayerObj);
    expect(mockMapAddLayer).toHaveBeenCalledWith(groups[LicenseType.Center]);
    expect(mockMapAddLayer).not.toHaveBeenCalledWith(groups[LicenseType.FamilyHome]);
  });

  // --- activeView watcher reacts to changes ---
  it('switches layers when activeView changes from facilities to density', async () => {
    providerStore.providers = [makeProvider()];
    mapStore.activeView = 'facilities';
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);
    await nextTick();

    vi.clearAllMocks();
    mapStore.activeView = 'density';
    await nextTick();

    expect(mockMapAddLayer).toHaveBeenCalledWith(mockHeatLayerObj);
    for (const group of Object.values(groups)) {
      expect(mockMapRemoveLayer).toHaveBeenCalledWith(group);
    }
  });

  it('switches layers when activeView changes from density to facilities', async () => {
    providerStore.providers = [makeProvider()];
    mapStore.activeView = 'density';
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);
    await nextTick();

    vi.clearAllMocks();
    mapStore.activeView = 'facilities';
    await nextTick();

    expect(mockMapRemoveLayer).toHaveBeenCalledWith(mockHeatLayerObj);
    expect(mockMapAddLayer).toHaveBeenCalledWith(groups[LicenseType.Center]);
  });

  // --- zoomend handler ---
  it('registers a zoomend handler on the map', () => {
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);

    expect(mockMapOn).toHaveBeenCalledWith('zoomend', expect.any(Function));
  });

  it('sets activeView to density when zoomend fires at zoom <= 8', () => {
    mapStore.activeView = 'facilities';
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);

    const zoomendCall = mockMapOn.mock.calls.find(c => c[0] === 'zoomend');
    const handler = zoomendCall![1] as () => void;

    mockGetZoom.mockReturnValue(8);
    handler();
    expect(mapStore.activeView).toBe('density');
  });

  it('sets activeView to density when zoomend fires at zoom exactly 8 (boundary is density)', () => {
    mapStore.activeView = 'facilities';
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);

    const zoomendCall = mockMapOn.mock.calls.find(c => c[0] === 'zoomend');
    const handler = zoomendCall![1] as () => void;

    mockGetZoom.mockReturnValue(8);
    handler();
    expect(mapStore.activeView).toBe('density');
  });

  it('sets activeView to facilities when zoomend fires at zoom > 8', () => {
    mapStore.activeView = 'density';
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);

    const zoomendCall = mockMapOn.mock.calls.find(c => c[0] === 'zoomend');
    const handler = zoomendCall![1] as () => void;

    mockGetZoom.mockReturnValue(10);
    handler();
    expect(mapStore.activeView).toBe('facilities');
  });

  it('sets activeView to facilities at zoom 9 (just above threshold)', () => {
    mapStore.activeView = 'density';
    useHeatLayer(mockMap as unknown as import('leaflet').Map, providerStore, filterStore, mapStore, groups);

    const zoomendCall = mockMapOn.mock.calls.find(c => c[0] === 'zoomend');
    const handler = zoomendCall![1] as () => void;

    mockGetZoom.mockReturnValue(9);
    handler();
    expect(mapStore.activeView).toBe('facilities');
  });
});
