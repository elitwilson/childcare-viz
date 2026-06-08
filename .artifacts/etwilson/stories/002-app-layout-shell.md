---
id: STR-002
title: App Layout Shell & Theming
epic: EPIC-001
status: open
priority: high
---

## Goal

Build the visual skeleton of the app — CSS grid layout, header, and sidebar shell — matching the CC Design mockup structure, with full CSS custom property theming (dark default) ready for feature stories to populate.

---

## Scope

### In
- Global CSS reset and CSS custom properties for dark and light themes (variables lifted directly from the mockup's `:root` and `html[data-theme="light"]` blocks)
- CSS grid body layout: `grid-template-rows: auto 1fr` (header + main), `grid-template-columns: 320px 1fr` (sidebar + map area)
- `AppHeader.vue` — renders the teal mark dot, "Michigan Childcare Access" title, "density & capacity explorer" subtitle, the "Spike · synthetic data" tag, and a non-functional theme toggle button placeholder (correct DOM structure and styles, no click handler)
- `AppSidebar.vue` — empty shell with correct width, background, border, and scroll behavior; no controls yet
- Map area placeholder `<div id="map">` inside a `map-wrap` container — unstyled beyond filling the grid cell
- Dark mode as default (`data-theme` not set = dark via `:root` variables)
- All CSS transitions from the mockup applied to the correct elements

### Out
- Theme toggle click handler / light mode switching (CSS vars defined, button exists, but not wired)
- Any sidebar section content (view toggle, chips, sliders, stats)
- Leaflet map initialization
- Pinia store logic

---

## Acceptance Criteria

- [ ] App renders a header bar, a 320px left sidebar, and a right map area that fills remaining viewport
- [ ] Header displays the mark dot, title, subtitle, spike tag, and theme toggle button — matching mockup layout
- [ ] CSS custom properties for both dark and light themes are defined in global CSS
- [ ] Dark theme is applied by default (correct `--bg`, `--panel`, `--ink` values active)
- [ ] Sidebar scrolls independently if content overflows
- [ ] Layout is `overflow: hidden` on body — no page scroll
- [ ] No console errors

---

## Context & Decisions

- **Tailwind CSS** is used for utility classes (spacing, layout, flex/grid helpers). CSS custom properties remain the theming mechanism — Tailwind utilities reference them via `bg-[var(--panel)]` etc. rather than replacing them
- Variable names must match the mockup exactly (`--bg`, `--panel`, `--panel-2`, `--line`, `--ink`, `--ink-dim`, `--ink-faint`, `--accent`, `--center`, `--family`, `--group`, `--head`, `--mono`, `--sans`, `--map-bg`) so future stories can reference them without renaming
- The theme toggle button must have the correct DOM structure (`#themeToggle`, `data-theme-set` attributes, `.ic.moon` / `.ic.sun` spans) even though it's not functional yet — the Leaflet story and feature stories depend on this structure
- `AppHeader.vue` and `AppSidebar.vue` are separate SFCs — not inlined in App.vue — because both will grow significantly in feature epics
- The `<div id="map">` placeholder lives in App.vue or a `MapView.vue` stub, not inside AppSidebar

---

## Dependencies

- **Depends on:** STR-001 (needs working scaffold)
- **Blocks:** STR-003 (Leaflet story mounts into the map container defined here)

---

## Notes

The mockup CSS is the source of truth for all variable values, transitions, and structural class names. The architect should read `.artifacts/etwilson/design/Michigan Childcare Map.html` in full before designing the component structure — do not reconstruct values from memory.
