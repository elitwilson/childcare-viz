import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import AppSidebar from './AppSidebar.vue';
import { useProviderStore } from '../stores/providers';
import { useFilterStore } from '../stores/filters';
import { useMapStore } from '../stores/map';
import type { Provider } from '../types/provider';
import { LicenseType } from '../types/provider';

const makeProvider = (overrides: Partial<Provider> = {}): Provider => ({
  id: '1',
  name: 'Test Provider',
  licenseType: LicenseType.Center,
  capacity: 20,
  lat: 0,
  lng: 0,
  address: '1 Main St',
  city: 'Portland',
  county: 'Multnomah',
  zipCode: '97201',
  rating: null,
  ...overrides,
});

describe('AppSidebar', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('section headers', () => {
    it('renders the "Map view" section', () => {
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="section-map-view"]').exists()).toBe(true);
    });

    it('renders the "Facility type" section', () => {
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="section-facility-type"]').exists()).toBe(true);
    });

    it('renders the "Filters" section', () => {
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="section-filters"]').exists()).toBe(true);
    });
  });

  describe('Map view section', () => {
    it('clicking Facilities button sets activeView to "facilities"', async () => {
      const mapStore = useMapStore();
      mapStore.activeView = 'density';
      const wrapper = mount(AppSidebar);
      await wrapper.find('[data-test="btn-facilities"]').trigger('click');
      expect(mapStore.activeView).toBe('facilities');
    });

    it('clicking Density button sets activeView to "density"', async () => {
      const mapStore = useMapStore();
      const wrapper = mount(AppSidebar);
      await wrapper.find('[data-test="btn-density"]').trigger('click');
      expect(mapStore.activeView).toBe('density');
    });

    it('aria-pressed updates reactively when activeView changes externally', async () => {
      const mapStore = useMapStore();
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="btn-facilities"]').attributes('aria-pressed')).toBe('true');
      expect(wrapper.find('[data-test="btn-density"]').attributes('aria-pressed')).toBe('false');
      mapStore.activeView = 'density';
      await flushPromises();
      expect(wrapper.find('[data-test="btn-facilities"]').attributes('aria-pressed')).toBe('false');
      expect(wrapper.find('[data-test="btn-density"]').attributes('aria-pressed')).toBe('true');
    });

    it('neither button is disabled and section has no aria-disabled', () => {
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="btn-facilities"]').attributes('disabled')).toBeUndefined();
      expect(wrapper.find('[data-test="btn-density"]').attributes('disabled')).toBeUndefined();
      expect(wrapper.find('[data-test="section-map-view"]').attributes('aria-disabled')).toBeUndefined();
    });
  });

  describe('Facility type chips', () => {
    it('renders exactly three chips — one per LicenseType', () => {
      const wrapper = mount(AppSidebar);
      const chips = wrapper.findAll('[data-test^="chip-"]');
      expect(chips).toHaveLength(3);
    });

    it('each chip shows the correct label', () => {
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="chip-center"]').text()).toContain('Licensed Center');
      expect(wrapper.find('[data-test="chip-group_home"]').text()).toContain('Group Home');
      expect(wrapper.find('[data-test="chip-family_home"]').text()).toContain('Family Home');
    });

    it('each chip shows the correct provider count from the store', () => {
      const providerStore = useProviderStore();
      providerStore.providers = [
        makeProvider({ id: '1', licenseType: LicenseType.Center }),
        makeProvider({ id: '2', licenseType: LicenseType.Center }),
        makeProvider({ id: '3', licenseType: LicenseType.GroupHome }),
      ];
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="chip-center"] [data-test="count"]').text()).toBe('2');
      expect(wrapper.find('[data-test="chip-group_home"] [data-test="count"]').text()).toBe('1');
      expect(wrapper.find('[data-test="chip-family_home"] [data-test="count"]').text()).toBe('0');
    });

    it('chip shows count 0 before data loads', () => {
      const wrapper = mount(AppSidebar);
      const chips = wrapper.findAll('[data-test^="chip-"]');
      chips.forEach(chip => {
        expect(chip.find('[data-test="count"]').text()).toBe('0');
      });
    });

    it('clicking a chip toggles filterStore.activeTypes for that type', async () => {
      const filterStore = useFilterStore();
      expect(filterStore.activeTypes.center).toBe(true);
      const wrapper = mount(AppSidebar);
      await wrapper.find('[data-test="chip-center"]').trigger('click');
      expect(filterStore.activeTypes.center).toBe(false);
      await wrapper.find('[data-test="chip-center"]').trigger('click');
      expect(filterStore.activeTypes.center).toBe(true);
    });

    it('chip aria-checked reflects the active state', async () => {
      const filterStore = useFilterStore();
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="chip-center"]').attributes('aria-checked')).toBe('true');
      filterStore.activeTypes.center = false;
      await flushPromises();
      expect(wrapper.find('[data-test="chip-center"]').attributes('aria-checked')).toBe('false');
    });
  });

  describe('Filters section — capacity slider', () => {
    it('slider has min=0, max=150, step=5', () => {
      const wrapper = mount(AppSidebar);
      const slider = wrapper.find('[data-test="slider-capacity"]');
      expect(slider.attributes('min')).toBe('0');
      expect(slider.attributes('max')).toBe('150');
      expect(slider.attributes('step')).toBe('5');
    });

    it('slider initial value matches filterStore.minCapacity', () => {
      const filterStore = useFilterStore();
      expect(filterStore.minCapacity).toBe(0);
      const wrapper = mount(AppSidebar);
      expect((wrapper.find('[data-test="slider-capacity"]').element as HTMLInputElement).value).toBe('0');
    });

    it('updating the slider updates filterStore.minCapacity', async () => {
      const filterStore = useFilterStore();
      const wrapper = mount(AppSidebar);
      const slider = wrapper.find('[data-test="slider-capacity"]');
      await slider.setValue(50);
      expect(filterStore.minCapacity).toBe(50);
    });

    it('displayed value label reflects the current minCapacity', async () => {
      const filterStore = useFilterStore();
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="capacity-value"]').text()).toBe('0');
      filterStore.minCapacity = 75;
      await flushPromises();
      expect(wrapper.find('[data-test="capacity-value"]').text()).toBe('75');
    });
  });

  describe('Showing section', () => {
    it('renders the showing section', () => {
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="section-showing"]').exists()).toBe(true);
    });

    it('displays facility count for currently filtered providers', () => {
      const providerStore = useProviderStore();
      providerStore.providers = [
        makeProvider({ id: '1', licenseType: LicenseType.Center, capacity: 20 }),
        makeProvider({ id: '2', licenseType: LicenseType.Center, capacity: 30 }),
        makeProvider({ id: '3', licenseType: LicenseType.GroupHome, capacity: 10 }),
      ];
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="stat-facility-count"]').text()).toBe('3');
    });

    it('displays total seats for currently filtered providers', () => {
      const providerStore = useProviderStore();
      providerStore.providers = [
        makeProvider({ id: '1', licenseType: LicenseType.Center, capacity: 20 }),
        makeProvider({ id: '2', licenseType: LicenseType.Center, capacity: 30 }),
        makeProvider({ id: '3', licenseType: LicenseType.GroupHome, capacity: 10 }),
      ];
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="stat-total-seats"]').text()).toBe('60');
    });

    it('count and seats update when a type is toggled off', async () => {
      const providerStore = useProviderStore();
      const filterStore = useFilterStore();
      providerStore.providers = [
        makeProvider({ id: '1', licenseType: LicenseType.Center, capacity: 20 }),
        makeProvider({ id: '2', licenseType: LicenseType.GroupHome, capacity: 15 }),
      ];
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="stat-facility-count"]').text()).toBe('2');
      expect(wrapper.find('[data-test="stat-total-seats"]').text()).toBe('35');

      filterStore.activeTypes[LicenseType.GroupHome] = false;
      await flushPromises();
      expect(wrapper.find('[data-test="stat-facility-count"]').text()).toBe('1');
      expect(wrapper.find('[data-test="stat-total-seats"]').text()).toBe('20');
    });

    it('count and seats update when minCapacity rises', async () => {
      const providerStore = useProviderStore();
      const filterStore = useFilterStore();
      providerStore.providers = [
        makeProvider({ id: '1', licenseType: LicenseType.Center, capacity: 20 }),
        makeProvider({ id: '2', licenseType: LicenseType.Center, capacity: 50 }),
      ];
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="stat-facility-count"]').text()).toBe('2');

      filterStore.minCapacity = 30;
      await flushPromises();
      expect(wrapper.find('[data-test="stat-facility-count"]').text()).toBe('1');
      expect(wrapper.find('[data-test="stat-total-seats"]').text()).toBe('50');
    });

    it('shows 0 count and 0 seats when provider list is empty', () => {
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="stat-facility-count"]').text()).toBe('0');
      expect(wrapper.find('[data-test="stat-total-seats"]').text()).toBe('0');
    });

    it('formats count >= 1000 with commas via toLocaleString', () => {
      const providerStore = useProviderStore();
      providerStore.providers = Array.from({ length: 1250 }, (_, i) =>
        makeProvider({ id: String(i), licenseType: LicenseType.Center, capacity: 1 })
      );
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="stat-facility-count"]').text()).toBe((1250).toLocaleString());
    });

    it('formats seats >= 1000 with commas via toLocaleString', () => {
      const providerStore = useProviderStore();
      providerStore.providers = [
        makeProvider({ id: '1', licenseType: LicenseType.Center, capacity: 1500 }),
      ];
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="stat-total-seats"]').text()).toBe((1500).toLocaleString());
    });
  });

  describe('Reset all filters', () => {
    it('renders the reset button', () => {
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="btn-reset"]').exists()).toBe(true);
    });

    it('clicking reset sets all activeTypes to true', async () => {
      const filterStore = useFilterStore();
      filterStore.activeTypes[LicenseType.Center] = false;
      filterStore.activeTypes[LicenseType.GroupHome] = false;
      const wrapper = mount(AppSidebar);
      await wrapper.find('[data-test="btn-reset"]').trigger('click');
      expect(filterStore.activeTypes[LicenseType.Center]).toBe(true);
      expect(filterStore.activeTypes[LicenseType.GroupHome]).toBe(true);
      expect(filterStore.activeTypes[LicenseType.FamilyHome]).toBe(true);
    });

    it('clicking reset sets minCapacity to 0', async () => {
      const filterStore = useFilterStore();
      filterStore.minCapacity = 75;
      const wrapper = mount(AppSidebar);
      await wrapper.find('[data-test="btn-reset"]').trigger('click');
      expect(filterStore.minCapacity).toBe(0);
    });

    it('stats update immediately after reset reflects full provider set', async () => {
      const providerStore = useProviderStore();
      const filterStore = useFilterStore();
      providerStore.providers = [
        makeProvider({ id: '1', licenseType: LicenseType.Center, capacity: 20 }),
        makeProvider({ id: '2', licenseType: LicenseType.GroupHome, capacity: 15 }),
      ];
      filterStore.activeTypes[LicenseType.GroupHome] = false;
      filterStore.minCapacity = 25;
      const wrapper = mount(AppSidebar);
      await flushPromises();
      expect(wrapper.find('[data-test="stat-facility-count"]').text()).toBe('0');

      await wrapper.find('[data-test="btn-reset"]').trigger('click');
      await flushPromises();
      expect(wrapper.find('[data-test="stat-facility-count"]').text()).toBe('2');
      expect(wrapper.find('[data-test="stat-total-seats"]').text()).toBe('35');
    });
  });
});
