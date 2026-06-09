---
number: 020
story: STR-020
status: ready
base_branch: main
depends_on: []
scope_files:
  - src/components/AppSidebar.vue
  - src/components/AppSidebar.test.ts
  - src/components/AppLegend.vue
  - src/components/AppLegend.test.ts
---

# Feature: Sidebar + legend visual polish

## Summary
Bring the sidebar's "Map view" segmented control and facility-type chips, plus the density legend's end label, closer to the CC Design mockup. The seg control is restyled into a pill-shaped container holding two transparent buttons (active button gets a `--panel-2` background and an accent-colored dot), facility chips gain a hover border-color cue, and the density legend's "sparse" label becomes "sparse · 'desert'". These are CSS-and-markup-only changes with no behavior change; the user sees a more polished sidebar and legend.

---

## Requirements
- The "Map view" seg control renders as a pill-shaped container with a visible gap between its two buttons.
- The active seg button has a `var(--panel-2)` background; the inactive seg button has a transparent background.
- Each seg button contains a small `.dot` circle element; the dot is accent-colored (`var(--accent)`) when its button is the active view.
- Facility-type chips change their border color to `var(--ink-faint)` on hover.
- The density legend's "sparse"-side end label reads `sparse · 'desert'`.
- Active-view styling continues to key off `aria-pressed="true"` after the seg control rewrite.
- All existing AppSidebar and AppLegend behavior tests continue to pass.

---

## Scope

### In Scope
- `AppSidebar.vue` — restyle `.seg` container and its buttons; add a `.dot` span inside each seg button; add chip hover border-color rule.
- `AppSidebar.test.ts` — update only if a test asserts on the old CSS class structure (none currently do; verify after the change and adjust if needed).
- `AppLegend.vue` — change the density "sparse" end-label text to `sparse · 'desert'`.
- `AppLegend.test.ts` — the existing `"sparse"` text assertion stays valid (substring match); no change expected, confirm after editing.

### Out of Scope
- Any functional/behavioral change to view toggling, filtering, or counts.
- Stats section or reset button (STR-017).
- Any component other than `AppSidebar.vue` and `AppLegend.vue`.

---

## Technical Approach
- **Entry points / interfaces:** Both components are already wired and tested. No script-logic changes — `mapStore.activeView` toggling and `aria-pressed` bindings stay exactly as they are at `AppSidebar.vue:36-37`.
- **Key modules / components:**
  - `AppSidebar.vue` — the `.seg` block (`AppSidebar.vue:120-148`) is rewritten from a border-joined flex pair to a pill container; the two `<button>`s in the template (`AppSidebar.vue:36-37`) each gain a `<span class="dot" aria-hidden="true"></span>`. The `.chip` rule (`AppSidebar.vue:157-166`) gains a `:hover` border-color.
  - `AppLegend.vue` — single text node change in the density block (`AppLegend.vue:24`).
- **Data model:** None. CSS and static markup only.
- **Key design decisions:**
  - Seg container: `background: var(--bg); padding: 4px; border-radius: 9px; border: 1px solid var(--line)`. Use `display: grid; grid-template-columns: 1fr 1fr; gap: 4px` so the two buttons share width evenly with a real gap (replaces the current `display: flex; gap: 0` joined layout). Remove the `:first-child` / `:last-child` border-radius and border-removal rules — no longer needed.
  - Seg buttons: `background: transparent; border: 0; border-radius: 6px`; add `display: flex; align-items: center; gap: 0.4rem` so the dot sits beside the label. Active state (`button[aria-pressed="true"]`) sets `background: var(--panel-2)` (replaces the old `var(--accent)` fill + white text).
  - `.dot`: `width: 7px; height: 7px; border-radius: 50%; background: currentColor; opacity: .6; flex-shrink: 0`. The active button sets the dot accent color via `.seg button[aria-pressed="true"] .dot { color: var(--accent); opacity: 1 }` (dot inherits `currentColor`).
  - Chip hover: `.chip:hover { border-color: var(--ink-faint) }`. The chip already has `border: 1px solid var(--line)`, so only the color changes on hover — no layout shift.
  - Density label: plain text change to `sparse · 'desert'` (use the `·` middle-dot U+00B7 and straight single quotes to match the story).

---

## Success Criteria
- [ ] Seg control container is pill-shaped (`border-radius: 9px`, `1px` border, `var(--bg)`) with a 4px gap between the two buttons.
- [ ] Clicking a seg button still switches `mapStore.activeView` (existing tests pass).
- [ ] Active seg button shows `var(--panel-2)` background; inactive is transparent.
- [ ] Each seg button renders a `.dot` span; active button's dot is `var(--accent)`.
- [ ] Hovering a facility chip changes its border color to `var(--ink-faint)`.
- [ ] Density legend end label reads `sparse · 'desert'`.
- [ ] `npm run test` passes with no regressions in `AppSidebar.test.ts` or `AppLegend.test.ts`.

---

## Tasks
Ordered by dependency.

- [ ] **Restyle the seg control and add dots:** In `AppSidebar.vue`, add `<span class="dot" aria-hidden="true"></span>` inside both seg `<button>`s (`AppSidebar.vue:36-37`). Rewrite the `.seg` and `.seg button` CSS to the pill-container + transparent-button + active-`--panel-2` design, including the `.dot` rules and the active-dot accent rule. Remove the now-dead `:first-child` / `:last-child` and `var(--accent)` active-fill rules. Preserve the `:aria-pressed` bindings unchanged.
- [ ] **Add chip hover state:** In `AppSidebar.vue`, add `.chip:hover { border-color: var(--ink-faint) }` to the chip CSS block.
- [ ] **Update density legend label:** In `AppLegend.vue`, change the first `.end-label` text from `sparse` to `sparse · 'desert'`.
- [ ] **Verify tests:** Run `npm run test`. Confirm `AppSidebar.test.ts` and `AppLegend.test.ts` still pass. The `"sparse"` substring assertion in `AppLegend.test.ts:73` remains valid; no sidebar test asserts on `.seg`/`.chip` CSS internals, so none should need changes. If any assertion broke, update it to match the new markup (do not weaken behavior coverage).

---

## Considerations
- The current active seg style uses a solid accent fill with white text; the mockup wants a subtle `--panel-2` background instead. Make sure inactive-button text color stays readable (keep `color: var(--ink)` on the base `.seg button` rule).
- The `.dot` uses `currentColor` so it tints with the button's text color by default; only the active button overrides it to `var(--accent)`. Mark dots `aria-hidden="true"` — they are decorative and must not add noise for screen readers.
- `AppSidebar.test.ts` is behavior-focused (data-test selectors + aria attributes) and does not assert on `.seg`/`.chip` class structure, so the CSS restructure should not break it. Still run the suite to confirm.
- Use the literal middle-dot character `·` (U+00B7) for the density label, matching the acceptance criterion text `sparse · 'desert'`.
