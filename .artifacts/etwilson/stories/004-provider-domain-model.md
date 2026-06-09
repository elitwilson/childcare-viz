---
id: STR-004
title: Provider Domain Model
epic: EPIC-002
status: complete
priority: high
---

## Goal

Define the canonical TypeScript types for the provider data domain — `LicenseType` enum and `Provider` interface — so every subsequent story in this epic has a stable, shared contract to build against.

---

## Scope

### In
- `src/types/provider.ts` containing:
  - `LicenseType` enum: `center`, `group_home`, `family_home`
  - `Provider` interface with all confirmed fields (see Context & Decisions)

### Out
- No runtime logic, no functions, no classes
- No API or store code
- No test for "enum has correct values" — that's testing TypeScript itself

---

## Acceptance Criteria

- [ ] `LicenseType` enum exported from `src/types/provider.ts` with values `center`, `group_home`, `family_home`
- [ ] `Provider` interface exported with all required fields correctly typed
- [ ] `vue-tsc --noEmit` passes cleanly
- [ ] No `any` types

---

## Context & Decisions

- **Confirmed `Provider` fields:**
  - `id: string` — from API `LicenseNumber`
  - `name: string` — from API `FacilityName`
  - `licenseType: LicenseType`
  - `capacity: number` — from API `Capacity`
  - `lat: number` — from API `Latitude`
  - `lng: number` — from API `Longitude`
  - `address: string` — from API `StreetAddress`
  - `city: string` — from API `City`
  - `county: string` — from API `CountyCode` (numeric string from API; kept as string, no name mapping in this story)
  - `zipCode: string` — from API `ZIPCode`
  - `rating: number | null` — always `null` from the current data source; field exists for future enrichment

- No `ages` field — not available in the API
- No `headStart` / `earlyHeadStart` flags — not mapping Head Start as a license type in this dataset
- `rating` is typed `number | null`, not `number`, because the data source doesn't provide it — do not default to `0`

---

## Dependencies

- **Depends on:** none
- **Blocks:** STR-005 (service + transform need the Provider type)

---

## Notes

This is intentionally a tiny story. The value is establishing the single source of truth for the domain model before any service or store code is written. Do not add utility functions, constants, or anything beyond the types themselves.
