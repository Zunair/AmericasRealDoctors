export class ThemeController {
  constructor({ root = document.documentElement, storage = localStorage, mediaQuery = window.matchMedia('(prefers-color-scheme: dark)') } = {}) {
    this.root = root;
    this.storage = storage;
    this.mediaQuery = mediaQuery;
    this.themeButton = document.querySelector('[data-theme-toggle]');
  }

  initialize() {
    this.restoreTheme();
    if (!this.themeButton) return;
    this.updateThemeButton();
    this.themeButton.addEventListener('click', () => this.toggleTheme());
  }

  restoreTheme() {
    const savedTheme = this.storage.getItem('ard-theme');
    if (savedTheme) {
      this.root.dataset.theme = savedTheme;
      return;
    }

    if (this.mediaQuery.matches) {
      this.root.dataset.theme = 'dark';
    }
  }

  toggleTheme() {
    const nextTheme = this.root.dataset.theme === 'dark' ? 'light' : 'dark';
    this.root.dataset.theme = nextTheme;
    this.storage.setItem('ard-theme', nextTheme);
    this.updateThemeButton();
  }

  updateThemeButton() {
    if (!this.themeButton) return;

    const isDark = this.root.dataset.theme === 'dark';
    this.themeButton.textContent = isDark ? '☀' : '☾';
    this.themeButton.setAttribute('aria-pressed', String(isDark));
    this.themeButton.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }
}

export function initializeTheme() {
  new ThemeController().initialize();
}
