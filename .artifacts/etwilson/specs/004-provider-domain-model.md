---
number: 004
story: STR-004
status: ready
base_branch: main
depends_on: []
scope_files:
  - src/types/provider.ts
---

# Feature: Provider Domain Model

## Summary
Define the canonical TypeScript types for the childcare provider domain in `src/types/provider.ts`: a `LicenseType` value set (`center`, `group_home`, `family_home`) and a `Provider` interface holding all confirmed, normalized fields. This is the single source of truth that every downstream story in EPIC-002 (service, transform, store, dev view) imports and builds against. There is no runtime logic here — only type declarations and the minimal value-set definition needed to express `LicenseType`.

---

## Requirements
- `src/types/provider.ts` exports a `LicenseType` representing exactly three values: `center`, `group_home`, `family_home`.
- `src/types/provider.ts` exports a `Provider` interface with these fields, exactly typed:
  - `id: string`
  - `name: string`
  - `licenseType: LicenseType`
  - `capacity: number`
  - `lat: number`
  - `lng: number`
  - `address: string`
  - `city: string`
  - `county: string`
  - `zipCode: string`
  - `rating: number | null`
- `rating` is `number | null`, never defaulted to `0` — the current data source does not supply a rating, and the `null` makes the absence explicit for future enrichment.
- No `ages`, `headStart`, or `earlyHeadStart` fields — none exist in this dataset.
- `vue-tsc --noEmit` (i.e. `vue-tsc -b`) passes cleanly with the file in place.
- No `any` types.

---

## Scope

### In Scope
- The `Provider` interface and the `LicenseType` value set in `src/types/provider.ts`.

### Out of Scope
- Any runtime logic — no functions, classes, fetch, or transform code.
- API response types (the raw ArcGIS feature shape) — those belong to STR-005's transform/service layer.
- County-code-to-name mapping — `county` stays a raw numeric string here.
- Tests asserting "the enum has the right values" — that tests TypeScript itself, not our code.

---

## Technical Approach
- **Entry point / interface:** A single new module `src/types/provider.ts`. The `types/` directory exists but is empty; this is its first file. Other stories import from it via `import type { Provider } from '@/types/provider'` (or relative path — match what STR-005 establishes; no path alias is configured yet, so a relative import is the safe assumption).

- **`LicenseType` — do not use a TS `enum`.** The project's `tsconfig.app.json` sets `"erasableSyntaxOnly": true`. Standard `enum` (and `const enum`) emit runtime code and are **not** erasable, so they fail compilation under this flag. Use the erasable const-object + derived-union pattern, which preserves the exact same external contract (named members plus a type) while compiling cleanly:

  ```ts
  export const LicenseType = {
    Center: 'center',
    GroupHome: 'group_home',
    FamilyHome: 'family_home',
  } as const;

  export type LicenseType = (typeof LicenseType)[keyof typeof LicenseType];
  ```

  This gives consumers both a value namespace (`LicenseType.Center`) and a type (`licenseType: LicenseType`) under the same name, matching how a TS enum would have been used downstream. The string values (`'center'`, `'group_home'`, `'family_home'`) are exactly those named in the story.

- **`Provider`:** A plain exported `interface` with the eleven fields above. Field types are all primitives plus the `LicenseType` union and the `number | null` for `rating`.

- **Key design decision:** Const-object-as-enum over a bare string-literal union (`type LicenseType = 'center' | ...`). The union alone would satisfy the type contract but gives downstream code no named constants — the transform in STR-005 would have to hardcode raw strings. The const object keeps a single authoritative place for both the values and the type.

---

## Success Criteria
- [ ] `src/types/provider.ts` exists and exports both `Provider` and `LicenseType`.
- [ ] `LicenseType` resolves to the union of `'center' | 'group_home' | 'family_home'`.
- [ ] `Provider` has all eleven fields with the exact types listed, including `rating: number | null`.
- [ ] `npm run build` (which runs `vue-tsc -b`) type-checks without errors.
- [ ] No `any` and no TS `enum`/`const enum` syntax in the file.

---

## Tasks
- [ ] **Create `src/types/provider.ts`:** Add the `LicenseType` const object and its derived union type using the `as const` pattern above, plus the `Provider` interface with all eleven fields. This is the entire deliverable.
- [ ] **Verify type-check:** Run `npm run build` (or `npx vue-tsc -b`) and confirm it passes with no errors and no `erasableSyntaxOnly` violations.

---

## Considerations
- The `erasableSyntaxOnly: true` flag is the one real trap in this story. Reaching for a conventional `enum` will compile-fail; the const-object pattern is mandatory, not stylistic.
- No path alias (`@/`) is configured in this project yet. If you write an example import anywhere, use a relative path, and let STR-005 own the import convention for consumers.
- Keep the file to types and the single const object only — the story is deliberately minimal. Do not add helper functions, county-name maps, validators, or constants.
- `county` is a numeric string (e.g. `'82'`) from the API's `CountyCode`; typing it as `string` (not `number`) is intentional so leading zeros and the raw code are preserved.

---
