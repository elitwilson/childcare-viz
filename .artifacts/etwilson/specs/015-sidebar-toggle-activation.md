---
number: 015
story: STR-015
status: complete
base_branch: main
depends_on: [STR-013]
scope_files:
  - src/components/AppSidebar.vue
  - src/components/AppSidebar.test.ts
---

# Feature: Sidebar View Toggle Activation

## Summary
The sidebar's "Facilities / Density" segmented control is currently inert — both buttons are `disabled`, the section is `aria-disabled`, and CSS blocks all interaction. This feature activates the control and wires it to `useMapStore.activeView` (the single source of truth for which map layer is visible). Clicking a button sets `activeView`; the buttons' `aria-pressed` state reflects `activeView` reactively, so when zoom-based auto-switching changes the view (handled in STR-014), the toggle visibly updates to match.

---

## Requirements
- Clicking the "Facilities" button sets `useMapStore.activeView` to `'facilities'`.
- Clicking the "Density" button sets `useMapStore.activeView` to `'density'`.
- The "Facilities" button's `aria-pressed` is `"true"` exactly when `activeView === 'facilities'`, and `"false"` otherwise.
- The "Density" button's `aria-pressed` is `"true"` exactly when `activeView === 'density'`, and `"false"` otherwise.
- `aria-pressed` on both buttons updates reactively when `activeView` is changed externally (e.g. by zoom auto-switch), not only on direct click.
- Neither button carries the `disabled` attribute; the control is fully interactive.
- The `aria-disabled` attribute is removed from the `section-map-view` wrapper.
- The active button shows the accent background style (already governed by the existing `button[aria-pressed="true"]` CSS rule); the inactive button does not.

---

## Scope

### In Scope
- `AppSidebar.vue` — instantiate `useMapStore`; bind both segmented-control buttons to `activeView` (click handlers + reactive `aria-pressed`); remove `disabled` from both buttons and `aria-disabled` from the section wrapper; remove `pointer-events: none` from `.seg` and `cursor: not-allowed` / `opacity: 0.7` from `.seg button` so the control reads as active.
- `AppSidebar.test.ts` — replace the existing "Map view section" tests that assert the disabled state with tests covering click-to-set behavior and reactive `aria-pressed` binding.

### Out of Scope
- The `useMapStore` definition itself — delivered by STR-013.
- Any map layer show/hide logic, heatmap, or zoom auto-switch — STR-014.
- The legend panel — STR-016.
- Any change to the facility-type chips, capacity slider, or other sidebar sections.

---

## Technical Approach
- **Entry point:** `src/components/AppSidebar.vue` `<script setup>`. Add `import { useMapStore } from '../stores/map';` and `const mapStore = useMapStore();` alongside the existing `useFilterStore` / `useProviderStore` instantiation.
- **Binding pattern:** Mirror the chips' store-driven pattern (computed-style read from store + click handler that writes the store). For the two buttons, bind `:aria-pressed="String(mapStore.activeView === 'facilities')"` and `:aria-pressed="String(mapStore.activeView === 'density')"`, and `@click="mapStore.activeView = 'facilities'"` / `@click="mapStore.activeView = 'density'"`. No local component state — the binding is read/write straight onto the store ref.
- **Key modules:** Only `AppSidebar.vue` owns this binding. `useMapStore` (from STR-013) owns `activeView`.
- **Data model:** `mapStore.activeView: 'facilities' | 'density'`, default `'facilities'` (per epic). The store is a Pinia setup store at `src/stores/map.ts` exposing `activeView` as a `ref`.
- **Key design decisions:**
  - `activeView` is the sole source of truth; the buttons are a pure read/write view of it. This is what makes the toggle correctly reflect zoom-driven changes for free.
  - Tests use real Pinia (`setActivePinia(createPinia())`) and drive `useMapStore()` directly — matching the existing `AppSidebar.test.ts` style, which uses real stores rather than `vi.mock`. (The story note about mocking describes the conceptual pattern; the established convention in this file is real Pinia stores, so follow that.)

---

## Success Criteria
- [ ] Clicking `[data-test="btn-density"]` makes `useMapStore().activeView === 'density'`.
- [ ] Clicking `[data-test="btn-facilities"]` makes `useMapStore().activeView === 'facilities'`.
- [ ] Setting `mapStore.activeView = 'density'` externally flips `btn-density` to `aria-pressed="true"` and `btn-facilities` to `aria-pressed="false"` after `flushPromises()`.
- [ ] Neither button has a `disabled` attribute; `section-map-view` has no `aria-disabled` attribute.
- [ ] `npm run test` passes; `vue-tsc` type-check passes.

---

## Tasks
Ordered by dependency.

- [ ] **Update tests (RED):** In `AppSidebar.test.ts`, replace the three existing "Map view section" tests (which assert `disabled` and `aria-disabled`) with: (1) clicking Facilities sets `activeView` to `'facilities'`; (2) clicking Density sets `activeView` to `'density'`; (3) external change to `activeView` updates both buttons' `aria-pressed` reactively; (4) neither button is `disabled` and the section has no `aria-disabled`. Import and use `useMapStore` via real Pinia, matching the file's existing style. Tests should fail against current `AppSidebar.vue`.
- [ ] **Activate the control (GREEN):** In `AppSidebar.vue`, instantiate `useMapStore`, bind both buttons' `@click` and `:aria-pressed` to `mapStore.activeView`, remove `disabled` from both buttons, and remove `aria-disabled` from the section wrapper. Make the new tests pass.
- [ ] **Update CSS:** Remove `pointer-events: none` from `.seg`, and `cursor: not-allowed` + `opacity: 0.7` from `.seg button`, so the active control no longer reads as disabled. The `button[aria-pressed="true"]` accent rule already handles active styling — leave it untouched.

---

## Considerations
- This story depends on STR-013 delivering `src/stores/map.ts` with `useMapStore` exposing `activeView` (`'facilities' | 'density'`, default `'facilities'`). If that store is absent at implementation time, the spec is blocked on STR-013 — but the executor sequences this after STR-013, so it should be present.
- `aria-pressed` must be bound as a string (`String(...)`), consistent with how the chips bind `aria-checked` (`String(filterStore.activeTypes[type])`) — DOM attribute reads return strings, and the tests assert `'true'`/`'false'`.
- Do not introduce local `ref` state for the toggle; reading and writing the store directly is what keeps it in sync with zoom auto-switching (STR-014).
- The existing default has Facilities pressed and Density unpressed, which matches `activeView` default `'facilities'` — no behavioral regression for the initial render.
