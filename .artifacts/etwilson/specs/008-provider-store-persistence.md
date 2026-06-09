---
number: 008
story: STR-008
status: complete
base_branch: main
depends_on: []
scope_files:
  - package.json
  - src/main.ts
  - src/stores/providers.ts
  - src/stores/providers.test.ts
---

# Feature: Provider Store Persistence

## Summary
Adds localStorage caching to `useProviderStore` so the app skips the ArcGIS API fetch on repeat visits within 24 hours. On first load `init()` fetches ~7,700 providers and writes them to localStorage; on reload within the TTL window `init()` returns immediately from the cached, persisted state without hitting the network. This is achieved with the `pinia-plugin-persistedstate` plugin (which rehydrates store state from localStorage before `init()` runs) plus a freshness guard in `init()` that keys off a persisted `fetchedAt` timestamp. Unblocks STR-010, which needs providers loaded fast at startup.

---

## Requirements
- On first load (empty localStorage), `init()` fetches from the API, populates `providers`, sets `initialized` and `fetchedAt`, and persists those fields to localStorage under key `mca-providers`.
- On reload within 24 hours, `init()` returns without making an API request because the plugin has rehydrated `providers`/`initialized`/`fetchedAt` and the freshness check passes.
- After 24 hours (or after localStorage is manually cleared), `init()` fetches again and rewrites the cache.
- The freshness window is exactly 24 hours: `Date.now() - fetchedAt < 86_400_000`.
- Only `useProviderStore` is persisted. No other store gains persistence.
- Existing `useProviderStore` unit tests continue to pass, accounting for the new `fetchedAt` field and the TTL-aware `init()` guard.

---

## Scope

### In Scope
- Install `pinia-plugin-persistedstate` at **v4** (Pinia 3 compatible) as a dependency.
- Register the plugin on the Pinia instance in `src/main.ts`.
- Add `fetchedAt: ref<number | null>(null)` to `useProviderStore`, set to `Date.now()` on successful fetch, and include it in the store's returned surface.
- Configure `persist` on `useProviderStore` to persist `providers`, `initialized`, and `fetchedAt` to localStorage under key `mca-providers`.
- Update the `init()` guard: skip the fetch when `initialized` is true AND `fetchedAt` is non-null AND the cache is under 24 h old; otherwise fetch.
- Update `providers.test.ts` to cover the rehydration-skip and stale-refetch behavior and to account for `fetchedAt`.

### Out of Scope
- Persisting any other store (`useFilterStore` is explicitly NOT persisted — STR-009).
- Cache invalidation beyond TTL (no version-keyed busting).
- Error handling for corrupted, oversized, or unavailable localStorage entries.
- Changing the API/transform layer or the `Provider` shape.

---

## Technical Approach
- **Entry points / interfaces:**
  - `src/main.ts` — create the Pinia instance, register `piniaPluginPersistedstate`, then `app.use(pinia)`.
  - `src/stores/providers.ts` — `useProviderStore.init()` is the public entry the rest of the app calls; the new `fetchedAt` ref joins the returned surface.
- **Key modules / components:**
  - `pinia-plugin-persistedstate` owns serialization/rehydration to/from localStorage. It rehydrates persisted refs synchronously when the store is first instantiated, so by the time `init()` runs, `providers`/`initialized`/`fetchedAt` already reflect the cached values.
  - `useProviderStore` owns the freshness decision in application code (`init()`), not the plugin. The plugin is configured only with `key` and `pick` (the list of persisted paths).
- **Data model:**
  - New store state: `fetchedAt: Ref<number | null>` — epoch millis of the last successful fetch, or `null` if never fetched.
  - Persisted payload under `mca-providers`: `{ providers: Provider[], initialized: boolean, fetchedAt: number | null }`. `providers` is ~1.5 MB JSON (~7,700 × ~200 bytes) — within localStorage limits.
