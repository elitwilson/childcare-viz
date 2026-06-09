---
id: STR-005
title: API Service & Transform Layer
epic: EPIC-002
status: complete
priority: high
---

## Goal

Build the two pure-function modules that own all knowledge of the external API: `childcareApi.ts` fetches raw paginated records from the Michigan LARA endpoint, and `childcareTransform.ts` normalizes a raw record into a typed `Provider`. The store story (STR-006) will call these — nothing else should.

---

## Scope

### In
- `src/services/childcareApi.ts` — exports `fetchAllProviders(): Promise<RawProvider[]>`; fires 8 parallel requests using `resultOffset` pagination; merges results; throws on network error
- `src/services/childcareTransform.ts` — exports `transformProvider(raw: RawProvider): Provider | null`; normalizes `FacilityType` to `LicenseType`; returns `null` for unknown types (with `console.warn`)
- A `RawProvider` type (can live in `childcareApi.ts` or a shared internal types file) representing the raw API record shape
- Unit tests for `childcareTransform.ts` covering all three known types, the null/warn path for unknown types, and rating always being `null`
- Unit tests for `fetchAllProviders` with mocked `fetch` covering: successful 8-page merge, partial response (fewer than 1000 records on last page), and network error propagation

### Out
- No Pinia store coupling
- No Vue components
- No retry logic or caching
- No county code → name mapping (county stays as the raw numeric string)

---

## Acceptance Criteria

- [ ] `fetchAllProviders()` fires 8 fetch calls in parallel (not sequentially) and returns a merged flat array
- [ ] `fetchAllProviders()` throws (or rejects) if any page fetch fails
- [ ] `transformProvider()` correctly maps all three `FacilityType` strings to `LicenseType` enum values
- [ ] `transformProvider()` returns `null` and calls `console.warn` for an unknown `FacilityType`
- [ ] `transformProvider()` always sets `rating: null`
- [ ] All unit tests pass
- [ ] No `any` types in production code (test mocks may use minimal casting)

---

## Context & Decisions

- **API endpoint:**
  ```
  https://utility.arcgis.com/usrsvcs/servers/a79c3b0caedf412599085941e2af91d4/rest/services/CSS/CSS_LARA/MapServer/5/query
  ```
- **Query params per page:** `where=1%3D1&outFields=*&returnGeometry=false&resultRecordCount=1000&resultOffset={offset}&f=json`
- **Offsets:** 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000 (8 requests for ~7,700 records)
- **Response shape:** `{ features: Array<{ attributes: RawProvider }> }` — records are in `features[].attributes`, not top-level
- **Parallel fetch:** use `Promise.all([...offsets.map(o => fetch(url + offset))])` — do not use a sequential loop
- **`LicenseType` mapping (exact API strings):**
  - `"Center"` → `'center'`
  - `"Group Home (7-12)"` → `'group_home'`
  - `"Family Home (1-6)"` → `'family_home'`
- **`returnGeometry=false`** — coordinates come from explicit `Latitude`/`Longitude` fields, not GeoJSON geometry; this reduces response size
- The `RawProvider` type should reflect only the fields we actually use, not the full 20-field API schema

---

## Dependencies

- **Depends on:** STR-004 (needs `Provider` and `LicenseType` types)
- **Blocks:** STR-006 (store calls `fetchAllProviders` and `transformProvider`)

---

## Notes

The `fetchAllProviders` function should not do any transformation — it returns raw records. The transform function should not do any fetching. Keeping them separate makes both trivially unit-testable and lets the store story compose them without coupling.
