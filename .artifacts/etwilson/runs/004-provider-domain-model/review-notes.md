# Review Notes — 004-provider-domain-model

## Create src/types/provider.ts

## Verdict: FLAGGED

**Task:** Create src/types/provider.ts
**Spec:** .artifacts/etwilson/specs/004-provider-domain-model.md

**Scope issues:** none

**Coverage gaps:**

- `LicenseType` value tests are explicitly out of scope per the spec: "Tests asserting 'the enum has the right values' — that tests TypeScript itself, not our code." The two `LicenseType` describe-block tests (`has the three expected string values`, `has exactly three members`) directly violate this exclusion. They should be removed.

- The remaining two `Provider interface` tests (`accepts a fully typed provider object`, `accepts a numeric rating`) are acceptable structural checks and cover the required fields and the `rating: number | null` contract.

- No test covers that `rating` cannot be `undefined` (i.e. the field is required, not optional). The spec states "never defaulted to `0`" and the absence must be explicit via `null`. A compile-time test confirming the field is required (not `?:`) would close this gap. This is a minor gap — the existing object literal tests do implicitly exercise this at the type level — so this is advisory, not blocking on its own.

**Primary block:** The two `LicenseType` tests must be removed — they are explicitly excluded by the spec's Out of Scope section.
