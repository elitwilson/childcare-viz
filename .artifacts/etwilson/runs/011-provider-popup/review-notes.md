## Add popup style block to src/style.css

## Verdict: APPROVED

**Task:** Add popup style block to src/style.css
**Spec:** .artifacts/etwilson/specs/011-provider-popup.md

**Scope issues:** none

**Coverage gaps:** none

## Build the popup-content function

## Verdict: FLAGGED

**Task:** Build the popup-content function
**Spec:** .artifacts/etwilson/specs/011-provider-popup.md

**Scope issues:**
- `src/composables/useMapMarkers.test.ts` — not listed in the spec's `scope_files`. The spec explicitly names `src/components/MapView.test.ts` as the test target for `buildPopupHtml`. The coder's rationale (MapView.test.ts mocks the full module) is understandable but the scope deviation still needs explicit sign-off from the team lead before proceeding.

**Coverage gaps:** none — all required cases (label × 3 types, swatch color, name, city, capacity format, rating non-null, rating null) are covered.

## Build the popup-content function (revised)

## Verdict: APPROVED

**Task:** Build the popup-content function
**Spec:** .artifacts/etwilson/specs/011-provider-popup.md

**Scope issues:** none — tests moved to `src/components/MapView.test.ts` as specified; `importActual` pattern resolves the prior mock conflict cleanly.

**Coverage gaps:** none

## Bind popups to markers

## Verdict: FLAGGED

**Task:** Bind popups to markers
**Spec:** .artifacts/etwilson/specs/011-provider-popup.md

**Scope issues:**
- `src/composables/useMapMarkers.test.ts` — not listed in the spec's `scope_files`. The spec's in-scope test file for this task is `src/components/MapView.test.ts`. Unlike the Task 2 deviation (which had a concrete technical constraint), no blocking reason is given here for why these tests cannot live in `MapView.test.ts`. The scope deviation needs sign-off before proceeding.

**Coverage gaps:** none — `bindPopup` called on each marker, HTML contains provider name and license type label, and `closeButton: false` is not passed are all covered.

## Bind popups to markers (follow-up)

Coder invoked one-fix-cycle rule with technical rationale: `useMapMarkers` is wholly stubbed in `MapView.test.ts`, making `bindPopup` unobservable there. `useMapMarkers.test.ts` is the only viable location. Deviation accepted; proceeding to implementation.
