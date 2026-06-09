import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

const mockTileLayer = { addTo: vi.fn().mockReturnThis() };
const mockMap = { setView: vi.fn().mockReturnThis(), remove: vi.fn() };

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => mockMap),
    tileLayer: vi.fn(() => mockTileLayer),
  },
}));

const mockInit = vi.fn();

vi.mock('./stores/providers', () => ({
  useProviderStore: vi.fn(),
}));

import { useProviderStore } from './stores/providers';
import App from './App.vue';

const mockUseProviderStore = vi.mocked(useProviderStore);

function makeStore(overrides: object = {}) {
  return {
    providers: [],
    loading: false,
    error: null,
    initialized: false,
    init: mockInit,
    ...overrides,
  };
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMap.setView.mockReturnThis();
    mockTileLayer.addTo.mockReturnThis();
    mockUseProviderStore.mockReturnValue(makeStore() as unknown as ReturnType<typeof useProviderStore>);
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

  it('calls store.init() once on mount', async () => {
    mount(App);
    await flushPromises();
    expect(mockInit).toHaveBeenCalledOnce();
  });

});
