---
number: 011
story: STR-011
status: ready
base_branch: main
depends_on: [STR-010]
scope_files:
  - src/components/MapView.vue
  - src/components/MapView.test.ts
  - src/style.css
  - src/style.css.test.ts
---

# Feature: Provider popup

## Summary
Clicking a circle marker on the map opens a styled Leaflet popup that shows the provider's license type (label + color swatch), name, city, capacity in seats, and quality rating. The rating row is omitted entirely when the provider has no rating. The popup is styled to match the spike mockup's dark theme — `var(--panel)` background, `var(--line)` border, monospace values — bringing the otherwise-bare markers to life and matching the design pixel-for-pixel.

---

## Requirements
- Every circle marker has a popup bound to it that opens when the marker is clicked.
- The popup header shows the provider's license type label (e.g. "Licensed Center", "Family Home", "Group Home") preceded by a color swatch whose color matches the marker's color for that license type.
- The popup shows the provider name.
- The popup shows a Location row with the provider's `city`.
- The popup shows a Capacity row formatted as `<capacity> seats` (e.g. `42 seats`).
- When `rating` is non-null, the popup shows a Rating row with the rating value.
- When `rating` is null, the Rating row is absent entirely (no key, no value, no empty row).
- The popup closes via map click and via Leaflet's default close button.
- The popup wrapper, tip, header swatch, name, and key/value grid are styled to match the mockup dark theme.

---

## Scope

### In Scope
- Binding a Leaflet popup to each circle marker created in STR-010 via `bindPopup`.
- Building the popup HTML as an inline template string (same pattern as the design mockup).
- A mapping from `Provider.licenseType` → display label and CSS color variable.
- Conditional rendering of the Rating row based on `rating` being null vs. non-null.
- Porting the `.leaflet-popup-content-wrapper`, `.leaflet-popup-tip`, `.leaflet-popup-content`, and `.pop ...` selectors from the mockup into `src/style.css`.

### Out of Scope
- Any popup triggered from the sidebar.
- Editing or interacting with provider data from the popup.
- Custom close-button behavior beyond the Leaflet default.
- An "Ages" row (present in the mockup template but absent from the `Provider` data model).
- Heatmap, stats panel, legend.

---

## Technical Approach
- **Entry point:** `src/components/MapView.vue`. STR-010 adds the loop that creates one `L.circleMarker` per provider; this story chains `.bindPopup(html, { ... })` onto each marker within that same loop.
- **License-type mapping:** `Provider.licenseType` is the union `'center' | 'group_home' | 'family_home'` (see `src/types/provider.ts`). The mockup keys are `center` / `family` / `group`, so a direct passthrough does **not** work — define an explicit map keyed by the actual `LicenseType` values:
  - `center` → label `Licensed Center`, CSS var `--center`
  - `family_home` → label `Family Home`, CSS var `--family`
  - `group_home` → label `Group Home`, CSS var `--group`
  This mapping should be the same one STR-010 uses to color the markers — if STR-010 already defines a label/color lookup, reuse it rather than duplicating. If not, define it once (e.g. a small `const` record in `MapView.vue` or a shared helper) and use it for both marker color and popup swatch so they cannot drift.
- **Resolving the swatch color:** markers and the popup swatch must use the *same* resolved color. The mockup resolves the CSS variable to a concrete color at runtime (`getComputedStyle(...).getPropertyValue(name)`); use whatever resolution STR-010 settled on. The popup swatch background must equal the marker's `fillColor`/`color` for that provider.
- **Popup HTML template:** inline template string matching the mockup structure, minus the Ages row:
  ```html
  <div class="pop">
    <div class="pt"><span class="sw" style="background:${color}"></span>${label}</div>
    <div class="nm">${name}</div>
    <div class="grid">
      <span class="k">Location</span><span class="vv">${city}</span>
      <span class="k">Capacity</span><span class="vv">${capacity} seats</span>
      ${ratingRow}
    </div>
  </div>
  ```
  where `ratingRow` is `<span class="k">Rating</span><span class="vv">${rating}</span>` when `rating !== null`, else the empty string.
