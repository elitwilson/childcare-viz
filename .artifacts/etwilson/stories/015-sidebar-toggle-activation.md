---
id: STR-015
title: Sidebar view toggle activation
epic: EPIC-004
status: open
priority: medium
---

## Goal

Enable the disabled "Facilities / Density" segmented control in the sidebar and wire it to `useMapStore.activeView`, so the user can manually switch views and the toggle always reflects the current state (including when zoom auto-switches it).

---

## Scope

### In
- `AppSidebar.vue` — remove `disabled`, `aria-disabled`, `pointer-events: none`, and `cursor: not-allowed` from the segmented control; bind buttons to `useMapStore.activeView`
- `AppSidebar.test.ts` — update/add tests covering toggle interaction and `aria-pressed` binding

### Out
- Any map layer logic — handled in STR-014
- Legend — handled in STR-016

---

## Acceptance Criteria

- [ ] Clicking "Facilities" sets `useMapStore.activeView` to `'facilities'`
- [ ] Clicking "Density" sets `useMapStore.activeView` to `'density'`
- [ ] `aria-pressed="true"` tracks the active button reactively (updates when zoom auto-switches the view)
- [ ] Buttons are clickable — no `disabled` attribute, no `pointer-events: none`
- [ ] Active button has the accent background style; inactive button does not

---

## Context & Decisions

- The toggle is purely a read/write binding on `useMapStore.activeView` — no local component state needed.
- `aria-disabled="true"` on the section wrapper should also be removed; the control is now fully interactive.
- The CSS `.seg` rule currently sets `pointer-events: none` on the container — remove that along with the `cursor: not-allowed` on the buttons.
- Active button styling is already handled by `button[aria-pressed="true"]` in the existing scoped CSS — no new styles needed, just ensure the binding is reactive.

---

## Dependencies

- **Depends on:** STR-013 (needs `useMapStore`)
- **Blocks:** none

---

## Notes

- Look at how `filterStore.activeTypes` is bound in the chips for the pattern: computed `aria-pressed` driven by store value, click handler that sets store value.
- The existing `AppSidebar.test.ts` mocks `useFilterStore` and `useProviderStore`; follow the same mocking pattern for `useMapStore`.
