import test from 'node:test';
import assert from 'node:assert/strict';
import { DoctorProfileController } from '../../assets/js/ui/doctorProfileController.js';

function createNode() {
  return {
    textContent: '',
    innerHTML: '',
    replaceChildren(...children) {
      this.textContent = children.map((child) => child.textContent ?? '').join('');
    }
  };
}

function createDocumentRoot() {
  const selectors = [
    '[data-doctor-profile-page]',
    '[data-doctor-name]',
    '[data-doctor-subtitle]',
    '[data-doctor-verification-list]',
    '[data-doctor-review-date]',
    '[data-doctor-clinical]',
    '[data-doctor-credentials]',
    '[data-doctor-education]',
    '[data-doctor-office]',
    '[data-doctor-articles]'
  ];
  const nodes = new Map(selectors.map((selector) => [selector, createNode()]));
  return {
    querySelector(selector) {
      return nodes.get(selector) ?? null;
    },
    createTextNode(text) {
      return { textContent: text };
    },
    createElement() {
      return createNode();
    },
    nodes
  };
}

test('renders the doctor selected by query parameter instead of the session fallback', async () => {
  const documentRoot = createDocumentRoot();
  const doctors = [
    {
      slug: 'dr-elena-morris',
      name: 'Dr. Elena Morris',
      specialty: 'Family Medicine',
      city: 'Philadelphia',
      region: 'Pennsylvania',
      credentials: 'MD',
      certifications: ['ABFM'],
      languages: ['English'],
      telehealth: true,
      inPerson: true,
      acceptingNewPatients: true,
      verification: ['identity_verified', 'license_verified'],
      country: 'USA',
      intro: 'Profile one',
      distance: '3 mi'
    },
    {
      slug: 'dr-priya-rao',
      name: 'Dr. Priya Rao',
      specialty: 'Pediatrics',
      city: 'Austin',
      region: 'Texas',
      credentials: 'MD',
      certifications: ['ABP'],
      languages: ['English', 'Hindi'],
      telehealth: false,
      inPerson: true,
      acceptingNewPatients: true,
      verification: ['identity_verified', 'license_verified', 'certification_verified'],
      country: 'USA',
      intro: 'Profile two',
      distance: '5 mi'
    }
  ];

  const state = {
    getCurrentSession() {
      return { doctorSlug: 'dr-elena-morris' };
    },
    getDoctorBySlug(slug) {
      return {
        slug,
        reviewDate: '2026-09-15',
        profile: {
          additionalSpecialties: ['Preventive Care'],
          licensedJurisdiction: 'Texas',
          licenseExpiration: '2027-04-30',
          education: 'Education details',
          officeName: 'Austin Pediatrics',
          officeAddress: '100 Main St',
          publicPhone: '(555) 010-0002',
          website: 'https://austin.example',
          appointmentUrl: 'https://booking.example/rao',
          visibility: {
            showExactAddress: true,
            showPublicPhone: true,
            showWebsite: true
          },
          articles: [
            {
              slug: 'dr-priya-rao-shared-decision-making',
              title: 'Shared decision-making in pediatrics',
              status: 'published',
              summary: 'Educational summary'
            }
          ]
        }
      };
    }
  };

  await new DoctorProfileController({
    documentRoot,
    location: { href: 'https://example.test/pages/doctor-profile.html?doctor=dr-priya-rao' },
    content: { async getDoctors() { return doctors; } },
    state
  }).initialize();

  assert.equal(documentRoot.nodes.get('[data-doctor-name]').textContent, 'Dr. Priya Rao');
  assert.match(documentRoot.nodes.get('[data-doctor-subtitle]').textContent, /Austin, Texas/);
  assert.match(documentRoot.nodes.get('[data-doctor-verification-list]').innerHTML, /Certification Independently Verified/);
  assert.match(documentRoot.nodes.get('[data-doctor-articles]').innerHTML, /dr-priya-rao-shared-decision-making/);
});
