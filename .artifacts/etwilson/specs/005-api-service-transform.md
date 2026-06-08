---
number: 005
story: STR-005
status: complete
base_branch: main
depends_on: [STR-004]
scope_files:
  - src/services/childcareApi.ts
  - src/services/childcareApi.test.ts
  - src/services/childcareTransform.ts
  - src/services/childcareTransform.test.ts
---

# Feature: API Service & Transform Layer

## Summary
This feature builds the two pure-function modules that own *all* knowledge of the external Michigan LARA ArcGIS API. `childcareApi.ts` fetches raw paginated provider records — firing 8 parallel `fetch` requests and merging them into a flat array of raw records. `childcareTransform.ts` normalizes a single raw API record into the typed `Provider` domain model defined in STR-004, mapping the API's `FacilityType` string to the `LicenseType` enum and dropping records of unknown type. Neither module knows about Pinia or Vue. The store story (STR-006) composes them; nothing else calls them. Separating fetch from transform keeps both trivially unit-testable.

---

## Requirements
- `fetchAllProviders()` returns a `Promise<RawProvider[]>` — a flat, merged array of all raw records across all 8 pages.
- The 8 page requests fire in parallel (via `Promise.all`), not sequentially.
- Each page request uses `resultOffset` pagination with offsets 0, 1000, …, 7000 and `resultRecordCount=1000`.
- If any page fetch fails (network error, or a non-OK HTTP response), `fetchAllProviders()` rejects — it does not silently drop a page or return partial data.
- A short last page (fewer than 1000 records) merges correctly without padding or error.
- `transformProvider(raw)` returns a typed `Provider` for the three known `FacilityType` strings.
- `transformProvider(raw)` returns `null` and calls `console.warn` (including the unknown type in the message) for any unrecognized `FacilityType`.
- `transformProvider(raw)` always sets `rating: null`.
- No `any` in production code.

---

## Scope

### In Scope
- `src/services/childcareApi.ts` — `fetchAllProviders(): Promise<RawProvider[]>` and the `RawProvider` type.
- `src/services/childcareTransform.ts` — `transformProvider(raw: RawProvider): Provider | null`.
- `src/services/childcareApi.test.ts` — mocked-`fetch` tests: successful 8-page merge, short last page, network/error propagation, and assertion that calls are parallel.
- `src/services/childcareTransform.test.ts` — all three known type mappings, the unknown-type null/warn path, and `rating === null`.

### Out of Scope
- Pinia store coupling (STR-006).
- Vue components.
- Retry logic, caching, or offline support.
- County code → name mapping (county stays as the raw numeric string).
- Any transformation inside `fetchAllProviders`, or any fetching inside `transformProvider`.

---

## Technical Approach
- **Entry points / interfaces:**
  - `fetchAllProviders(): Promise<RawProvider[]>` — the only export of `childcareApi.ts` (plus the `RawProvider` type).
  - `transformProvider(raw: RawProvider): Provider | null` — the only export of `childcareTransform.ts`.
- **Key modules / components:**
  - `childcareApi.ts` owns the endpoint URL, query-param construction, the offset list `[0, 1000, …, 7000]`, parallel fetch via `Promise.all(offsets.map(...))`, OK-status checking, and merging `features[].attributes` from each page response into one `RawProvider[]`.
  - `childcareTransform.ts` owns the `FacilityType` → `LicenseType` mapping and field renaming from raw API names to the `Provider` shape. Imports `Provider` and `LicenseType` from `../types/provider`.
- **Data model:**
  - `RawProvider` reflects only the fields actually consumed (not the full 20-field API schema):
    `LicenseNumber: string`, `FacilityName: string`, `FacilityType: string`, `Capacity: number`, `Latitude: number`, `Longitude: number`, `StreetAddress: string`, `City: string`, `CountyCode: string`, `ZIPCode: string`. (`FacilityType` is typed `string`, not a union, so unknown values flow through to the null/warn guard.)
  - Page response shape (used only inside `childcareApi.ts`): `{ features: Array<{ attributes: RawProvider }> }`.
  - `Provider` / `LicenseType` come from STR-004 (`src/types/provider.ts`).
