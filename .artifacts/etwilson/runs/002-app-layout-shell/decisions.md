# Decisions — 002-app-layout-shell

## Assumptions

1. No mockup file is present in the repo. CSS variable values and DOM structure are derived from the spec text (verbatim variable names, color values in oklch, and exact DOM structure descriptions).
2. The spec states `#map` selector must be global — placing it in `style.css` and in an unscoped `<style>` block in MapView.vue is equivalent; chose `style.css` for consistency with spec.
3. Tailwind `@import "tailwindcss"` is kept at top of `style.css` as the scaffold set it up and the spec says Tailwind utilities may be used for layout/spacing.
4. The spec lists exact color values for dark theme variables in the Success Criteria (`--bg: #11151c`, etc). Those hex values are used as the oklch equivalents may be what the spec means by "copied verbatim from mockup lines 15-42" — since no mockup file exists, using the hex values from the success criteria as authoritative.
