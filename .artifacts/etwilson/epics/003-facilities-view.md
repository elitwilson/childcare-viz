---
id: EPIC-003
title: Facilities View — Circle Markers & Popups
status: ready
created: 2026-06-08
---

## Goal

Replace the empty Leaflet canvas with meaningful content: a circle marker per provider, sized by capacity and colored by license type, with a click popup. Wire the sidebar with type-chip toggles and a min-capacity slider that reactively filter what's shown on the map. This is the first epic where the app looks like the design mockup.

---

## Scope In

- **`pinia-plugin-persistedstate`** (v4, Pinia 3 compatible): install, register in `main.ts`, configure `useProviderStore` to cache to localStorage with a 24 h TTL.
- **`useFilterStore`**: new Pinia store for active license-type toggles and min-capacity value. Not persisted.
- **Circle markers**: canvas renderer for performance; per-type layer groups so chip toggling adds/removes groups rather than iterating markers. Capacity filter re-renders the affected groups.
- **Marker visual spec** (from design mockup): colors as CSS custom properties (`--center`, `--family`, `--group`), radius formula `4 + √capacity × 1.15`, `fillOpacity: 0.55 / opacity: 0.9 / weight: 1.4`.
- **Click popup**: license type label + swatch, provider name, city, capacity in seats, quality rating (omitted if null).
- **Sidebar — Facility type**: three license-type chips with label, color swatch, and provider count. Toggling updates the filter store and the corresponding layer group.
- **Sidebar — Filters**: min-capacity slider (0–150, step 5) bound to filter store.
- **Sidebar — Map view**: render the segmented Facilities / Density toggle as a visual placeholder only — disabled/inert until EPIC-004.

## Scope Out

- Density / heatmap layer (EPIC-004)
- `useMapStore` / active-layer management (EPIC-004)
- Stats panel ("Showing" counts, total seats, avg rating)
- Dark/light mode toggle
- Legend panel
- Min-quality-rating slider
- Head Start facility type (not in real data model)

---

## Key Decisions

- **`pinia-plugin-persistedstate` must be v4**: v3 does not support Pinia 3. Wrong version installs silently and breaks persistence at runtime.
- **`useFilterStore.activeTypes` must be `ref<Record<LicenseType, boolean>>`**, not `ref<Set<...>>`. Vue 3 tracks property assignments on a ref'd object but does not track `.add()`/`.delete()` mutations on a ref'd Set — toggling chips would silently fail to trigger reactivity.
- **Canvas renderer + per-type layer groups**: canvas for render performance at ~7,700 markers; separate groups so type-chip toggling is O(1) map layer ops, not O(n) marker iteration.
- **CSS vars for colors**: color values live in `style.css`, not JS constants, so markers inherit future theme changes automatically.
- **TTL check in application code**: the 24 h cache freshness guard lives in `useProviderStore.init()`, not in a plugin serializer. Simplest approach; no custom plugin config needed.
- **`useFilterStore` is not persisted**: filter state intentionally resets on every page load — return visitors should not arrive at a pre-filtered map.
- **No `useMapStore` in this epic**: layer management (facilities vs. density) belongs to EPIC-004. `MapView` owns Leaflet directly here.
- **Popup omits rating row if null**: `rating` is `number | null` in the `Provider` type; don't render a blank row.
