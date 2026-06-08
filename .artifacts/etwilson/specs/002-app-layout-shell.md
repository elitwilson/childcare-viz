---
number: 002
story: STR-002
status: complete
base_branch: main
depends_on: [STR-001]
scope_files:
  - src/App.vue
  - src/style.css
  - src/components/AppHeader.vue
  - src/components/AppSidebar.vue
  - src/components/MapView.vue
---

# Feature: App Layout Shell & Theming

## Summary
Build the static visual skeleton of the Michigan Childcare Access app: a CSS grid page layout (header row + sidebar/map columns) with a header bar, an empty sidebar shell, and a map-area placeholder. All theming is driven by CSS custom properties lifted verbatim from the design mockup, with dark theme as the default. This story produces no behavior — no theme toggling, no map, no controls — only correct DOM structure, styles, and the global CSS variable system that every later feature story references. A developer running `npm run dev` sees the full chrome of the app with an empty sidebar and an empty map cell.

---

## Requirements
- The page renders as a CSS grid with two rows (`auto 1fr`: header, main) and the main area as a grid of two columns (`320px 1fr`: sidebar, map area).
- The `<body>` is `overflow: hidden` so the page itself never scrolls.
- All CSS custom properties from the mockup's `:root` block are defined globally and active by default (dark theme), and the `html[data-theme="light"]` override block is also defined (but not activated by any toggle in this story).
- The header renders, in order: a teal mark dot, the title "Michigan Childcare Access", the subtitle "density & capacity explorer", a theme-toggle button group, and a "Spike · synthetic data" tag.
- The theme-toggle group has the exact DOM structure from the mockup (`#themeToggle`, two buttons with `data-theme-set="dark"`/`"light"`, `aria-pressed` reflecting dark as active, and `.ic.moon` / `.ic.sun` icon spans) but no click handler.
- The sidebar renders as an empty panel with the correct background, right border, fixed 320px width, vertical padding, and independent vertical scrolling when its content overflows.
- The map area renders a `.map-wrap` container holding a `<div id="map">` placeholder that fills its grid cell.
- All transitions specified in the mockup are applied to their corresponding elements (header, aside, and the elements that exist in this story).
- No console errors when the app loads.

---

## Scope

### In Scope
- Global CSS: box-sizing reset, `html, body` sizing/margin, the `:root` dark variables, the `html[data-theme="light"]` variables, and the transition declarations — all matching the mockup.
- `AppHeader.vue`: header bar with mark dot, title, subtitle, non-functional theme toggle (correct DOM + styles), and spike tag.
- `AppSidebar.vue`: empty `<aside>` shell — width, background, border, padding, scroll behavior, and webkit scrollbar styling. No sections or controls.
- `MapView.vue`: `.map-wrap` container wrapping `<div id="map">`. Map placeholder styled only to fill the cell (`width/height: 100%`, `--map-bg` background).
- `App.vue`: composes header + main grid (sidebar + map area), sets up the `<main>` grid.

### Out of Scope
- Theme toggle click handler, light-mode switching, and `localStorage` persistence (CSS vars defined, button exists, not wired).
- Any sidebar section content: view toggle (`.seg`), type chips (`.chips`), sliders, stats, reset button.
- Leaflet map initialization, tile layers, legend, empty-note, popups (STR-003 and later).
- Pinia stores or any state logic.
- Theme-related CSS for elements that don't exist yet (e.g. `.chip`, `input[type=range]`) — only carry over the global variables and the transitions for elements present in this story.

---

## Technical Approach
- **Entry points / interfaces:** `App.vue` is the root SFC mounted in `main.ts` (from STR-001). It renders `<AppHeader />` then a `<main>` containing `<AppSidebar />` and `<MapView />`. Global styles live in `src/style.css` (the file the `vue-ts` template imports in `main.ts`); the mockup's `:root` / `data-theme` variables and the body grid go there.
- **Key modules / components:**
  - `src/style.css` — owns the reset, CSS custom properties (both themes), `body` grid, `main` grid, and global transition rules. This is the theming foundation other stories depend on.
  - `src/components/AppHeader.vue` — owns header DOM + scoped/component styles for `.mark`, `h1`, `.sub`, `.theme-toggle` (and `.ic.sun`/`.ic.moon`), `.spike-tag`.
  - `src/components/AppSidebar.vue` — owns the `<aside>` shell and its scrollbar styling.
  - `src/components/MapView.vue` — owns `.map-wrap` + `#map` placeholder.
