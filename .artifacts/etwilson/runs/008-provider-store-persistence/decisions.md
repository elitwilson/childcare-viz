# Decisions — 008-provider-store-persistence

## Assumption: pinia-plugin-persistedstate v4 `pick` option
The spec explicitly calls out that v4 renamed the whitelist option from `paths` to `pick`. Using `pick` as documented in the spec.

## Assumption: no `test` script added to package.json
The spec notes no `test` script exists and says do not add it unless trivially warranted. Running tests with `pnpm exec vitest run`.

## Assumption: localStorage.clear() added in beforeEach
Since tests now interact with real localStorage (jsdom), adding `localStorage.clear()` alongside `setActivePinia(createPinia())` in the test `beforeEach` to prevent state leakage between tests.

## Assumption: TTL test uses timestamp arithmetic
Stale-cache test sets `fetchedAt` to `Date.now() - 86_400_001` directly on the store rather than mocking timers, consistent with spec guidance and keeping test style simple.
