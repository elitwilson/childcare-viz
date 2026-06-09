import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

// Hoist all mock variables so vi.mock factories can reference them
const { mockTileLayer, mockMap, mockUseMapMarkers, mockUseHeatLayer, mockProviderInit } = vi.hoisted(() => {
  const mockTileLayer = { addTo: vi.fn().mockReturnThis() };
  const mockMap = {
    setView: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    on: vi.fn(),
    getZoom: vi.fn(() => 6),
  };
  return {
    mockTileLayer,
    mockMap,
    mockUseMapMarkers: vi.fn(() => ({})),
    mockUseHeatLayer: vi.fn(),
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

vi.mock('leaflet.heat', () => ({}));

vi.mock('../composables/useMapMarkers', async (importActual) => {
  const actual = await importActual<typeof import('../composables/useMapMarkers')>();
  return {
    ...actual,
    useMapMarkers: mockUseMapMarkers,
  };
});

vi.mock('../composables/useHeatLayer', () => ({
  useHeatLayer: mockUseHeatLayer,
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

vi.mock('../stores/map', () => ({
  useMapStore: vi.fn(() => ({
    activeView: 'facilities',
  })),
}));

import L from 'leaflet';
import MapView from './MapView.vue';
import { buildPopupHtml } from '../composables/useMapMarkers';
import { LicenseType } from '../types/provider';
import type { Provider } from '../types/provider';

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

describe('buildPopupHtml', () => {
  const CENTER_COLOR = 'oklch(0.70 0.13 250)';
  const FAMILY_COLOR = 'oklch(0.74 0.13 145)';
  const GROUP_COLOR  = 'oklch(0.78 0.13 85)';

  it('returns a string containing the .pop wrapper', () => {
    const html = buildPopupHtml(makeProvider(), CENTER_COLOR);
    expect(html).toContain('class="pop"');
  });

  it('renders "Licensed Center" label for center license type', () => {
    const html = buildPopupHtml(makeProvider({ licenseType: LicenseType.Center }), CENTER_COLOR);
    expect(html).toContain('Licensed Center');
  });

  it('renders "Family Home" label for family_home license type', () => {
    const html = buildPopupHtml(makeProvider({ licenseType: LicenseType.FamilyHome }), FAMILY_COLOR);
    expect(html).toContain('Family Home');
  });

  it('renders "Group Home" label for group_home license type', () => {
    const html = buildPopupHtml(makeProvider({ licenseType: LicenseType.GroupHome }), GROUP_COLOR);
    expect(html).toContain('Group Home');
  });

  it('injects the resolved color as inline background on the swatch', () => {
    const html = buildPopupHtml(makeProvider({ licenseType: LicenseType.Center }), CENTER_COLOR);
    expect(html).toContain(`background:${CENTER_COLOR}`);
  });

  it('swatch element has class "sw"', () => {
    const html = buildPopupHtml(makeProvider(), CENTER_COLOR);
    expect(html).toContain('class="sw"');
  });

  it('renders the provider name in the .nm element', () => {
    const html = buildPopupHtml(makeProvider({ name: 'Sunshine Childcare' }), CENTER_COLOR);
    expect(html).toContain('Sunshine Childcare');
    expect(html).toContain('class="nm"');
  });

  it('renders the city in the Location row', () => {
    const html = buildPopupHtml(makeProvider({ city: 'Grand Rapids' }), CENTER_COLOR);
    expect(html).toContain('Location');
    expect(html).toContain('Grand Rapids');
  });

  it('renders capacity as "<n> seats" in the Capacity row', () => {
    const html = buildPopupHtml(makeProvider({ capacity: 42 }), CENTER_COLOR);
    expect(html).toContain('Capacity');
    expect(html).toContain('42 seats');
  });

  it('includes a Rating row when rating is non-null', () => {
    const html = buildPopupHtml(makeProvider({ rating: 4 }), CENTER_COLOR);
    expect(html).toContain('Rating');
    expect(html).toContain('4');
  });

  it('omits the Rating row entirely when rating is null', () => {
    const html = buildPopupHtml(makeProvider({ rating: null }), CENTER_COLOR);
    expect(html).not.toContain('Rating');
  });

  it('omits any empty Rating key/value when rating is null', () => {
    const html = buildPopupHtml(makeProvider({ rating: null }), CENTER_COLOR);
    const ratingCount = (html.match(/Rating/g) || []).length;
    expect(ratingCount).toBe(0);
  });
});
