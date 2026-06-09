# Decisions — map-store-leaflet-heat-types

## 2026-06-08

- Named local type alias `MapView` omitted from export per spec guidance: "exporting the type is not required by this story and can wait for the consumer story that needs it." Used inline union `'facilities' | 'density'` in the ref to avoid a noUnusedLocals failure if no consumer imports the exported type.
- No `init()`, `loading`, or `error` state per spec: store holds pure UI state with no async load.
- No persistence wiring per spec requirement.
