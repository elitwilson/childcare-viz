import { ref } from 'vue';
import type { Ref } from 'vue';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'mca-theme';

function readStorage(): Theme {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'dark' || val === 'light') return val;
  } catch {
    // storage unavailable
  }
  return 'light';
}

function writeStorage(t: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    // storage unavailable
  }
}

const theme = ref<Theme>(readStorage());
document.documentElement.setAttribute('data-theme', theme.value);

export function useTheme(): { theme: Ref<Theme>; setTheme: (t: Theme) => void } {
  function setTheme(t: Theme): void {
    theme.value = t;
    document.documentElement.setAttribute('data-theme', t);
    writeStorage(t);
  }

  return { theme, setTheme };
}
