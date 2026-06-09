---
feature: 014-heat-layer-zoom-autoswitch-visibility
---

# Decisions

## MapView.vue location
The spec references `src/views/MapView.vue` but the file actually lives at `src/components/MapView.vue`. Applying changes to the actual file path.

## leaflet-heat import
`@types/leaflet.heat` augments the `L` namespace directly — `L.heatLayer(...)` is available without a separate import once `leaflet.heat` is imported as a side-effect. The implementation imports `leaflet.heat` via `import 'leaflet.heat'`.

## heatLayer mock shape
The mock exposes `setLatLngs`, `addTo`, `addLayer` (inherited from TileLayer/Layer) spies. The `addTo` pattern is used for heat layer because Leaflet `HeatLayer` extends `TileLayer`. The composable uses `map.addLayer`/`map.removeLayer` (not `addTo`) for consistency with the groups pattern.
