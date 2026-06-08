---
id: EPIC-001
title: Project Setup & Launchable Dev App
status: ready
created: 2026-06-08
---

## Goal
Scaffold the Vue 3 + Vite + TypeScript project from scratch and get it to a launchable local dev state: `npm run dev` opens the browser, the app renders the correct layout shell (header, sidebar, map area), and a Leaflet map with CARTO tiles is initialized and functional. No feature work — just a working skeleton a developer can build on.

---

## Scope In
- `npm create vite` with Vue 3 + TypeScript template
- Install and configure core deps: Pinia, Leaflet 1.9.4, leaflet.heat 0.2.0, @types/leaflet
- App layout shell matching the CC Design mockup structure: header bar, left sidebar, map area (CSS grid, no content yet)
- CSS custom properties for dark/light theming (variables from the mockup, dark as default)
- Leaflet map component initialized in the map area, rendering CARTO dark basemap tiles
- `npm run dev` launches and shows the map — pan and zoom work

## Scope Out
- Real Michigan GIS provider data fetching
- Filter controls (type chips, sliders, reset button)
- Facilities view (circle markers, popups)
- Density / heatmap view
- Stats panel logic
- Dark/light mode toggle wiring (CSS vars can be defined, but toggle button not functional)
- Any Pinia store logic beyond initial project wiring

---

## Key Decisions
- **Stack:** Vue 3 Composition API (`<script setup lang="ts">`), Vite, TypeScript — no options API
- **Map engine:** Leaflet 1.9.4 + leaflet.heat 0.2.0, loaded as npm packages (not CDN)
- **Basemap:** CARTO dark_all tiles, no API key required
- **State:** Pinia installed and wired but stores are empty stubs — real state comes in feature epics
- **Layout:** CSS grid matching the mockup (320px sidebar + `1fr` map), no component library
- **Theming:** CSS custom properties defined at `:root` and `html[data-theme="light"]` as in the mockup — not wired to a toggle yet
- **Local dev only:** No deployment config, no CI, no build optimizations
