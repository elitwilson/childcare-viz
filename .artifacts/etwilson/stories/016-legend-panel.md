---
id: STR-016
title: Legend panel (AppLegend.vue)
epic: EPIC-004
status: complete
priority: medium
---

## Goal

Add a reactive legend overlay to the map that shows the right key for the active view — a type color/size reference for Facilities mode and a heat gradient bar for Density mode — so users always know how to read what they're looking at.

---

## Scope

### In
- `src/components/AppLegend.vue` — legend component accepting `activeView: 'facilities' | 'density'` as a prop
  - Facilities mode: license type color swatches (center/group/family) + size note
  - Density mode: horizontal gradient bar (`#3b6fb0` → `#4fae7a` → `#d9b13f` → `#d96a4a`) with "sparse" / "dense" end labels
- `src/components/AppLegend.test.ts`
- `MapView.vue` — import and render `AppLegend` inside `.map-wrap`, passing `useMapStore.activeView`

### Out
- Any map layer logic — handled in STR-014
- Sidebar toggle — handled in STR-015

---

## Acceptance Criteria

- [ ] Legend is visible in both Facilities and Density modes
- [ ] Facilities mode shows all three license type color swatches with correct labels (Licensed Center, Group Home, Family Home)
- [ ] Facilities mode color swatches use CSS variables (`--center`, `--group`, `--family`) — not hardcoded hex
- [ ] Density mode shows a horizontal gradient bar from `#3b6fb0` to `#d96a4a` with "sparse" and "dense" labels
- [ ] Legend switches content reactively when `activeView` prop changes
- [ ] Legend is positioned absolutely in the bottom-left of `.map-wrap`, above the map tiles (z-index above Leaflet layers)

---

## Context & Decisions

- `AppLegend` is a pure presentational component — it receives `activeView` as a prop and has no store dependencies.
- Positioned absolute inside `.map-wrap` (not in `AppSidebar`), consistent with Leaflet's own control overlays. Bottom-left is the standard position for map legends.
- Facilities mode color swatches use CSS variables, not hardcoded hex — same variables used by the circle markers (`--center`, `--group`, `--family`) — so the legend always matches the markers.
- The gradient bar in density mode mirrors the `leaflet.heat` gradient stops: `0.0: '#3b6fb0'`, `0.4: '#4fae7a'`, `0.7: '#d9b13f'`, `1.0: '#d96a4a'`. Implement as a CSS `linear-gradient`.
- Size legend for Facilities mode: a brief note or small visual indicating markers scale with capacity. Keep it simple — don't over-engineer a live size demo.

---

## Dependencies

- **Depends on:** STR-013 (needs `useMapStore` to pass `activeView` from `MapView.vue`)
- **Blocks:** none

---

## Notes

- `MapView.vue` currently has a minimal template; `AppLegend` is positioned inside `.map-wrap` via absolute CSS, not as a sibling in the app layout.
- Look at `AppHeader.vue` and `AppSidebar.vue` for component structure conventions.
- The `.map-wrap` div in `MapView.vue` already wraps the `#map` div — add `position: relative` if not already set, so the absolute-positioned legend anchors to it.
- Use `data-test` attributes on the legend modes for testability (`data-test="legend-facilities"`, `data-test="legend-density"`).
