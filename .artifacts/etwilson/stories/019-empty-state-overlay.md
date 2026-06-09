---
id: STR-019
title: Empty state overlay
epic: EPIC-005
status: open
priority: medium
---

## Goal

Show a clear "No facilities match these filters." message in the map area when the current filter combination produces no visible providers, so users know the map is empty intentionally rather than broken.

---

## Scope

### In
- `MapView.vue` — absolute-positioned overlay inside `.map-wrap` that displays "No facilities match these filters." when the filtered visible provider list is empty; hidden otherwise
- `MapView.test.ts` — tests for overlay visibility toggling

### Out
- Any changes to filter logic or stores
- Any changes to the sidebar

---

## Acceptance Criteria

- [ ] The overlay is visible when all providers are filtered out (e.g., `minCapacity` set to 200, which no provider meets)
- [ ] The overlay is hidden when at least one provider is visible
- [ ] The overlay appears and disappears reactively as filters change (no reload needed)
- [ ] The overlay is positioned in the center of the map area, layered above the map tiles

---

## Context & Decisions

- The overlay is driven by a computed `isMapEmpty: boolean` in `MapView.vue` — `true` when the count of providers passing all active filters is 0.
- The filtered count is computed using the same predicate as `useMapMarkers` and `useHeatLayer`: `provider.capacity >= filterStore.minCapacity && filterStore.activeTypes[provider.licenseType]`. `MapView` already has access to `providerStore` and `filterStore`.
- Overlay positioning: `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 500` — matches the mockup's `.empty-note` style.
- The overlay should only appear after providers have loaded (i.e., `providerStore.providers.length > 0`). An empty map during the initial load is not the same as "no matches."

---

## Dependencies

- **Depends on:** none
- **Blocks:** none

---

## Notes

- `MapView.vue` currently imports `useProviderStore` and `useFilterStore` — the overlay computed can be added directly without new imports.
- Style reference from mockup: `.empty-note` uses `var(--panel)` background, `var(--line)` border, `border-radius: 10px`, `font-size: 13px`, `color: var(--ink-dim)`. Keep simple.
- Use `data-test="empty-note"` for the overlay element to make it testable.
