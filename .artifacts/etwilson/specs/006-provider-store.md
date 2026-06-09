---
number: 006
story: STR-006
status: complete
base_branch: main
depends_on: [STR-005]
scope_files:
  - src/stores/providers.ts
  - src/stores/providers.test.ts
---

# Feature: Pinia Provider Store

## Summary
`useProviderStore` is the single source of truth for childcare provider data across the app. It composes the service and transform layers from EPIC-002: on `init()` it calls `fetchAllProviders()`, maps each raw record through `transformProvider()` (dropping `null` results), and exposes reactive `providers`, `loading`, `error`, and `initialized` state. Every future feature story (map markers, sidebar filters, the dev table) reads from this store rather than touching the API directly. The store itself is thin — it owns async coordination and state transitions only, with no fetch or transform logic inlined.

---

## Requirements
- The store exposes reactive state: `providers: Provider[]` (initially `[]`), `loading: boolean` (initially `false`), `error: string | null` (initially `null`), `initialized: boolean` (initially `false`).
- `init()` is the sole public action; it loads providers by calling `fetchAllProviders()` and transforming results.
- After `init()` resolves successfully, `providers` is populated with the transformed, non-null records and `initialized` is `true`.
- `loading` is `true` while a fetch is in flight and `false` after it settles — on both the success and error paths.
- Calling `init()` a second time while `initialized` is `true` does not trigger another fetch (guarded early return).
- A fetch failure sets `error` to a non-null human-readable string, leaves `providers` as `[]`, and clears `loading`.
- `null` results returned from `transformProvider` are filtered out and never appear in `providers`.

---

## Scope

### In Scope
- `src/stores/providers.ts` — Pinia setup store `useProviderStore`.
- `src/stores/providers.test.ts` — unit tests (mocking the service/transform module boundary).

### Out of Scope
- No computed getters or filtering logic (belongs to the sidebar/controls epic).
- No component wiring (STR-007 DevDataView).
- No retry logic or caching.
- No `useProviders` composable.
- No changes to the service or transform layers (delivered by STR-005).

---

## Technical Approach
- **Entry points / interfaces:** `export const useProviderStore = defineStore('providers', () => { ... })` using the Pinia **setup-store** form (project convention; `createPinia()` is already wired in `src/main.ts`). The only exported action is `init()`.
- **Composition:** The store imports `fetchAllProviders` from `../services/childcareApi` and `transformProvider` from `../services/childcareTransform`. Per STR-005 these have signatures `fetchAllProviders(): Promise<RawProvider[]>` and `transformProvider(raw: RawProvider): Provider | null`. The store does not inline any fetch or transform logic.
- **`init()` flow:**
  1. `if (initialized.value) return;` — guard against re-fetch.
  2. `loading.value = true`, `error.value = null`.
  3. `try`: `const raw = await fetchAllProviders();` then map through `transformProvider` and drop nulls — e.g. `providers.value = raw.map(transformProvider).filter((p): p is Provider => p !== null);` then `initialized.value = true`.
  4. `catch (e)`: set `error.value` to a human-readable string (derive from `e instanceof Error ? e.message : String(e)`), leave `providers.value` as `[]`. Do not set `initialized` (allows a later retry via re-calling `init()`).
  5. `finally`: `loading.value = false`.
- **Data model:** consumes `Provider` from `src/types/provider.ts` (STR-004); no new types introduced.
- **Key design decisions:**
  - `error` holds a string message, not the raw `Error` object — components render a message, not an exception.
  - `initialized` is set only on the success path so a failed first load can be retried.
  - State as `ref`, getters as `computed` (none here), action as a plain `async function` — per the project's Pinia conventions.
  - No `any` in production code.

---

## Success Criteria
- [ ] `useProviderStore().providers` is populated with transformed records after `init()` resolves.
- [ ] `loading` is `true` during the fetch and `false` after it settles (success and error).
- [ ] `initialized` is `true` after a successful `init()`; a second `init()` call performs no additional fetch (asserted via mock call count).
- [ ] A fetch error sets `error` to a non-null string and leaves `providers` as `[]`.
- [ ] `null` results from `transformProvider` are excluded from `providers`.
- [ ] `vue-tsc --noEmit` passes; no `any` in production code.
- [ ] All unit tests pass.

---

## Tasks
Ordered by dependency.

- [ ] **Scaffold the store:** Create `src/stores/providers.ts` with `useProviderStore` setup store exposing `providers`, `loading`, `error`, `initialized` refs and an `init()` action skeleton (guard + loading/finally structure). Return the explicit public surface (`{ providers, loading, error, initialized, init }`). Stub `init()` body just enough to compile.
- [ ] **Write failing unit tests:** Create `src/stores/providers.test.ts`. Use `setActivePinia(createPinia())` in `beforeEach` to isolate state. `vi.mock('../services/childcareApi', ...)` and `vi.mock('../services/childcareTransform', ...)` to control return values at the module boundary — tests must not hit the network. Cover: (a) `init()` populates `providers` from mocked transformed results; (b) the `initialized` guard prevents a second `fetchAllProviders` call (assert call count is 1 after two `init()` calls); (c) `loading` is `true` mid-fetch and `false` after, on both success and error paths; (d) a rejected `fetchAllProviders` sets a non-null `error` string and leaves `providers` empty; (e) `null` results from `transformProvider` are filtered out. Verify tests fail for the right reasons before implementing.
- [ ] **Implement `init()`:** Fill in the action per the Technical Approach so all tests pass. Keep the store thin — async coordination and state only. Confirm `vue-tsc --noEmit` and the full test suite pass.

---

## Considerations
- **Mocking strategy:** Mock both `childcareApi` and `childcareTransform` at the module boundary. The cleanest path for the filter/transform assertions is to control `fetchAllProviders`'s resolved `RawProvider[]` and stub `transformProvider` to return a mix of `Provider` objects and `null` — this exercises the store's filtering without depending on real transform logic.
- **Loading-during-fetch assertion:** assert `loading === true` against the pending promise *before* awaiting it (capture the promise, check `loading`, then `await`), since `loading` is cleared in `finally`.
- **Retry semantics:** because `initialized` is set only on success, a failed load leaves the store re-callable. Don't add explicit retry logic — that's out of scope; just don't block re-calling `init()` after an error.
- **Dependency timing:** this story depends on STR-005's `fetchAllProviders` / `transformProvider` and STR-004's `Provider` type. If those modules don't yet exist when implementation starts, the executor's dependency ordering (`depends_on: [STR-005]`) should have run them first; the type-only imports will fail to compile otherwise.
- The `src/stores/` directory does not exist yet and will be created by this story.
