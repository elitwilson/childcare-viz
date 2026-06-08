import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppHeader from './AppHeader.vue';

describe('AppHeader', () => {
  it('renders the mark dot element', () => {
    const wrapper = mount(AppHeader);
    expect(wrapper.find('.mark').exists()).toBe(true);
  });

  it('renders the title "Michigan Childcare Access"', () => {
    const wrapper = mount(AppHeader);
    expect(wrapper.find('h1').text()).toBe('Michigan Childcare Access');
  });

  it('renders the subtitle "density & capacity explorer"', () => {
    const wrapper = mount(AppHeader);
    expect(wrapper.find('.sub').text()).toBe('density & capacity explorer');
  });

  it('renders the theme toggle with id themeToggle', () => {
    const wrapper = mount(AppHeader);
    expect(wrapper.find('#themeToggle').exists()).toBe(true);
  });

  it('renders dark button with data-theme-set="dark" and aria-pressed="true"', () => {
    const wrapper = mount(AppHeader);
    const darkBtn = wrapper.find('[data-theme-set="dark"]');
    expect(darkBtn.exists()).toBe(true);
    expect(darkBtn.attributes('aria-pressed')).toBe('true');
    expect(darkBtn.find('.ic.moon').exists()).toBe(true);
  });

  it('renders light button with data-theme-set="light" and aria-pressed="false"', () => {
    const wrapper = mount(AppHeader);
    const lightBtn = wrapper.find('[data-theme-set="light"]');
    expect(lightBtn.exists()).toBe(true);
    expect(lightBtn.attributes('aria-pressed')).toBe('false');
    expect(lightBtn.find('.ic.sun').exists()).toBe(true);
  });

  it('renders the spike tag', () => {
    const wrapper = mount(AppHeader);
    expect(wrapper.find('.spike-tag').exists()).toBe(true);
    expect(wrapper.find('.spike-tag').text()).toContain('Spike');
  });

  it('renders elements in correct order: mark, h1, sub, themeToggle, spike-tag', () => {
    const wrapper = mount(AppHeader);
    const header = wrapper.find('header');
    const children = header.element.children;
    const classNames = Array.from(children).map(el => el.className || el.tagName.toLowerCase());
    const markIdx = classNames.findIndex(c => c.includes('mark'));
    const h1Idx = Array.from(children).findIndex(el => el.tagName.toLowerCase() === 'h1');
    const subIdx = classNames.findIndex(c => c.includes('sub'));
    const toggleIdx = Array.from(children).findIndex(el => el.id === 'themeToggle');
    const spikeIdx = classNames.findIndex(c => c.includes('spike-tag'));
    expect(markIdx).toBeLessThan(h1Idx);
    expect(h1Idx).toBeLessThan(subIdx);
    expect(subIdx).toBeLessThan(toggleIdx);
    expect(toggleIdx).toBeLessThan(spikeIdx);
  });
});
