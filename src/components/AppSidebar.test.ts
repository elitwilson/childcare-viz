import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppSidebar from './AppSidebar.vue';

describe('AppSidebar', () => {
  it('renders an aside element as root', () => {
    const wrapper = mount(AppSidebar);
    expect(wrapper.element.tagName.toLowerCase()).toBe('aside');
  });

  it('renders no inner content sections', () => {
    const wrapper = mount(AppSidebar);
    expect(wrapper.element.children.length).toBe(0);
  });
});
