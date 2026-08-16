import { SECURITY_REQUIREMENTS } from '../config/constants.js';

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;

export function validateStrongPassword(password) {
  return STRONG_PASSWORD.test(password);
}

export function getSecurityChecklist() {
  return SECURITY_REQUIREMENTS;
}
