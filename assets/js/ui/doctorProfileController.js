import { contentService } from '../services/contentService.js';
import { BetaStateService } from '../services/betaStateService.js';
import { VERIFICATION_BADGES } from '../config/constants.js';

function toBadgeLabel(key) {
  return VERIFICATION_BADGES.find((badge) => badge.key === key)?.label ?? key;
}

function renderList(items) {
  return items.map((item) => `<li>${item}</li>`).join('');
}

export class DoctorProfileController {
  constructor({
    documentRoot = document,
    location = globalThis.location,
    content = contentService,
    state = new BetaStateService()
  } = {}) {
    this.documentRoot = documentRoot;
    this.location = location;
    this.content = content;
    this.state = state;
    this.profileRoot = this.documentRoot.querySelector('[data-doctor-profile-page]');
  }

  async initialize() {
    if (!this.profileRoot) return;

    const slug = new URL(this.location.href).searchParams.get('doctor') ?? this.state.getCurrentSession()?.doctorSlug ?? '';
    const doctors = await this.content.getDoctors();
    const publicDoctor = doctors.find((doctor) => doctor.slug === slug) ?? doctors[0];
    if (!publicDoctor) return;

    const application = this.state.getDoctorBySlug(publicDoctor.slug);
    this.render(publicDoctor, application);
  }

  render(doctor, application) {
    const title = this.documentRoot.querySelector('[data-doctor-name]');
    const subtitle = this.documentRoot.querySelector('[data-doctor-subtitle]');
    const verificationList = this.documentRoot.querySelector('[data-doctor-verification-list]');
    const reviewDate = this.documentRoot.querySelector('[data-doctor-review-date]');
    const clinical = this.documentRoot.querySelector('[data-doctor-clinical]');
    const credentials = this.documentRoot.querySelector('[data-doctor-credentials]');
    const credentialsSummary = this.documentRoot.querySelector('[data-doctor-education]');
    const office = this.documentRoot.querySelector('[data-doctor-office]');
    const articles = this.documentRoot.querySelector('[data-doctor-articles]');
    const fallbackProfile = application?.profile ?? {};

    if (title) title.textContent = doctor.name;
    if (subtitle) subtitle.textContent = `${doctor.specialty} in ${doctor.city}, ${doctor.region}. Educational directory listing with verification details.`;
    if (verificationList) verificationList.innerHTML = renderList(doctor.verification.map(toBadgeLabel));
    if (reviewDate) reviewDate.textContent = application?.reviewDate || 'Not yet reviewed';

    if (clinical) {
      clinical.innerHTML = `
        <p><strong>Primary specialty:</strong> ${doctor.specialty}</p>
        <p><strong>Additional specialties:</strong> ${(fallbackProfile.additionalSpecialties ?? []).join(', ') || 'None listed'}</p>
        <p><strong>Languages:</strong> ${doctor.languages.join(', ')}</p>
        <p><strong>Care modes:</strong> ${doctor.inPerson ? 'In-person' : ''}${doctor.inPerson && doctor.telehealth ? ' · ' : ''}${doctor.telehealth ? 'Telehealth' : ''}</p>
        <p><strong>Accepting new patients:</strong> ${doctor.acceptingNewPatients ? 'Yes' : 'No'}</p>
      `;
    }

    if (credentials) {
      credentials.innerHTML = renderList([
        ...doctor.certifications,
        `${fallbackProfile.licensedJurisdiction ?? doctor.region} medical license (active, expiration ${fallbackProfile.licenseExpiration ?? 'Not listed'})`
      ]);
    }

    if (credentialsSummary) {
      credentialsSummary.textContent = fallbackProfile.education ?? 'Education details pending update.';
    }

    if (office) {
      const showExactAddress = fallbackProfile.visibility?.showExactAddress ?? true;
      const showPhone = fallbackProfile.visibility?.showPublicPhone ?? true;
      const showWebsite = fallbackProfile.visibility?.showWebsite ?? true;
      office.innerHTML = `
        <p><strong>Office:</strong> ${fallbackProfile.officeName ?? `${doctor.city} practice`}</p>
        <p><strong>Address:</strong> ${showExactAddress ? fallbackProfile.officeAddress ?? `${doctor.city}, ${doctor.region}` : `${doctor.city}, ${doctor.region}`}</p>
        ${showPhone ? `<p><strong>Public phone:</strong> ${fallbackProfile.publicPhone ?? 'Available after contact request'}</p>` : '<p><strong>Public phone:</strong> Hidden by doctor preference</p>'}
        ${showWebsite ? `<p><strong>Website:</strong> ${fallbackProfile.website ?? 'Not listed'}</p>` : '<p><strong>Website:</strong> Hidden by doctor preference</p>'}
        <p><strong>Appointment:</strong> ${fallbackProfile.appointmentUrl ?? 'Contact office for scheduling'}</p>
      `;
    }

    if (articles) {
      const publishedArticles = (fallbackProfile.articles ?? []).filter((article) => article.status === 'published');
      articles.innerHTML = publishedArticles
        .map(
          (article) => `
            <article class="doctor-card">
              <strong>${article.title}</strong>
              <p>${article.summary}</p>
              <a class="btn" href="/pages/article-details.html?doctor=${doctor.slug}&article=${article.slug}">Read</a>
            </article>
          `
        )
        .join('');
    }
  }
}

export async function initializeDoctorProfile() {
  await new DoctorProfileController().initialize();
}
