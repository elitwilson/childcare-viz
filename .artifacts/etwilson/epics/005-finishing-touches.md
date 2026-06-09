---
id: EPIC-005
title: Finishing Touches — Stats, Reset, Theme & Polish
status: ready
created: 2026-06-09
---

## Goal

Complete the app to match the CC Design mockup: add the live stats panel, reset button, dark/light theme toggle with basemap swap, empty-state overlay, and visual polish to bring the sidebar and legend in line with the mockup's styling. After this epic the app is feature-complete against the mockup.

---

## Scope In

- **Stats panel** — "Showing" sidebar section with two live stats computed from the current filtered provider list:
  - Facility count ("facilities on map")
  - Total licensed seats (sum of `capacity`)
  - No avg-rating stat — rating data is unavailable in the real API (deferred to a future cycle)
- **Reset all filters button** — bottom of sidebar; resets `activeTypes` (all true) and `minCapacity` (0) via `useFilterStore`
- **Dark/light theme toggle** — wire up the placeholder button in `AppHeader`; sets `data-theme` on `<html>`, swaps CARTO basemap (dark_all ↔ light_all), persists to localStorage
- **Empty state overlay** — absolute-positioned note inside `.map-wrap` ("No facilities match these filters.") displayed when the filtered visible provider list is empty; hidden otherwise
- **Sidebar visual polish** — bring `.seg` control and `.chip` styling closer to the mockup:
  - Seg control: pill-container style (`background: var(--bg); padding: 4px; border-radius: 9px; border: 1px solid var(--line)`) with gap between buttons; active button uses `var(--panel-2)` background
  - `.dot` span inside each seg button (small circle, teal when active)
  - Chip hover state: `border-color: var(--ink-faint)` on hover
- **Legend density label** — update to "sparse · 'desert'" / "dense" to match mockup exactly

## Scope Out

- Min-rating slider — no real quality rating data in the LARA API (Great Start to Quality ratings are a separate Michigan dataset; defer to future cycle)
- Avg quality rating stat — same reason
- Head Start facility type — not present in the real LARA API data; only appeared in the mockup's synthetic data
- Any feature not visible in the CC Design mockup HTML
- Mobile layout, dark/light basemap CSS (only the CARTO URL changes; CSS theming via `data-theme` is already in `style.css`)

---

## Key Decisions

- **Stats computed from `useFilterStore`**: the stats panel reflects the same filtered provider list the map shows. It reads from `useProviderStore.providers` filtered through `useFilterStore` — no new store needed; a computed in a `useStats` composable or directly in `AppSidebar` is sufficient.
- **Theme state in a composable, not a Pinia store**: theme toggle interacts with the DOM (`<html>` attribute) and localStorage directly. A `useTheme` composable (not a Pinia store) keeps this concern isolated; components call `useTheme()` to get current theme and toggle.
- **CARTO basemap swap lives in `MapView`**: `MapView` watches the theme ref from `useTheme` and replaces the tile layer when it changes. Light URL: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`.
- **localStorage key**: `mca-theme`, matching the mockup. Default is `'dark'`.
- **Empty state**: visibility driven by a computed `filteredProviders.length === 0` in the component or composable that already owns the filtered list — no new store state.
- **Reset resets `useFilterStore` only**: the view toggle (`useMapStore.activeView`) is not reset — it stays wherever zoom left it. Only `activeTypes` and `minCapacity` are reset.
- **Avg rating stat omitted**: the "Showing" section shows count + seats only. The rating row from the mockup is not implemented — no placeholder, no "—" display — simply not present until rating data exists.
