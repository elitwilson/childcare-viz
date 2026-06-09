---
number: 017
story: STR-017
status: complete
base_branch: main
depends_on: []
scope_files:
  - src/components/AppSidebar.vue
  - src/components/AppSidebar.test.ts
---

# Feature: Stats panel + Reset button

## Summary
Adds the final two interactive sections to `AppSidebar`: a "Showing" section that displays the live facility count and total licensed seats for the current filter state, and a "Reset all filters" button that returns all filters to their defaults. Both are computed from the currently-filtered provider list using the same predicate the map markers use, so the numbers always match what is drawn on the map. This completes the sidebar's interactive surface against the CC Design mockup.

---

## Requirements
- The sidebar shows a "Showing" section that displays the count of facilities currently passing the active filters, with the label "facilities on map".
- The "Showing" section displays the total licensed seats (sum of `capacity`) across those same filtered facilities.
- Both the count and the seats total update reactively when `filterStore.activeTypes` or `filterStore.minCapacity` change, and when `providerStore.providers` changes.
- The sidebar shows a "Reset all filters" button below the "Showing" section.
- Clicking "Reset all filters" sets every entry in `filterStore.activeTypes` to `true` and sets `filterStore.minCapacity` to `0`.
- After a reset, the displayed stats reflect the reset filter state immediately (no stale values).
- Count and seats are displayed comma-formatted via `toLocaleString()`.
- Before provider data loads (empty provider list), the count and seats both display `0`.

---

## Scope

### In Scope
- New "Showing" section in `AppSidebar.vue` (count + total seats), placed above the reset button.
- "Reset all filters" button in `AppSidebar.vue`, at the very bottom of the `<aside>`.
- A shared `filteredProviders` computed in `AppSidebar.vue` driving both stats, using the same predicate as `useMapMarkers`: `filterStore.activeTypes[p.licenseType] && p.capacity >= filterStore.minCapacity`.
- Tests in `AppSidebar.test.ts` for stats reactivity, formatting, empty-state, and reset behavior.
- Reset button styling using the existing CSS variable palette.

### Out of Scope
- Avg quality rating stat (all providers have `rating: null` from the real API — no placeholder, no "—").
- Any change to `useFilterStore` (reset mutates existing store state directly).
- Any change to `useMapStore.activeView` (reset does not touch the map view toggle).
- Any change outside `AppSidebar.vue` / `AppSidebar.test.ts`.
- Factoring the filter predicate into a shared composable (the story scopes the duplication to the sidebar only).

---

## Technical Approach
- **Entry points / interfaces:** All changes live in `AppSidebar.vue`. It already imports `useFilterStore` and `useProviderStore`. No new store, composable, or props.
- **Key modules / components:**
  - A `filteredProviders` computed returns `providerStore.providers.filter(p => filterStore.activeTypes[p.licenseType] && p.capacity >= filterStore.minCapacity)`. This mirrors the predicate in `src/composables/useMapMarkers.ts` (`buildGroup` skips `p.capacity < minCap` and `rebuildVisible` only renders active types).
  - `facilityCount` computed: `filteredProviders.value.length`.
  - `totalSeats` computed: `filteredProviders.value.reduce((sum, p) => sum + p.capacity, 0)`.
  - A `resetFilters()` function: set `filterStore.minCapacity = 0`, and set each key of `filterStore.activeTypes` to `true` (iterate the keys; matches the `Record<LicenseType, boolean>` shape).
- **Data model:** Consumes `Provider` (`capacity: number`, `licenseType: LicenseType`) and the `filterStore` state (`activeTypes: Record<LicenseType, boolean>`, `minCapacity: number`). No new types.
- **Key design decisions:**
  - Stats are computed in the component, not the store — per the story, no new store/composable; the existing `typeCounts` computed establishes the in-component pattern of filtering `providerStore.providers`.
  - The filter predicate matches `useMapMarkers` exactly so the count never diverges from the markers on the map.
  - `toLocaleString()` for display formatting; values are integers.

---

## Success Criteria
- [ ] "Showing" section renders with a facility count and a total-seats value, both reactive to filter changes.
- [ ] With a known provider set, count and seats reflect only providers passing the active-type + min-capacity predicate.
- [ ] Toggling a type off and raising min capacity both reduce the count/seats reactively.
- [ ] Clicking "Reset all filters" restores all `activeTypes` to `true` and `minCapacity` to `0`, and the stats update to reflect the full set.
- [ ] Empty provider list shows `0` count and `0` seats.
- [ ] Counts ≥ 1000 render comma-formatted (e.g. `1,250`).
- [ ] All existing `AppSidebar.test.ts` cases still pass.

---

## Tasks
Ordered by dependency.

- [ ] **Scaffold tests (RED):** In `AppSidebar.test.ts`, add a `describe('Showing section')` and `describe('Reset all filters')` block with scaffolded cases: count + seats reflect filtered providers, both update when a type is toggled off, both update when minCapacity rises, empty list shows 0/0, comma formatting for large totals, reset restores `activeTypes` (all true) and `minCapacity` (0), and stats update after reset. Use `data-test` selectors (e.g. `stat-facility-count`, `stat-total-seats`, `btn-reset`).
- [ ] **Add Showing section + stats computeds (GREEN):** Add `filteredProviders`, `facilityCount`, `totalSeats` computeds and the "Showing" `.section` markup (above the reset button) with `data-test="section-showing"`, the count labeled "facilities on map", and the seats total — both rendered with `toLocaleString()`. Make the stats tests pass.
- [ ] **Add Reset button (GREEN):** Add the `resetFilters()` function and the "Reset all filters" button as the last element in `<aside>` with `data-test="btn-reset"`. Wire `@click="resetFilters"`. Make the reset tests pass.
- [ ] **Style the new sections:** Add scoped CSS for the stat rows and `.reset` button using existing CSS variables (`--panel`, `--line`, `--ink`, `--ink-dim`, `--accent`). Confirm the full suite is green.

---

## Considerations
- `activeTypes` is a `Record<LicenseType, boolean>`; iterate its keys for reset rather than re-deriving from `LicenseType` values — both work, but key iteration keeps reset aligned with whatever the store holds. The existing `toggleType` helper already casts to `Record<string, boolean>` to mutate; follow that established pattern to satisfy the index signature without `any`.
- The predicate must stay in sync with `useMapMarkers`. If a future story factors this into a shared composable, this in-component copy is the thing to replace — note it but do not pre-build the abstraction here.
- The `.section:last-child` rule removes the bottom border on the final section; placing the reset button as the last child (outside or as the final `.section`) may change which element loses its border. Verify the visual separation between "Showing" and the reset control still reads correctly.
- Tests set `providerStore.providers = [...]` directly (see existing chip-count tests) — follow that pattern; no API mocking needed.
- `setValue`/store mutation followed by `await flushPromises()` is the established way to assert reactive DOM updates in this test file.
