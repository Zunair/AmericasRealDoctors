export function initializeTheme() {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('ard-theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme) root.dataset.theme = savedTheme;
  else if (systemDark) root.dataset.theme = 'dark';

  const themeButton = document.querySelector('[data-theme-toggle]');
  if (!themeButton) return;
  themeButton.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = nextTheme;
    localStorage.setItem('ard-theme', nextTheme);
  });
}
