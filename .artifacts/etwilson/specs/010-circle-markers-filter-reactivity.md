---
number: 010
story: STR-010
status: complete
base_branch: main
depends_on: [STR-008, STR-009]
scope_files:
  - src/composables/useMapMarkers.ts
  - src/composables/useMapMarkers.test.ts
  - src/components/MapView.vue
  - src/components/MapView.test.ts
  - src/style.css
---

# Feature: Circle markers with filter reactivity

## Summary
Render all ~7,700 providers as Leaflet circle markers on the map, styled per the design mockup — radius scaled by capacity, color by license type — and reactively show/hide them as `useFilterStore` state changes. Markers are organized into three per-type `L.layerGroup` instances so toggling a license type is an O(1) `addLayer`/`removeLayer` call, while changing the minimum-capacity threshold rebuilds the active groups from the filtered provider list. A canvas renderer keeps drawing fast at this marker count. This is the first epic deliverable where the app visibly resembles the mockup.

---

## Requirements
- All providers with valid coordinates render as circle markers on the map once provider data has loaded.
- Each marker's radius is computed as `4 + Math.sqrt(capacity) * 1.15`, so radius visibly scales with capacity.
- Each marker is colored by its `licenseType`, resolved at render time from the CSS custom properties `--center`, `--family`, `--group`.
- Markers use `fillOpacity: 0.55`, `opacity: 0.9`, `weight: 1.4`, and are drawn via a shared canvas renderer (`L.canvas()`).
- Markers are grouped into exactly three `L.layerGroup` instances keyed by `LicenseType`; a marker belongs to the group matching its type.
- When `filterStore.activeTypes[type]` becomes `false`, that type's layer group is removed from the map; when it becomes `true`, the group is added back — without touching other types' groups.
- When `filterStore.minCapacity` changes, each currently-active group is cleared and repopulated from the providers whose `capacity >= minCapacity` (and whose type is active), reflecting the new threshold.
- Markers below the current `minCapacity` are not shown; restoring `minCapacity` to `0` and all `activeTypes` to `true` brings every valid-coordinate marker back.
- Provider data loading is triggered if not already initialized, and markers appear once the data resolves even though it arrives asynchronously after mount.

---

## Scope

### In Scope
- Confirm/retain the CSS custom properties `--center`, `--family`, `--group` in `src/style.css` (already present) — the spec depends on these exact names.
- A `useMapMarkers(map, providerStore, filterStore)` composable in `src/composables/useMapMarkers.ts` that owns marker creation, the three layer groups, color resolution, and the two filter watchers.
- Integration of that composable into `MapView.vue`, called once the Leaflet map exists.
- Triggering `providerStore.init()` from `MapView` on mount (idempotent) and reacting to providers becoming available.
- Unit tests for the composable's pure logic (radius formula, type→group assignment, capacity/type filtering) and the watcher behavior (type toggle adds/removes a group; capacity change rebuilds active groups).

### Out of Scope
- Popup binding / click handlers on markers (STR-011).
- Sidebar UI — chips and slider that mutate `filterStore` (STR-012).
- Density/heatmap layer and `useMapStore` (EPIC-004).
- Head Start (`--head`) facility type — not in the current `LicenseType` union.
- Persistence of filter state (handled by STR-008/STR-009 scope; filter state is intentionally not persisted).

---

## Technical Approach
- **Entry points / interfaces:** `MapView.vue` continues to own the `L.Map` instance (no `useMapStore` this epic). After the map is created in `onMounted`, it calls `useMapMarkers(map, providerStore, filterStore)`. The composable signature: `useMapMarkers(map: L.Map, providerStore: ReturnType<typeof useProviderStore>, filterStore: ReturnType<typeof useFilterStore>)`. It sets up its own watchers and returns nothing required by the caller (or returns the layer-group map for testing/inspection).
- **Key modules / components:**
  - `src/composables/useMapMarkers.ts` — new. Responsibilities: create a shared `L.canvas()` renderer; resolve the three colors once via `getComputedStyle(document.documentElement).getPropertyValue(...)`; create three `L.layerGroup()` instances keyed by `LicenseType`; build markers from the provider list; install watchers on `filterStore.activeTypes` and `filterStore.minCapacity`; and watch `providerStore.providers` (or `initialized`) so the initial build runs when data arrives.
  - `src/components/MapView.vue` — modified. Acquires `useProviderStore()` and `useFilterStore()`, calls `providerStore.init()` on mount, and invokes the composable with the live map.
  - `src/stores/filters.ts` — consumed (created by STR-009): `activeTypes: ref<Record<LicenseType, boolean>>`, `minCapacity: ref<number>`.
  - `src/stores/providers.ts` — consumed: `providers: ref<Provider[]>`, `initialized`, `init()`.
- **Data model:**
  - `Provider` (existing) — `licenseType: LicenseType`, `capacity: number`, `lat: number`, `lng: number`.
  - `groups: Record<LicenseType, L.LayerGroup>` — one group per type.
  - `colors: Record<LicenseType, string>` — resolved CSS color strings (`LicenseType.FamilyHome` → `--family`, `GroupHome` → `--group`, `Center` → `--center`).
