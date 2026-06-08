# Decisions — 005-api-service-transform

## Pre-existing build errors

`pnpm build` (vue-tsc -b) fails with 4 type errors that existed before this spec:
- `src/components/MapView.test.ts` lines 72, 79: `vi.mocked(tileLayer)` cast overlaps issue
- `src/style.css.test.ts` lines 2, 3, 5: `fs`, `path`, `__dirname` — missing `@types/node`
- `vite.config.ts` line 7: `test` not in `UserConfigExport` type

None of these are in spec scope files. The success criterion "pnpm build is clean" cannot be met without fixing pre-existing issues. All new production code in `childcareApi.ts` and `childcareTransform.ts` is type-clean (zero errors in those files).

## RawProvider placement

Spec gave a choice: colocate `RawProvider` in `childcareApi.ts` or `childcareTransform.ts`. Chose `childcareApi.ts` because fetch is the natural owner of the raw shape — the transform just consumes it. This is the single definition; the transform imports it.
