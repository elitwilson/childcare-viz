# Review Notes — 003-leaflet-map-init

## Write failing tests covering Leaflet map initialization, tile layer setup, zoom constraints, and lifecycle teardown

## Verdict: APPROVED

**Task:** Write failing tests covering Leaflet map initialization, tile layer setup, zoom constraints, and lifecycle teardown
**Spec:** .artifacts/etwilson/specs/003-leaflet-map-init.md

**Scope issues:** none — only `src/components/MapView.test.ts` was modified, which is colocated with the in-scope `src/components/MapView.vue`

**Coverage gaps:** none — all requirements are covered:
- Map element rendered (`#map` inside `.map-wrap`) ✓
- `L.map()` called on mount with the DOM element (not string id) ✓
- `setView([44.6, -85.6], 6)` ✓
- `minZoom: 5`, `maxZoom: 13` map options ✓
- CARTO dark URL with `cartocdn.com` and `dark_all` ✓
- Tile options: `attribution`, `subdomains: 'abcd'`, `maxZoom: 19` ✓
- Tile layer added to map ✓
- `map.remove()` called on unmount ✓
- New map instance created on re-mount (confirms teardown + re-init) ✓
