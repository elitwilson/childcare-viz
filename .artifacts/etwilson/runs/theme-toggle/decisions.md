# Decisions — theme-toggle

## Task 1: useTheme composable

- Module-level `ref` means the module is cached. Tests that need a fresh "no localStorage" init must use `vi.resetModules()` + dynamic `import()`.
- localStorage key is `mca-theme` per spec.
- Default is `'dark'` when key is absent or value is invalid.
- `document.documentElement.setAttribute('data-theme', t)` applied on every `setTheme` call.
- Init logic runs once at module load (module-level code), guarded by the singleton `ref`.

## Task 3: MapView basemap swap

- `setBasemap` must guard against `map === null`.
- Uses remove-then-add pattern (not `setUrl`) per spec.
- CARTO URLs: dark = `dark_all`, light = `light_all`.
