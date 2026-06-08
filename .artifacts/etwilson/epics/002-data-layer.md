---
id: EPIC-002
title: Data Layer & Provider Service
status: ready
created: 2026-06-08
---

## Goal
Establish the full data pipeline for Michigan childcare provider data: a typed service layer that fetches from the Michigan GIS ArcGIS REST API, a transform layer that normalizes raw API responses into a clean domain model, and a Pinia store that is the single source of truth for providers throughout the app. After this epic, every future feature story has a stable, typed interface to build against — `useProviderStore()` — with no knowledge of the underlying API shape.

---

## Scope In
- `src/types/provider.ts` — `Provider` interface and `LicenseType` enum (canonical domain model)
- `src/services/childcareApi.ts` — paginated fetch against the Michigan LARA MapServer proxy (7,700 records, `maxRecordCount: 1000`, uses `resultOffset` pagination); returns raw JSON; no store coupling
- `src/services/childcareTransform.ts` — pure transform functions mapping raw API records to `Provider` objects; normalizes `FacilityType` string to `LicenseType` enum; `rating` always `null` (not in this dataset)
- `src/stores/providers.ts` — `useProviderStore` (Pinia setup store): state (`providers: Provider[]`, `loading: boolean`, `error: string | null`, `initialized: boolean`), actions (`init()` with initialized guard, `fetchProviders()`)
- Error handling: network errors and unexpected API shapes surfaced in `store.error`
- Loading state tracked correctly across all paginated requests

## Scope In (continued)
- `src/components/DevDataView.vue` — a minimal dev-only component that renders the loaded providers as a plain list or table (name, licenseType, capacity, city, lat/lng); mounted in `App.vue` temporarily so the data pipeline can be manually verified end-to-end in the browser

## Scope Out
- No `ages` field — not in the API
- No quality rating from this source — `rating` will be `null` for all providers; a future story can enrich from another source if needed
- No Head Start as a license type — not present in this dataset (3 types only)
- No map rendering or marker placement (UI epic)
- No filter/search logic (sidebar controls epic)
- No `useProviders` composable — Pinia store is the public interface; composable layer adds indirection without clear benefit at this stage
- Census population API / per-capita desert metric
- MSU mapping project data integration
- Offline caching or service worker

---

## Key Decisions

- **Confirmed API endpoint (verified, no auth required):**
  ```
  https://utility.arcgis.com/usrsvcs/servers/a79c3b0caedf412599085941e2af91d4/rest/services/CSS/CSS_LARA/MapServer/5/query
  ```
  The internal state MapServer (`gisagocss.state.mi.us`) requires a token — do NOT use it.

- **Confirmed fields:** `OBJECTID`, `LicenseNumber`, `FacilityName`, `StreetAddress`, `City`, `ZIPCode`, `CountyCode`, `FacilityType`, `FacilityTypeCode`, `Capacity`, `MonthsofOperation`, `FullDay`, `Latitude`, `Longitude`.

- **Confirmed `Provider` model fields:**
  - `id: string` — from `LicenseNumber`
  - `name: string` — from `FacilityName`
  - `licenseType: LicenseType`
  - `capacity: number` — from `Capacity` (confirmed present, numeric)
  - `lat: number` — from `Latitude` (explicit field, no geometry parsing needed)
  - `lng: number` — from `Longitude`
  - `address: string` — from `StreetAddress`
  - `city: string` — from `City`
  - `county: string` — from `CountyCode` (numeric code; architect should decide whether to map to name or leave as code)
  - `zipCode: string` — from `ZIPCode`
  - `rating: number | null` — always `null` from this source; field kept for future enrichment

- **Confirmed `LicenseType` enum values (exact API strings):**
  - `"Center"` → `'center'`
  - `"Group Home (7-12)"` → `'group_home'`
  - `"Family Home (1-6)"` → `'family_home'`
  - Unknown strings → log a warning, skip the record (do not silently coerce)

- **Pagination required.** 7,700 total records; `maxRecordCount: 1000`. Fetch all pages in parallel using `resultOffset` (0, 1000, 2000, …, 7000) — 8 concurrent requests — then merge. Do not fetch sequentially.

- **CORS confirmed.** Works from browser without a proxy.

- **Service layer is pure functions, not a class.** No instantiation, no DI, no store coupling. Trivially testable.

- **Transform layer is pure functions.** `childcareTransform.ts` takes a raw API record, returns `Provider | null` (null on unknown type). No side effects.

- **Pinia store owns all async state.** `loading`, `error`, `initialized` live in the store. Components read from store, never orchestrate fetches directly.

- **`init()` guard prevents double-fetch.** `if (initialized) return` at start of `init()`. Called from `App.vue` on mount.
