import { initializeTheme } from './ui/themeController.js';
import { initializeMapAndList } from './ui/mapController.js';
import { initializeRegistrationGuards } from './ui/registrationController.js';
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

initializeTheme();
initializeMapAndList();
initializeRegistrationGuards();
renderSharedLists();
