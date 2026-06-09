---
id: STR-013
title: useMapStore + leaflet-heat type declaration
epic: EPIC-004
status: complete
priority: high
---

## Goal

Create the `useMapStore` Pinia store that tracks which map view is active, and add a local TypeScript declaration for `leaflet.heat` so the package is type-safe throughout the project. This is the foundation that all other EPIC-004 stories depend on.

---

## Scope

### In
- `src/stores/map.ts` — setup-store with `activeView: ref<'facilities' | 'density'>` defaulting to `'facilities'`
- `src/stores/map.test.ts` — unit tests for the store
- `src/types/leaflet-heat.d.ts` — `declare module 'leaflet.heat'` stub that satisfies `vue-tsc` without `@ts-ignore`

### Out
- Any consumer of `useMapStore` (wired in subsequent stories)
- Any map layer logic

---

## Acceptance Criteria

- [ ] `useMapStore` exports `activeView` as a writable ref typed `'facilities' | 'density'`
- [ ] Default value of `activeView` is `'facilities'`
- [ ] `vue-tsc` passes with no errors after adding the `leaflet-heat.d.ts` declaration
- [ ] Store is not persisted (no `pinia-plugin-persistedstate` or localStorage writes)

---

## Context & Decisions

- Store name follows existing convention: `useMapStore` in `src/stores/map.ts`.
- `activeView` is the single source of truth for which layer is visible — zoom logic and the sidebar toggle both write to it.
- Not persisted: view state resets on reload by design (epic decision).
- No `@types/leaflet.heat` exists on npm; a local `declare module 'leaflet.heat'` stub in `src/types/` is the correct fix — do not use `// @ts-ignore`.
- The declaration file only needs to satisfy the compiler, not fully type the API. A minimal stub (`export default function heat(...): L.Layer`) is sufficient.

---

## Dependencies

- **Depends on:** none
- **Blocks:** STR-014, STR-015, STR-016 (all require `useMapStore`)

---

## Notes

- Look at `src/stores/filters.ts` for the setup-store pattern to follow.
- The `leaflet.heat` API surface used in STR-014: `L.heatLayer(latLngs, options)` returns a `L.Layer`. The declaration stub only needs to cover this call signature.
