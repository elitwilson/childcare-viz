---
number: 019
story: STR-019
status: complete
base_branch: main
depends_on: []
scope_files:
  - src/components/MapView.vue
  - src/components/MapView.test.ts
---

# Feature: Empty State Overlay

## Summary
When a user's active filter combination (license-type toggles + minimum capacity) excludes every loaded provider, the map area shows a centered "No facilities match these filters." overlay. This signals that the empty map is the intended result of the filters rather than a loading failure or a broken map. The overlay reacts live as filters change and only appears after provider data has loaded.

---

## Requirements
- The overlay displays the text "No facilities match these filters." in the center of the map area.
- The overlay is visible only when providers have loaded (`providerStore.providers.length > 0`) **and** zero of those providers pass the active filters.
- The overlay is hidden when at least one provider passes the active filters.
- The overlay is hidden during initial load / before any provider data exists (an empty `providers` array is not treated as "no matches").
- Visibility recomputes reactively whenever `filterStore.minCapacity`, `filterStore.activeTypes`, or `providerStore.providers` change.
- The overlay is layered above the map tiles and centered within the map area.

---

## Scope

### In Scope
- `MapView.vue`: a computed `isMapEmpty` and an absolute-positioned overlay element inside `.map-wrap` gated on it.
- `MapView.test.ts`: tests asserting overlay visibility toggling across the no-match, has-match, and not-yet-loaded states.

### Out of Scope
- Any change to filter logic, the filter store, or the provider store.
- Any change to the sidebar, legend, markers, or heat layer.
- Localization, animation, or dismissal controls for the overlay.

---

## Technical Approach
- **Entry point:** `MapView.vue` already imports and holds `providerStore` and `filterStore` (`src/components/MapView.vue:15-16`). No new store wiring is needed.
- **Filter predicate:** mirror the established predicate used by `useMapMarkers.buildGroup` — a provider passes when `p.capacity >= filterStore.minCapacity && filterStore.activeTypes[p.licenseType]`. (Note: `useMapMarkers` uses `capacity < minCap` to *exclude*, so the inclusive predicate is `capacity >= minCapacity`.)
- **Computed:** add
  ```ts
  const isMapEmpty = computed(() =>
    providerStore.providers.length > 0 &&
    !providerStore.providers.some(
      p => p.capacity >= filterStore.minCapacity && filterStore.activeTypes[p.licenseType],
    ),
  );
  ```
  Add `computed` to the existing `vue` import. Reactivity is automatic because the predicate reads reactive store refs.
- **Template:** add a sibling of `#map` inside `.map-wrap`, rendered with `v-if="isMapEmpty"`, carrying `data-test="empty-note"`. Keep it after `#map` and `<AppLegend>` so it sits above tiles in stacking order; `z-index` makes the layering explicit regardless.
- **Data model:** no new types. Reads `Provider.capacity`, `Provider.licenseType`, `filterStore.minCapacity`, `filterStore.activeTypes` (a `Record<LicenseType, boolean>`).
- **Key design decisions:**
  - Visibility is a pure derived value (`computed`) over store state — no watchers, no local mirror state, consistent with the functional/reactive style of the codebase.
  - The `providers.length > 0` guard distinguishes "loaded but no matches" from "not yet loaded," per the story's explicit decision.

---

## Success Criteria
- [ ] `[data-test="empty-note"]` is present and contains "No facilities match these filters." when providers are loaded but none pass the filters.
- [ ] `[data-test="empty-note"]` is absent when at least one provider passes the filters.
- [ ] `[data-test="empty-note"]` is absent when `providerStore.providers` is empty (initial load).
- [ ] Overlay visibility updates without remount when `minCapacity` or `activeTypes` change such that the match count crosses zero.
- [ ] Overlay is centered in `.map-wrap` and rendered above the map tiles.
- [ ] `npm run test` and `vue-tsc` pass.

---

## Tasks
Ordered by dependency.

- [ ] **Scaffold overlay tests:** In `MapView.test.ts`, add a `describe('empty state overlay')` block with scaffolded cases: visible when loaded + no matches, hidden when a provider matches, hidden when `providers` is empty, and reactive toggle when filters change. The existing module-level mocks for `useProviderStore` / `useFilterStore` return fixed objects; these tests will need per-test control over `providers`, `minCapacity`, and `activeTypes` (e.g. by overriding the mock return values per test via `vi.mocked(...).mockReturnValue(...)` in the new block, following the existing `vi.hoisted` + `vi.mock` pattern). Use `makeProvider` (already defined in the file) to build fixtures.
- [ ] **Write real tests (RED):** Convert scaffolds to real failing assertions against `[data-test="empty-note"]` existence and text. Drive the not-loaded case with `providers: []`, the no-match case with a provider whose `capacity` is below `minCapacity` or whose `licenseType` is toggled off, and the has-match case with a passing provider. Verify failures are due to the missing overlay, not test setup.
- [ ] **Implement overlay (GREEN):** In `MapView.vue`, import `computed`, add the `isMapEmpty` computed, and add the `v-if="isMapEmpty"` overlay element with `data-test="empty-note"` inside `.map-wrap`. Add scoped styles per the spec below. Run the full suite; all MapView tests (existing + new) must pass.

---

## Considerations
- **Test mock shape:** the existing `MapView.test.ts` mocks `useProviderStore`/`useFilterStore` at module scope returning a single fixed object. To vary state per test, override the mocked return value inside the new describe block (and restore in `beforeEach` via `vi.clearAllMocks` / re-setting defaults). Do not change the existing tests' assumptions — they assume `providers: []`, which already correctly yields **no** overlay (not-loaded state), so they should continue to pass unchanged.
- **Predicate direction:** `useMapMarkers` excludes with `p.capacity < minCap`; the inclusive form for "does any provider match" is `p.capacity >= filterStore.minCapacity`. Keep these consistent to avoid an off-by-one at the boundary (a provider with `capacity === minCapacity` is a match and must hide the overlay).
- **`activeTypes` indexing:** `filterStore.activeTypes` is keyed by `LicenseType`; index it directly with `p.licenseType` (already a `LicenseType`). No string coercion needed and no `any`.
- **Stacking context:** `.map-wrap` is the positioning ancestor for `AppLegend` (`position: absolute` children). Leaflet panes and zoom controls sit at high z-indexes; `z-index: 500` per the story keeps the overlay above tiles while below Leaflet's control layer (1000) — acceptable since the overlay is centered, not over the controls.

## Style (apply in `MapView.vue` scoped styles)
- Positioning: `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 500;`
- Appearance: `background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 10px 16px; font-size: 13px; color: var(--ink-dim);`
- Note: `MapView.vue` currently has no `<style>` block; add a scoped one (SFC order `<script>` → `<template>` → `<style>`).