- **Close button:** the story requires the default close button, so do **not** pass `{ closeButton: false }` (the mockup does — deliberately diverge here). Leaflet's default already closes on map click.
- **Styling:** port these selectors verbatim from the mockup into `src/style.css` (they don't exist there yet): `.leaflet-popup-content-wrapper`, `.leaflet-popup-tip`, `.leaflet-popup-content`, `.pop .pt`, `.pop .pt .sw`, `.pop .nm`, `.pop .grid`, `.pop .grid .k`, `.pop .grid .vv`. The `.leaflet-popup-content-wrapper` transition selector is already present in `style.css`; don't duplicate it.

### Data model
Uses the existing `Provider` interface (`src/types/provider.ts`) unchanged. Fields read by the popup: `name`, `licenseType`, `capacity`, `city`, `rating` (`number | null`).

### Key design decisions
- **Inline template string over a Vue component for popup content** — matches the mockup pattern and Leaflet's `bindPopup(htmlString)` contract; a Vue sub-component would require manual mount/teardown for marginal benefit and is out of scope.
- **Diverge from mockup on close button and Ages row** — the story's acceptance criteria are authoritative over the mockup where they conflict.

---

## Success Criteria
- [ ] Clicking any marker opens a popup; clicking elsewhere on the map (or the close button) closes it.
- [ ] The popup header label and swatch color match the clicked provider's license type and equal the marker's color.
- [ ] Location shows the provider's city; Capacity shows `<n> seats`.
- [ ] A provider with a non-null rating shows a Rating row with that value; a provider with `rating === null` shows no Rating row at all.
- [ ] Popup background is `var(--panel)`, border is `var(--line)`, values render in the monospace font — visually matching the mockup.
- [ ] Unit tests cover popup-content generation (label/swatch/city/capacity correctness and the null-vs-non-null rating branch).

---

## Tasks
Ordered by dependency.

- [ ] **Add popup style block to `src/style.css`:** Port `.leaflet-popup-content-wrapper`, `.leaflet-popup-tip`, `.leaflet-popup-content`, and the `.pop ...` selectors from the mockup. Extend `src/style.css.test.ts` to assert the new selectors / key properties exist (follow the existing assertion pattern in that file).
- [ ] **Build the popup-content function:** Add a pure function (in `MapView.vue` or a small colocated helper) that takes a `Provider` and the resolved color and returns the popup HTML string, including the conditional Rating row. Ensure the license-type → label/color mapping is shared with STR-010's marker coloring (reuse if present; otherwise define once). Fully unit-test this function in `MapView.test.ts` before wiring — cover label/swatch/city/capacity and both rating branches.
- [ ] **Bind popups to markers:** In the marker-creation loop (added by STR-010), call `.bindPopup(buildPopupHtml(provider, color))` on each `circleMarker`, using the default close button (no `closeButton: false`).

---

## Considerations
- **Mockup divergences are intentional:** the mockup template includes an `Ages` row and passes `{ closeButton: false }`; this story deliberately drops both. Don't "fix" the spec back toward the mockup.
- **License-type key mismatch:** the mockup's data uses keys `center`/`family`/`group`, but the real `Provider.licenseType` values are `center`/`family_home`/`group_home`. Map against the real values, not the mockup keys, or `family_home`/`group_home` will fall through.
- **Swatch/marker color must not drift:** the popup swatch and the marker fill must resolve to the same color. Prefer one shared mapping/resolution path over two parallel ones.
- **Rating format:** the `Provider.rating` is `number | null`. The story says "quality rating" without mandating a star rendering; render the numeric value. (The mockup's `.pop .stars` styling exists and may be applied for visual parity, but a star glyph renderer is not required by the acceptance criteria — keep it simple unless STR-010 established otherwise.)
- **HTML in template string:** values come from a trusted public dataset and are injected as innerHTML by Leaflet. This matches the mockup and is acceptable for this local-only demo; no escaping requirement is imposed by the story.
- **Dependency on STR-010:** this story has no independent deliverable until markers exist. The marker-creation loop, the color-resolution approach, and any label/color helper are introduced by STR-010 — this spec extends that loop rather than re-establishing it.
