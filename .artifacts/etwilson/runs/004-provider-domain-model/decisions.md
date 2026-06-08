# Decisions — 004-provider-domain-model

## Pre-existing build failures

`npm run build` fails with type errors in `src/components/MapView.test.ts`, `src/style.css.test.ts`, and `vite.config.ts`. These are not introduced by this spec — they were present before `src/types/provider.ts` was created. The spec's success criterion ("npm run build passes cleanly") cannot be met until these pre-existing failures are resolved. No action taken here; flagged for human review.
