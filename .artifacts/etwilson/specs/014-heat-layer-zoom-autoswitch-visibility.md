---
number: 014
story: STR-014
status: complete
base_branch: main
depends_on: [STR-013]
scope_files:
  - src/composables/useHeatLayer.ts
  - src/composables/useHeatLayer.test.ts
  - src/views/MapView.vue
---

# Feature: Heat layer, zoom auto-switch, and layer visibility

## Summary
Adds a density heatmap to the map and the logic that keeps the two-view experience coherent. A new `useHeatLayer` composable builds a `leaflet.heat` layer from the same filtered provider list the circle markers use, rebuilds it when `minCapacity` or `activeTypes` change, and reacts to `useMapStore.activeView` by toggling the heat layer and the facilities layer groups on/off. It also installs a `zoomend` handler that drives `activeView` automatically: zoom ≤ 8 selects `'density'`, zoom > 8 selects `'facilities'`, so the map is never an unreadable blob. `MapView.vue` wires this composable in after `useMapMarkers`, passing the layer groups returned by the latter.

---

## Requirements
- A `useHeatLayer(map, providerStore, filterStore, mapStore, groups)` composable creates a single `leaflet.heat` layer from the filtered provider list.
- The filtered provider list applies the same two filters used by the circle markers: a provider is included only if `provider.capacity >= filterStore.minCapacity` AND `filterStore.activeTypes[provider.licenseType]` is true.
- Each heat point is the tuple `[provider.lat, provider.lng, Math.min(1, provider.capacity / 120)]`.
- The heat layer is created with options `{ radius: 28, blur: 22, maxZoom: 11, minOpacity: 0.25, gradient: { 0.0: '#3b6fb0', 0.4: '#4fae7a', 0.7: '#d9b13f', 1.0: '#d96a4a' } }`.
- When `filterStore.minCapacity` or `filterStore.activeTypes` change, the heat layer's point data is rebuilt to reflect the new filtered list.
- When `mapStore.activeView === 'density'`: the heat layer is on the map and every facilities group is removed from the map.
- When `mapStore.activeView === 'facilities'`: the heat layer is removed from the map and the facilities groups that should be visible (per `activeTypes`) are on the map.
- A `map.on('zoomend')` handler sets `mapStore.activeView` to `'density'` when `map.getZoom() <= 8`, and to `'facilities'` when `map.getZoom() > 8`.
- `MapView.vue` calls `useHeatLayer` after `useMapMarkers`, passing the `map`, the three stores, and the `Record<string, L.LayerGroup>` returned by `useMapMarkers`.

---

## Scope

### In Scope
- `src/composables/useHeatLayer.ts` — new composable (heat layer build, filter watchers, `activeView` visibility watcher, `zoomend` handler).
- `src/composables/useHeatLayer.test.ts` — unit tests.
- `src/views/MapView.vue` — instantiate `useMapStore`, call `useHeatLayer` after `useMapMarkers`.

### Out of Scope
- The sidebar view toggle UI (STR-015) and legend panel (STR-016).
- `useMapStore` itself and the `leaflet-heat.d.ts` declaration (STR-013).
- Any change to `useMapMarkers` — its responsibility stays circle-marker filter reactivity only. It must NOT learn about `activeView`; all active-view visibility is owned by `useHeatLayer`.

---

## Technical Approach
- **Entry points / interfaces:**
  - `useHeatLayer(map: L.Map, providerStore, filterStore, mapStore, groups: Record<string, L.LayerGroup>): void`. Signature mirrors `useMapMarkers` (`src/composables/useMapMarkers.ts:42`) plus the `mapStore` and `groups` params. No return value needed.
  - Store types via `ReturnType<typeof useProviderStore>` / `useFilterStore` / `useMapStore`, matching the existing composable's import style.
- **Key modules / components:**
  - `useHeatLayer.ts` owns: building the `[lat, lng, intensity]` tuples, creating the heat layer with `L.heatLayer(points, options)`, a `filteredProviders()` helper, an `applyVisibility()` helper that adds/removes the heat layer and facilities groups according to `activeView`, and the `zoomend` handler.
  - `MapView.vue` (`src/views/MapView.vue`) imports `useMapStore`, captures `const groups = useMapMarkers(...)`, then calls `useHeatLayer(map, providerStore, filterStore, mapStore, groups)`.
- **Data model:**
  - Heat input: `L.HeatLatLngTuple` = `[number, number, number]` (lat, lng, intensity). Provided by the installed `@types/leaflet.heat`, which augments the `L` namespace with `L.heatLayer(...)` returning `L.HeatLayer` (has `setLatLngs`). The STR-013 local `.d.ts` is a redundant fallback; prefer the `L.heatLayer` API either way.
  - `groups: Record<string, L.LayerGroup>` keyed by `LicenseType` value, exactly as `useMapMarkers` returns.