- **Key design decisions:**
  - **Canvas renderer:** a single `L.canvas()` passed as the `renderer` option to every `L.circleMarker` — one deviation from the SVG default, materially faster at 7,700 markers (epic decision).
  - **Per-type layer groups for type toggling:** toggling a type is `map.addLayer(group)` / `map.removeLayer(group)` — O(1), not per-marker iteration (epic decision).
  - **Capacity filter rebuilds groups:** on `minCapacity` change, each active group is `clearLayers()`-ed and repopulated from the filtered provider subset. Acceptable for a POC at this scale; avoids tracking per-marker visibility (story decision).
  - **Color resolution via CSS vars at render time:** `getComputedStyle(document.documentElement).getPropertyValue('--center').trim()` etc., resolved once when the composable builds markers — future-proofs theming (epic decision). oklch in Canvas 2D is supported in target browsers (Chrome 111+, Firefox 113+, Safari 15.4+).
  - **Composable extraction:** marker/filter logic lives in `useMapMarkers` rather than inline in `MapView.vue`, keeping the component thin and the logic unit-testable (story note).
  - **Coordinate validity:** the provider transform already drops records without valid coordinates, so the composable can treat every `provider` in the store as renderable; no extra coordinate guard is required, but markers are still built only from `providerStore.providers`.

---

## Success Criteria
- [ ] On load (after provider data resolves), circle markers appear on the map for all providers in the store.
- [ ] Marker radius equals `4 + Math.sqrt(capacity) * 1.15` for a given capacity (verified in a unit test).
- [ ] Each marker's color matches its license type using the `--center` / `--family` / `--group` CSS variables.
- [ ] Setting `filterStore.activeTypes.center = false` removes the center group from the map and leaves the other two groups present (`map.removeLayer` called with the center group only).
- [ ] Setting `filterStore.minCapacity = 50` results in active groups containing only markers for providers with `capacity >= 50`.
- [ ] Restoring `activeTypes` to all-`true` and `minCapacity` to `0` results in every provider marker being present again.
- [ ] Toggling a type performs a layer-group add/remove (not a per-marker loop) — asserted by mocking `map.addLayer`/`map.removeLayer` and verifying group-level calls.
- [ ] `npm run test` passes; `vue-tsc` type-check is clean.

---

## Tasks
Ordered by dependency.

- [ ] **Scaffold composable + tests (RED):** Create `src/composables/useMapMarkers.ts` (empty/typed signature) and `src/composables/useMapMarkers.test.ts`. Scaffold `it` cases with placeholder assertions for: radius formula, type→group assignment, capacity filtering, type-toggle watcher (add/remove group), capacity-change watcher (rebuild active groups), and initial build firing when providers populate. Mock `leaflet` (`L.canvas`, `L.circleMarker`, `L.layerGroup` with `addLayer`/`clearLayers`, and a mock `map` with `addLayer`/`removeLayer`) following the existing `MapView.test.ts` mock style. Use `setActivePinia(createPinia())` in `beforeEach`.
- [ ] **Write real failing tests:** Fill assertions. Drive `filterStore`/`providerStore` state directly (set `providerStore.providers`, flip `activeTypes` keys, set `minCapacity`) and `await nextTick()` before asserting watcher effects. Verify they fail because the composable is unimplemented. Must be fully passing before MapView wiring begins.
- [ ] **Implement `useMapMarkers`:** Create the canvas renderer, resolve colors from CSS vars, build the three layer groups, populate from `providerStore.providers` filtered by `minCapacity`, add active groups to the map, and install the two watchers plus the providers-loaded watcher. Make all composable tests pass.
- [ ] **Wire into `MapView.vue`:** Acquire `useProviderStore()` and `useFilterStore()`, call `providerStore.init()` in `onMounted`, and invoke `useMapMarkers(map, providerStore, filterStore)` after the map is created. Update `MapView.test.ts` so existing Leaflet-init tests still pass with the store providers (wrap mounts with Pinia; mock the stores or use a real pinia with empty providers). Keep the structural tests green.

---

## Considerations
- **Async data timing:** `providerStore.init()` resolves after mount, so the composable cannot build markers synchronously at call time. Watch `providerStore.providers` (or `initialized`) with `{ immediate: true }` so the build runs both when data is already present and when it arrives later. `init()` is idempotent via the store's `initialized` guard, so calling it from both `App.vue` and `MapView` is safe.
- **Test mocking of Leaflet:** `MapView.test.ts` already mocks `leaflet`'s `default` export with `map` and `tileLayer`. Extend that mock to include `canvas`, `circleMarker`, and `layerGroup` (the latter returning an object with `addLayer`, `clearLayers`, and an identity so `map.addLayer`/`removeLayer` calls can be asserted against specific groups). Prefer testing the composable in isolation with its own focused mock rather than overloading the component test.
- **Reactivity of `activeTypes`:** it is a `ref<Record<...>>`; a `watch` over it must use `{ deep: true }` (or watch a derived getter) to observe key assignment — mirror spec 009's guidance. The capacity watcher is a plain `watch(() => filterStore.minCapacity, ...)`.
- **Color string format:** `getComputedStyle(...).getPropertyValue('--center')` returns the raw declared value (e.g. `oklch(0.70 0.13 250)`) with possible leading whitespace — `.trim()` it before passing to Leaflet's `color`/`fillColor`.
- **Group membership for an inactive type at capacity-change time:** when rebuilding on `minCapacity` change, only rebuild groups whose type is currently active (or rebuild all groups but only re-add active ones) — keep the two watchers' responsibilities composable so toggling a type back on shows the correctly capacity-filtered set. A simple, correct approach: maintain a single "rebuild visible markers" routine that both watchers call, deriving membership from current `activeTypes` + `minCapacity`.
- **Existing CSS vars:** `--center`, `--family`, `--group` already exist in `src/style.css` (and have light-theme-safe oklch values). No CSS addition is strictly required, but the spec lists `src/style.css` in scope in case the implementer needs to confirm/adjust them; do not remove or rename them.
