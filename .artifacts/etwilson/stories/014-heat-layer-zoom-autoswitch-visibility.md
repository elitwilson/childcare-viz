---
id: STR-014
title: Heat layer, zoom auto-switch, and layer visibility
epic: EPIC-004
status: open
priority: high
---

## Goal

Implement the heatmap layer and the logic that keeps the map coherent as the user zooms or switches views: a `zoomend` handler that auto-selects the right view, and a watcher that shows/hides the facilities groups and heat layer whenever `activeView` changes.

---

## Scope

### In
- `src/composables/useHeatLayer.ts` — new composable that:
  - Creates a `leaflet.heat` layer from the filtered provider list
  - Watches `filterStore.minCapacity` and `filterStore.activeTypes` to rebuild the heat layer when filters change
  - Watches `useMapStore.activeView` to add/remove the heat layer from the map, and to show/hide the facilities layer groups (passed in as a parameter)
  - Attaches a `map.on('zoomend')` handler that writes `'density'` to `activeView` when zoom ≤ 8, `'facilities'` when zoom > 8
- `src/composables/useHeatLayer.test.ts`
- `MapView.vue` — call `useHeatLayer` after `useMapMarkers`, passing `map`, stores, and the groups returned by `useMapMarkers`

### Out
- Any UI changes (sidebar, legend) — covered in STR-015 and STR-016
- Changes to `useMapMarkers` itself — its responsibility remains filter reactivity for circle markers only

---

## Acceptance Criteria

- [ ] Heatmap renders at zoom ≤ 8 and is hidden at zoom > 8 (auto-switch)
- [ ] Circle markers are hidden when `activeView === 'density'`, visible when `activeView === 'facilities'`
- [ ] Heat layer reflects the active `minCapacity` and `activeTypes` filters (updates on filter change)
- [ ] Changing `activeView` programmatically toggles layers correctly
- [ ] Heat layer weight per point: `Math.min(1, capacity / 120)`
- [ ] Heat layer config: `radius: 28, blur: 22, maxZoom: 11, minOpacity: 0.25`, gradient `{0.0: '#3b6fb0', 0.4: '#4fae7a', 0.7: '#d9b13f', 1.0: '#d96a4a'}`

---

## Context & Decisions

- `useHeatLayer` follows the same composable pattern as `useMapMarkers` — accepts `map`, `providerStore`, `filterStore`, and additionally `useMapStore` and the layer groups from `useMapMarkers`.
- The zoom threshold is 8: zoom ≤ 8 is "whole state / blob territory" → density; zoom > 8 is "city/region level" → facilities. This is a product decision, not configurable.
- The toggle in the sidebar will reflect `activeView` reactively (STR-015), so the auto-switch is transparent to the user.
- Heat layer uses the same filtered provider list as circle markers — `activeTypes` filtering means types toggled off do not contribute heat points.
- `useMapMarkers` already manages which groups are on the map; `useHeatLayer` needs a reference to those groups to show/hide them when `activeView` changes. Pass the groups return value of `useMapMarkers` into `useHeatLayer`.

---

## Dependencies

- **Depends on:** STR-013 (needs `useMapStore` and `leaflet-heat` types)
- **Blocks:** none

---

## Notes

- `leaflet.heat` input format: array of `[lat, lng, intensity]` tuples.
- When rebuilding the heat layer for filter changes, call `.setLatLngs()` or remove and re-add — check the `leaflet.heat` API; `setLatLngs` is the cheaper path.
- Facilities groups to show/hide are keyed by `LicenseType` — `useMapMarkers` returns `Record<string, L.LayerGroup>`.
- `useMapMarkers` does not need to know about `activeView`; layer visibility for the active-view switch is fully owned by `useHeatLayer`.
