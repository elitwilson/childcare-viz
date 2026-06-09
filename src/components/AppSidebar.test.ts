import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import AppSidebar from './AppSidebar.vue';
import { useProviderStore } from '../stores/providers';
import { useFilterStore } from '../stores/filters';
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
    it('renders two disabled buttons for Facilities and Density', () => {
      const wrapper = mount(AppSidebar);
      const facilitiesBtn = wrapper.find('[data-test="btn-facilities"]');
      const densityBtn = wrapper.find('[data-test="btn-density"]');
      expect(facilitiesBtn.attributes('disabled')).toBeDefined();
      expect(densityBtn.attributes('disabled')).toBeDefined();
    });

    it('Facilities button has aria-pressed="true"', () => {
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="btn-facilities"]').attributes('aria-pressed')).toBe('true');
    });

    it('section container has aria-disabled="true"', () => {
      const wrapper = mount(AppSidebar);
      expect(wrapper.find('[data-test="section-map-view"]').attributes('aria-disabled')).toBe('true');
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
});
