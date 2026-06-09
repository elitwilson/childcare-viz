---
feature-slug: visual-polish
spec: .artifacts/etwilson/specs/020-visual-polish.md
---

# Decisions

## CSS hover state not directly tested
Chip hover border-color (`.chip:hover { border-color: var(--ink-faint) }`) and seg button CSS details (pill shape, panel-2 background, dot color) are not covered by assertions — @vue/test-utils cannot evaluate computed CSS. Only the DOM contract (`.dot` presence and `aria-hidden`) is tested. This matches the reviewer's approval.

## Single commit for all four tasks
Tasks 1–3 are cohesive markup+CSS changes to the same two files with no inter-task ordering constraint. Task 4 (verify tests) produced no file changes. Bundled into one commit per reviewer approval scope.
