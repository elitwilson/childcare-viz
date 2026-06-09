---
id: STR-012
title: Sidebar filters
epic: EPIC-003
status: open
priority: medium
---

## Goal

Populate `AppSidebar` with the three filter controls from the design mockup: license-type chips, min-capacity slider, and a disabled Map view toggle placeholder. Completing the sidebar makes the app fully interactive for the facilities view.

---

## Scope

### In
- **Map view section**: segmented "Facilities / Density" toggle rendered as a visual placeholder — `disabled` / `aria-disabled`, `pointer-events: none`. No store wiring.
- **Facility type section**: one chip per `LicenseType` showing label, color swatch, and provider count. Clicking toggles `filterStore.activeTypes[type]`. Chip visually dims when its type is off.
- **Filters section**: min-capacity slider, range 0–150, step 5, bound two-way to `filterStore.minCapacity`. Displays current value.
- Sidebar section layout and styles matching the mockup (section headers, chip styles, slider styles)

### Out
- Stats panel ("Showing" counts)
- Min-quality-rating slider
- Reset button
- Legend panel
- Any density/heatmap controls

---

## Acceptance Criteria

- [ ] Sidebar renders three sections: Map view, Facility type, Filters
- [ ] Map view toggle is visible but non-interactive
- [ ] Each license-type chip shows the correct label, color swatch, and count of providers of that type
- [ ] Clicking a chip toggles its type in `filterStore.activeTypes`; the chip dims visually when off; markers update on the map
- [ ] Capacity slider moves from 0–150 in steps of 5; current value is displayed; map updates reactively
- [ ] Sidebar appearance matches the mockup's dark panel style

---

## Context & Decisions

- Provider counts on chips come from `useProviderStore.providers` filtered by type — computed at render time, not stored separately
- Map view toggle is UI-only in this epic; full wiring deferred to EPIC-004 when the density layer exists
- Chip and slider styles can be ported directly from the design mockup's CSS

---

## Dependencies

- **Depends on:** STR-009 (filterStore must exist to bind to), STR-010 (layer groups must exist for map to respond to filter changes)
- **Blocks:** none

---

## Notes

- `AppSidebar` is currently an empty `<aside>` shell — all content in this story is additive
- The sidebar and `MapView` are siblings in the layout; they communicate exclusively through `useFilterStore`, not props or emits
