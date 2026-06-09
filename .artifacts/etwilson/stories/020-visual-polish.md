---
id: STR-020
title: Sidebar + legend visual polish
epic: EPIC-005
status: open
priority: low
---

## Goal

Bring the sidebar's view toggle and facility-type chips and the legend's density label closer to the CC Design mockup — rounding off the visual gaps that remain after the functional stories.

---

## Scope

### In
- `AppSidebar.vue` — seg control visual overhaul:
  - Container: `background: var(--bg); padding: 4px; border-radius: 9px; border: 1px solid var(--line)`
  - Buttons: `background: transparent; border: 0; border-radius: 6px` with active state `background: var(--panel-2)`
  - Add `.dot` span inside each button (small circle, `color: var(--accent)` when active, dimmer when inactive)
- `AppSidebar.vue` — chip hover state: `border-color: var(--ink-faint)` on hover
- `AppSidebar.test.ts` — update any tests that relied on removed/changed CSS class structure
- `AppLegend.vue` — update density end label from `"sparse"` to `"sparse · 'desert'"`
- `AppLegend.test.ts` — update snapshot/text assertion if present

### Out
- Any functional behavior changes — this is CSS and markup only
- Stats section or reset button (STR-017)
- Any other components

---

## Acceptance Criteria

- [ ] Seg control renders as a pill-shaped container with gap between the two buttons
- [ ] Active seg button has `var(--panel-2)` background; inactive button is transparent
- [ ] Each seg button contains a small `.dot` circle; dot is accent-colored when the button is active
- [ ] Facility-type chips show a visible border color change on hover
- [ ] Density legend end label reads "sparse · 'desert'" (with the single-quoted 'desert')
- [ ] All existing sidebar and legend tests still pass

---

## Context & Decisions

- These are CSS-only changes (plus minimal markup additions for `.dot` spans and the label text). No store or composable changes.
- The seg control style in the mockup uses `grid-template-columns: 1fr 1fr; gap: 4px` inside the container. Rewrite `.seg` styles accordingly; remove the current border-based approach.
- `.dot` span: `width: 7px; height: 7px; border-radius: 50%; background: currentColor; opacity: .6` — active button sets `color: var(--accent)` so the dot picks it up via `currentColor`.
- Chip hover is additive — just add a `:hover` rule to the existing `.chip` selector.
- `AppLegend` density label is a text-only change: `"sparse"` → `"sparse · 'desert'"`. The surrounding layout does not change.

---

## Dependencies

- **Depends on:** none
- **Blocks:** none

---

## Notes

- The seg control currently uses a border-based two-button layout. The new pill-container approach is a meaningful CSS restructure — be careful that `aria-pressed` styling still works after the rewrite.
- Check `AppSidebar.test.ts` for any selectors that target the old `.seg button` border styles — those may need updating.
- The `.dot` span needs to be added to the template on both buttons: `<span class="dot"></span>Facilities` and `<span class="dot"></span>Density`.
