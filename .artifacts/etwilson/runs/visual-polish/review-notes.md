## Restyle seg control (add .dot spans), chip hover state, density legend label update

## Verdict: APPROVED

**Task:** Restyle seg control (add .dot spans), chip hover state, density legend label update
**Spec:** .artifacts/etwilson/specs/020-visual-polish.md

**Scope issues:** none

**Coverage gaps:** none — CSS-only items (seg pill shape, button backgrounds, chip hover) have no DOM contract testable with @vue/test-utils; all testable requirements (dot span presence, aria-hidden, density label text, existing behavior) are covered.
