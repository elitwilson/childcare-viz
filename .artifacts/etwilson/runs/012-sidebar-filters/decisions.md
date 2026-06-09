# Decisions — 012-sidebar-filters

## Assumptions

1. `LicenseType` enum uses const object pattern — `LicenseType.Center === 'center'`, etc. The spec's in-component mapping must use these string values as keys.
2. Test fixture will seed `useProviderStore.providers` directly (no `init()` call) since the sidebar is a consumer, not responsible for loading data.
3. `data-test` selectors used: `section-map-view`, `section-facility-type`, `section-filters`, `chip-{type}`, `slider-capacity`, `capacity-value`, `btn-facilities`, `btn-density`.

## Implementation notes

- Tasks 3 and 4 (template/script implementation + mockup styles) were committed together — the styles are inseparable from the markup they style.
- `toggleType` casts `filterStore.activeTypes` to `Record<string, boolean>` — needed because TypeScript infers the store's `activeTypes` with literal-type `LicenseType` keys, but the iterated `type` from the `licenseTypes` array is typed as `string`. All runtime values are valid `LicenseType` keys.
- Pre-existing failures in `MapView.test.ts` (`buildPopupHtml`) are from spec 011 (provider popup, not yet implemented) — out of scope for this spec.
