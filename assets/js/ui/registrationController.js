import { validateStrongPassword } from '../services/authSecurityService.js';

export class RegistrationController {
  constructor({ documentRoot = document, clipboard = navigator.clipboard } = {}) {
    this.documentRoot = documentRoot;
    this.clipboard = clipboard;
    this.passwordField = this.documentRoot.querySelector('[data-password]');
    this.passwordHint = this.documentRoot.querySelector('[data-password-hint]');
    this.copySecretButton = this.documentRoot.querySelector('[data-copy-secret]');
  }

  initialize() {
    this.bindPasswordHint();
    this.bindSecretCopy();
  }

  bindPasswordHint() {
    if (!this.passwordField || !this.passwordHint) return;

    this.passwordField.addEventListener('input', () => {
      this.passwordHint.textContent = validateStrongPassword(this.passwordField.value)
        ? 'Strong password format met.'
        : 'Use 12+ characters with upper/lowercase, number, and symbol.';
    });
  }

  bindSecretCopy() {
    if (!this.copySecretButton) return;

    this.copySecretButton.addEventListener('click', async () => {
      const source = this.documentRoot.querySelector(this.copySecretButton.dataset.copySecret);
      if (!source) return;

      try {
        await this.clipboard.writeText(source.textContent.trim());
        this.copySecretButton.textContent = 'Secret copied';
      } catch {
        this.copySecretButton.textContent = 'Copy unavailable';
      }
    });
  }
}

export function initializeRegistrationGuards() {
  new RegistrationController().initialize();
}
