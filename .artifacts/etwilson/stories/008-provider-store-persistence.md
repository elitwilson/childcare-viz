---
id: STR-008
title: Provider store persistence
epic: EPIC-003
status: open
priority: high
---

## Goal

Add localStorage caching to `useProviderStore` so the app skips the API fetch on repeat visits within 24 hours. Unblocks STR-010 which needs providers loaded fast at startup.

---

## Scope

### In
- Install `pinia-plugin-persistedstate` v4
- Register the plugin in `main.ts`
- Add `fetchedAt: ref<number | null>(null)` to `useProviderStore`; set it on successful fetch
- Configure `persist` on `useProviderStore` to write `providers`, `initialized`, and `fetchedAt` to localStorage under key `mca-providers`
- Guard `init()`: skip fetch if `initialized` is true and cache is under 24 h old (`Date.now() - fetchedAt < 86_400_000`)

### Out
- Persisting any other store
- Cache invalidation beyond TTL (e.g. version-keyed busting)
- Error handling for corrupted/oversized localStorage entries

---

## Acceptance Criteria

- [ ] On first load, `init()` fetches from the API and writes providers to localStorage
- [ ] On reload within 24 h, `init()` returns without making an API request (observable via network tab)
- [ ] After 24 h (or manually clearing localStorage), `init()` fetches again
- [ ] `useProviderStore` unit tests pass with the new `fetchedAt` field accounted for

---

## Context & Decisions

- Must install `pinia-plugin-persistedstate` **v4** — v3 does not support Pinia 3 and will silently fail
- TTL guard lives in `init()` application code, not in a plugin serializer — no custom plugin config needed
- `fetchedAt` is persisted alongside `providers` so the freshness check survives page reloads
- `useFilterStore` (STR-009) is explicitly NOT persisted — only `useProviderStore` gets this treatment

---

## Dependencies

- **Depends on:** none
- **Blocks:** STR-010 (markers need providers loaded at startup)

---

## Notes

- The `providers` array is ~7,700 items × ~200 bytes ≈ 1.5 MB JSON — well within localStorage limits but worth knowing
- Existing `useProviderStore` tests may need updating to account for the new `fetchedAt` field and the updated `init()` guard logic
