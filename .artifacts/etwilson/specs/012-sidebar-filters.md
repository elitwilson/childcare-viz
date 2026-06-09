---
number: 012
story: STR-012
status: complete
base_branch: main
depends_on: [STR-009, STR-010]
scope_files:
  - src/components/AppSidebar.vue
  - src/components/AppSidebar.test.ts
---

# Feature: Sidebar filters

## Summary
Populate the currently-empty `AppSidebar` shell with the three filter controls from the design mockup: a disabled "Facilities / Density" Map-view toggle placeholder, one license-type chip per `LicenseType` (label, color swatch, live provider count), and a min-capacity slider. The chips and slider write directly to `useFilterStore` (`activeTypes` and `minCapacity`), which the map composable (STR-010) already watches — so toggling a chip or dragging the slider reactively updates the markers on the map. This is the change that makes the facilities view fully interactive and makes the app match the mockup's dark sidebar.

---

## Requirements
- The sidebar renders three stacked sections in order: **Map view**, **Facility type**, **Filters**, each with a small-caps uppercase header.
- The **Map view** section renders a segmented control with two buttons ("Facilities", "Density"). It is visible but inert: both buttons are `disabled`, the control is `aria-disabled` and has `pointer-events: none`. Facilities reads as the selected/pressed state. No store wiring.
- The **Facility type** section renders exactly one chip per `LicenseType` value (`center`, `group_home`, `family_home`), each showing: a color swatch matching that type's map color, a human-readable label, and a count of providers of that type from `useProviderStore.providers`.
- Clicking a chip toggles `filterStore.activeTypes[type]` (true↔false). When a type is off, its chip dims (opacity 0.4) and its swatch greys out.
- The chip's `aria-checked` attribute reflects the type's current on/off state.
- Provider counts are computed from the live provider list at render time; they reflect whatever `useProviderStore.providers` currently holds (0 before data loads, real counts after).
- The **Filters** section renders a single range slider: min 0, max 150, step 5, two-way bound to `filterStore.minCapacity`. A value label displays the current `minCapacity`.
- The sidebar's appearance (section padding/borders, chip layout, slider thumb/track, segmented control) matches the mockup using the existing global CSS custom properties.

---

## Scope

### In Scope
- All markup, styles, and store wiring inside `src/components/AppSidebar.vue`.
- Map-view segmented toggle as an inert visual placeholder.
- License-type chips with label, swatch, count, and toggle behavior bound to `filterStore.activeTypes`.
- Min-capacity slider bound to `filterStore.minCapacity` with a current-value display.
- Updating `src/components/AppSidebar.test.ts` to cover the new content (replacing the current "empty shell" tests).

### Out of Scope
- Stats panel / "Showing" counts (`sCount`, `sSeats`, `sRate`).
- Min-quality-rating slider.
- "Reset all filters" button.
- Legend panel and any density/heatmap controls.
- Any wiring of the Map-view toggle to state (deferred to EPIC-004).
- Any change to `MapView`, `useMapMarkers`, `useFilterStore`, or `useProviderStore` — those are consumed as-is.

---

## Technical Approach
- **Entry point:** `src/components/AppSidebar.vue`, currently an empty `<aside>` shell. All content is additive inside that root `<aside>`. Follow the established SFC pattern in `AppHeader.vue`: `<script setup lang="ts">` → `<template>` → scoped `<style>`, porting mockup markup directly and relying on global CSS vars from `src/style.css`.
- **Stores consumed:**
  - `useFilterStore` (`src/stores/filters.ts`, from STR-009) — surface is `{ activeTypes: ref<Record<LicenseType, boolean>>, minCapacity: ref<number> }`. No actions exist; the sidebar mutates state by direct property assignment (`filterStore.activeTypes[type] = !filterStore.activeTypes[type]`) and `v-model="filterStore.minCapacity"`.
  - `useProviderStore` (`src/stores/providers.ts`) — read `providers` to compute per-type counts.
- **Type → label / color mapping:** The codebase `LicenseType` keys (`center`, `group_home`, `family_home`) do **not** line up 1:1 with the mockup's CSS color-var names (`--center`, `--family`, `--group`). Define a small in-component array/record mapping each `LicenseType` to its display label and CSS color-var name, and iterate it with `v-for` to render chips:
  - `center` → label "Licensed Center", swatch `var(--center)`
  - `group_home` → label "Group Home", swatch `var(--group)`
  - `family_home` → label "Family Home", swatch `var(--family)`
  Drive the swatch background with an inline `:style="{ background: 'var(--center)' }"` style binding (mirrors the mockup), so no JS color resolution is needed — the CSS variables already exist in `src/style.css`.
