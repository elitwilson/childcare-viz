---
number: 018
story: STR-018
status: ready
base_branch: main
depends_on: []
scope_files:
  - src/composables/useTheme.ts
  - src/composables/useTheme.test.ts
  - src/components/AppHeader.vue
  - src/components/MapView.vue
---

# Feature: Dark/Light Theme Toggle

## Summary
The header renders a placeholder dark/light theme toggle that currently does nothing. This feature wires it up: clicking "Dark" or "Light" switches the app's color scheme by setting `data-theme` on `<html>`, swaps the Leaflet CARTO basemap between the dark and light tile sets, and persists the choice to `localStorage` so it survives reloads. A new `useTheme` composable owns the theme state via a module-level `ref`, so the header and the map share one reactive source of truth. Default theme on first load is `'dark'`.

---

## Requirements
- A `useTheme` composable exposes a shared reactive `theme: Ref<'dark' | 'light'>` and a `setTheme(t: 'dark' | 'light')` function.
- On first init, `useTheme` reads `localStorage['mca-theme']`; if absent or invalid, it defaults to `'dark'`.
- Setting a theme applies `data-theme="<theme>"` to the `<html>` element and writes the value to `localStorage['mca-theme']`.
- All `localStorage` access is wrapped in try/catch so a storage failure (e.g. disabled storage) does not throw.
- Clicking the "Dark" button activates dark mode; clicking "Light" activates light mode.
- The active button reports `aria-pressed="true"` and the inactive button `aria-pressed="false"`, both reactive to the current theme.
- Each header button shows a text label ("Dark" / "Light") alongside its existing icon span.
- The map's CARTO tile layer uses `dark_all` in dark mode and `light_all` in light mode, and swaps live when the theme changes.

---

## Scope

### In Scope
- New composable `src/composables/useTheme.ts` with module-level shared state.
- New test `src/composables/useTheme.test.ts`.
- `AppHeader.vue`: wire buttons to `useTheme`, reactive `aria-pressed`, add "Dark"/"Light" labels.
- `MapView.vue`: refactor hardcoded tile URL into a `setBasemap(theme)` helper holding a `tileLayer` reference; watch `theme` and swap on change.

### Out of Scope
- Any CSS changes — the `html[data-theme="light"]` block already exists in `src/style.css` (line 34).
- A Pinia store for theme — the composable's module-level `ref` is sufficient.
- Theme-driven changes to marker/heat colors beyond what the existing CSS variables already provide.

---

## Technical Approach
- **Entry points / interfaces:**
  - `useTheme(): { theme: Ref<'dark' | 'light'>; setTheme: (t: 'dark' | 'light') => void }`. State (`theme` ref) is declared at module scope so every caller shares the same instance. Init logic (read localStorage, apply `data-theme`) runs once at module load or guarded by a flag.
- **Key modules / components:**
  - `useTheme.ts` — owns theme state, localStorage persistence (`mca-theme` key), and DOM attribute application (`document.documentElement.setAttribute('data-theme', t)`).
  - `AppHeader.vue` — consumes `useTheme`, binds `:aria-pressed="theme === 'dark'"` / `theme === 'light'`, calls `setTheme('dark'|'light')` on `@click`, renders labels.
  - `MapView.vue` — adds `let tileLayer: L.TileLayer | null = null` and a `setBasemap(theme)` helper that removes the existing layer (if any) and adds a new `L.tileLayer` with the matching CARTO URL; `onMounted` calls `setBasemap(theme.value)` instead of inlining the dark URL; a `watch(theme, (t) => setBasemap(t))` swaps live.
- **Data model:**
  - `type Theme = 'dark' | 'light'`. localStorage stores the raw string.
  - CARTO URLs: dark `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`, light `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`. Other tile options (`attribution`, `subdomains: 'abcd'`, `maxZoom: 19`) are unchanged.
- **Key design decisions:**
  - Module-level `ref` (not Pinia) per the story decision — lightweight shared singleton, matches the composable-first preference for state with no async lifecycle.
  - `setBasemap` removes-then-adds rather than calling `setUrl`, per the story's explicit instruction, keeping the helper reusable.

---

## Success Criteria
- [ ] `useTheme.theme` defaults to `'dark'` when localStorage is empty.
- [ ] `useTheme.theme` restores the persisted value (`'light'`) when `localStorage['mca-theme']` is set on init.
- [ ] `setTheme('light')` sets `document.documentElement` `data-theme` to `'light'` and writes `'light'` to localStorage.
- [ ] localStorage access does not throw when storage is unavailable (try/catch verified).
- [ ] In the rendered header, the active theme button has `aria-pressed="true"` and the other `"false"`, updating on click.
- [ ] After theme change, the Leaflet tile layer URL reflects `light_all` / `dark_all` accordingly (old layer removed, new added).

---

## Tasks
Ordered by dependency.

- [ ] **Create `useTheme` composable (test-first):** Write `useTheme.test.ts` covering: default `'dark'`, restore from localStorage, `setTheme` applies `data-theme` to `<html>` + writes localStorage, and localStorage try/catch resilience. Then implement `src/composables/useTheme.ts` with module-level `ref<Theme>`, init-from-storage, `setTheme`. Must be fully green before proceeding.
- [ ] **Wire `AppHeader.vue`:** Import `useTheme`; bind both buttons' `@click` to `setTheme('dark')` / `setTheme('light')`; bind `:aria-pressed` reactively to `theme`; add "Dark" / "Light" text labels next to the existing `.ic` icon spans.
- [ ] **Refactor `MapView.vue` basemap swap:** Add `let tileLayer: L.TileLayer | null = null` and `setBasemap(theme: 'dark' | 'light')` (remove existing layer, add new with the matching CARTO URL). Replace the inlined dark `L.tileLayer(...).addTo(map)` in `onMounted` with `setBasemap(theme.value)`. Add `watch(theme, (t) => setBasemap(t))`.

---

## Considerations
- The module-level `ref` means init side effects (reading localStorage, setting `data-theme`) fire at module load. In tests, reset `document.documentElement` attributes and `localStorage` in `beforeEach`, and be aware the module is cached across tests — use `vi.resetModules()` + dynamic `import()` if a test needs a fresh default-from-empty-storage run.
- `MapView.test.ts` does not exist; the existing Leaflet mock pattern lives in `useMapMarkers.test.ts`. The basemap swap is verified via success criteria / manual run rather than a new MapView component test, consistent with the project's "test logic, not components" stance — no MapView test is required by this spec.
- `setBasemap` must guard against `map` being null and remove the previous `tileLayer` before adding the new one to avoid stacked layers on repeated swaps.
- Validate the value read from localStorage is one of `'dark' | 'light'`; treat anything else as the default `'dark'`.
