---
id: STR-010
title: Circle markers with filter reactivity
epic: EPIC-003
status: open
priority: high
---

## Goal

Render all ~7,700 providers as interactive circle markers on the map, styled per the design mockup, and reactively show/hide them as `useFilterStore` state changes. This is the core visual deliverable of the epic.

---

## Scope

### In
- Add CSS custom properties to `style.css`: `--center: oklch(0.70 0.13 250)`, `--family: oklch(0.74 0.13 145)`, `--group: oklch(0.78 0.13 85)`
- Canvas renderer (`L.canvas()`) passed as `renderer` to all circle markers
- Three `L.layerGroup()` instances in `MapView` — one per `LicenseType` — populated on provider load
- Radius formula: `4 + Math.sqrt(capacity) * 1.15`
- Marker stroke/fill: `fillOpacity: 0.55, opacity: 0.9, weight: 1.4`; color resolved from CSS vars via `getComputedStyle`
- Watcher on `filterStore.activeTypes`: add/remove the corresponding layer group from the map
- Watcher on `filterStore.minCapacity`: clear and rebuild each active layer group from the filtered provider list
- Call `useProviderStore.init()` from `MapView` on mount if not already initialized

### Out
- Popup binding (STR-011)
- Sidebar UI (STR-012)
- Density/heatmap layer (EPIC-004)

---

## Acceptance Criteria

- [ ] All providers with valid coordinates appear as circle markers on initial load
- [ ] Marker radius visibly scales with capacity
- [ ] Markers are colored by license type matching the mockup color scheme
- [ ] Setting `filterStore.activeTypes.center = false` removes center markers from the map without affecting other types
- [ ] Setting `filterStore.minCapacity = 50` removes markers below that threshold
- [ ] Restoring defaults brings all markers back
- [ ] No visible render lag when toggling a type (layer group add/remove, not per-marker iteration)

---

## Context & Decisions

- **Canvas renderer**: pass `L.canvas()` as `renderer` option — single change from SVG default, meaningfully faster at this marker count
- **Per-type layer groups**: type toggling is `map.addLayer(group)` / `map.removeLayer(group)` — O(1), not O(n) marker iteration
- **Capacity filter re-renders**: when `minCapacity` changes, each active group is cleared and rebuilt from the filtered provider subset — acceptable for POC
- **Colors via CSS vars**: use `getComputedStyle(document.documentElement).getPropertyValue('--center')` etc. to resolve colors at render time, not hardcoded hex — future-proof for theming
- **`MapView` owns Leaflet directly**: no `useMapStore` in this epic; filter reactivity flows from watchers inside `MapView`

---

## Dependencies

- **Depends on:** STR-008 (providers must be available), STR-009 (filterStore must exist)
- **Blocks:** STR-011 (popup binds to markers), STR-012 (sidebar toggles the layer groups built here)

---

## Notes

- `MapView.vue` will get complex with layer group management + watchers — architect should consider extracting a `useMapMarkers(map, filterStore)` composable to keep the component readable
- oklch colors in canvas: delegated to browser Canvas 2D API — supported in Chrome 111+, Firefox 113+, Safari 15.4+; fine for this POC
