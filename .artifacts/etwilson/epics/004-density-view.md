---
id: EPIC-004
title: Density View, Layer Toggle & Legend
status: ready
created: 2026-06-09
---

## Goal

Complete the two-view map experience from the mockup: wire the disabled Facilities/Density toggle, implement the heatmap layer, auto-switch views based on zoom level so the map is never a blob, and add the legend panel that reflects the active view.

---

## Scope In

- **`useMapStore`**: new Pinia store with `activeView: ref<'facilities' | 'density'>` (default `'facilities'`). Single source of truth for which layer is visible. Not persisted.
- **Sidebar view toggle**: remove `disabled`/`pointer-events: none` from the segmented control; bind both buttons to `useMapStore.activeView`.
- **Heatmap layer**: `leaflet.heat` (already installed). Layer weight = `Math.min(1, capacity / 120)` per provider point. Config from mockup: `radius: 28, blur: 22, maxZoom: 11, minOpacity: 0.25`, gradient `{0.0: '#3b6fb0', 0.4: '#4fae7a', 0.7: '#d9b13f', 1.0: '#d96a4a'}`.
- **Zoom-based auto-switch**: `map.on('zoomend')` writes to `useMapStore.activeView` — zoom ≤ 8 forces `'density'`, zoom > 8 forces `'facilities'`. Fully automatic; toggle reflects current state.
- **Layer visibility watcher**: when `activeView` changes, show/hide the facilities layer groups and heat layer accordingly.
- **Legend panel**: absolute-positioned overlay (bottom-left of `.map-wrap`). Facilities mode: type color key + size legend. Density mode: heat gradient bar with "sparse → dense" labels. Switches reactively with `activeView`.
- **`leaflet.heat` TypeScript types**: the package ships no `.d.ts`. Add a local declaration file (`src/types/leaflet-heat.d.ts`) to satisfy `vue-tsc`.

## Scope Out

- Stats panel (EPIC-005)
- Dark/light mode toggle (EPIC-005)
- Min-rating slider (EPIC-005)
- Reset button (EPIC-005)

---

## Key Decisions

- **Fully automatic zoom switching**: zoom ≤ 8 → density, zoom > 8 → facilities. The toggle reflects what zoom already decided — there is no separate "user preference" to track. One store field (`activeView`) drives everything.
- **Zoom threshold is 8**: zoom 6 = whole state (blob territory), zoom 9+ = city/region level where individual markers are meaningful. Threshold 8 is the inflection point.
- **`useMapStore` is separate from `useFilterStore`**: view state (which layer) and filter state (which providers) are orthogonal concerns. Filters apply to both views.
- **Heat layer uses same filtered provider list as circle markers**: `minCapacity` and `activeTypes` filters from `useFilterStore` apply to the heatmap too — the heat layer should reflect the same data the user has filtered to.
- **`leaflet.heat` types via local declaration**: no `@types/leaflet.heat` exists on npm. A local `declare module 'leaflet.heat'` stub in `src/types/` is the correct fix; do not use `// @ts-ignore`.
- **Legend is a component (`AppLegend.vue`)**, not inline markup in `MapView`. It receives `activeView` as a prop and is positioned absolutely inside `.map-wrap`.
