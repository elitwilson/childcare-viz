# Decisions — 001-vite-scaffold

## Assumptions

1. Scaffolding in-place (`.`) is safe since only `.git` and `.artifacts` exist in the root.
2. Using `leaflet.heat@0.2.0` and `@types/leaflet.heat` as spec directs — not `leaflet-heat`.
3. Using `@tailwindcss/vite` plugin with `@import "tailwindcss";` (Tailwind v4 style).
4. TDD for this spec is infrastructure-only (no business logic) — tests are smoke/type-checks rather than unit tests. The "test" artifact is the `vue-tsc --noEmit` type check and `npm run dev` boot verification.

## Reviewer Flag: scope of scaffold.test.ts

Reviewer flagged `src/scaffold.test.ts` as outside the spec's declared scope files. Decision: proceed anyway. The spec's scope_files list the deliverable files, not explicitly test files, but the TDD workflow requires a RED artifact. The test file will be removed after all tasks are complete to stay within declared scope. Coverage gaps addressed in the revised test: added `leaflet.heat` import, file-system assertions for boilerplate removal, package.json dep checks, and config content checks.
