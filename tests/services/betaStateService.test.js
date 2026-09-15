import test from 'node:test';
import assert from 'node:assert/strict';
import { BetaStateService } from '../../assets/js/services/betaStateService.js';

const seedDoctors = [
  {
    name: 'Dr. Elena Morris',
    credentials: 'MD, IFMCP',
    specialty: 'Family Medicine',
    city: 'Philadelphia',
    region: 'Pennsylvania',
    country: 'USA',
    intro: 'Integrative family physician focused on informed consent and collaborative care plans.',
    certifications: ['ABFM', 'IFM Certified Practitioner'],
    languages: ['English', 'Spanish'],
    telehealth: true,
    inPerson: true,
    acceptingNewPatients: true,
    distance: '3.2 mi',
    verification: ['identity_verified', 'license_verified', 'certification_verified']
  }
];

function createStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, value);
    }
  };
}

test('seeds approved beta doctors from the canonical doctor dataset', () => {
  const service = new BetaStateService({
    storage: createStorage(),
    seedDoctors,
    now: () => new Date('2026-09-15T14:00:00.000Z')
  });

  const doctors = service.getApprovedDoctors();

  assert.equal(doctors.length, 1);
  assert.equal(doctors[0].slug, 'dr-elena-morris');
  assert.equal(service.getApplications().length, 1);
});

test('requires email verification and two-factor setup before doctor sign-in', () => {
  const service = new BetaStateService({
    storage: createStorage(),
    seedDoctors,
    now: () => new Date('2026-09-15T14:00:00.000Z')
  });

  service.submitRegistration({
    email: 'doctor@example.com',
    password: 'StrongPassword!123',
    firstName: 'Avery',
    lastName: 'Stone',
    credentials: 'MD',
    specialty: 'Internal Medicine',
    additionalSpecialties: 'Preventive Care',
    biography: 'Doctor biography',
    officeName: 'Stone Clinic',
    officeAddress: '1200 Main St',
    city: 'Austin',
    region: 'Texas',
    country: 'USA',
    publicPhone: '(555) 010-0001',
    publicEmail: 'doctor@example.com',
    website: 'https://stone.example',
    languages: 'English',
    licenseNumber: 'TX-1001',
    licensingAuthority: 'Texas Medical Board',
    licensedJurisdiction: 'Texas',
    licenseExpiration: '2027-08-01',
    appointmentUrl: 'https://booking.example/avery-stone',
    acceptingNewPatients: 'yes',
    careMode: 'both'
  });

  const beforeVerification = service.signIn({
    email: 'doctor@example.com',
    password: 'StrongPassword!123',
    otp: '123456'
  });
  assert.equal(beforeVerification.success, false);
  assert.match(beforeVerification.message, /Verify your email/);

  assert.equal(service.verifyEmail('doctor@example.com'), true);
  assert.equal(service.enableTwoFactor({
    email: 'doctor@example.com',
    code: '123456',
    confirmedSavedCodes: true
  }).success, true);

  const signInResult = service.signIn({
    email: 'doctor@example.com',
    password: 'StrongPassword!123',
    otp: '123456'
  });

  assert.equal(signInResult.success, true);
  assert.equal(signInResult.redirectTo, '/pages/doctor-dashboard.html');
});

test('publishes approved applications and persists doctor profile edits', () => {
  const service = new BetaStateService({
    storage: createStorage(),
    seedDoctors,
    now: () => new Date('2026-09-15T14:00:00.000Z')
  });

  const application = service.submitRegistration({
    email: 'doctor@example.com',
    password: 'StrongPassword!123',
    firstName: 'Avery',
    lastName: 'Stone',
    credentials: 'MD',
    specialty: 'Internal Medicine',
    additionalSpecialties: '',
    biography: 'Doctor biography',
    officeName: 'Stone Clinic',
    officeAddress: '1200 Main St',
    city: 'Austin',
    region: 'Texas',
    country: 'USA',
    publicPhone: '(555) 010-0001',
    publicEmail: 'doctor@example.com',
    website: 'https://stone.example',
    languages: 'English',
    licenseNumber: 'TX-1001',
    licensingAuthority: 'Texas Medical Board',
    licensedJurisdiction: 'Texas',
    licenseExpiration: '2027-08-01',
    appointmentUrl: 'https://booking.example/avery-stone',
    acceptingNewPatients: 'yes',
    careMode: 'both'
  });

  service.setApplicationStatus({ slug: application.slug, status: 'approved' });
  service.verifyEmail('doctor@example.com');
  service.enableTwoFactor({ email: 'doctor@example.com', code: '123456', confirmedSavedCodes: true });
  service.signIn({ email: 'doctor@example.com', password: 'StrongPassword!123', otp: '123456' });
  service.updateCurrentDoctorProfile({
    showExactAddress: false,
    showPublicPhone: false,
    showWebsite: true,
    intro: 'Updated intro'
  });

  const publishedDoctor = service.getApprovedDoctors().find((doctor) => doctor.slug === application.slug);
  const savedApplication = service.getDoctorBySlug(application.slug);

  assert.equal(publishedDoctor?.name, 'Dr. Avery Stone');
  assert.equal(savedApplication?.profile.intro, 'Updated intro');
  assert.equal(savedApplication?.profile.visibility.showPublicPhone, false);
});
