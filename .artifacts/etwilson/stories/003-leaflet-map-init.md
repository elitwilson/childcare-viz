---
id: STR-003
title: Leaflet Map Initialization
epic: EPIC-001
status: open
priority: high
---

## Goal

Mount a functional Leaflet map in the map area container, rendering CARTO dark basemap tiles centered on Michigan, with pan and zoom working — completing the launchable dev app milestone.

---

## Scope

### In
- `MapView.vue` component that initializes a Leaflet map instance on mount and destroys it on unmount
- Map centered on Michigan (`[44.6, -85.6]`, zoom 6) matching the mockup
- CARTO dark basemap tile layer (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`) with correct attribution
- Map fills the `map-wrap` container (100% width and height)
- `minZoom: 5`, `maxZoom: 13` constraints from the mockup
- MapView rendered in the map area defined by STR-002

### Out
- Light basemap tile layer (CARTO light_all) — CSS vars for light theme exist but tile swap is not wired
- Any map layers (markers, heatmap)
- Any popups or controls beyond Leaflet's built-in zoom control
- Pinia store integration

---

## Acceptance Criteria

- [ ] `npm run dev` opens the browser and the Leaflet map renders with CARTO dark tiles
- [ ] Map is centered on Michigan and shows both peninsulas at zoom 6
- [ ] Pan and zoom work with mouse/trackpad
- [ ] Map fills the map area (no blank space, no overflow)
- [ ] No console errors on load or during map interaction
- [ ] Leaflet map instance is properly destroyed when the component unmounts (no memory leak)

---

## Context & Decisions

- Leaflet must be initialized inside `onMounted` — calling `L.map()` before the DOM element exists will throw
- The map container `<div id="map">` must have an explicit height (inherited from the grid cell via `height: 100%`) — Leaflet requires a sized container
- Import Leaflet as an ES module (`import L from 'leaflet'`) and import `leaflet/dist/leaflet.css` in the component or globally
- leaflet.heat is installed but not imported or used in this story
- The `setBasemap` pattern from the mockup (swappable tile layers) does not need to be implemented here — a single hardcoded dark tile layer is sufficient for this story
- Tile layer attribution string: `'&copy; OpenStreetMap &copy; CARTO'`

---

## Dependencies

- **Depends on:** STR-002 (map container and CSS grid must exist before Leaflet can mount)
- **Blocks:** none (this completes EPIC-001)

---

## Notes

The Leaflet CSS import is required for correct marker/popup rendering — a common gotcha. The architect should verify it's imported either in `MapView.vue` or in `main.ts`/global styles. The `leaflet/dist/leaflet.css` path must be imported alongside the JS.
