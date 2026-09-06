export type Theme = 'paper' | 'terminal';

/** Also hardcoded (not imported) in ThemeScript — that script must be a
 * literal inline string, since it runs before any module graph exists. */
export const THEME_STORAGE_KEY = 'ys.theme';

const THEME_COLOR: Record<Theme, string> = {
  paper: '#FAF8F4',
  terminal: '#0b0f0c',
};

function isTheme(value: string | null | undefined): value is Theme {
  return value === 'paper' || value === 'terminal';
}

/** Reads the theme ThemeScript already stamped onto <html> before hydration. */
export function readDomTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  return isTheme(attr) ? attr : 'paper';
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme === 'terminal' ? 'dark' : 'light';

  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', THEME_COLOR[theme]);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode / storage disabled — the in-memory state still holds for this visit.
  }
}
