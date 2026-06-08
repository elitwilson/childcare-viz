import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MapView from './MapView.vue';

describe('MapView', () => {
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
});
