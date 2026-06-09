# Review Notes — legend-panel

## Scaffold AppLegend test

## Verdict: APPROVED

**Task:** Scaffold AppLegend test
**Spec:** .artifacts/etwilson/specs/016-legend-panel.md

**Scope issues:** none

**Coverage gaps:** none

All required test cases are present and properly structured:
- Facilities mode: `[data-test="legend-facilities"]` present, `[data-test="legend-density"]` absent
- All three label strings covered ("Licensed Center", "Group Home", "Family Home") with individual tests
- Capacity/size note requirement covered
- All three CSS variable swatch references covered (var(--center), var(--group), var(--family))
- Density mode: `[data-test="legend-density"]` present, `[data-test="legend-facilities"]` absent
- "sparse" and "dense" end labels covered
- Gradient bar element presence covered
- Reactive prop switching covered in both directions (facilities→density and density→facilities)

Tests target observable DOM behavior via `data-test` attributes, not implementation details.

## Wire into MapView.vue

## Verdict: APPROVED

**Task:** Wire into MapView.vue
**Spec:** .artifacts/etwilson/specs/016-legend-panel.md

**Scope issues:** none

**Coverage gaps:** none

Both wiring requirements covered: AppLegend rendered inside `.map-wrap` (test 1 selects `.map-wrap [data-test="legend-facilities"]`), and `mapStore.activeView` passed as prop (test 2 confirms facilities block present / density absent with mocked store returning `activeView: 'facilities'`). Tests target observable DOM output.
