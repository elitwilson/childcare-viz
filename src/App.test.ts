import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from './App.vue';

describe('App', () => {
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
});
