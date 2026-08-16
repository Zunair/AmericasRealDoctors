import { initializeTheme } from './ui/themeController.js';
import { initializeMapAndList } from './ui/mapController.js';
import { initializeRegistrationGuards } from './ui/registrationController.js';
import { initializeSharedChrome } from './ui/siteChrome.js';
import { FUTURE_PHASE_FEATURES, VERIFICATION_BADGES } from './config/constants.js';

function renderSharedLists() {
  const todoList = document.querySelector('[data-future-features]');
  if (todoList) {
    todoList.innerHTML = FUTURE_PHASE_FEATURES.map((feature) => `<li>${feature}</li>`).join('');
  }

  const verificationList = document.querySelector('[data-verification-badges]');
  if (verificationList) {
    verificationList.innerHTML = VERIFICATION_BADGES.map((badge) => `<li><strong>${badge.label}:</strong> ${badge.detail}</li>`).join('');
  }
}

initializeSharedChrome();
initializeTheme();
await initializeMapAndList();
initializeRegistrationGuards();
renderSharedLists();

const signInForm = document.querySelector('[data-sign-in-form]');
if (signInForm) {
  signInForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = document.querySelector('[data-sign-in-status]');
    if (status) {
      status.textContent = 'Sign-in is handled locally in this preview so credentials are not sent through the URL.';
    }
  });
}
