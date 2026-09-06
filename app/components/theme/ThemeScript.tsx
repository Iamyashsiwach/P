// Blocking, ~300-byte inline script that must run before first paint, so it
// cannot import app/lib/theme.ts — that constant is duplicated here on
// purpose. Reads ?theme= first (so a shared link deep-links into a theme,
// e.g. a screenshot posted with ?theme=blueprint), then localStorage, and
// defaults to 'paper': blueprint is a deliberate act, never inferred from
// the OS dark-mode setting.
const THEME_SCRIPT = `
(function () {
  try {
    var KEY = 'ys.theme';
    var params = new URLSearchParams(location.search);
    var fromUrl = params.get('theme');
    var t = (fromUrl === 'blueprint' || fromUrl === 'paper') ? fromUrl : localStorage.getItem(KEY);
    if (t !== 'blueprint' && t !== 'paper') t = 'paper';
    document.documentElement.dataset.theme = t;
    document.documentElement.style.colorScheme = t === 'blueprint' ? 'dark' : 'light';
    if (fromUrl === 'blueprint' || fromUrl === 'paper') {
      try { localStorage.setItem(KEY, t); } catch (e) {}
    }
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}

export default ThemeScript;
