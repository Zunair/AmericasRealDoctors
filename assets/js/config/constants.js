export const ROUTES = {
  home: '/index.html',
  map: '/pages/explore-map.html',
  search: '/pages/doctor-search-results.html',
  profile: '/pages/doctor-profile.html',
  join: '/pages/join-as-doctor.html',
  registration: '/pages/doctor-registration.html',
  verification: '/pages/how-verification-works.html',
  admin: '/pages/admin-dashboard.html'
};

export const VERIFICATION_BADGES = [
  { key: 'identity_verified', label: 'Identity Verified', detail: 'Government identity matched to account owner.' },
  { key: 'license_verified', label: 'Medical License Verified', detail: 'License active and independently confirmed.' },
  { key: 'certification_submitted', label: 'Certification Submitted', detail: 'Certification documents provided and awaiting full verification.' },
  { key: 'certification_verified', label: 'Certification Independently Verified', detail: 'Certification was verified through a trusted third-party source.' }
];

export const FUTURE_PHASE_FEATURES = [
  'Social authentication',
  'Passkey authentication',
  'Patient accounts',
  'Saved doctors',
  'Secure doctor contact forms',
  'Appointment integrations',
  'Public comments after moderation and abuse controls',
  'Native mobile applications',
  'Multilingual interface'
];

export const SECURITY_REQUIREMENTS = [
  'Email verification and strong password validation',
  'Secure password hashing, CSRF protection, secure cookies, and session expiration',
  'Rate limiting, credential stuffing protection, account lockout or progressive delays',
  'Role-based access control, audit logging, and security-event notifications',
  'TOTP two-factor authentication with recovery code confirmation for doctors and administrators'
];
