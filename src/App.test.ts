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

vi.mock('./components/DevDataView.vue', () => ({
  default: {
    name: 'DevDataView',
    template: '<div data-test="dev-data-view"></div>',
  },
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
    mockUseProviderStore.mockReturnValue(makeStore() as ReturnType<typeof useProviderStore>);
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

  it('renders "Loading…" when store.loading is true', () => {
    mockUseProviderStore.mockReturnValue(makeStore({ loading: true }) as ReturnType<typeof useProviderStore>);
    const wrapper = mount(App);
    expect(wrapper.text()).toContain('Loading…');
  });

  it('renders "Error: {message}" when store.error is set', () => {
    mockUseProviderStore.mockReturnValue(makeStore({ error: 'fetch failed' }) as ReturnType<typeof useProviderStore>);
    const wrapper = mount(App);
    expect(wrapper.text()).toContain('Error: fetch failed');
  });

  it('renders DevDataView when providers are available and not loading or errored', () => {
    mockUseProviderStore.mockReturnValue(makeStore({
      providers: [{ id: '1', name: 'Test', licenseType: 'center', capacity: 10, lat: 42, lng: -83, address: '1 Main', city: 'Detroit', county: 'Wayne', zipCode: '48201', rating: null }],
      initialized: true,
    }) as ReturnType<typeof useProviderStore>);
    const wrapper = mount(App);
    expect(wrapper.find('[data-test="dev-data-view"]').exists()).toBe(true);
  });

  it('does not render DevDataView when loading', () => {
    mockUseProviderStore.mockReturnValue(makeStore({ loading: true }) as ReturnType<typeof useProviderStore>);
    const wrapper = mount(App);
    expect(wrapper.find('[data-test="dev-data-view"]').exists()).toBe(false);
  });

  it('does not render DevDataView when error is set', () => {
    mockUseProviderStore.mockReturnValue(makeStore({ error: 'oops' }) as ReturnType<typeof useProviderStore>);
    const wrapper = mount(App);
    expect(wrapper.find('[data-test="dev-data-view"]').exists()).toBe(false);
  });
});
