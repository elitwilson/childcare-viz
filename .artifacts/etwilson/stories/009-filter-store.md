---
id: STR-009
title: Filter store
epic: EPIC-003
status: complete
priority: high
---

## Goal

Introduce `useFilterStore` as the single source of truth for sidebar filter state. Decouples sidebar UI (STR-012) from map rendering (STR-010) — both read from the same store rather than passing props or events across siblings.

---

## Scope

### In
- New Pinia store `useFilterStore` (setup store style)
- `activeTypes: ref<Record<LicenseType, boolean>>` — all three types enabled by default
- `minCapacity: ref<number>` — defaults to 0
- Store is **not** persisted

### Out
- Any UI components
- Any map integration
- `pinia-plugin-persistedstate` (that's STR-008)

---

## Acceptance Criteria

- [ ] `useFilterStore` is importable and returns `activeTypes` and `minCapacity`
- [ ] Toggling a key in `activeTypes` is reactive — watchers on the store fire when a value changes
- [ ] `minCapacity` defaults to 0
- [ ] All three `LicenseType` values default to `true` in `activeTypes`
- [ ] Unit tests cover initial state, toggling a type, and updating `minCapacity`

---

## Context & Decisions

- `activeTypes` **must** be `ref<Record<LicenseType, boolean>>`, not `ref<Set<LicenseType>>`. Vue 3 tracks property assignments on a ref'd plain object but does not track `.add()`/`.delete()` mutations on a ref'd Set — chips would silently fail to trigger reactivity.
- Store is not persisted — filter state resets on every page load intentionally. Return visitors should not arrive at a pre-filtered map.

---

## Dependencies

- **Depends on:** none
- **Blocks:** STR-010 (map watches this store), STR-012 (sidebar binds to this store)

---

## Notes

- Follow the setup store pattern already used in `useProviderStore` — `ref` for state, plain `function` for actions, explicit return object
