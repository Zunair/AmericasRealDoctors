import { validateStrongPassword } from '../services/authSecurityService.js';

export function initializeRegistrationGuards() {
  const passwordField = document.querySelector('[data-password]');
  const passwordHint = document.querySelector('[data-password-hint]');
  const copySecretButton = document.querySelector('[data-copy-secret]');

  if (passwordField && passwordHint) {
    passwordField.addEventListener('input', () => {
      passwordHint.textContent = validateStrongPassword(passwordField.value)
        ? 'Strong password format met.'
        : 'Use 12+ characters with upper/lowercase, number, and symbol.';
    });
  }

  if (copySecretButton) {
    copySecretButton.addEventListener('click', async () => {
      const source = document.querySelector(copySecretButton.dataset.copySecret);
      if (!source) return;
      try {
        await navigator.clipboard.writeText(source.textContent.trim());
        copySecretButton.textContent = 'Secret copied';
      } catch {
        copySecretButton.textContent = 'Copy unavailable';
      }
    });
  }
}