- **Data model:** None. This story is purely presentational; no props, emits, or state.
- **Key design decisions:**
  - **Variable names are copied verbatim** from the mockup (`--bg`, `--panel`, `--panel-2`, `--line`, `--ink`, `--ink-dim`, `--ink-faint`, `--accent`, `--center`, `--family`, `--group`, `--head`, `--map-bg`, plus the font vars `--mono`, `--sans`). Renaming would break later stories that reference them.
  - **Theming stays in CSS custom properties, not Tailwind config.** Tailwind utilities (per the story's Context note) may be used for plain layout/spacing and reference vars via arbitrary values like `bg-[var(--panel)]`, but the variable definitions and theme switch mechanism (`data-theme` on `<html>`) are pure CSS. Do not move theme colors into `tailwind.config`.
  - **Global vs. component styles:** Variables, body/main grid, and cross-cutting transitions are global (`style.css`) because they apply at the document level and are referenced project-wide. Element-specific styles (header, aside, map-wrap) live with their components. Because `#map` is targeted by Leaflet by ID in STR-003 and `:root`/`html` selectors can't be scoped, the map placeholder and any `#map`/`html`/`body` rules must be global (unscoped), not in a `<style scoped>` block.
  - **`#map` must be a global selector** so STR-003's Leaflet init (which calls `L.map('map')`) finds a correctly-sized element. Put the `#map` and `.map-wrap` rules in `style.css` (or an unscoped `<style>` in `MapView.vue`), not scoped.
  - **Dark default via absence:** no `data-theme` attribute is set on `<html>`, so `:root` (dark) values apply. The light block (`html[data-theme="light"]`) is defined but never activated in this story.

---

## Success Criteria
- [ ] `npm run dev` loads with no console errors and shows a header bar, a 320px sidebar, and a map area filling the rest of the viewport.
- [ ] The header shows mark dot, title, subtitle, the dark/light toggle group, and the spike tag, laid out left-to-right matching the mockup (toggle pushed right via `margin-left:auto`, spike tag after it).
- [ ] Inspecting computed styles confirms dark-theme variable values are active (`--bg: #11151c`, `--panel: #1a2029`, `--ink: #e8edf3`).
- [ ] `html[data-theme="light"]` is present in the stylesheet (verifiable by manually setting `data-theme="light"` on `<html>` in devtools and seeing colors change — even though no in-app control does this).
- [ ] The `<body>` does not scroll; the sidebar scrolls independently when forced to overflow (verifiable by temporarily adding tall content).
- [ ] The theme-toggle DOM matches the mockup exactly: `#themeToggle`, two buttons with `data-theme-set`, `aria-pressed="true"` on the dark button, `.ic.moon` and `.ic.sun` spans present.
- [ ] `#map` exists as a global-selectable element filling its grid cell with `--map-bg` background.

---

## Tasks
Ordered by dependency.

- [ ] **Global styles & theme variables (`src/style.css`):** Replace the template's default CSS with the mockup's reset (`* { box-sizing }`, `html, body` height/margin), the full `:root` dark variable block and `html[data-theme="light"]` block (copied verbatim from the mockup lines 15–42), the `body` grid (`grid-template-rows: auto 1fr; overflow: hidden; font-family/background/color from vars`), the `main` grid (`grid-template-columns: 320px 1fr; min-height: 0`), the global transition rules (`html { transition: none }` and the `header, aside, ... { transition: ... }` rule, scoped to elements that exist), and the global `#map` / `.map-wrap` / `.leaflet-container` background rules. Confirm dark values are active. Must be in place before components are styled.
- [ ] **`AppHeader.vue`:** Build the `<header>` SFC with the exact mockup DOM (mark, h1, sub, `#themeToggle` group with both buttons + icon spans, spike tag) and port the header styles (`.mark`, `header h1`, `.sub`, `.theme-toggle`, `.theme-toggle button`, `aria-pressed` styling, `.ic.sun`/`.ic.moon` pseudo-elements, `.spike-tag`). No click handler on the toggle. Verify layout matches mockup.
- [ ] **`AppSidebar.vue`:** Build the empty `<aside>` SFC with the mockup's aside styles (background, right border, `overflow-y: auto`, padding) and the webkit scrollbar rules. No inner content.
- [ ] **`MapView.vue`:** Build the `.map-wrap` + `<div id="map">` placeholder. Keep `#map` styling global (in `style.css` or an unscoped block) so STR-003 can target it. Verify it fills the right grid cell.
- [ ] **Compose in `App.vue`:** Render `<AppHeader />` and a `<main>` containing `<AppSidebar />` and `<MapView />`. Run `npm run dev`, confirm the full shell renders with dark theme and no console errors.

---

## Considerations
- The mockup loads Leaflet/leaflet.heat via CDN `<script>` tags and defines popup/legend/control styles. **Ignore all of that here** — those belong to STR-003 and feature stories. Only port the global vars, body/main layout, header, aside, and the bare `#map` placeholder.
- The mockup's transition rule lists selectors that don't exist yet (`.legend, .seg, .chip, .reset, input[type=range], .leaflet-popup-content-wrapper`). Including the full rule is harmless (selectors simply match nothing now), but the intent is that `header` and `aside` transitions are active in this story. Keep the rule faithful to the mockup so feature stories don't have to re-add selectors.
- `--map-bg` is used as the `#map` background and also `.leaflet-container` background in the mockup; defining the `.leaflet-container` rule now is fine and prevents a flash later, but it has no effect until Leaflet renders.
- The font variables `--mono` and `--sans` are part of the `:root` block and must be carried over even though no element-specific typography beyond header/body is styled in this story — later stories (chips, stats, sliders) reference them.
- Color values use `oklch(...)` and `color-mix(in oklch, ...)`. These are modern CSS supported by current Chromium/Safari/Firefox; since this is a local-dev POC, no fallback is required. Copy them verbatim.
- The theme toggle's `aria-pressed` is hardcoded (`dark` = `true`, `light` = `false`) in this story; do not bind it to reactive state — that wiring is explicitly out of scope.
- Keep the `#map` element's ID exactly `map` (not a Vue-generated id) so STR-003's `L.map('map')` call works.
