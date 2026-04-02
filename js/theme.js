// ─────────────────────────────────────────────────────────────────────
// theme.js — Light / dark mode toggle with localStorage persistence
// ─────────────────────────────────────────────────────────────────────

const THEME_KEY = 'crowdverse-theme';

function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark';
  } catch {
    return 'dark';
  }
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function setTheme(theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  updateThemeToggleLabel();
  return next;
}

function updateThemeToggleLabel() {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  btn.innerHTML = isLight
    ? '☀️ Light Mode'
    : '🌙 Dark Mode';
}

// Apply immediately to prevent flash of wrong theme
(function initTheme() {
  const saved = getSavedTheme();
  if (saved === 'light') {
    applyTheme('light');
  }
})();
