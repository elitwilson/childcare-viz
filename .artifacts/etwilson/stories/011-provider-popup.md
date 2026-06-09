---
id: STR-011
title: Provider popup
epic: EPIC-003
status: complete
priority: medium
---

## Goal

Clicking a circle marker opens a styled popup showing key provider details. Brings the map to life and matches the mockup's dark popup design.

---

## Scope

### In
- Bind a Leaflet popup to each circle marker via `bindPopup`
- Popup content: license type label + color swatch, provider name, city, capacity in seats, quality rating (row omitted if `rating` is null)
- Popup styled to match mockup: `var(--panel)` background, `var(--line)` border, dark text, monospace values

### Out
- Any popup triggered from the sidebar
- Editing or interacting with provider data from the popup
- Custom close button behavior beyond Leaflet default

---

## Acceptance Criteria

- [ ] Clicking a marker opens a popup
- [ ] Popup shows: license type label with matching color swatch, provider name, city, capacity (e.g. "42 seats")
- [ ] Rating row is present when `rating` is non-null, absent when null
- [ ] Popup background and border match the mockup dark theme
- [ ] Popup closes on map click or the default close button

---

## Context & Decisions

- Popup HTML is an inline template string passed to `bindPopup` — same pattern as the design mockup
- Color swatch in popup header uses the same CSS var as the marker (`--center`, `--family`, `--group`)
- Rating field is `number | null` in the `Provider` type — conditional rendering is required, not optional

---

## Dependencies

- **Depends on:** STR-010 (markers must exist to bind popups to)
- **Blocks:** none

---

## Notes

- Leaflet popup styling requires targeting `.leaflet-popup-content-wrapper` and `.leaflet-popup-tip` in global CSS — these selectors are already present in the design mockup's stylesheet and can be ported to `style.css`
