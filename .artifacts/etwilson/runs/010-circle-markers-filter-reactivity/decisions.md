# Decisions — 010-circle-markers-filter-reactivity

## Assumptions

- `LicenseType` const object keys are `Center`, `GroupHome`, `FamilyHome` mapping to values `center`, `group_home`, `family_home`. CSS var mapping: `center`→`--center`, `group_home`→`--group`, `family_home`→`--family`.
- `MapView.test.ts` currently uses no Pinia; when wiring MapView we wrap mount with createTestingPinia or stub the stores so existing tests keep passing without hitting the API.
- The composable returns the groups map for test inspection, as the spec suggests ("or returns the layer-group map for testing/inspection").
- Color resolution (`getComputedStyle`) is not tested in unit tests because jsdom does not evaluate CSS vars; colors are tested structurally (correct property keys) and the color-resolution helper is kept simple enough to trust visually.
