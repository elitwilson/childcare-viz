---
id: STR-007
title: DevDataView & App Wiring
epic: EPIC-002
status: complete
priority: high
---

## Goal

Wire the provider store into `App.vue` and render a minimal dev view so the full data pipeline can be manually verified end-to-end in the browser — real data from the Michigan API appearing on screen.

---

## Scope

### In
- `App.vue` — call `providerStore.init()` in `onMounted`; render loading/error states and `<DevDataView />` once data is available
- `src/components/DevDataView.vue` — displays a plain table of loaded providers showing: name, licenseType, capacity, city, county, lat, lng; shows total count in a heading; no styling beyond readability

### Out
- No styling to match the mockup (that's the UI epic)
- No filtering, sorting, or pagination of the displayed list
- No integration with the Leaflet map component
- This component is explicitly temporary — it will be removed or replaced in a future epic; do not over-engineer it

---

## Acceptance Criteria

- [ ] `npm run dev` loads in the browser and the provider data appears without a full-page error
- [ ] A loading state is visible while the 8 API requests are in flight
- [ ] The table shows all loaded providers (approximately 7,700 rows)
- [ ] Each row displays: name, licenseType, capacity, city, county, lat, lng
- [ ] A total count is shown (e.g. "7,247 providers loaded")
- [ ] If the API fails, an error message is shown instead of a blank screen
- [ ] No console errors on load

---

## Context & Decisions

- `DevDataView` reads from `useProviderStore()` directly — no props
- `App.vue` shows a simple "Loading…" text while `store.loading` is true
- `App.vue` shows a simple "Error: {store.error}" message if `store.error` is set
- The existing `<AppHeader />`, `<AppSidebar />`, and `<MapView />` from EPIC-001 remain in place; `<DevDataView />` can be rendered below them or in place of the map area temporarily — coder's discretion for the dev view placement
- Component tests are not required for `DevDataView` — it is throwaway UI and will be manually verified

---

## Dependencies

- **Depends on:** STR-006 (needs the Pinia store)
- **Blocks:** none (this completes EPIC-002)

---

## Notes

The point of this story is a human clicking through the browser and seeing real Michigan childcare data on screen. The component itself is intentionally disposable — clean code standards apply but don't build it to last.
