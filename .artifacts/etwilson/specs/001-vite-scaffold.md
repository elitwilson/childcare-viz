---
number: 001
story: STR-001
status: ready
base_branch: main
depends_on: []
scope_files:
  - package.json
  - package-lock.json
  - vite.config.ts
  - tsconfig.json
  - tsconfig.app.json
  - tsconfig.node.json
  - index.html
  - src/main.ts
  - src/App.vue
  - src/style.css
  - src/vite-env.d.ts
  - src/types/leaflet.heat.d.ts
  - src/components/HelloWorld.vue
  - src/assets/**
  - public/**
  - .gitignore
---

# Feature: Vite + Vue 3 + TypeScript Scaffold

## Summary
Bootstrap the Childcare Viz project from an empty directory into a clean, launchable Vue 3 + Vite + TypeScript application. This story creates the foundation every subsequent story builds on: the official `vue-ts` Vite template with all boilerplate removed, core dependencies installed (Leaflet, leaflet.heat, Pinia, Tailwind), and Pinia wired into the app entry point. The deliverable is a dev server that boots cleanly to an empty page with zero console errors — no layout, no map, no stores, just a correct skeleton.

---

## Requirements
- The project is initialized with the official Vite `vue-ts` template (Vue 3 + TypeScript), not a hand-rolled Vite config.
- TypeScript strict mode remains enabled (the `vue-ts` template default).
- All Vite/Vue boilerplate is removed: the `HelloWorld` component, the counter logic, the default `vue.svg`/`vite.svg` logo assets, and the demo styling.
- Core dependencies are installed and recorded in `package.json`: `leaflet@1.9.4`, `leaflet.heat@0.2.0`, `pinia`, plus dev type packages `@types/leaflet` and `@types/leaflet.heat`.
- Tailwind CSS is installed and configured via the official Vite plugin, and a Tailwind directive entry stylesheet is wired into the app.
- Pinia is created and registered in `src/main.ts` via `app.use(createPinia())` before mount.
- `App.vue` renders an empty shell (no demo markup) and the app mounts to `#app` without runtime errors.
- `npm install` completes with no errors; `npm run dev` starts the dev server and loads in the browser with a clean console.
- `leaflet.heat` resolves with usable types so subsequent stories can call `L.heatLayer(...)` without `any` — if the installed `@types/leaflet.heat` does not augment the `L` namespace correctly, a minimal local declaration in `src/types/` covers the gap.

---

## Scope

### In Scope
- `npm create vite` with the `vue-ts` template into the project root.
- Removing all template boilerplate (component, counter, logos, demo CSS).
- Installing runtime deps (`leaflet`, `leaflet.heat`, `pinia`) and dev type deps (`@types/leaflet`, `@types/leaflet.heat`).
- Installing and configuring Tailwind CSS via the Vite plugin (`@tailwindcss/vite`), with the Tailwind import in the entry stylesheet.
- Registering Pinia in `main.ts`.
- A minimal empty `App.vue`.
- A local `leaflet.heat` type shim **only if** the published types prove insufficient.

### Out of Scope
- Any layout, header, sidebar, or map-area markup (STR-002).
- Any Leaflet map initialization or CARTO tiles (STR-003).
- Any Pinia stores — only the plugin is registered.
- Any feature code, filters, data fetching, or theming logic.
- CSS beyond clearing Vite defaults and wiring the Tailwind entry import.

---

## Technical Approach
- **Entry points / interfaces:**
  - `index.html` — single mount point `<div id="app"></div>`, title set to the project name.
  - `src/main.ts` — creates the Vue app, installs Pinia, imports the entry stylesheet, mounts to `#app`.
  - `src/App.vue` — `<script setup lang="ts">` SFC, empty shell.

- **Key modules / components:**
  - `vite.config.ts` — Vue plugin plus the `@tailwindcss/vite` plugin.
  - `src/style.css` — the single entry stylesheet; contains the Tailwind import (`@import "tailwindcss";` for Tailwind v4 via the Vite plugin). This replaces the template's demo `style.css`.
  - `src/types/leaflet.heat.d.ts` — created **only** if the published `@types/leaflet.heat` does not correctly augment the Leaflet `L` namespace.

- **Data model:** None. No stores, no data shapes in this story.

- **Key design decisions:**
  - **Use the official template, not manual Vite setup** — per story guidance and to avoid drift from upstream defaults; keeps strict TS config intact.
  - **Correct `leaflet.heat` package name:** The story brief's guidance is inverted. Verified against npm on 2026-06-08: `leaflet.heat@0.2.0` **exists** and is the correct package; `@types/leaflet.heat@0.2.5` **exists** as well. The suggested `leaflet-heat` / `@types/leaflet-heat` names return 404 and must **not** be used. Install `leaflet.heat` and `@types/leaflet.heat`. A local shim is the fallback only if the published types fail to compile against this Leaflet version.
  - **Tailwind via the Vite plugin (v4 style):** Use `@tailwindcss/vite` and the `@import "tailwindcss";` directive rather than the legacy `tailwind.config.js` + PostCSS + `@tailwind base/components/utilities` setup. This matches the current Tailwind + Vite integration and keeps config minimal. (Theming custom properties are STR-002/STR-003 concerns, not this story.)
  - **Pinia registered but empty** — the plugin is installed so later stories add stores without re-touching `main.ts`.

---

## Success Criteria
- [ ] `npm install` completes with no errors.
- [ ] `npm run dev` starts the dev server and the page loads in the browser with **no console errors**.
- [ ] `package.json` `dependencies` include `leaflet` (1.9.4), `leaflet.heat` (0.2.0), and `pinia`; `devDependencies` include `@types/leaflet` and `@types/leaflet.heat`.
- [ ] No boilerplate remains: no `HelloWorld.vue`, no counter, no `vue.svg`/`vite.svg` assets, no demo styles.
- [ ] `src/main.ts` creates the app, calls `app.use(createPinia())`, and mounts to `#app`.
- [ ] `npm run build` (or `vue-tsc --noEmit`) type-checks cleanly, including any `L.heatLayer` reference if added as a smoke check (optional — not required to leave one in).
- [ ] Tailwind utility classes apply when used (verifiable by temporarily adding a class, then removing it).

---

## Tasks
Ordered by dependency.

- [ ] **Scaffold the template:** Run `npm create vite@latest` with the `vue-ts` template into the project root (the directory is empty except `.git`/`.artifacts`, so scaffold in place). Run `npm install`. Confirm `npm run dev` boots the stock template. Files: `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.ts`, `src/App.vue`, `src/style.css`, `src/vite-env.d.ts`, `.gitignore`.

- [ ] **Strip boilerplate:** Delete `src/components/HelloWorld.vue`, remove the counter and demo markup from `src/App.vue` (leave an empty `<script setup lang="ts">` SFC with an empty template), delete `src/assets/vue.svg` and `public/vite.svg`, and clear the demo rules from `src/style.css`. Confirm `npm run dev` still boots to a blank page with a clean console.

- [ ] **Install core dependencies:** `npm install leaflet@1.9.4 leaflet.heat@0.2.0 pinia` and `npm install -D @types/leaflet @types/leaflet.heat`. Verify the entries land in `package.json` with the expected versions. Verify `leaflet.heat` types augment `L` — add a throwaway `L.heatLayer([], {})` reference in a `.ts` scratch and run `vue-tsc --noEmit`; if it does not type-check, add `src/types/leaflet.heat.d.ts` with a minimal `declare module 'leaflet.heat'` / `L.heatLayer` augmentation, then remove the scratch reference.

- [ ] **Configure Tailwind:** `npm install -D tailwindcss @tailwindcss/vite`, register the `@tailwindcss/vite` plugin in `vite.config.ts`, and add `@import "tailwindcss";` to `src/style.css` (ensure `main.ts` imports `./style.css`). Confirm a Tailwind utility class renders, then remove the test class.

- [ ] **Wire Pinia and verify:** In `src/main.ts`, `import { createPinia } from 'pinia'` and call `app.use(createPinia())` before `app.mount('#app')`. Run `npm run dev` and confirm a clean boot with no console errors, and `npm run build` type-checks cleanly.

---

## Considerations
- **The story's `leaflet.heat` guidance is backwards.** Do not trust the "`leaflet-heat` is the correct name" note — `leaflet-heat` does not exist on npm (verified 404). Use `leaflet.heat@0.2.0` and `@types/leaflet.heat@0.2.5`. This is the single most likely place to waste time if the implementer follows the story literally.
- **Tailwind version:** Prefer the current Vite-plugin integration (`@tailwindcss/vite` + `@import "tailwindcss";`). If a `tailwind.config.js`-based setup is already familiar, it also works, but the plugin path is less config and is the recommended current approach.
- **`@types/leaflet.heat` existing does not guarantee it augments the `L` namespace for `L.heatLayer`.** The verification step (type-check a `L.heatLayer` reference) is the gate for whether the local shim is needed — don't skip it, since the heatmap story (a later epic) depends on these types being correct.
- **Scaffolding in a non-empty directory:** the root already contains `.git` and `.artifacts`. `npm create vite` into `.` should be fine, but confirm it does not clobber or refuse due to those existing entries; scaffold in place rather than into a subfolder.
- **Default Vite port** is 5173; no port config is required for this story.