- **Counts:** a `computed` returning `Record<LicenseType, number>` (or a per-chip count derived in the `v-for`) from `providerStore.providers.filter(p => p.licenseType === type).length`. Computed at render time, not stored — matches the story decision.
- **Chip toggle / dim:** bind `:aria-checked="filterStore.activeTypes[type]"` and `@click` to flip it. The `.chip[aria-checked="false"] { opacity: .4 }` rule (and greyed swatch) comes straight from the mockup CSS, scoped into the component.
- **Slider:** `<input type="range" min="0" max="150" step="5" v-model.number="filterStore.minCapacity">` with a sibling label showing `{{ filterStore.minCapacity }}`. `.number` ensures `minCapacity` stays a `number` (the store types it `number` and the map composable compares numerically).
- **Map-view placeholder:** static markup — two `<button disabled>` elements inside a `.seg`/`.section`, "Facilities" carrying the pressed/selected styling, the container `aria-disabled="true"` with `pointer-events: none`. No script.
- **Key design decisions:**
  - Swatch colors via inline `var(--…)` references rather than a JS color map — the sidebar only needs the CSS value for display, and the chips' off-state already overrides the swatch in CSS. Keeps the component free of `getComputedStyle` plumbing (which lives in the map composable for canvas rendering only).
  - Store mutation by direct assignment, since STR-009 deliberately ships no toggle/reset actions.

---

## Success Criteria
- [ ] `AppSidebar` renders three sections with headers "Map view", "Facility type", "Filters".
- [ ] The Map-view segmented control is visible but cannot be clicked (`disabled` buttons, `pointer-events: none`, `aria-disabled`).
- [ ] Three chips render — one per `LicenseType` — each with the correct label, a swatch in the correct type color, and a count equal to the number of providers of that type in the store.
- [ ] Clicking a chip flips `filterStore.activeTypes[type]`, sets its `aria-checked` accordingly, and dims the chip when off.
- [ ] The slider has `min=0 max=150 step=5`, two-way binds `filterStore.minCapacity`, and the displayed value tracks the slider as it moves.
- [ ] With the map mounted, toggling a chip or moving the slider visibly changes which markers show (verified via the existing STR-010 reactivity — no new map code).
- [ ] `npm run test` passes and `vue-tsc` type-check is clean.

---

## Tasks
Ordered by dependency.

- [ ] **Replace shell tests with real test scaffold (RED):** Rewrite `src/components/AppSidebar.test.ts`. Set `setActivePinia(createPinia())` in `beforeEach`. Scaffold `it` cases for: three section headers render; map-view buttons are disabled; one chip per license type with correct label and count (seed `useProviderStore.providers` with a small fixture); clicking a chip toggles `filterStore.activeTypes[type]` and `aria-checked`; the slider has the right `min`/`max`/`step` and updating it sets `filterStore.minCapacity`. Use `data-test` selectors. Placeholder assertions first.
- [ ] **Write real failing tests:** Fill in assertions against the scaffold; confirm they fail because `AppSidebar` is still the empty shell.
- [ ] **Implement the sidebar template + script (GREEN):** Build the three sections in `AppSidebar.vue`. Add the `LicenseType → {label, colorVar}` mapping, the per-type count computed, chip `v-for` with toggle + `aria-checked`, the inert map-view segment, and the range slider with `v-model.number` + value display. Wire `useFilterStore` and `useProviderStore`. Make all tests pass.
- [ ] **Port mockup styles into scoped `<style>`:** Bring over `.section`/`.section h2`, `.seg`/`.seg button`/`.dot`, `.chips`/`.chip`/`.sw`/`.nm`/`.ct` (including the `aria-checked="false"` dim + grey-swatch rules), `.slider-row`/`.lab` and `input[type=range]` thumb/track rules from the design mockup, using existing global CSS vars. Keep the existing `aside` width/scrollbar styles. Verify counts/toggle/slider visually if the app can be run.

---

## Considerations
- **Key/label mismatch is the main gotcha:** iterating `Object.values(LicenseType)` gives `center`/`group_home`/`family_home`, but the mockup color vars are `--center`/`--family`/`--group` and labels are "Licensed Center"/"Family Home"/"Group Home". Map them explicitly; do not assume `--${type}` resolves.
- **Counts before data loads:** `useProviderStore.providers` is empty until `init()` resolves. Chips must render with count `0` and not error — a `computed` over an empty array handles this naturally. Do not call `init()` from the sidebar; the app already triggers it.
- **`v-model.number` on the slider:** native range inputs emit string values; without `.number` the store's `minCapacity` becomes a string and the map composable's numeric capacity comparison can misbehave. Use `.number`.
- **No store actions exist (STR-009):** mutate `activeTypes`/`minCapacity` directly. Vue tracks property assignment on the ref'd plain `activeTypes` record (that was the explicit reason STR-009 used a record, not a `Set`).
- **Scoped styles vs. global vars:** the CSS custom properties (`--center`, `--accent`, `--panel`, `--line`, `--ink*`, etc.) are defined globally on `:root` in `src/style.css`; scoped component styles can reference them freely. The chip/slider class names are local to this component, so scoping is fine — no need to touch `style.css`.
- **`aria-checked` on a non-input chip:** match the mockup, which uses `role="checkbox"` + `aria-checked` on a `div`. Keep that semantic so the dim-on-off CSS selector (`[aria-checked="false"]`) and tests can target it.
