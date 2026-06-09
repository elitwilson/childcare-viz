# Decisions — 007-dev-data-view

## Combined task 1+2 commit

Tasks 1 (Create DevDataView.vue) and 2 (Wire App.vue) were committed together because:
- App.vue tests require DevDataView to be stubbed/present at the same time
- The two files form an atomic unit: App.vue imports DevDataView, so neither is independently shippable
- Splitting would have required a broken intermediate state on main

## App.vue: dropped storeToRefs

App.vue reads `store.loading` and `store.error` directly in the template rather than destructuring with `storeToRefs`. Reason: `storeToRefs` throws when called with a plain mock object in tests. Direct property access on the reactive store proxy is equally reactive in production and avoids the test-compat issue.

## Live ArcGIS API returns 400 during end-to-end verification

During manual verification, the ArcGIS FeatureServer endpoint (`services1.arcgis.com/.../MichiganChildCareProviders/FeatureServer/0`) returns HTTP 200 with `{"error":{"code":400,"message":"Invalid URL"}}` for all requests. This causes `data.features.map(...)` to throw `TypeError: Cannot read properties of undefined (reading 'map')` in `fetchPage`. This is a pre-existing data availability issue from STR-005.

The STR-007 error path works correctly: the store catches the error and sets `error = "Cannot read properties of undefined (reading 'map')"`, and App.vue renders `Error: {message}`. This satisfies the spec requirement for error display.

The "no console errors during a normal load" and "~7,700 rows" acceptance criteria cannot be verified until the ArcGIS service is accessible. This needs human review.

## DevDataView.vue: storeToRefs retained

DevDataView.vue uses `storeToRefs` for `providers` because it's only tested manually (no unit tests per spec), so there's no mock-compat constraint.

## App tests: DevDataView stubbed

The App.test.ts stubs `./components/DevDataView.vue` to prevent it from calling `useProviderStore` during App-level tests. This keeps App tests focused on App.vue's own logic (init call, conditional rendering) without coupling to DevDataView's store dependency.
