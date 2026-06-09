# Decisions — 011-provider-popup

## buildPopupHtml test location

**Spec says:** "Fully unit-test this function in `MapView.test.ts`"

**Actual placement:** Tests added to `useMapMarkers.test.ts` instead — resolved via `importActual` and placed in `MapView.test.ts` per reviewer sign-off (Task 2).

**Reason:** `MapView.test.ts` mocks the entire `../composables/useMapMarkers` module with `vi.mock(...)`. The `importActual` pattern threads `buildPopupHtml` through as the real export while keeping `useMapMarkers` mocked, making pure unit tests of the function viable in that file.

## popup binding test location (Task 3)

**Spec says:** `src/components/MapView.test.ts` is the test file for Task 3.

**Actual placement:** Tests added to `useMapMarkers.test.ts`.

**Reason:** Popup binding (`bindPopup` on each `circleMarker`) happens inside `useMapMarkers`, not in `MapView.vue`. In `MapView.test.ts`, `useMapMarkers` is replaced wholesale by a mock — the real marker-creation loop never runs, so `bindPopup` call assertions cannot be made there. `useMapMarkers.test.ts` is the only file where the real loop executes and where `mockCircleMarkerObj.bindPopup` can be observed. This is the same constraint that originally motivated the Task 2 deviation, and the same structural reason applies here. Flagged to reviewer; proceeding because no technically sound alternative exists within spec scope.
