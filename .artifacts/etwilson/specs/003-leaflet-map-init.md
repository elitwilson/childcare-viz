---
number: 003
story: STR-003
status: ready
base_branch: main
depends_on: [STR-002]
scope_files:
  - src/components/MapView.vue
  - src/App.vue
---

# Feature: Leaflet Map Initialization

## Summary
Mount a functional Leaflet map inside the map-area container built in STR-002, rendering CARTO dark basemap tiles centered on Michigan with working pan and zoom. The map is initialized in `MapView.vue` on component mount and cleanly destroyed on unmount. A single hardcoded dark tile layer is sufficient — no theme-driven basemap swapping, no markers, no heatmap, no Pinia. This story completes EPIC-001: `npm run dev` opens the browser and a developer sees a live, interactive Michigan map.

---

## Requirements
- On mount, `MapView.vue` initializes a Leaflet map instance bound to the `#map` element and centers it on Michigan at `[44.6, -85.6]`, zoom `6`.
- The map applies a single CARTO `dark_all` tile layer with the attribution string `&copy; OpenStreetMap &copy; CARTO`.
- Map zoom is constrained to `minZoom: 5`, `maxZoom: 13` (matching the mockup map options).
- The map fills its container: 100% width and 100% height of the `map-wrap` grid cell, with no blank space and no overflow.
- Pan and zoom work via mouse/trackpad, and Leaflet's built-in zoom control is visible.
- On unmount, the Leaflet map instance is destroyed (`map.remove()`) so no event listeners or DOM remain — no memory leak across re-mounts.
- Loading and interacting with the map produces no console errors.

---

## Scope

### In Scope
- A `MapView.vue` SFC (`<script setup lang="ts">`) that owns the Leaflet lifecycle: create in `onMounted`, destroy in `onUnmounted`.
- The single CARTO dark tile layer wired with correct subdomains and attribution.
- Importing `leaflet/dist/leaflet.css` so Leaflet renders correctly (controls, container).
- Placing `MapView.vue` into the map area defined by STR-002 (replacing or owning the `#map` placeholder).
- The `#map` and `.map-wrap` sizing rules required for Leaflet to render in a flex/grid cell.

### Out of Scope
- The CARTO `light_all` tile layer and any theme-driven basemap swap (`setBasemap` pattern from the mockup) — not wired in this story.
- Any map layers: markers, point layers, `leaflet.heat` heatmap, legend, popups.
- Any controls beyond Leaflet's built-in zoom control.
- Pinia store integration — the map instance is local to the component.
- Map resize handling beyond what Leaflet does natively (no `invalidateSize` wiring unless required to avoid blank tiles — see Considerations).

---

## Technical Approach
- **Entry points / interfaces:**
  - `MapView.vue` — a self-contained SFC. Its template renders the map container; its `<script setup>` holds the Leaflet lifecycle. It is rendered inside the map area established by STR-002.
  - STR-002 placed a `<div id="map">` inside a `.map-wrap` container (either in `App.vue` or a `MapView.vue` stub). This story makes `MapView.vue` the owner of that container so the Leaflet instance and the DOM element live together.

- **Key modules / components:**
  - `MapView.vue` owns: the template `<div id="map">` (inside `.map-wrap` if `.map-wrap` lives in the component, or `App.vue` renders `<MapView />` inside its existing `.map-wrap`), the `L.map(...)` instance, the tile layer, and lifecycle teardown.
  - `App.vue` — if STR-002 left a raw `#map` placeholder in `App.vue`, replace it with `<MapView />`. Match whichever placement STR-002 actually produced; verify before editing.

- **Data model:** None. The Leaflet `Map` instance is held in a module-local `ref` (or plain `let` in setup scope); no reactive state, no store.

- **Key design decisions:**
  - **Initialize in `onMounted`, not setup body** — `L.map('map')` (or `L.map(elRef.value)`) requires the DOM element to exist; calling it before mount throws.
  - **Bind to the element, not just the id string** — prefer a template ref (`const mapEl = ref<HTMLElement>()`) passed to `L.map(mapEl.value!, ...)` over the string id `'map'`, so the component does not depend on a globally-unique `#map` id and is robust to re-mount. Keep `id="map"` on the element too if STR-002's CSS (`#map { width:100%; height:100% }`) targets it by id.
  - **Single hardcoded dark layer** — the mockup's `setBasemap(theme)` swap and `BASEMAPS` map are deliberately not implemented; one `L.tileLayer(dark_all, ...)` `.addTo(map)` call is the whole tile setup.
  - **Tile options match the mockup exactly:** `subdomains: 'abcd'`, tile-level `maxZoom: 19`, `attribution: '&copy; OpenStreetMap &copy; CARTO'`. Note the tile `maxZoom: 19` is distinct from the map's `maxZoom: 13` — keep both as in the mockup.
  - **CSS import location:** import `leaflet/dist/leaflet.css` once. Importing it inside `MapView.vue`'s `<script setup>` (`import 'leaflet/dist/leaflet.css'`) keeps the dependency colocated; importing it in `main.ts` is equally acceptable. Either is fine — just ensure it is imported exactly once and before the map renders.
  - **Teardown via `map.remove()`** in `onUnmounted` — releases listeners and DOM, preventing the "map container already initialized" error and memory leaks on HMR / re-mount.

