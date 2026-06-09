# Review Notes — 005-api-service-transform

## Define RawProvider and transformProvider (RED)

## Verdict: APPROVED

**Task:** Define RawProvider and transformProvider (RED)
**Spec:** .artifacts/etwilson/specs/005-api-service-transform.md

**Scope issues:** none

**Coverage gaps:** none

All 7 required behaviors have test coverage:
- Three known FacilityType mappings (Center, Group Home (7-12), Family Home (1-6))
- Unknown type returns null
- Unknown type triggers console.warn with the unknown type in the message
- rating is always null
- All Provider fields copied from correct raw field names

Note: Tests use `LicenseType.Center` / `LicenseType.GroupHome` / `LicenseType.FamilyHome` — valid because `LicenseType` is a `const` object (as const pattern), not a TS enum. Consistent with spec requirement and provider.ts definition.

## Implement fetchAllProviders and write childcareApi.test.ts (RED)

## Verdict: APPROVED

**Task:** Implement fetchAllProviders and write childcareApi.test.ts (RED)
**Spec:** .artifacts/etwilson/specs/005-api-service-transform.md

**Scope issues:** none

**Coverage gaps:** none

All 8 required behaviors covered: 8 fetch calls, correct resultOffset per page, required query params in all URLs, merged flat array, short last page, network error rejection, non-OK HTTP rejection, and parallelism (calls issued before any resolves).
