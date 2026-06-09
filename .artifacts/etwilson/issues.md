# Known Issues

## ~~Small circle unreachable when enveloped by a larger circle~~ — FIXED

**Fixed in:** `useMapMarkers.ts` `buildGroup()` — providers now sorted by capacity descending before insertion into the layer group. Canvas hit-testing iterates in reverse insertion order, so smaller markers (inserted last) receive click priority even when visually enclosed by a larger one.

---

## Accidental zoom while dragging on Magic Mouse / trackpad

**Description:** On a Magic Mouse (and likely trackpads), slight finger movement while holding the mouse button to pan the map fires scroll events, causing unintended zoom during drag.

**Status:** FIXED — `MapView.vue` now disables scroll-wheel zoom on `mousedown` and re-enables it on `mouseup` and `mouseleave`. Standard mice are unaffected.

---