- **Key design decisions:**
  - Persist config uses the v4 `pick` option (the v4 name; older docs say `paths`) to whitelist exactly `['providers', 'initialized', 'fetchedAt']`. `loading` and `error` are transient and must not be persisted.
  - TTL lives in `init()` so no custom serializer/plugin hook is needed; the plugin config stays minimal.
  - `fetchedAt` is persisted alongside `providers` so the freshness check survives reloads — without it, a rehydrated `initialized: true` would wrongly suppress refetch forever.
  - Register the plugin via a `createPinia()` instance variable in `main.ts` (rather than inline) so the `.use()` call reads cleanly.

---

## Success Criteria
- [ ] `pnpm ls pinia-plugin-persistedstate` reports a 4.x version.
- [ ] `src/main.ts` registers the persistedstate plugin on the Pinia instance before mount.
- [ ] First `init()` with empty localStorage performs one API fetch and leaves `mca-providers` in localStorage containing `providers`, `initialized: true`, and a numeric `fetchedAt`.
- [ ] Second `init()` on a store rehydrated with a fresh (<24 h) `fetchedAt` performs zero API fetches.
- [ ] `init()` on a store rehydrated with a stale (>24 h) `fetchedAt` performs exactly one API fetch and updates `fetchedAt`.
- [ ] `vitest` passes for `src/stores/providers.test.ts` including the new cases.

---

## Tasks
Ordered by dependency.

- [ ] **Install and register the plugin:** Add `pinia-plugin-persistedstate@^4` to `package.json` dependencies (install via pnpm) and register it in `src/main.ts` — `const pinia = createPinia(); pinia.use(piniaPluginPersistedstate); app.use(pinia);`. Verify the installed version is 4.x.
- [ ] **Add `fetchedAt` and persist config to the store:** In `src/stores/providers.ts` add `const fetchedAt = ref<number | null>(null)`, set `fetchedAt.value = Date.now()` on successful fetch (alongside `initialized.value = true`), return `fetchedAt` from the store, and pass the store options object `{ persist: { key: 'mca-providers', pick: ['providers', 'initialized', 'fetchedAt'] } }` as the third argument to `defineStore`.
- [ ] **Add the TTL guard to `init()`:** Replace the `if (initialized.value) return;` early-return with a freshness check: return early only when `initialized.value && fetchedAt.value !== null && Date.now() - fetchedAt.value < 86_400_000`. Otherwise proceed to fetch. Fully test before moving on.
- [ ] **Update store tests:** In `src/stores/providers.test.ts`, update existing expectations for the new `fetchedAt` field where relevant, and add cases: (a) fresh rehydrated cache → `init()` does not call `fetchAllProviders`; (b) stale rehydrated cache (`fetchedAt` > 24 h ago) → `init()` fetches once. Drive these by seeding the store's persisted state (e.g. setting `localStorage['mca-providers']` before instantiating, or setting `fetchedAt`/`initialized`/`providers` directly) — jsdom provides localStorage in this config.

---

## Considerations
- **`pick` vs `paths`:** v4 renamed the whitelist option to `pick`. Using the v3 `paths` name silently persists nothing matched and the cache will not work. Confirm against installed v4 types.
- **No `test` script exists yet:** `package.json` has no `test` script — run the suite with `pnpm exec vitest run` (or `pnpm vitest run`). Consider whether adding a `"test": "vitest run"` script is in scope; the story does not require it, so do not add it unless trivially warranted.
- **Rehydration timing:** The plugin rehydrates state when the store is instantiated. `init()` must read `initialized`/`fetchedAt` (not assume a clean slate), which the new guard already does. Tests must instantiate the store *after* seeding localStorage for rehydration to take effect.
- **TTL math via stale timestamp:** To exercise the stale path in tests, set `fetchedAt` to `Date.now() - 86_400_001` (or older) rather than mocking timers, unless mocking `Date.now` is cleaner for the existing test style.
- **localStorage isolation between tests:** Because tests now touch real localStorage, clear it in `beforeEach` (e.g. `localStorage.clear()`) alongside the existing `setActivePinia(createPinia())` so cases don't leak cached state into one another.
- **Transient fields stay out:** Never persist `loading`/`error` — a persisted `loading: true` would render the app stuck on a stale loading state after reload.
