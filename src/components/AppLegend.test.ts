import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppLegend from './AppLegend.vue';

describe('AppLegend — facilities mode', () => {
  it('renders [data-test="legend-facilities"] when activeView is facilities', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'facilities' } });
    expect(wrapper.find('[data-test="legend-facilities"]').exists()).toBe(true);
  });

  it('does not render [data-test="legend-density"] when activeView is facilities', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'facilities' } });
    expect(wrapper.find('[data-test="legend-density"]').exists()).toBe(false);
  });

  it('renders "Licensed Center" label', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'facilities' } });
    expect(wrapper.text()).toContain('Licensed Center');
  });

  it('renders "Group Home" label', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'facilities' } });
    expect(wrapper.text()).toContain('Group Home');
  });

  it('renders "Family Home" label', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'facilities' } });
    expect(wrapper.text()).toContain('Family Home');
  });

  it('includes a note about marker size scaling with capacity', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'facilities' } });
    const facilityBlock = wrapper.find('[data-test="legend-facilities"]');
    expect(facilityBlock.text().toLowerCase()).toContain('size');
    expect(facilityBlock.text().toLowerCase()).toContain('capacity');
  });

  it('swatch for Licensed Center references var(--center) via inline style', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'facilities' } });
    const swatches = wrapper.findAll('[data-test="legend-facilities"] .swatch');
    const centerSwatch = swatches[0];
    expect(centerSwatch.attributes('style')).toContain('var(--center)');
  });

  it('swatch for Group Home references var(--group) via inline style', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'facilities' } });
    const swatches = wrapper.findAll('[data-test="legend-facilities"] .swatch');
    const groupSwatch = swatches[1];
    expect(groupSwatch.attributes('style')).toContain('var(--group)');
  });

  it('swatch for Family Home references var(--family) via inline style', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'facilities' } });
    const swatches = wrapper.findAll('[data-test="legend-facilities"] .swatch');
    const familySwatch = swatches[2];
    expect(familySwatch.attributes('style')).toContain('var(--family)');
  });
});

describe('AppLegend — density mode', () => {
  it('renders [data-test="legend-density"] when activeView is density', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'density' } });
    expect(wrapper.find('[data-test="legend-density"]').exists()).toBe(true);
  });

  it('does not render [data-test="legend-facilities"] when activeView is density', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'density' } });
    expect(wrapper.find('[data-test="legend-facilities"]').exists()).toBe(false);
  });

  it('renders "sparse" label', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'density' } });
    expect(wrapper.find('[data-test="legend-density"]').text()).toContain('sparse');
  });

  it("renders \"sparse · 'desert'\" as the sparse end-label", () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'density' } });
    expect(wrapper.find('[data-test="legend-density"]').text()).toContain("sparse · 'desert'");
  });

  it('renders "dense" label', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'density' } });
    expect(wrapper.find('[data-test="legend-density"]').text()).toContain('dense');
  });

  it('renders a gradient bar element', () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'density' } });
    expect(wrapper.find('[data-test="legend-density"] .gradient-bar').exists()).toBe(true);
  });
});

describe('AppLegend — reactive switching', () => {
  it('swaps from facilities to density block when activeView prop changes', async () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'facilities' } });
    expect(wrapper.find('[data-test="legend-facilities"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="legend-density"]').exists()).toBe(false);

    await wrapper.setProps({ activeView: 'density' });

    expect(wrapper.find('[data-test="legend-facilities"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="legend-density"]').exists()).toBe(true);
  });

  it('swaps from density to facilities block when activeView prop changes', async () => {
    const wrapper = mount(AppLegend, { props: { activeView: 'density' } });
    await wrapper.setProps({ activeView: 'facilities' });
    expect(wrapper.find('[data-test="legend-facilities"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="legend-density"]').exists()).toBe(false);
  });
});
