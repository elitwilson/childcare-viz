---
id: STR-017
title: Stats panel + Reset button
epic: EPIC-005
status: open
priority: high
---

## Goal

Add a "Showing" sidebar section that displays live facility count and total licensed seats for the current filter state, and a "Reset all filters" button that returns all filters to defaults — completing the sidebar's interactive surface.

---

## Scope

### In
- `AppSidebar.vue` — new "Showing" section above the reset button: facility count ("facilities on map") and total licensed seats, both computed from the currently filtered provider list
- `AppSidebar.vue` — "Reset all filters" button at the bottom of the sidebar; resets `filterStore.activeTypes` (all true) and `filterStore.minCapacity` (0)
- `AppSidebar.test.ts` — tests for stats reactivity and reset behavior

### Out
- Avg quality rating stat (no real rating data in the API — deferred)
- Any changes to `useFilterStore` itself (reset calls existing store state setters)
- Any changes outside the sidebar

---

## Acceptance Criteria

- [ ] "Showing" section displays current facility count that updates reactively when filters change
- [ ] "Showing" section displays total licensed seats (sum of `capacity`) that updates reactively
- [ ] Clicking "Reset all filters" sets `filterStore.activeTypes` to all-true for all three license types
- [ ] Clicking "Reset all filters" sets `filterStore.minCapacity` to 0
- [ ] Stats update immediately after reset (reactive, no stale display)
- [ ] Stats section is visually separated from the filter controls (standard `.section` wrapper)

---

## Context & Decisions

- Stats are computed directly in `AppSidebar` using `computed()` — no new store or composable needed. Read `providerStore.providers` filtered through the same logic `useMapMarkers` uses: `provider.capacity >= filterStore.minCapacity && filterStore.activeTypes[provider.licenseType]`.
- Avg rating stat is explicitly out of scope — all providers have `rating: null` from the real API. No placeholder, no "—" display.
- Reset resets `useFilterStore` only — `useMapStore.activeView` is not touched (view stays wherever zoom left it).
- Facility count and seats are integers; format with `toLocaleString()` for comma-separated display matching the mockup.
- The reset button uses the existing CSS variable palette (`var(--panel)`, `var(--line)`, `var(--ink-dim)`) — see the mockup's `.reset` style for reference.

---

## Dependencies

- **Depends on:** none
- **Blocks:** none

---

## Notes

- Look at the existing `typeCounts` computed in `AppSidebar` for the pattern of filtering `providerStore.providers`.
- The "Showing" section and reset button are the last two sections in `<aside>` — Showing above reset, reset at the very bottom.
- Style reference from mockup: `.stat .v` uses monospace font, 26px, `var(--accent)` for count; `.stat .k` is 11.5px dim. Keep it simple — match the spirit, not pixel-perfect, since the overall sidebar layout already diverges slightly.
