import { describe, it, expect, vi, beforeEach } from 'vitest';

// Reset module registry so each test group that needs fresh module state can re-import.
// Tests that share the same module instance use the module cached by the first import.

describe('useTheme', () => {
  beforeEach(() => {
    // Reset DOM and storage between tests
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    vi.resetModules();
  });

  it('defaults to dark when localStorage is empty', async () => {
    const { useTheme } = await import('./useTheme');
    const { theme } = useTheme();
    expect(theme.value).toBe('dark');
  });

  it('restores light from localStorage on init', async () => {
    localStorage.setItem('mca-theme', 'light');
    const { useTheme } = await import('./useTheme');
    const { theme } = useTheme();
    expect(theme.value).toBe('light');
  });

  it('defaults to dark when localStorage value is invalid', async () => {
    localStorage.setItem('mca-theme', 'invalid');
    const { useTheme } = await import('./useTheme');
    const { theme } = useTheme();
    expect(theme.value).toBe('dark');
  });

  it('setTheme applies data-theme attribute to <html>', async () => {
    const { useTheme } = await import('./useTheme');
    const { setTheme } = useTheme();
    setTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('setTheme writes to localStorage', async () => {
    const { useTheme } = await import('./useTheme');
    const { setTheme } = useTheme();
    setTheme('light');
    expect(localStorage.getItem('mca-theme')).toBe('light');
  });

  it('setTheme updates the reactive theme ref', async () => {
    const { useTheme } = await import('./useTheme');
    const { theme, setTheme } = useTheme();
    setTheme('light');
    expect(theme.value).toBe('light');
    setTheme('dark');
    expect(theme.value).toBe('dark');
  });

  it('init applies data-theme to <html> from localStorage', async () => {
    localStorage.setItem('mca-theme', 'light');
    await import('./useTheme');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('does not throw when localStorage is unavailable', async () => {
    const originalGetItem = Storage.prototype.getItem;
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.getItem = () => { throw new Error('storage disabled'); };
    Storage.prototype.setItem = () => { throw new Error('storage disabled'); };

    try {
      const { useTheme } = await import('./useTheme');
      const { theme, setTheme } = useTheme();
      expect(() => setTheme('light')).not.toThrow();
      expect(theme.value).toBe('light');
    } finally {
      Storage.prototype.getItem = originalGetItem;
      Storage.prototype.setItem = originalSetItem;
    }
  });
});
