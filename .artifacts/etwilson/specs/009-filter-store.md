---
number: 009
story: STR-009
status: ready
base_branch: main
depends_on: []
scope_files:
  - src/stores/filters.ts
  - src/stores/filters.test.ts
---

# Feature: Filter Store

## Summary
Introduce `useFilterStore`, a Pinia setup store that is the single source of truth for the sidebar's filter state: which license types are active and the minimum-capacity threshold. It holds no UI and does no map work — it exists so the sidebar (STR-012) and the map (STR-010) read and mutate the same reactive state instead of passing props or events across sibling components. State is intentionally not persisted; it resets to defaults on every page load.

---

## Requirements
- `useFilterStore` is importable and returns `activeTypes` and `minCapacity` on its public surface.
- `activeTypes` is a `ref<Record<LicenseType, boolean>>` with all three `LicenseType` values (`center`, `group_home`, `family_home`) present and defaulting to `true`.
- `minCapacity` is a `ref<number>` defaulting to `0`.
- Assigning to a key of `activeTypes.value` (e.g. `activeTypes.value.center = false`) is reactive — watchers/computeds depending on the store observe the change.
- Updating `minCapacity.value` is reactive.
- The store is not registered with `pinia-plugin-persistedstate` and has no `persist` option — its state resets on reload.

---

## Scope

### In Scope
- New Pinia setup store at `src/stores/filters.ts`.
- `activeTypes: ref<Record<LicenseType, boolean>>`, all three types `true` by default.
- `minCapacity: ref<number>`, default `0`.
- Unit tests covering initial state, toggling a type, and updating `minCapacity`.

### Out of Scope
- Any UI components (sidebar chips, slider — STR-012).
- Any map integration or watchers (STR-010).
- `pinia-plugin-persistedstate` install/registration (STR-008).
- Toggle/reset action helpers — direct property assignment is sufficient for this story; no actions are required by the acceptance criteria.

---

## Technical Approach
- **Entry points / interfaces:** `export const useFilterStore = defineStore('filters', () => { ... })` in `src/stores/filters.ts`, mirroring the setup-store form of `useProviderStore` (`src/stores/providers.ts`).
- **Key modules / components:** Single file `src/stores/filters.ts`. Imports `LicenseType` (the type) and the `LicenseType` const object from `../types/provider` to build the default `activeTypes` record.
- **Data model:**
  - `activeTypes: Record<LicenseType, boolean>` — keys are the three `LicenseType` string literal values (`'center'`, `'group_home'`, `'family_home'`); all `true` initially.
  - `minCapacity: number` — `0` initially.
- **Key design decisions:**
  - `activeTypes` is a `ref` wrapping a plain object, **not** a `ref<Set<LicenseType>>`. Vue 3 tracks property assignment on a ref'd plain object but does not track `.add()`/`.delete()` on a ref'd `Set`, so a Set would cause chip toggles to silently fail reactivity. (Epic + story decision.)
  - Build the default record explicitly from the `LicenseType` const values rather than hardcoding string keys, so adding a license type later surfaces a type error rather than a silently missing key. Either an explicit literal (`{ center: true, group_home: true, family_home: true }`) or a derived record is acceptable as long as the result is typed `Record<LicenseType, boolean>`; prefer deriving from `Object.values(LicenseType)` for maintainability.
  - State only — no actions in the return object — matching what the acceptance criteria require. Return an explicit object: `{ activeTypes, minCapacity }`.

---

## Success Criteria
- [ ] `import { useFilterStore } from '../stores/filters'` resolves and the store returns `activeTypes` and `minCapacity`.
- [ ] `activeTypes.value` deep-equals `{ center: true, group_home: true, family_home: true }` on a fresh store.
- [ ] `minCapacity.value === 0` on a fresh store.
- [ ] A `vi.fn()`-backed `watch` (or `computed`) over the store fires after `activeTypes.value.center = false`.
- [ ] Setting `minCapacity.value = 25` is observed by a watcher/computed.
- [ ] `npm run test` passes; `vue-tsc` type-check is clean.

---

## Tasks
- [ ] **Scaffold test file:** Create `src/stores/filters.test.ts` with `setActivePinia(createPinia())` in `beforeEach`, and scaffolded `it` cases for: initial `activeTypes`, initial `minCapacity`, toggling a type triggers reactivity, updating `minCapacity` triggers reactivity. Use placeholder assertions (RED).
- [ ] **Write real failing tests:** Fill in assertions. For reactivity, mount a `watch`/`computed` over the store value and assert it observes the mutation (use `nextTick` from `vue` after the mutation before asserting on a `watch` callback). Verify they fail because the store does not exist yet.
- [ ] **Implement the store:** Create `src/stores/filters.ts` as a setup store returning `{ activeTypes, minCapacity }` with the defaults above. Make all tests pass.

---

## Considerations
- Reactivity assertion: a `ref<Record<...>>` tracks property assignment but watching it requires either `deep: true` on a `watch(store.activeTypes, ...)` or watching a `computed` that reads a specific key. Prefer a `computed(() => store.activeTypes.center)` and assert its value changes after assignment — this is the cleanest signal of reactivity and mirrors how the sidebar/map will consume it. Call `await nextTick()` after the mutation if asserting on a `watch` callback rather than a `computed`.
- Do not reach for `reactive` — the project's Vue style rules prefer `ref`, and the epic decision is explicitly framed around a ref'd plain object.
- Keep the store free of `pinia-plugin-persistedstate` config. STR-008 installs that plugin and configures only `useProviderStore`; this store must remain unpersisted.
- The `LicenseType` const object and type share a name (declaration merging in `src/types/provider.ts`). Import it once: `import { LicenseType } from '../types/provider'` gives the value; `LicenseType` is also usable as a type in the same scope.
