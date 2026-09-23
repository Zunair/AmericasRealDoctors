import test from 'node:test';
import assert from 'node:assert/strict';
import { BetaPortalController } from '../../assets/js/ui/betaPortalController.js';

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
    '[data-doctor-dashboard]',
    '[data-doctor-dashboard-status]',
    '[data-dashboard-name]',
    '[data-dashboard-completion]',
    '[data-dashboard-verification]',
    '[data-dashboard-review-date]',
    '[data-dashboard-credential-health]',
    '[data-dashboard-security]',
    '[data-dashboard-content]'
  ];
  const nodes = new Map(selectors.map((selector) => [selector, createNode()]));
  return {
    querySelector(selector) {
      return nodes.get(selector) ?? null;
    },
    createTextNode(text) {
      return { textContent: text };
    },
    nodes
  };
}

test('renders doctor dashboard summary from the active doctor session', () => {
  const documentRoot = createDocumentRoot();
  const controller = new BetaPortalController({
    documentRoot,
    state: {
      getCurrentSession() {
        return { role: 'doctor', doctorSlug: 'dr-elena-morris' };
      },
      getDoctorBySlug() {
        return {
          reviewDate: '2026-09-15',
          verification: ['identity_verified', 'license_verified', 'certification_verified'],
          profile: {
            name: 'Dr. Elena Morris',
            credentials: 'MD',
            biography: 'Bio',
            officeAddress: '1200 Main St',
            licenseNumber: 'PA-1001',
            licenseExpiration: '2027-04-30',
            website: 'https://doctor.example',
            licensedJurisdiction: 'Pennsylvania',
            articles: [
              { status: 'published' },
              { status: 'draft' },
              { status: 'published' }
            ]
          }
        };
      }
    }
  });

  controller.renderDoctorDashboard();

  assert.equal(documentRoot.nodes.get('[data-doctor-dashboard-status]').textContent, 'Signed in as Dr. Elena Morris.');
  assert.equal(documentRoot.nodes.get('[data-dashboard-name]').textContent, 'Dr. Elena Morris');
  assert.equal(documentRoot.nodes.get('[data-dashboard-completion]').textContent, '100%');
  assert.match(documentRoot.nodes.get('[data-dashboard-verification]').textContent, /identity verified; license verified; certification verified/);
  assert.equal(documentRoot.nodes.get('[data-dashboard-review-date]').textContent, '2026-09-15');
  assert.match(documentRoot.nodes.get('[data-dashboard-security]').textContent, /2FA enabled/);
  assert.equal(documentRoot.nodes.get('[data-dashboard-content]').textContent, '2 published · 1 drafts');
});
