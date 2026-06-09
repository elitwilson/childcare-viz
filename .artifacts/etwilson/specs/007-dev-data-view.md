---
number: 007
story: STR-007
status: complete
base_branch: main
depends_on: [STR-006]
scope_files:
  - src/App.vue
  - src/components/DevDataView.vue
---

# Feature: DevDataView & App Wiring

## Summary
Wire the Pinia provider store into the application root and render a throwaway dev table so the entire EPIC-002 data pipeline can be verified end-to-end in a browser. `App.vue` triggers `providerStore.init()` on mount, shows a loading indicator while the API requests are in flight, shows an error message on failure, and otherwise renders `DevDataView` — a minimal, unstyled table listing every loaded provider with a total count. This is the human-verification capstone of the data epic; the component is intentionally disposable and will be removed in a later UI epic.

---

## Requirements
- On app mount, the provider store's `init()` action is invoked exactly once.
- While the store is loading, a plain "Loading…" text indicator is visible on screen.
- If the store has an error, a plain "Error: {message}" text is shown instead of a blank screen.
- When data is available, a table is rendered with one row per provider.
- Each table row displays, in order: name, licenseType, capacity, city, county, lat, lng.
- A heading shows the total number of loaded providers (e.g. "7,247 providers loaded").
- The existing `AppHeader`, `AppSidebar`, and `MapView` components remain mounted; `DevDataView` is added without removing them.
- No console errors occur during a normal load.

---

## Scope

### In Scope
- `App.vue` — import and use `useProviderStore`; call `init()` in `onMounted`; conditionally render loading text, error text, or `DevDataView` based on store state.
- `src/components/DevDataView.vue` — new component reading `useProviderStore()` directly (no props), rendering the provider count heading and the table.

### Out of Scope
- Any styling to match the design mockup (UI epic).
- Filtering, sorting, or pagination of the displayed providers.
- Integrating provider data with the Leaflet `MapView` (markers/heatmap).
- Component/unit tests for `DevDataView` — it is throwaway UI, manually verified.
- Modifying the store, service, transform, or domain-model code (delivered by STR-004/005/006).

---

## Technical Approach
- **Entry points / interfaces:**
  - `App.vue` is the application root mounted in `src/main.ts` (Pinia is already registered there).
  - The store is consumed via `useProviderStore()` from `src/stores/providers.ts` (STR-006). Its reactive surface: `providers: Provider[]`, `loading: boolean`, `error: string | null`, `initialized: boolean`, and the `init()` action.
  - The `Provider` type comes from `src/types/provider.ts` (STR-004): `name`, `licenseType` (`LicenseType` — a string union derived from a `const` object via `as const`, not a TS enum, since tsconfig has `erasableSyntaxOnly: true`), `capacity`, `city`, `county`, `lat`, `lng`, etc.

- **Key modules / components:**
  - `App.vue` owns lifecycle (`onMounted → store.init()`) and top-level conditional rendering of loading / error / `DevDataView`. Use `storeToRefs` (or read `store.x` directly in template) so `loading`/`error`/`providers` stay reactive.
  - `DevDataView.vue` owns presentation of the loaded list. It reads the store directly; it does not call `init()` and takes no props.

- **Data model:** Consumes `Provider[]` from the store. No new types. The count heading derives from `providers.length`.

- **Key design decisions:**
  - `App.vue` is the single place that calls `init()`; `DevDataView` is a pure consumer. This keeps lifecycle responsibility at the root and the dev view stateless.
  - `DevDataView` renders below the existing `<main>` layout (or in place of the map area — coder's discretion per the story) without removing `AppHeader`/`AppSidebar`/`MapView`.
  - Loading and error states are rendered by `App.vue`, not `DevDataView`, so the dev view only ever deals with the populated-data case.
  - Render the full ~7,700-row table plainly (`v-for` over `providers`); no virtualization — acceptable for a disposable dev view, and explicitly in scope per the acceptance criteria.

---

## Success Criteria
- [ ] `npm run dev` loads in the browser and provider data appears with no full-page error.
- [ ] A "Loading…" indicator is visible while the API requests are in flight.
- [ ] The table renders one row per loaded provider (~7,700 rows).
- [ ] Each row shows name, licenseType, capacity, city, county, lat, lng.
- [ ] A total provider count is displayed in a heading.
- [ ] Simulating an API failure shows "Error: {message}" instead of a blank screen.
- [ ] No console errors on a normal load.
- [ ] `vue-tsc --noEmit` passes; no `any` types.

---

## Tasks
Ordered by dependency.

- [ ] **Create `DevDataView.vue`:** New SFC in `src/components/`, `<script setup lang="ts">`. Import and call `useProviderStore()`; read `providers` via `storeToRefs`. Render a heading with `providers.length` ("N providers loaded") and a `<table>` with a header row and a `v-for` body row per provider showing name, licenseType, capacity, city, county, lat, lng. Minimal CSS for readability only. No props, no `init()` call.
- [ ] **Wire `App.vue`:** Import `useProviderStore` and `onMounted` from vue; call `store.init()` in `onMounted`. Use `storeToRefs` for `loading`/`error`. In the template, render "Loading…" when `loading`, "Error: {error}" when `error` is set, and `<DevDataView />` otherwise. Keep `<AppHeader />`, `<AppSidebar />`, `<MapView />` mounted; place `<DevDataView />` per coder's discretion (below `<main>` or in the map area).
- [ ] **Manual end-to-end verification:** Run `npm run dev`, confirm loading state appears, then real Michigan provider rows and count render with no console errors. Run `vue-tsc --noEmit` to confirm types are clean.

---

## Considerations
- The store guards re-fetch with `initialized`, so calling `init()` in `onMounted` is safe even across HMR-triggered remounts.
- `error` is a human-readable string (not an Error object) per the STR-006 contract — render it directly.
- Rendering ~7,700 plain rows is fine here; do not add virtualization or pagination even if the browser is briefly busy — that contradicts the "throwaway, don't over-engineer" intent.
- `licenseType` is a `LicenseType` string-union value (`center` / `group_home` / `family_home`, from the `as const` object — not a TS enum); render the raw value as-is, no label mapping (out of scope).
- This component is explicitly temporary. Apply clean-code standards but do not build for longevity, extract abstractions, or add tests.

---
