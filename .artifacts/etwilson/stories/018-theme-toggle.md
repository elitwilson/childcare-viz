---
id: STR-018
title: Dark/light theme toggle
epic: EPIC-005
status: open
priority: high
---

## Goal

Wire the placeholder theme toggle in the header so clicking Dark/Light actually switches the app's color scheme and swaps the CARTO basemap, with the choice persisted to localStorage across reloads.

---

## Scope

### In
- `src/composables/useTheme.ts` — composable that manages theme state: reads from localStorage on init (key `mca-theme`, default `'dark'`), sets `data-theme` attribute on `<html>`, exposes `theme: Ref<'dark' | 'light'>` and `setTheme(t)` function
- `AppHeader.vue` — import `useTheme`, bind button `aria-pressed` reactively, call `setTheme` on click; add "Dark" / "Light" labels to match mockup
- `MapView.vue` — watch `useTheme().theme` and swap the Leaflet tile layer URL between dark and light CARTO basemaps
- `src/composables/useTheme.test.ts`

### Out
- Any CSS changes (dark/light theme CSS variables are already in `style.css` via `html[data-theme="light"]`)
- Pinia store for theme (composable is sufficient — theme is not shared across components via store; each caller to `useTheme()` gets the same singleton ref)

---

## Acceptance Criteria

- [ ] Clicking "Light" in the header sets `data-theme="light"` on `<html>` and the app switches to light colors
- [ ] Clicking "Dark" sets `data-theme="dark"` (or removes the attribute) and the app returns to dark
- [ ] The active button shows `aria-pressed="true"`, the inactive button shows `aria-pressed="false"`, both update reactively
- [ ] The CARTO tile layer swaps to `light_all` in light mode and `dark_all` in dark mode
- [ ] Theme choice persists in localStorage (`mca-theme` key) and is restored on reload
- [ ] Default theme on first load is `'dark'`

---

## Context & Decisions

- `useTheme` is a composable, not a Pinia store — it manages a module-level `ref` so all callers share the same reactive instance without Pinia overhead. This mirrors the mockup's approach (a simple function with a closure over state).
- Dark CARTO URL: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
- Light CARTO URL: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
- `MapView` currently hardcodes the dark tile URL in `onMounted`. Refactor to a `setBasemap(theme)` helper that removes the current tile layer and adds a new one — called on mount and on theme change via `watch`.
- localStorage key is `mca-theme` (matches the mockup). Use try/catch around localStorage access for environments where it may be blocked.
- `AppHeader` buttons currently render moon/sun icon spans with no labels. Add "Dark" / "Light" text labels to match the mockup's button content.

---

## Dependencies

- **Depends on:** none
- **Blocks:** none

---

## Notes

- The `html[data-theme="light"]` CSS block is already in `src/style.css` from EPIC-001 — no CSS changes needed, just setting the attribute.
- `MapView.vue` needs to hold a reference to the current tile layer so it can call `map.removeLayer(tileLayer)` before adding the new one. The current implementation adds the tile layer inline in `onMounted` without storing a reference — refactor to a `let tileLayer: L.TileLayer | null = null` pattern.
- Testing `useTheme` will require mocking localStorage and the DOM `documentElement.setAttribute` call.
