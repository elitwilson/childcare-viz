<script setup lang="ts">
</script>

<template>
  <header>
    <span class="mark"></span>
    <h1>Michigan Childcare Access</h1>
    <span class="sub">density &amp; capacity explorer</span>
    <div id="themeToggle" class="theme-toggle">
      <button data-theme-set="dark" aria-pressed="true">
        <span class="ic moon"></span>
      </button>
      <button data-theme-set="light" aria-pressed="false">
        <span class="ic sun"></span>
      </button>
    </div>
    <span class="spike-tag">Spike · synthetic data</span>
  </header>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
  height: 48px;
  background: var(--panel);
  border-bottom: 1px solid var(--line);
}

.mark {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

header h1 {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink);
  margin: 0;
  white-space: nowrap;
}

.sub {
  font-size: 0.75rem;
  color: var(--ink-dim);
  white-space: nowrap;
}

.theme-toggle {
  display: flex;
  gap: 2px;
  margin-left: auto;
}

.theme-toggle button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 24px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  color: var(--ink-dim);
}

.theme-toggle button[aria-pressed="true"] {
  background: var(--panel-2);
  color: var(--ink);
}

.ic.moon::before {
  content: '🌙';
  font-size: 0.75rem;
}

.ic.sun::before {
  content: '☀️';
  font-size: 0.75rem;
}

.spike-tag {
  font-size: 0.65rem;
  color: var(--ink-dim);
  background: var(--panel-2);
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 2px 6px;
  white-space: nowrap;
}
</style>
