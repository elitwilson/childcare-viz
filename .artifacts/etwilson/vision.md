# Vision: Michigan Childcare Access Map

> A Vue 3 implementation of a Claude Code Design mockup — interactive map of real Michigan licensed childcare providers with density and filtering controls.

---

## Problem Statement

This is a proof-of-concept demo to showcase the Claude Code + Claude Design workflow: take an HTML/CSS/JS prototype produced by the AI design tool and faithfully rebuild it in a production-ready Vue 3 + Vite stack against real data. The subject matter (Michigan childcare access) provides meaningful real-world data to replace the synthetic spike data, making the demo credible.

---

## Product Positioning

A local-dev Vue 3 SPA that replicates the "Michigan Childcare Access" spike design pixel-for-pixel, powered by real provider data from Michigan's public ArcGIS licensing API. The goal is a working demo that looks exactly like the mockup and uses live data — not a shipped product.

---

## Users & Personas

**Demo audience** — anyone evaluating the Claude Code + Claude Design workflow. The app itself has no end-user persona requirements beyond "it looks right and the data is real."

---

## Core Features

- Interactive Leaflet map centered on Michigan (both peninsulas), pan/zoom
- **Facilities view** — circle markers from real provider data, sized by capacity, colored by license type
- **Density view** — heatmap layer showing provider concentration
- Sidebar filter controls: view toggle, license-type chips, min-capacity slider, min-rating slider
- Live stats panel (facility count, total seats, avg rating) recomputing on filter change
- Facility click-through popup (name, city, type, capacity, ages, rating)
- Dark / light mode toggle with CARTO basemap swap
- Legend panel (type key for facilities view, gradient scale for density view)
- Data sourced from Michigan GIS ArcGIS FeatureServer (no auth, GeoJSON, no proxy needed)

---

## Explicit Non-Goals

- No county-level choropleth or polygon overlays
- No desert classification / per-capita ratio computation
- No Census population data integration
- No search by address or county
- No user accounts, saved filters, or data export
- No backend or server-side code of any kind
- No deployment, hosting, or production build target
- No mobile-specific layout or PWA support
- No features beyond what appear in the CC Design mockup

---

## Product Constraints

- Must run entirely in the browser — all data fetched client-side from public APIs
- No API keys or auth tokens required for any data source
- Local dev only — no deployment target

---

## Tech Stack

- **Vue 3** with `<script setup lang="ts">` Composition API
- **Vite** build tooling
- **Tailwind CSS** — utility layer for spacing/layout; CSS custom properties handle theming
- **Leaflet 1.9.4** — map engine (matches mockup)
- **leaflet.heat 0.2.0** — heatmap layer (matches mockup)
- **CARTO raster tiles** — dark + light basemaps, no key needed (matches mockup)
- **Michigan GIS ArcGIS FeatureServer** — real provider points, free GeoJSON REST API
- **Pinia** — state management (filters, view mode)
- **TypeScript** throughout

---

## Milestones & Phasing

### v1 — Working Demo
- Scaffold Vue 3 + Vite project
- Wrap Leaflet map in a Vue component
- Fetch real provider data from Michigan ArcGIS API on load
- Implement all sidebar controls (view toggle, type chips, sliders, reset)
- Implement facilities view (circle markers, popups)
- Implement density view (heatmap)
- Live stats panel
- Dark / light mode toggle with basemap swap
- Visual match to CC Design mockup

---

## Success Criteria

- **v1:** App runs locally, loads real Michigan provider data, all mockup controls work, visual output matches the CC Design spike design.

---

## Open Questions

_None — scope is fully resolved._
