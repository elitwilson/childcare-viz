---
number: 013
story: STR-013
status: complete
base_branch: main
depends_on: []
scope_files:
  - src/stores/map.ts
  - src/stores/map.test.ts
---

# Feature: useMapStore (active map view state)

## Summary
Adds a small Pinia setup-store, `useMapStore`, that holds the single source of truth for which map view is active: `'facilities'` or `'density'`. The store is the foundation EPIC-004 builds on — the sidebar toggle, the zoom-based auto-switch, and the layer-visibility watcher will all read and write this one `activeView` ref. It defaults to `'facilities'` and is intentionally not persisted, so the view resets on reload.

This story originally also called for a `src/types/leaflet-heat.d.ts` declaration stub for `leaflet.heat`. Codebase exploration found that premise no longer holds (see Scope → Out of Scope and Considerations): the project already depends on `@types/leaflet.heat@0.2.5`, which is installed and resolves cleanly. No local declaration is needed, so that deliverable is dropped.

---

## Requirements
- `useMapStore` exposes `activeView` as a writable `ref` typed `'facilities' | 'density'`.
- `activeView` defaults to `'facilities'`.
- Writing a new value to `activeView` is observable by reactive consumers (computed/watch).
- The store is not persisted: no `pinia-plugin-persistedstate` config and no localStorage reads or writes. View state resets on reload by design.
- The store follows the existing setup-store convention used by `useFilterStore` / `useProviderStore`.

---

## Scope

### In Scope
- `src/stores/map.ts` — setup-store `useMapStore('map')` exposing `activeView`.
- `src/stores/map.test.ts` — unit tests covering default value, writable update, and reactivity.

### Out of Scope
- Any consumer of `useMapStore` (sidebar toggle, zoom auto-switch, layer watcher, legend — all in later EPIC-004 stories).
- Any map layer or heatmap logic.
- `src/types/leaflet-heat.d.ts` — **dropped.** `@types/leaflet.heat@0.2.5` is already a devDependency and is installed; it augments the `leaflet` module so that `import 'leaflet.heat'` (side-effect) and `L.heatLayer(latlngs, options)` both typecheck with no error and no `@ts-ignore`. A local `declare module 'leaflet.heat'` stub is unnecessary and would duplicate/conflict with the installed types. See Considerations.
- Fixing the pre-existing `vue-tsc` error in `AppSidebar.vue:48` (unrelated to this story; see Considerations).

---

## Technical Approach
- **Entry point / interface:** `src/stores/map.ts` — `export const useMapStore = defineStore('map', () => { ... })`. Mirror `src/stores/filters.ts` exactly in shape.
- **Key module:** the store itself; it has no dependencies on services, the API, or other stores.
- **Data model:** `type MapView = 'facilities' | 'density'`. Declare a local string-literal union and type the ref as `ref<MapView>('facilities')`. (Inline `ref<'facilities' | 'density'>('facilities')` is acceptable; a named local type alias reads better for the later consumers that import it — but exporting the type is not required by this story and can wait for the consumer story that needs it.)
- **Key design decisions:**
  - Setup-store form (composition style), state as `ref`, per `vue-code-style` rules and existing stores.
  - Store id string `'map'`; composable name `useMapStore`.
  - No `init()` / `loading` / `error` scaffolding — this store holds pure UI state with no async load, so the async-action pattern from `useProviderStore` does not apply.
  - Not persisted — do not import or register `pinia-plugin-persistedstate` for this store.

---

## Success Criteria
- [ ] `src/stores/map.ts` exports `useMapStore`; `store.activeView` is `'facilities'` immediately after creation.
- [ ] Assigning `store.activeView = 'density'` updates the value and is observed by a `computed` reading it.
- [ ] `src/stores/map.test.ts` passes under `pnpm exec vitest run`.
- [ ] No persistence wiring is present in the store (verified by inspection — no `persist` option, no localStorage).
- [ ] `pnpm exec vue-tsc -p tsconfig.app.json --noEmit` introduces **no new** errors. (The pre-existing `AppSidebar.vue:48` error is out of scope and will remain until its own fix lands.)

---

## Tasks
Ordered by dependency.

- [ ] **RED — scaffold and write store tests:** Create `src/stores/map.test.ts` following `src/stores/filters.test.ts`: `setActivePinia(createPinia())` in `beforeEach`; cases for (1) default `activeView === 'facilities'`, (2) writing `'density'` updates the value, (3) reactivity — a `computed(() => store.activeView)` observes the change. Run and confirm they fail (store does not yet exist).
- [ ] **GREEN — implement the store:** Create `src/stores/map.ts` with the `useMapStore('map')` setup-store exposing `activeView` typed `'facilities' | 'density'`, default `'facilities'`. Run tests to green.
- [ ] **Verify typecheck:** Run `pnpm exec vue-tsc -p tsconfig.app.json --noEmit` and confirm no new errors are introduced by the new files (only the known `AppSidebar.vue:48` error remains).

---

## Considerations
- **`@types/leaflet.heat` already covers the heatmap API.** `package.json` lists `@types/leaflet.heat@^0.2.5` under devDependencies; it is installed at `node_modules/@types/leaflet.heat`. It augments `declare module "leaflet"` to add `L.heatLayer(latlngs, options): L.HeatLayer` and the `HeatMapOptions` interface. A throwaway file importing `'leaflet.heat'` and calling `L.heatLayer([[1,2,3]], { radius: 25 })` typechecked with zero errors. **STR-014 should rely on these installed types and must NOT add a `src/types/leaflet-heat.d.ts` stub** — doing so would be redundant and risks conflicting augmentations. This contradicts the STR-013 story body and the EPIC-004 scope note; flag to the human so the epic/story can be corrected.
- **Pre-existing typecheck error, out of scope.** `vue-tsc` currently reports one error: `src/components/AppSidebar.vue(48,12): error TS2322: Type 'string' is not assignable to type 'Booleanish | "mixed" | undefined'` (the `:aria-checked="String(...)"` binding). It predates this story and is unrelated to the map store. STR-013's AC "vue-tsc passes with no errors" therefore cannot be satisfied in absolute terms without touching out-of-scope code. This spec instead requires that STR-013 introduce **no new** errors. Recommend opening a separate fix for the AppSidebar binding.
- **`tsconfig.app.json` has `noUnusedLocals`/`noUnusedParameters` on.** Keep the store minimal — an unused local type alias or import would fail the build.