---

## Success Criteria
- [ ] `npm run dev` opens the browser and the Leaflet map renders with CARTO dark tiles.
- [ ] The map is centered on Michigan at zoom 6 and shows both peninsulas.
- [ ] Pan (drag) and zoom (scroll / +/− control) work smoothly.
- [ ] The map fills the entire map area — no blank gutter, no scrollbar/overflow.
- [ ] Zoom is bounded: cannot zoom out past 5 or in past 13.
- [ ] No console errors on initial load or during pan/zoom interaction.
- [ ] Navigating away/back (or HMR edit) re-mounts the map without the "Map container is already initialized" error — confirming clean teardown.

---

## Tasks
Ordered by dependency.

- [ ] **Verify STR-002 map-area structure:** Read `App.vue` (and any `MapView.vue` stub STR-002 produced) to confirm where the `.map-wrap` / `#map` placeholder lives and what CSS targets it (`#map { width:100%; height:100% }`, `.map-wrap { position:relative; min-height:0 }`). This determines whether `MapView.vue` owns `.map-wrap` + `#map` or just `#map` inside `App.vue`'s existing `.map-wrap`. Do not assume — match the actual output.

- [ ] **Build `MapView.vue` skeleton:** Create/replace `MapView.vue` as a `<script setup lang="ts">` SFC with a template `<div id="map" ref="mapEl"></div>` (wrapped in `.map-wrap` only if that wrapper is not already in `App.vue`). Import `leaflet/dist/leaflet.css` and `import L from 'leaflet'`. Render `<MapView />` from `App.vue` in the map area, removing any raw `#map` placeholder STR-002 left there. Confirm `npm run dev` shows the sized (empty) container with no console errors.

- [ ] **Initialize the Leaflet map and tile layer:** In `onMounted`, create `L.map(mapEl.value!, { zoomControl: true, attributionControl: true, minZoom: 5, maxZoom: 13 }).setView([44.6, -85.6], 6)`, then add `L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 19 })`. Hold the map in a setup-scoped `let map: L.Map | null`. Verify tiles render, the map is centered on Michigan, and pan/zoom work. Must be working before teardown is added.

- [ ] **Wire teardown and verify lifecycle:** In `onUnmounted`, call `map?.remove()` and null the reference. Verify via HMR edit (or a temporary `v-if` toggle on `<MapView />`) that the map re-mounts cleanly with no "already initialized" error and no console errors. Confirm zoom bounds (5–13) and full-container fill one final time.

---

## Considerations
- **Sized container is mandatory:** Leaflet renders a blank/grey map if the container has zero height at init time. STR-002 should give `#map` `height: 100%` inheriting from the grid cell; if tiles render blank or half-tiled on first paint, the container was unsized at `onMounted` — confirm the grid cell resolves to a real height before debugging Leaflet itself.
- **`invalidateSize` only if needed:** If the map mounts inside a container whose size settles after layout (rare here, since the grid cell is sized synchronously), a single `map.invalidateSize()` after `onMounted` / `nextTick` fixes a half-rendered tile grid. Add it only if the symptom appears — do not add preemptively.
- **`{r}` retina suffix:** The CARTO URL includes `{r}` for retina tiles; Leaflet resolves it automatically. Keep it in the URL exactly as the mockup has it.
- **Tile `maxZoom: 19` vs map `maxZoom: 13`:** These are intentionally different and both come straight from the mockup — the map constraint (13) governs user zoom; the tile option (19) is the layer's own max. Do not "reconcile" them to a single value.
- **Do not import `leaflet.heat`:** It is installed (STR-001) but unused here. Importing it now adds a heat layer dependency this story does not need.
- **Element id vs template ref:** Keep `id="map"` for STR-002's CSS, but pass the resolved element (template ref) to `L.map()` rather than the `'map'` string — this avoids reliance on a single global id and is friendlier to HMR re-mounts.
