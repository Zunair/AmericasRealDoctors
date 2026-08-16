import { DOCTORS } from './doctors.js';

export const SITE_CONTENT = {
  site: {
    name: "America's Real Doctors",
    url: 'https://americasrealdoctors.com',
    description: 'Secure, map-based physician directory connecting patients with verified, independent, and patient-focused doctors.',
    searchTopics: ['doctor search', 'verification', 'telehealth', 'family medicine', 'integrative medicine', 'location pages']
  },
  pages: [
    { title: 'Home', url: '/index.html', description: 'Homepage with discovery map, doctor search, and verification messaging.', group: 'core' },
    { title: 'Explore Map', url: '/pages/explore-map.html', description: 'Interactive doctor discovery map by region.', group: 'search' },
    { title: 'Doctor Search Results', url: '/pages/doctor-search-results.html', description: 'Filterable doctor search results page.', group: 'search' },
    { title: 'Doctor Profile', url: '/pages/doctor-profile.html', description: 'Public profile for a verified doctor.', group: 'doctor' },
    { title: 'Join as a Doctor', url: '/pages/join-as-doctor.html', description: 'Doctor onboarding and verification entry point.', group: 'doctor' },
    { title: 'Doctor Registration', url: '/pages/doctor-registration.html', description: 'Doctor registration flow with credential submission.', group: 'doctor' },
    { title: 'Email Verification', url: '/pages/email-verification.html', description: 'Email ownership verification step.', group: 'account' },
    { title: '2FA Setup', url: '/pages/two-factor-setup.html', description: 'Two-factor authentication setup for doctor and admin accounts.', group: 'account' },
    { title: 'Doctor Dashboard', url: '/pages/doctor-dashboard.html', description: 'Doctor account dashboard for verification and profile management.', group: 'doctor' },
    { title: 'Edit Profile', url: '/pages/edit-profile.html', description: 'Profile editing and status overview.', group: 'doctor' },
    { title: 'Credential Management', url: '/pages/credential-management.html', description: 'License and credential tracking.', group: 'doctor' },
    { title: 'Doctor Articles', url: '/pages/doctor-articles.html', description: 'Doctor-authored educational article dashboard.', group: 'content' },
    { title: 'Article Details', url: '/pages/article-details.html', description: 'Educational article detail page.', group: 'content' },
    { title: 'Admin Dashboard', url: '/pages/admin-dashboard.html', description: 'Administrative review and moderation dashboard.', group: 'admin' },
    { title: 'About', url: '/pages/about.html', description: 'Mission, trust model, and directory principles.', group: 'support' },
    { title: 'How Verification Works', url: '/pages/how-verification-works.html', description: 'Explanation of badges, identity checks, and verification steps.', group: 'support' },
    { title: 'Frequently Asked Questions', url: '/pages/frequently-asked-questions.html', description: 'Frequently asked questions about verification, privacy, and safety.', group: 'support' },
    { title: 'Contact', url: '/pages/contact.html', description: 'Support and profile correction form.', group: 'support' },
    { title: 'Privacy Policy', url: '/pages/privacy-policy.html', description: 'Privacy and data-handling expectations.', group: 'policy' },
    { title: 'Terms of Use', url: '/pages/terms-of-use.html', description: 'Use terms for the public directory and doctor content.', group: 'policy' },
    { title: 'Medical Disclaimer', url: '/pages/medical-disclaimer.html', description: 'Educational-only medical disclaimer.', group: 'policy' },
    { title: 'Accessibility Statement', url: '/pages/accessibility-statement.html', description: 'Accessibility and inclusive design statement.', group: 'policy' },
    { title: 'Sign In', url: '/pages/sign-in.html', description: 'Local sign-in page for doctor and admin accounts.', group: 'account' },
    { title: 'Forgot Password', url: '/pages/forgot-password.html', description: 'Password recovery entry point.', group: 'account' },
    { title: 'Account Recovery', url: '/pages/account-recovery.html', description: 'Account recovery workflow and recovery code handling.', group: 'account' },
    { title: 'Doctors in Pennsylvania', url: '/pages/doctors-in-pennsylvania.html', description: 'Crawlable location landing page for Pennsylvania doctors.', group: 'browse' },
    { title: 'Doctors in Philadelphia', url: '/pages/doctors-in-philadelphia.html', description: 'Crawlable location landing page for Philadelphia doctors.', group: 'browse' },
    { title: 'Integrative Doctors in California', url: '/pages/integrative-doctors-in-california.html', description: 'Crawlable specialty and location landing page.', group: 'browse' },
    { title: 'Family Physicians Offering Telehealth', url: '/pages/family-physicians-offering-telehealth.html', description: 'Crawlable telehealth landing page for family physicians.', group: 'browse' }
  ],
  browseDimensions: ['name', 'specialty', 'city', 'country', 'language', 'telehealth', 'acceptingNewPatients', 'verification']
};

export const PUBLIC_DOCTOR_INDEX = DOCTORS.map((doctor) => ({
  name: doctor.name,
  credentials: doctor.credentials,
  specialty: doctor.specialty,
  city: doctor.city,
  country: doctor.country,
  intro: doctor.intro,
  certifications: doctor.certifications,
  telehealth: doctor.telehealth,
  acceptingNewPatients: doctor.acceptingNewPatients,
  distance: doctor.distance,
  verification: doctor.verification
}));