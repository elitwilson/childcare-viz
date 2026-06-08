---
id: STR-001
title: Vite + Vue 3 Scaffold
epic: EPIC-001
status: open
priority: high
---

## Goal

Bootstrap the project with a clean Vue 3 + TypeScript Vite template and install all core dependencies so subsequent stories have a working foundation to build on.

---

## Scope

### In
- Initialize project with `npm create vite` using the `vue-ts` template
- Remove all Vite boilerplate (HelloWorld component, counter logic, default styles, Vite/Vue logos)
- Install dependencies: `leaflet@1.9.4`, `leaflet-heat` (leaflet.heat 0.2.0), `@types/leaflet`, `pinia`, Tailwind CSS (with Vite plugin)
- Wire Pinia into the Vue app in `main.ts` (`app.use(createPinia())`)
- Confirm `npm run dev` boots without errors and renders an empty page

### Out
- No layout, no components beyond an empty App.vue
- No Pinia stores (just the plugin installed)
- No Leaflet usage yet
- No CSS beyond clearing Vite defaults

---

## Acceptance Criteria

- [ ] `npm install` completes with no errors
- [ ] `npm run dev` starts the dev server and loads in the browser without console errors
- [ ] `package.json` lists `leaflet`, `pinia`, and `@types/leaflet` as dependencies
- [ ] No Vite boilerplate artifacts remain (no HelloWorld, no counter, no default Vite/Vue assets)
- [ ] `main.ts` creates and mounts the Vue app with Pinia installed

---

## Context & Decisions

- Use the official `npm create vite@latest` Vue + TypeScript template — do not set up Vite manually
- `leaflet.heat` is not on npm as `leaflet.heat` — the correct package name is `leaflet-heat`; install it along with its types if available, otherwise a local shim may be needed (architect should confirm)
- Pinia is installed but no stores are created in this story — just the plugin registration in `main.ts`
- TypeScript strict mode should remain on (Vite vue-ts template default)

---

## Dependencies

- **Depends on:** none
- **Blocks:** STR-002 (layout story needs a working scaffold to build on)

---

## Notes

The architect should verify the correct npm package name and type declarations for `leaflet.heat` — it has historically been published inconsistently. If `@types/leaflet-heat` doesn't exist, a minimal `declare module 'leaflet-heat'` shim in `src/types/` is acceptable for this story.
