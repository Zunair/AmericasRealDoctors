import { betaStateService } from '../services/contentService.js';

function readFormValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function formatDateTime(value) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export class BetaPortalController {
  constructor({
    documentRoot = document,
    location = globalThis.location,
    windowRef = globalThis.window,
    state = betaStateService
  } = {}) {
    this.documentRoot = documentRoot;
    this.location = location;
    this.windowRef = windowRef;
    this.state = state;
  }

  initialize() {
    this.bindRegistrationForm();
    this.bindEmailVerification();
    this.bindSignInForm();
    this.bindForgotPasswordForm();
    this.bindTwoFactorForm();
    this.bindRecoveryForm();
    this.bindContactForm();
    this.bindEditProfileForm();
    this.renderDoctorDashboard();
    this.renderCredentialManagement();
    this.renderDoctorArticles();
    this.renderArticleDetails();
    this.renderAdminDashboard();
  }

  getQueryParam(name) {
    return new URL(this.location.href).searchParams.get(name) ?? '';
  }

  redirect(url) {
    if (this.windowRef?.location?.assign) {
      this.windowRef.location.assign(url);
      return;
    }
    this.location.href = url;
  }

  requireDoctorSession(statusNode) {
    const session = this.state.getCurrentSession();
    if (session?.role === 'doctor' && session.doctorSlug) return session;
    if (statusNode) {
      statusNode.textContent = 'Sign in with a doctor account to manage this page.';
    }
    return null;
  }

  bindRegistrationForm() {
    const form = this.documentRoot.querySelector('[data-registration-form]');
    if (!form) return;

    const status = this.documentRoot.querySelector('[data-registration-status]');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = readFormValues(form);
      const action = event.submitter?.value ?? 'draft';
      const application = action === 'submit'
        ? this.state.submitRegistration(values)
        : this.state.saveRegistrationDraft(values);

      if (!status) return;

      if (action === 'submit') {
        status.textContent = 'Application saved and routed to email verification.';
        this.redirect(`/pages/email-verification.html?email=${encodeURIComponent(application.email)}`);
        return;
      }

      status.textContent = 'Draft saved locally for beta review.';
    });
  }

  bindEmailVerification() {
    const verifyButton = this.documentRoot.querySelector('[data-email-verify]');
    const resendButton = this.documentRoot.querySelector('[data-email-resend]');
    const status = this.documentRoot.querySelector('[data-email-status]');
    const email = this.getQueryParam('email');
    const emailTarget = this.documentRoot.querySelector('[data-email-target]');
    if (emailTarget && email) emailTarget.textContent = email;

    verifyButton?.addEventListener('click', () => {
      if (!status) return;
      if (!email || !this.state.verifyEmail(email)) {
        status.textContent = 'Enter registration details first so email verification can continue.';
        return;
      }
      status.textContent = 'Email verified. Continue to two-factor setup.';
      this.redirect(`/pages/two-factor-setup.html?email=${encodeURIComponent(email)}`);
    });

    resendButton?.addEventListener('click', () => {
      if (status) status.textContent = email ? `Verification reminder sent for ${email}.` : 'Start registration first to request verification.';
    });
  }

  bindSignInForm() {
    const form = this.documentRoot.querySelector('[data-sign-in-form]');
    if (!form) return;

    const status = this.documentRoot.querySelector('[data-sign-in-status]');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const result = this.state.signIn(readFormValues(form));
      if (!status) return;
      status.textContent = result.message ?? 'Signed in successfully.';
      if (result.success) {
        this.redirect(result.redirectTo);
        return;
      }
      if (result.redirectTo) this.redirect(result.redirectTo);
    });
  }

  bindForgotPasswordForm() {
    const form = this.documentRoot.querySelector('[data-forgot-password-form]');
    if (!form) return;

    const status = this.documentRoot.querySelector('[data-forgot-password-status]');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = readFormValues(form).email?.toString() ?? '';
      this.state.startPasswordReset(email);
      if (status) status.textContent = 'If the address is on file, reset instructions will be sent to the verified email.';
    });
  }

  bindTwoFactorForm() {
    const form = this.documentRoot.querySelector('[data-two-factor-form]');
    if (!form) return;

    const status = this.documentRoot.querySelector('[data-two-factor-status]');
    const email = this.getQueryParam('email') || this.state.getCurrentSession()?.email || '';
    const emailTarget = this.documentRoot.querySelector('[data-two-factor-email]');
    if (emailTarget && email) emailTarget.textContent = email;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = readFormValues(form);
      const result = this.state.enableTwoFactor({
        email,
        code: values.otp?.toString() ?? '',
        confirmedSavedCodes: values.savedRecoveryCodes === 'yes'
      });
      if (!status) return;
      status.textContent = result.success
        ? 'Two-factor authentication enabled. Sign in to continue.'
        : 'Enter a 6-digit code and confirm that recovery codes were saved.';
      if (result.success) this.redirect('/pages/sign-in.html');
    });
  }

  bindRecoveryForm() {
    const form = this.documentRoot.querySelector('[data-account-recovery-form]');
    if (!form) return;

    const status = this.documentRoot.querySelector('[data-account-recovery-status]');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const result = this.state.useRecoveryCode(readFormValues(form).recoveryCode?.toString() ?? '');
      if (!status) return;
      status.textContent = result.success ? 'Recovery code accepted. Redirecting…' : 'Recovery code not recognized.';
      if (result.success) this.redirect(result.redirectTo);
    });
  }

  bindContactForm() {
    const form = this.documentRoot.querySelector('[data-contact-form]');
    if (!form) return;

    const status = this.documentRoot.querySelector('[data-contact-status]');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.state.saveSupportRequest(readFormValues(form));
      if (status) status.textContent = 'Support request saved locally for beta follow-up.';
      form.reset();
    });
  }

  bindEditProfileForm() {
    const form = this.documentRoot.querySelector('[data-edit-profile-form]');
    if (!form) return;

    const status = this.documentRoot.querySelector('[data-edit-profile-status]');
    const session = this.requireDoctorSession(status);
    if (!session) return;

    const application = this.state.getDoctorBySlug(session.doctorSlug);
    if (!application) return;
    if (status) status.textContent = `Signed in as ${application.profile.name}.`;

    form.elements.namedItem('showExactAddress').value = application.profile.visibility.showExactAddress ? 'yes' : 'no';
    form.elements.namedItem('showPublicPhone').value = application.profile.visibility.showPublicPhone ? 'yes' : 'no';
    form.elements.namedItem('showWebsite').value = application.profile.visibility.showWebsite ? 'yes' : 'no';
    form.elements.namedItem('intro').value = application.profile.intro;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = readFormValues(form);
      this.state.updateCurrentDoctorProfile({
        showExactAddress: values.showExactAddress === 'yes',
        showPublicPhone: values.showPublicPhone === 'yes',
        showWebsite: values.showWebsite === 'yes',
        intro: values.intro.toString().trim()
      });
      if (status) status.textContent = 'Profile visibility settings saved.';
    });
  }

  renderDoctorDashboard() {
    const root = this.documentRoot.querySelector('[data-doctor-dashboard]');
    if (!root) return;

    const status = this.documentRoot.querySelector('[data-doctor-dashboard-status]');
    const session = this.requireDoctorSession(status);
    if (!session) return;

    const application = this.state.getDoctorBySlug(session.doctorSlug);
    if (!application) return;
    if (status) status.textContent = `Signed in as ${application.profile.name}.`;

    const profile = application.profile;
    const completedSections = [
      profile.credentials,
      profile.biography,
      profile.officeAddress,
      profile.licenseNumber,
      profile.licenseExpiration,
      profile.website
    ].filter(Boolean).length;
    const completion = Math.round((completedSections / 6) * 100);

    this.documentRoot.querySelector('[data-dashboard-name]')?.replaceChildren(this.documentRoot.createTextNode(profile.name));
    this.documentRoot.querySelector('[data-dashboard-completion]')?.replaceChildren(this.documentRoot.createTextNode(`${completion}%`));
    this.documentRoot.querySelector('[data-dashboard-verification]')?.replaceChildren(this.documentRoot.createTextNode(application.verification.join('; ').replaceAll('_', ' ')));
    this.documentRoot.querySelector('[data-dashboard-review-date]')?.replaceChildren(this.documentRoot.createTextNode(application.reviewDate || 'Pending review'));
    this.documentRoot.querySelector('[data-dashboard-credential-health]')?.replaceChildren(
      this.documentRoot.createTextNode(`${profile.licensedJurisdiction} license active until ${profile.licenseExpiration}`)
    );
    this.documentRoot.querySelector('[data-dashboard-security]')?.replaceChildren(
      this.documentRoot.createTextNode(`2FA ${this.state.getCurrentSession() ? 'enabled' : 'required'} · Recovery codes available in account recovery`)
    );
    this.documentRoot.querySelector('[data-dashboard-content]')?.replaceChildren(
      this.documentRoot.createTextNode(`${profile.articles.filter((article) => article.status === 'published').length} published · ${profile.articles.filter((article) => article.status === 'draft').length} drafts`)
    );
  }

  renderCredentialManagement() {
    const body = this.documentRoot.querySelector('[data-credential-table-body]');
    if (!body) return;

    const status = this.documentRoot.querySelector('[data-credential-status]');
    const session = this.requireDoctorSession(status);
    if (!session) return;

    const application = this.state.getDoctorBySlug(session.doctorSlug);
    if (!application) return;
    if (status) status.textContent = `Managing credentials for ${application.profile.name}.`;

    const profile = application.profile;
    body.innerHTML = `
      <tr>
        <td>${profile.licensedJurisdiction} Medical License</td>
        <td>${application.verification.includes('license_verified') ? 'Verified' : 'Submitted'}</td>
        <td>${profile.licenseExpiration}</td>
        <td><button class="btn" type="button" data-credential-action>Upload renewal</button></td>
      </tr>
      <tr>
        <td>${profile.certifications[0] ?? 'Certification'}</td>
        <td>${application.verification.includes('certification_verified') ? 'Verified' : 'Submitted'}</td>
        <td>${profile.licenseExpiration}</td>
        <td><button class="btn" type="button" data-credential-action>Add document</button></td>
      </tr>
    `;

    body.addEventListener('click', (event) => {
      if (!(event.target instanceof HTMLElement) || !event.target.matches('[data-credential-action]')) return;
      if (status) status.textContent = 'Document intake stays local in beta; the request is ready for backend wiring.';
    });
  }

  renderDoctorArticles() {
    const list = this.documentRoot.querySelector('[data-doctor-article-list]');
    if (!list) return;

    const status = this.documentRoot.querySelector('[data-doctor-articles-status]');
    const session = this.requireDoctorSession(status);
    if (!session) return;

    const application = this.state.getDoctorBySlug(session.doctorSlug);
    if (!application) return;
    if (status) status.textContent = `Showing article queue for ${application.profile.name}.`;

    list.innerHTML = application.profile.articles
      .map(
        (article) => `
          <article class="doctor-card">
            <strong>${article.status === 'draft' ? 'Draft' : 'Published'}: ${article.title}</strong>
            <p>Category: ${article.category}</p>
            ${article.status === 'published' ? `<a class="btn" href="/pages/article-details.html?doctor=${application.slug}&article=${article.slug}">View article</a>` : ''}
          </article>
        `
      )
      .join('');
  }

  renderArticleDetails() {
    const articleRoot = this.documentRoot.querySelector('[data-article-details]');
    if (!articleRoot) return;

    const doctorSlug = this.getQueryParam('doctor');
    if (!doctorSlug) return;
    const application = doctorSlug ? this.state.getDoctorBySlug(doctorSlug) : null;
    const articles = application?.profile.articles?.filter((article) => article.status === 'published') ?? [];
    const articleSlug = this.getQueryParam('article');
    const article = articles.find((entry) => entry.slug === articleSlug) ?? articles[0];
    if (!application || !article) return;

    this.documentRoot.querySelector('[data-article-title]')?.replaceChildren(this.documentRoot.createTextNode(article.title));
    this.documentRoot.querySelector('[data-article-author]')?.replaceChildren(
      this.documentRoot.createTextNode(`${application.profile.name} · Identity verified · Medical license verified`)
    );
    this.documentRoot.querySelector('[data-article-summary]')?.replaceChildren(this.documentRoot.createTextNode(article.summary));
    this.documentRoot.querySelector('[data-article-references]')?.replaceChildren(
      ...article.references.map((reference) => {
        const item = this.documentRoot.createElement('li');
        item.textContent = reference;
        return item;
      })
    );
  }

  renderAdminDashboard() {
    const queue = this.documentRoot.querySelector('[data-admin-queue]');
    const auditBody = this.documentRoot.querySelector('[data-admin-audit-body]');
    if (!queue || !auditBody) return;

    const status = this.documentRoot.querySelector('[data-admin-status]');
    const session = this.state.getCurrentSession();
    if (session?.role !== 'admin' && status) {
      status.textContent = 'Sign in with the beta admin account to manage applications.';
      const pendingCountNode = this.documentRoot.querySelector('[data-admin-pending-count]');
      const expiringCountNode = this.documentRoot.querySelector('[data-admin-expiring-count]');
      if (pendingCountNode) pendingCountNode.textContent = '0';
      if (expiringCountNode) expiringCountNode.textContent = '0';
      queue.innerHTML = '<p class="notice">Administrator access is required to view the review queue.</p>';
      auditBody.innerHTML = '';
      return;
    }

    const render = () => {
      const applications = this.state.getApplications();
      const pendingApplications = applications.filter((application) => application.status !== 'approved');
      const currentTime = this.state.now().getTime();
      const expiringCount = applications.filter((application) => {
        if (!application.profile.licenseExpiration) return false;
        const difference = new Date(application.profile.licenseExpiration).getTime() - currentTime;
        return difference > 0 && difference <= 1000 * 60 * 60 * 24 * 60;
      }).length;

      const pendingCountNode = this.documentRoot.querySelector('[data-admin-pending-count]');
      const expiringCountNode = this.documentRoot.querySelector('[data-admin-expiring-count]');
      if (pendingCountNode) pendingCountNode.textContent = String(pendingApplications.length);
      if (expiringCountNode) expiringCountNode.textContent = String(expiringCount);

      queue.innerHTML = pendingApplications.length
        ? pendingApplications
            .map(
              (application) => `
                <article class="doctor-card">
                  <strong>${application.profile.name}</strong>
                  <p>${application.profile.specialty} · ${application.profile.city}, ${application.profile.region}</p>
                  <p>Status: ${application.status}</p>
                  <div class="actions">
                    <button class="btn btn-primary" type="button" data-admin-approve="${application.slug}">Approve</button>
                    <button class="btn" type="button" data-admin-return="${application.slug}">Keep in queue</button>
                  </div>
                </article>
              `
            )
            .join('')
        : '<p class="notice">Application queue is clear.</p>';

      auditBody.innerHTML = this.state
        .getAuditLog()
        .map(
          (entry) => `
            <tr>
              <td>${entry.actorEmail}</td>
              <td>${formatDateTime(entry.date)}</td>
              <td>${entry.action}</td>
              <td>${entry.profile}</td>
              <td>${entry.transition}</td>
              <td>${entry.note}</td>
            </tr>
          `
        )
        .join('');
    };

    queue.addEventListener('click', (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      const approveSlug = event.target.dataset.adminApprove;
      const returnSlug = event.target.dataset.adminReturn;
      if (!approveSlug && !returnSlug) return;
      if (session?.role !== 'admin') {
        if (status) status.textContent = 'Admin sign-in is required before queue actions can run.';
        return;
      }

      if (approveSlug) {
        this.state.setApplicationStatus({ slug: approveSlug, status: 'approved' });
        if (status) status.textContent = 'Application approved and published to the beta directory.';
      }
      if (returnSlug) {
        this.state.setApplicationStatus({ slug: returnSlug, status: 'pending', note: 'Held for follow-up' });
        if (status) status.textContent = 'Application remains in the review queue.';
      }
      render();
    });

    this.documentRoot.querySelector('[data-admin-review-button]')?.addEventListener('click', () => {
      if (status) status.textContent = 'Review queue loaded below.';
    });
    this.documentRoot.querySelector('[data-admin-expiring-button]')?.addEventListener('click', () => {
      if (status) status.textContent = 'Expiring credentials are listed in the dashboard totals.';
    });

    render();
  }
}

export function initializeBetaPortal() {
  new BetaPortalController().initialize();
}