- **Key design decisions:**
  - `FacilityType` mapping is an explicit lookup: `"Center"` → `center`, `"Group Home (7-12)"` → `group_home`, `"Family Home (1-6)"` → `family_home`. Unknown → `null` + `console.warn`. This is a switch or a `Record<string, LicenseType>` lookup with an undefined-check; either is acceptable.
  - **`LicenseType` is NOT a TS enum.** The tsconfig sets `erasableSyntaxOnly: true`, which bans `enum`/`const enum`. STR-004 defines `LicenseType` as a `const` object with a derived union type (`as const` pattern), so reference values as the union's string literals (`'center'`, `'group_home'`, `'family_home'`) or via the const object's members — never `LicenseType.Center` enum-member syntax. The mapping values are these string literals.
  - `returnGeometry=false`: coordinates come from explicit `Latitude`/`Longitude` raw fields, not GeoJSON geometry.
  - Per-page `fetch` checks `response.ok` and throws on a non-OK status so a 500 on one page rejects the whole call (matches "throws if any page fetch fails").
  - Use the existing Vitest setup (config lives in `vite.config.ts`; `jsdom` env). Mock the global `fetch` with `vi.stubGlobal('fetch', vi.fn())` (or `vi.spyOn`), mirroring the module-boundary mocking style already used in the suite (e.g. `vi.mock('leaflet')` in `MapView.test.ts`). Reset between tests in `beforeEach`.

---

## Success Criteria
- [ ] `fetchAllProviders()` issues exactly 8 `fetch` calls, all initiated before any resolves (parallel), and returns the merged flat array.
- [ ] Each `fetch` URL contains the correct `resultOffset` for its page and `resultRecordCount=1000`, `returnGeometry=false`, `f=json`.
- [ ] A rejected/failed page fetch causes `fetchAllProviders()` to reject.
- [ ] A short final page merges without error and the total count reflects the real records.
- [ ] `transformProvider()` maps all three known types to the correct `LicenseType` and copies every `Provider` field from the right raw field.
- [ ] `transformProvider()` returns `null` and warns for an unknown type.
- [ ] `transformProvider()` output always has `rating === null`.
- [ ] All unit tests pass; `vue-tsc --noEmit` (via `pnpm build`) is clean with no `any` in production code.

---

## Tasks
Ordered by dependency.

- [ ] **Define `RawProvider` and `transformProvider` (RED → GREEN):** In `childcareTransform.ts`, declare `RawProvider` (the used-fields subset) and implement `transformProvider`. Write `childcareTransform.test.ts` first covering the three known mappings, the unknown-type null/warn path, and `rating === null`. Decide where `RawProvider` lives — colocate it in `childcareApi.ts` and import into the transform, OR keep it in the transform module; pick one and keep it the single definition. Must be fully tested before the API task consumes the type.
- [ ] **Implement `fetchAllProviders` (RED → GREEN):** In `childcareApi.ts`, build the endpoint URL + query params, the offsets array, parallel `Promise.all` fetch, `response.ok` checks, and merge of `features[].attributes`. Reuse the `RawProvider` type from the previous task.
- [ ] **Write `childcareApi.test.ts`:** Mock global `fetch`. Cover: successful 8-page merge (assert 8 calls + merged length), short last page, and error propagation (one page rejects → call rejects). Assert parallelism (e.g. 8 calls issued, or `Promise.all` behavior — calls made before resolution).
- [ ] **Verify build + types:** Run the test suite and `pnpm build` (runs `vue-tsc -b`) to confirm no `any` and clean types.

---

## Considerations
- **Parallelism is testable but slightly indirect.** With a mocked `fetch`, assert that all 8 calls are registered synchronously before any awaited resolution (e.g. invoke `fetchAllProviders()` without awaiting, then check `fetch.mock.calls.length === 8`), rather than trying to measure wall-clock timing.
- **Error semantics:** the story says "throws (or rejects) if any page fetch fails." `Promise.all` already rejects on the first rejection, so a fetch that rejects propagates for free; the only added work is throwing on a non-OK HTTP status (`!response.ok`) since `fetch` resolves on 4xx/5xx.
- **`FacilityType` exact strings matter** — `"Group Home (7-12)"` and `"Family Home (1-6)"` include the parenthetical ranges; the mapping keys must match byte-for-byte.
- **`RawProvider` deliberately omits most of the API's ~20 fields.** Only model the 10 fields the `Provider` transform consumes.
- **No `console.warn` noise in passing tests:** the unknown-type test should assert the warn (e.g. spy on `console.warn`); known-type tests should not trigger it.
- **Test mocks may use minimal casting** (e.g. casting a partial object to `RawProvider`) — this is allowed by the no-`any` rule for tests only, not production code.
