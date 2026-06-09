---
number: 016
story: STR-016
status: complete
base_branch: main
depends_on: [STR-013]
scope_files:
  - src/components/AppLegend.vue
  - src/components/AppLegend.test.ts
  - src/components/MapView.vue
---

# Feature: Legend panel (AppLegend.vue)

## Summary
A reactive legend overlay anchored to the bottom-left of the map that tells the user how to read the active view. In Facilities mode it shows the three license-type color swatches (Licensed Center, Group Home, Family Home) plus a brief note that marker size scales with capacity. In Density mode it shows a horizontal heat-gradient bar with "sparse" and "dense" end labels. `AppLegend` is a pure presentational component driven by an `activeView` prop; `MapView` renders it inside `.map-wrap` and feeds it `useMapStore.activeView`.

---

## Requirements
- `AppLegend` accepts a single prop `activeView: 'facilities' | 'density'`.
- When `activeView === 'facilities'`, the legend shows three color swatches labeled exactly "Licensed Center", "Group Home", and "Family Home".
- The facilities swatch colors are driven by CSS variables `--center`, `--group`, and `--family` — never hardcoded hex.
- Facilities mode includes a brief note indicating marker size scales with capacity.
- When `activeView === 'density'`, the legend shows a horizontal gradient bar from `#3b6fb0` through `#4fae7a` and `#d9b13f` to `#d96a4a`, with "sparse" and "dense" end labels.
- The legend content switches reactively when the `activeView` prop changes — facilities content present only in facilities mode, density content present only in density mode.
- The legend is positioned absolutely in the bottom-left of `.map-wrap`, layered above the Leaflet map tiles.
- The facilities block carries `data-test="legend-facilities"` and the density block carries `data-test="legend-density"`.

---

## Scope

### In Scope
- New component `src/components/AppLegend.vue` — prop-driven, no store dependency.
- New test `src/components/AppLegend.test.ts`.
- `MapView.vue` — import `AppLegend`, render it inside `.map-wrap`, pass `useMapStore().activeView`.

### Out of Scope
- Map layer logic, heatmap rendering, marker rendering (STR-014).
- Sidebar view toggle (STR-015).
- Defining `useMapStore` itself (STR-013) — this spec only consumes its `activeView`.
- Theme toggle / light-mode legend variants beyond what the shared CSS variables already provide.

---

## Technical Approach
- **Entry point / interface:** `AppLegend` is mounted by `MapView.vue` inside the existing `.map-wrap` div. Props: `defineProps<{ activeView: 'facilities' | 'density' }>()`. No emits, no store access inside the component.
- **Reactive switching:** Use `v-if="activeView === 'facilities'"` / `v-else` (or two `v-if` blocks) so exactly one of the two `data-test` blocks is present in the DOM at a time. Because the prop is reactive, the swap is automatic.
- **Facilities swatches:** Render three rows, each a swatch `<span>` + label. Set swatch background via inline style bound to the CSS variable, e.g. `:style="{ background: 'var(--center)' }"`, so colors stay in sync with the circle markers (which resolve the same `--center`/`--group`/`--family` vars in `useMapMarkers.ts`). Labels are the literal strings "Licensed Center", "Group Home", "Family Home" — matching `LICENSE_META` in `src/composables/useMapMarkers.ts`.
- **Density gradient bar:** A single element with `background: linear-gradient(to right, #3b6fb0, #4fae7a, #d9b13f, #d96a4a)` in scoped `<style>`, flanked by "sparse" (left) and "dense" (right) text labels. These four stops mirror the `leaflet.heat` gradient defined in the epic.
- **Positioning:** Scoped CSS on the legend root: `position: absolute; bottom; left;` with a `z-index` above Leaflet layers (Leaflet panes sit around 200–700; use a value such as `z-index: 1000`, consistent with Leaflet's own control overlays). `.map-wrap` already has `position: relative` (`src/style.css`), so no change needed there.
- **Styling:** Match the dark-theme panel conventions used by `AppHeader.vue` — `var(--panel)` background, `var(--line)` border, `var(--ink)` / `var(--ink-dim)` text. Use scoped styles in the SFC.
- **MapView wiring:** `MapView.vue` imports `useMapStore` (from STR-013) and `AppLegend`, then renders `<AppLegend :active-view="mapStore.activeView" />` inside `.map-wrap` alongside the existing `#map` div.

---

## Success Criteria
- [ ] `AppLegend.vue` exists and renders without error when mounted with each `activeView` value.
- [ ] With `activeView="facilities"`, `[data-test="legend-facilities"]` is present and `[data-test="legend-density"]` is absent; the three labels "Licensed Center", "Group Home", "Family Home" all render.
- [ ] Facilities swatches resolve their background from `var(--center)`, `var(--group)`, `var(--family)` (assert inline style references the variable, not a hex literal).
- [ ] With `activeView="density"`, `[data-test="legend-density"]` is present and `[data-test="legend-facilities"]` is absent; the gradient bar and "sparse"/"dense" labels render.
- [ ] Changing the `activeView` prop on a mounted wrapper swaps the rendered block reactively.
- [ ] `MapView.vue` renders `AppLegend` inside `.map-wrap` and passes `mapStore.activeView`.

---

## Tasks
Ordered by dependency.

- [ ] **Scaffold AppLegend test:** Create `src/components/AppLegend.test.ts` with cases for facilities-mode swatches/labels, density-mode gradient/labels, CSS-variable-backed swatch colors, and reactive prop switching. Mount with `@vue/test-utils`, select via `data-test`. Get a clean red.
- [ ] **Implement AppLegend.vue:** Build the prop-driven component (`defineProps<{ activeView }>()`), two `data-test` blocks, swatches bound to CSS variables, gradient bar via scoped `linear-gradient`, and absolute bottom-left positioning with a Leaflet-safe `z-index`. Make the tests pass.
- [ ] **Wire into MapView.vue:** Import `useMapStore` and `AppLegend`; render `<AppLegend :active-view="mapStore.activeView" />` inside `.map-wrap`. Keep existing map/marker setup intact. Verify `MapView.test.ts` still passes.

---

## Considerations
- This story depends on STR-013 for `useMapStore` / `activeView`. The `AppLegend` component itself has no store dependency and can be built and unit-tested in isolation; only the `MapView` wiring task needs `useMapStore` to exist. If STR-013's store surface is not yet present when the MapView task runs, the executor must sequence STR-013 first (already declared in `depends_on`).
- Keep swatch colors as CSS-variable references (`var(--center)` etc.) so a future light/dark theme switch recolors the legend automatically — the same variables the circle markers consume in `useMapMarkers.ts`.
- Label strings must match the marker/popup labels exactly ("Licensed Center", "Group Home", "Family Home") to stay consistent with `LICENSE_META`.
- The density gradient stops are presentational only here; the authoritative `leaflet.heat` gradient lives in STR-014. The four hex values are duplicated by design (CSS gradient vs. JS gradient config) — keep them in sync with the epic's stated stops.
- `z-index` must clear Leaflet's overlay panes; a value around `1000` matches Leaflet's own control layer and avoids the legend being hidden behind tiles or markers.
