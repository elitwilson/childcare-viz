import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

const { mockTileLayer, mockMap, mockInit } = vi.hoisted(() => {
  return {
    mockTileLayer: { addTo: vi.fn().mockReturnThis() },
    mockMap: { setView: vi.fn().mockReturnThis(), remove: vi.fn(), addLayer: vi.fn(), removeLayer: vi.fn() },
    mockInit: vi.fn(),
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

vi.mock('./composables/useMapMarkers', () => ({
  useMapMarkers: vi.fn(),
}));

vi.mock('./stores/providers', () => ({
  useProviderStore: vi.fn(() => ({
    providers: [],
    loading: false,
    error: null,
    initialized: false,
    init: mockInit,
  })),
}));

vi.mock('./stores/filters', () => ({
  useFilterStore: vi.fn(() => ({
    activeTypes: { center: true, family_home: true, group_home: true },
    minCapacity: 0,
  })),
}));

import App from './App.vue';

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockMap.setView.mockReturnThis();
    mockTileLayer.addTo.mockReturnThis();
  });

  it('renders AppHeader', () => {
    const wrapper = mount(App);
    expect(wrapper.find('header').exists()).toBe(true);
  });

  it('renders a main element', () => {
    const wrapper = mount(App);
    expect(wrapper.find('main').exists()).toBe(true);
  });

  it('renders AppSidebar (aside) inside main', () => {
    const wrapper = mount(App);
    expect(wrapper.find('main aside').exists()).toBe(true);
  });

  it('renders MapView (.map-wrap) inside main', () => {
    const wrapper = mount(App);
    expect(wrapper.find('main .map-wrap').exists()).toBe(true);
  });

  it('renders #map inside main', () => {
    const wrapper = mount(App);
    expect(wrapper.find('main #map').exists()).toBe(true);
  });

  it('calls store.init() on mount', async () => {
    mount(App);
    await flushPromises();
    expect(mockInit).toHaveBeenCalled();
  });
});
