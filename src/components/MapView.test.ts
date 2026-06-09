import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

// Hoist all mock variables so vi.mock factories can reference them
const { mockTileLayer, mockMap, mockUseMapMarkers, mockProviderInit } = vi.hoisted(() => {
  const mockTileLayer = { addTo: vi.fn().mockReturnThis() };
  const mockMap = {
    setView: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
  };
  return {
    mockTileLayer,
    mockMap,
    mockUseMapMarkers: vi.fn(),
    mockProviderInit: vi.fn(),
  };
});

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => mockMap),
    tileLayer: vi.fn(() => mockTileLayer),
    canvas: vi.fn(() => ({})),
    circleMarker: vi.fn(() => ({})),
    layerGroup: vi.fn(() => ({ addLayer: vi.fn(), clearLayers: vi.fn() })),
  },
}));

vi.mock('../composables/useMapMarkers', () => ({
  useMapMarkers: mockUseMapMarkers,
}));

vi.mock('../stores/providers', () => ({
  useProviderStore: vi.fn(() => ({
    providers: [],
    loading: false,
    error: null,
    initialized: false,
    init: mockProviderInit,
  })),
}));

vi.mock('../stores/filters', () => ({
  useFilterStore: vi.fn(() => ({
    activeTypes: { center: true, family_home: true, group_home: true },
    minCapacity: 0,
  })),
}));

import L from 'leaflet';
import MapView from './MapView.vue';

describe('MapView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockMap.setView.mockReturnThis();
    mockTileLayer.addTo.mockReturnThis();
  });

  // Structure tests (from STR-002)
  it('renders a .map-wrap container', () => {
    const wrapper = mount(MapView);
    expect(wrapper.find('.map-wrap').exists()).toBe(true);
  });

  it('renders a #map div inside .map-wrap', () => {
    const wrapper = mount(MapView);
    expect(wrapper.find('.map-wrap #map').exists()).toBe(true);
  });

  it('#map has id exactly "map" (required by Leaflet)', () => {
    const wrapper = mount(MapView);
    const mapEl = wrapper.find('#map');
    expect(mapEl.exists()).toBe(true);
    expect(mapEl.element.id).toBe('map');
  });

  // Leaflet initialization
  it('initializes a Leaflet map on mount', () => {
    mount(MapView);
    expect(L.map).toHaveBeenCalledOnce();
  });

  it('passes the map element (not a string id) to L.map', () => {
    mount(MapView);
    const arg = (L.map as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(arg).toBeInstanceOf(HTMLElement);
  });

  it('sets view centered on Michigan with zoom 6', () => {
    mount(MapView);
    expect(mockMap.setView).toHaveBeenCalledWith([44.6, -85.6], 6);
  });

  it('creates the map with minZoom: 5 and maxZoom: 13', () => {
    mount(MapView);
    const opts = (L.map as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(opts).toMatchObject({ minZoom: 5, maxZoom: 13 });
  });

  it('creates a CARTO dark tile layer with correct URL', () => {
    mount(MapView);
    const url = (L.tileLayer as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toContain('cartocdn.com');
    expect(url).toContain('dark_all');
  });

  it('creates tile layer with correct options', () => {
    mount(MapView);
    const opts = (L.tileLayer as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(opts).toMatchObject({
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    });
  });

  it('adds the tile layer to the map', () => {
    mount(MapView);
    expect(mockTileLayer.addTo).toHaveBeenCalledWith(mockMap);
  });

  // Teardown
  it('calls map.remove() on unmount', () => {
    const wrapper = mount(MapView);
    wrapper.unmount();
    expect(mockMap.remove).toHaveBeenCalledOnce();
  });

  it('re-mounting creates a new map instance each time', () => {
    const wrapper = mount(MapView);
    wrapper.unmount();
    expect(mockMap.remove).toHaveBeenCalledOnce();
    mount(MapView);
    expect(L.map).toHaveBeenCalledTimes(2);
  });

  // Store wiring (from STR-010)
  it('calls providerStore.init() on mount', () => {
    mount(MapView);
    expect(mockProviderInit).toHaveBeenCalledOnce();
  });

  it('calls useMapMarkers with the map, providerStore, and filterStore on mount', () => {
    mount(MapView);
    expect(mockUseMapMarkers).toHaveBeenCalledOnce();
    const [mapArg, providerArg, filterArg] = mockUseMapMarkers.mock.calls[0];
    expect(mapArg).toBe(mockMap);
    expect(providerArg).toHaveProperty('init');
    expect(filterArg).toHaveProperty('activeTypes');
  });
});
