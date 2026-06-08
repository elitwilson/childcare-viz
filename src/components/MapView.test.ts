import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

const mockTileLayer = {
  addTo: vi.fn().mockReturnThis(),
};
const mockMap = {
  setView: vi.fn().mockReturnThis(),
  remove: vi.fn(),
};

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => mockMap),
    tileLayer: vi.fn(() => mockTileLayer),
  },
}));

import L from 'leaflet';
import MapView from './MapView.vue';

describe('MapView', () => {
  beforeEach(() => {
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
    const url = (L.tileLayer as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toContain('cartocdn.com');
    expect(url).toContain('dark_all');
  });

  it('creates tile layer with correct options', () => {
    mount(MapView);
    const opts = (L.tileLayer as ReturnType<typeof vi.fn>).mock.calls[0][1];
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
});
