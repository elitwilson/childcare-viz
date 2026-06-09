# Review Notes — 010-circle-markers-filter-reactivity

## Scaffold composable + tests (RED)

## Verdict: APPROVED

**Task:** Scaffold composable + tests (RED)
**Spec:** .artifacts/etwilson/specs/010-circle-markers-filter-reactivity.md

**Scope issues:** none

**Coverage gaps:** none

All 13 scaffolded test cases map to spec requirements:
- Radius formula (1 test)
- Type-to-group assignment: center, family_home, group_home (3 tests)
- Initial build when providers already present (1 test)
- Async providers-loaded watcher (1 test)
- Capacity filtering: exclusion below threshold + restore to 0 (2 tests)
- Type-toggle watcher: remove group, add group back, no side effect on other types (3 tests)
- Capacity-change watcher: rebuilds active groups, skips inactive groups (2 tests)

Leaflet mock covers canvas, circleMarker, layerGroup (with addLayer/clearLayers). getComputedStyle stubbed for CSS var resolution. setActivePinia(createPinia()) in beforeEach. All tests fail with placeholder assertions as expected for RED phase.

## Write real failing tests

## Verdict: APPROVED

**Task:** Write real failing tests
**Spec:** .artifacts/etwilson/specs/010-circle-markers-filter-reactivity.md

**Scope issues:** none

**Coverage gaps:** none

All 13 tests converted to real assertions. All 13 fail with AssertionError (not test-logic errors), confirming correct RED state. Coverage verified against all spec requirements:
- Radius formula asserted via mockCircleMarker call options
- Type-group assignment verified by filtering createdGroups for addLayer calls
- Sync and async provider watcher paths both covered
- Capacity filtering: exclusion below threshold and restore to 0 both asserted
- Type toggle: removeLayer/addLayer called with a group object (has clearLayers), not a marker; isolation (no side effect on other types) confirmed
- Capacity-change watcher: active group cleared and repopulated; inactive group not cleared

Per-group independent vi.fn() spies in createdGroups array enable precise group-level assertions without over-coupling to implementation ordering.

## Wire into MapView.vue (test update phase)

## Verdict: APPROVED

**Task:** Wire into MapView.vue (test update phase)
**Spec:** .artifacts/etwilson/specs/010-circle-markers-filter-reactivity.md

**Scope issues:** none

**Coverage gaps:** none

All 12 original MapView tests preserved and passing. Two new wiring tests added and failing correctly:
- `calls providerStore.init() on mount` — observable behavior, not implementation detail
- `calls useMapMarkers with the map, providerStore, and filterStore on mount` — asserts correct args passed, using property-presence checks for store args

Mocks correctly placed at module boundary. Leaflet mock extended with canvas/circleMarker/layerGroup. Store mocks are minimal stubs returning only what MapView needs.
