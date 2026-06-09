import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const css = readFileSync(resolve(__dirname, 'style.css'), 'utf-8');

describe('Global styles & theme variables', () => {
  it('defines dark theme CSS custom properties in :root', () => {
    expect(css).toContain(':root');
    expect(css).toContain('--bg:');
    expect(css).toContain('--panel:');
    expect(css).toContain('--panel-2:');
    expect(css).toContain('--line:');
    expect(css).toContain('--ink:');
    expect(css).toContain('--ink-dim:');
    expect(css).toContain('--ink-faint:');
    expect(css).toContain('--accent:');
    expect(css).toContain('--center:');
    expect(css).toContain('--family:');
    expect(css).toContain('--group:');
    expect(css).toContain('--head:');
    expect(css).toContain('--map-bg:');
    expect(css).toContain('--mono:');
    expect(css).toContain('--sans:');
  });

  it('defines light theme override block via html[data-theme="light"]', () => {
    expect(css).toContain('html[data-theme="light"]');
  });

  it('sets box-sizing reset on *', () => {
    expect(css).toMatch(/\*[^{]*\{[^}]*box-sizing/);
  });

  it('sets html and body to full height with no margin', () => {
    expect(css).toMatch(/html\s*,?\s*body/);
    expect(css).toContain('height: 100%');
    expect(css).toContain('margin: 0');
  });

  it('sets body overflow hidden', () => {
    expect(css).toContain('overflow: hidden');
  });

  it('sets body as CSS grid with auto 1fr rows', () => {
    expect(css).toContain('grid-template-rows: auto 1fr');
  });

  it('sets main grid with 320px sidebar column', () => {
    expect(css).toContain('grid-template-columns: 320px 1fr');
  });

  it('defines transition rule for header and aside', () => {
    expect(css).toMatch(/header.*transition|transition.*header/s);
    expect(css).toMatch(/aside.*transition|transition.*aside/s);
  });

  it('defines global #map styles', () => {
    expect(css).toContain('#map');
  });

  it('defines .map-wrap styles', () => {
    expect(css).toContain('.map-wrap');
  });
});

describe('Leaflet popup styles', () => {
  it('defines .leaflet-popup-content-wrapper with var(--panel) background', () => {
    expect(css).toContain('.leaflet-popup-content-wrapper');
    expect(css).toMatch(/\.leaflet-popup-content-wrapper[^}]*background[^:]*:[^}]*var\(--panel\)/s);
  });

  it('defines .leaflet-popup-content-wrapper with var(--line) border', () => {
    expect(css).toMatch(/\.leaflet-popup-content-wrapper[^}]*border[^:]*:[^}]*var\(--line\)/s);
  });

  it('defines .leaflet-popup-tip with var(--panel) background', () => {
    expect(css).toContain('.leaflet-popup-tip');
    expect(css).toMatch(/\.leaflet-popup-tip[^}]*background[^:]*:[^}]*var\(--panel\)/s);
  });

  it('defines .leaflet-popup-content selector', () => {
    expect(css).toContain('.leaflet-popup-content');
  });

  it('defines .pop .pt selector', () => {
    expect(css).toContain('.pop .pt');
  });

  it('defines .pop .pt .sw selector (color swatch)', () => {
    expect(css).toContain('.pop .pt .sw');
  });

  it('defines .pop .nm selector (provider name)', () => {
    expect(css).toContain('.pop .nm');
  });

  it('defines .pop .grid selector', () => {
    expect(css).toContain('.pop .grid');
  });

  it('defines .pop .grid .k selector (key column)', () => {
    expect(css).toContain('.pop .grid .k');
  });

  it('defines .pop .grid .vv selector with monospace font', () => {
    expect(css).toContain('.pop .grid .vv');
    expect(css).toMatch(/\.pop \.grid \.vv[^}]*font-family[^:]*:[^}]*var\(--mono\)/s);
  });
});
