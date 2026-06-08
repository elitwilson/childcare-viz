---
id: STR-006
title: Pinia Provider Store
epic: EPIC-002
status: open
priority: high
---

## Goal

Build `useProviderStore` — the single source of truth for provider data in the app. The store calls the service layer, transforms results, and exposes reactive state (`providers`, `loading`, `error`, `initialized`) that all future feature stories read from.

---

## Scope

### In
- `src/stores/providers.ts` — Pinia setup store `useProviderStore` with:
  - State: `providers: Provider[]`, `loading: boolean`, `error: string | null`, `initialized: boolean`
  - Action: `init()` — guarded with `if (initialized) return`; sets `loading`, calls `fetchAllProviders()`, maps results through `transformProvider()` (filtering nulls), sets `providers`, handles errors into `error`, always clears `loading` in `finally`
- Unit tests covering: init loads providers, init guard prevents second fetch, loading/error state transitions, null transforms filtered out

### Out
- No computed getters or filtering logic (sidebar controls epic)
- No component wiring (STR-007)
- No retry logic

---

## Acceptance Criteria

- [ ] `useProviderStore().providers` is populated after `init()` resolves
- [ ] `loading` is `true` during fetch and `false` after (both success and error)
- [ ] `initialized` is `true` after first successful `init()`, preventing re-fetch
- [ ] Calling `init()` a second time while `initialized` is `true` does not trigger a new fetch
- [ ] A fetch error sets `error` to a non-null string and leaves `providers` as `[]`
- [ ] `null` results from `transformProvider` are filtered out and do not appear in `providers`
- [ ] All unit tests pass

---

## Context & Decisions

- Use Pinia setup store form (not options store) — matches project convention
- `init()` is the only public action; components call `store.init()`, not `store.fetchProviders()` directly
- `error` stores a human-readable message string, not the raw Error object
- Use `setActivePinia(createPinia())` in `beforeEach` to isolate store state between tests
- Mock `fetchAllProviders` at the module boundary with `vi.mock` — do not let tests hit the real network
- `transformProvider` should also be mockable but its behavior can be tested through the store by controlling `fetchAllProviders`'s return value

---

## Dependencies

- **Depends on:** STR-005 (needs `fetchAllProviders` and `transformProvider`)
- **Blocks:** STR-007 (DevDataView needs the store)

---

## Notes

The store should import `fetchAllProviders` from `../services/childcareApi` and `transformProvider` from `../services/childcareTransform` — not inline any fetch or transform logic itself. Keep the store thin: async coordination and state only.