- **Key design decisions:**
  - The heat layer is created once and updated via `.setLatLngs(points)` on filter changes (cheaper than recreate; matches the story note). The layer is added/removed from the map only by the `activeView` watcher.
  - Filtered list is computed inline (not pushed into a store) to keep `useFilterStore`/`useMapStore` orthogonal per the epic decision. Duplicating the `capacity >= minCapacity && activeTypes[type]` predicate here is acceptable — it is two lines, not worth a shared abstraction.
  - Watchers: one `watch` on `() => [filterStore.minCapacity, { ...filterStore.activeTypes }]` (deep) to rebuild points; one `watch` on `() => mapStore.activeView` (immediate, so initial visibility is correct) to toggle layers; one `watch` on `() => providerStore.providers` to (re)build points once data arrives. `zoomend` is registered once at setup.
  - `applyVisibility()` is the single place that touches `map.addLayer`/`map.removeLayer` for the heat layer and groups, called by the `activeView` watcher. For the facilities case it re-adds only groups whose `activeTypes[type]` is true, so it does not resurrect a type the user toggled off.

---

## Success Criteria
- [ ] `useHeatLayer` builds an `L.heatLayer` whose points are `[lat, lng, Math.min(1, capacity/120)]` for each provider in the filtered list.
- [ ] Heat layer is created with the exact options `radius: 28, blur: 22, maxZoom: 11, minOpacity: 0.25` and the four-stop gradient.
- [ ] With `activeView === 'density'`: heat layer added to map, all facilities groups removed.
- [ ] With `activeView === 'facilities'`: heat layer removed, active facilities groups present.
- [ ] Changing `minCapacity` or toggling a type in `activeTypes` calls `setLatLngs` with the recomputed filtered point set.
- [ ] A `zoomend` handler is registered; firing it at zoom 6 sets `activeView = 'density'`, at zoom 10 sets `activeView = 'facilities'`.
- [ ] `MapView.vue` calls `useHeatLayer` after `useMapMarkers`, passing the returned groups.
- [ ] `useMapMarkers` is unchanged; `npm run test` and `vue-tsc` pass.

---

## Tasks
Ordered by dependency.

- [ ] **Scaffold `useHeatLayer` + tests (RED):** Create `src/composables/useHeatLayer.ts` with the exported signature and create `src/composables/useHeatLayer.test.ts`. Model the test setup on `useMapMarkers.test.ts`: hoisted `vi.mock('leaflet')` extended with `heatLayer` (returns a mock object exposing `setLatLngs`/`addTo` spies) and a `mockMap` extended with an `on` spy, `getZoom`, plus the existing `addLayer`/`removeLayer`. Stub a `useMapStore` (or use the real store once STR-013 lands) with a writable `activeView` ref. Scaffold the cases listed below. Must be reviewed before GREEN.
- [ ] **Build the heat layer + filtered points (GREEN, part 1):** Implement `filteredProviders()` (capacity + activeTypes predicate), the `[lat, lng, Math.min(1, capacity/120)]` tuple mapping, and `L.heatLayer(points, options)` creation with the exact option block. Add the providers watcher so points build once data is present.
- [ ] **Filter reactivity (GREEN, part 2):** Add the deep watcher on `minCapacity` + `activeTypes` that recomputes points and calls `.setLatLngs(...)` on the heat layer. Fully test before next task.
- [ ] **`activeView` visibility + `zoomend` (GREEN, part 3):** Implement `applyVisibility()` and the `immediate` watcher on `mapStore.activeView` (toggle heat layer on/off, add/remove facilities groups respecting `activeTypes`). Register the `map.on('zoomend')` handler that writes `activeView` from `map.getZoom()` against threshold 8.
- [ ] **Wire into `MapView.vue`:** Import and instantiate `useMapStore`; capture `const groups = useMapMarkers(...)`; call `useHeatLayer(map, providerStore, filterStore, mapStore, groups)` after it. Confirm `npm run test` and type-check pass.

---

## Considerations
- **Boundary at exactly zoom 8:** `<= 8` is density, `> 8` is facilities — 8 itself is density. Don't write `< 8`.
- **`immediate: true` on the `activeView` watcher** is required so layer visibility is correct on first render (default `activeView` is `'facilities'`, so the heat layer must start removed and groups present). But note `useMapMarkers` already adds active groups when providers load — `applyVisibility` for the facilities case should be idempotent (re-adding an already-present layer in Leaflet is a no-op, which is fine).
- **Ordering vs. `useMapMarkers`:** `useHeatLayer` must run after `useMapMarkers` so `groups` exists and is populated; the spec requires this call order in `MapView.vue`.
- **Don't recreate the heat layer on filter change** — use `setLatLngs`. Recreating would require removing/re-adding and re-checking `activeView`, which is needless churn.
- **Test isolation:** follow the existing pattern — `setActivePinia(createPinia())`, `vi.clearAllMocks()`, and reset any hoisted mock state in `beforeEach`. Drive `activeView` by mutating the store/ref directly and `await nextTick()` before asserting.
- **`activeTypes`-off providers contribute no heat** — this is the same filtered list as markers, so a toggled-off type drops out of both the markers and the heatmap. Cover this in a test.
