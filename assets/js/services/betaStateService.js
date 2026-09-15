const STORAGE_KEY = 'ard-beta-state-v1';

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCaseWords(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function splitDoctorName(name) {
  const normalized = name.replace(/^Dr\.\s*/i, '').trim();
  const [firstName = '', ...rest] = normalized.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' ')
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildSeedApplication(doctor) {
  const { firstName, lastName } = splitDoctorName(doctor.name);
  const slug = createSlug(doctor.name);
  const primaryCertification = doctor.certifications[0] ?? 'Board certification';

  return {
    slug,
    email: `${slug}@beta.americasrealdoctors.local`,
    status: 'approved',
    createdAt: '2026-07-20T12:00:00.000Z',
    updatedAt: '2026-07-25T12:00:00.000Z',
    submittedAt: '2026-07-22T12:00:00.000Z',
    reviewDate: '2026-07-25',
    verification: [...doctor.verification],
    profile: {
      name: doctor.name,
      credentials: doctor.credentials,
      specialty: doctor.specialty,
      additionalSpecialties: doctor.specialty === 'Family Medicine' ? ['Integrative Medicine', 'Preventive Care'] : [],
      city: doctor.city,
      region: doctor.region,
      country: doctor.country,
      intro: doctor.intro,
      biography: `${doctor.intro} Educational directory listing for beta release review.`,
      certifications: [...doctor.certifications],
      languages: [...doctor.languages],
      telehealth: doctor.telehealth,
      inPerson: doctor.inPerson,
      acceptingNewPatients: doctor.acceptingNewPatients,
      distance: doctor.distance,
      licenseNumber: `${doctor.region.slice(0, 2).toUpperCase()}-${slug.slice(-4).toUpperCase()}`,
      licensingAuthority: `${doctor.region} Medical Board`,
      licensedJurisdiction: doctor.region,
      licenseExpiration: '2027-04-30',
      officeName: `${lastName || firstName} Care`,
      officeAddress: `1200 ${doctor.city} Medical Plaza`,
      publicPhone: '(555) 010-2026',
      publicEmail: `${slug}@practice.example`,
      website: `https://${slug}.example`,
      appointmentUrl: `https://booking.example/${slug}`,
      education: `${titleCaseWords(doctor.specialty)} residency and continuing education.`,
      visibility: {
        showExactAddress: true,
        showPublicPhone: true,
        showWebsite: true
      },
      articles: [
        {
          slug: `${slug}-shared-decision-making`,
          title: `Shared decision-making in ${doctor.specialty.toLowerCase()}`,
          category: doctor.specialty,
          status: 'published',
          summary: 'Educational article to support patient understanding and informed discussions.',
          references: ['CDC preventive care recommendations', 'USPSTF guidelines']
        },
        {
          slug: `${slug}-preventive-care-draft`,
          title: 'Preventive checkups and informed consent',
          category: 'Preventive Care',
          status: 'draft',
          summary: 'Draft educational article for beta workflows.',
          references: []
        }
      ]
    },
    notes: `${primaryCertification} confirmed during beta review.`
  };
}

function buildSeedAccount(application, index) {
  return {
    email: application.email,
    role: 'doctor',
    doctorSlug: application.slug,
    password: 'BetaDoctor!1234',
    otpCode: `12345${index + 1}`,
    emailVerified: true,
    twoFactorEnabled: true,
    recoveryCodes: [`${application.slug.toUpperCase()}-REC-1`, `${application.slug.toUpperCase()}-REC-2`],
    createdAt: application.createdAt
  };
}

function buildDefaultState(seedDoctors) {
  const applications = seedDoctors.map(buildSeedApplication);
  return {
    version: 1,
    currentSession: null,
    applications,
    accounts: [
      {
        email: 'admin@beta.americasrealdoctors.local',
        role: 'admin',
        doctorSlug: '',
        password: 'BetaAdmin!1234',
        otpCode: '654321',
        emailVerified: true,
        twoFactorEnabled: true,
        recoveryCodes: ['ADMIN-RECOVERY-1', 'ADMIN-RECOVERY-2'],
        createdAt: '2026-07-15T12:00:00.000Z'
      },
      ...applications.map(buildSeedAccount)
    ],
    supportRequests: [],
    passwordResetRequests: [],
    auditLog: [
      {
        actorEmail: 'admin@beta.americasrealdoctors.local',
        date: '2026-07-25T14:30:00.000Z',
        action: 'Approve',
        profile: applications[0]?.profile.name ?? 'Doctor profile',
        transition: 'Pending → Approved',
        note: 'License validated'
      }
    ]
  };
}

function createApplicationFromRegistration(data, existingApplication) {
  const baseName = `Dr. ${data.firstName.trim()} ${data.lastName.trim()}`.trim();
  const slug = existingApplication?.slug ?? createSlug(baseName);
  const primaryField = data.specialty.trim();
  const languages = data.languages
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    slug,
    email: data.email.trim().toLowerCase(),
    status: existingApplication?.status ?? 'draft',
    createdAt: existingApplication?.createdAt ?? data.timestamp,
    updatedAt: data.timestamp,
    submittedAt: existingApplication?.submittedAt ?? '',
    reviewDate: existingApplication?.reviewDate ?? '',
    verification: existingApplication?.verification ?? ['identity_verified', 'license_verified', 'certification_submitted'],
    notes: existingApplication?.notes ?? 'Awaiting administrative review.',
    profile: {
      name: baseName,
      credentials: data.credentials.trim(),
      specialty: primaryField,
      additionalSpecialties: data.additionalSpecialties
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      city: data.city.trim(),
      region: data.region.trim(),
      country: data.country.trim(),
      intro: data.biography.trim().slice(0, 180) || `${primaryField} profile pending review.`,
      biography: data.biography.trim(),
      certifications: existingApplication?.profile.certifications ?? ['Certification submitted'],
      languages: languages.length ? languages : ['English'],
      telehealth: data.careMode === 'telehealth' || data.careMode === 'both',
      inPerson: data.careMode === 'in-person' || data.careMode === 'both',
      acceptingNewPatients: data.acceptingNewPatients === 'yes',
      distance: existingApplication?.profile.distance ?? '0 mi',
      licenseNumber: data.licenseNumber.trim(),
      licensingAuthority: data.licensingAuthority.trim(),
      licensedJurisdiction: data.licensedJurisdiction.trim(),
      licenseExpiration: data.licenseExpiration,
      officeName: data.officeName.trim(),
      officeAddress: data.officeAddress.trim(),
      publicPhone: data.publicPhone.trim(),
      publicEmail: data.publicEmail.trim(),
      website: data.website.trim(),
      appointmentUrl: data.appointmentUrl.trim(),
      education: existingApplication?.profile.education ?? 'Doctor-provided background pending administrative review.',
      visibility: existingApplication?.profile.visibility ?? {
        showExactAddress: false,
        showPublicPhone: true,
        showWebsite: true
      },
      articles: existingApplication?.profile.articles ?? []
    }
  };
}

export class BetaStateService {
  constructor({ storage = globalThis.localStorage, seedDoctors = [], now = () => new Date() } = {}) {
    this.storage = storage;
    this.seedDoctors = seedDoctors;
    this.now = now;
  }

  readState() {
    const fallback = buildDefaultState(this.seedDoctors);
    if (!this.storage) return fallback;

    const stored = this.storage.getItem(STORAGE_KEY);
    if (!stored) {
      this.writeState(fallback);
      return clone(fallback);
    }

    try {
      const parsed = JSON.parse(stored);
      if (!parsed || parsed.version !== 1) {
        this.writeState(fallback);
        return clone(fallback);
      }
      return parsed;
    } catch {
      this.writeState(fallback);
      return clone(fallback);
    }
  }

  writeState(state) {
    if (!this.storage) return clone(state);
    this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return clone(state);
  }

  reset() {
    return this.writeState(buildDefaultState(this.seedDoctors));
  }

  getApprovedDoctors() {
    return this.readState()
      .applications.filter((application) => application.status === 'approved')
      .map((application) => this.toPublicDoctor(application));
  }

  getDirectoryDoctors(canonicalDoctors = this.seedDoctors) {
    const approvedDoctors = this.getApprovedDoctors();
    const approvedBySlug = new Map(approvedDoctors.map((doctor) => [doctor.slug, doctor]));
    const canonicalSlugs = canonicalDoctors.map((doctor) => createSlug(doctor.name));
    const mergedDoctors = canonicalDoctors.map((doctor) => {
      const slug = createSlug(doctor.name);
      return approvedBySlug.get(slug) ?? { slug, ...doctor };
    });
    const betaOnlyDoctors = approvedDoctors.filter((doctor) => !canonicalSlugs.includes(doctor.slug));
    return [...mergedDoctors, ...betaOnlyDoctors];
  }

  getDoctorBySlug(slug) {
    const application = this.readState().applications.find((entry) => entry.slug === slug);
    return application ? clone(application) : null;
  }

  getCurrentSession() {
    return clone(this.readState().currentSession);
  }

  getCurrentDoctorApplication() {
    const session = this.getCurrentSession();
    if (!session?.doctorSlug) return null;
    return this.getDoctorBySlug(session.doctorSlug);
  }

  getApplications({ includeApproved = true } = {}) {
    const applications = this.readState().applications;
    return clone(includeApproved ? applications : applications.filter((application) => application.status !== 'approved'));
  }

  getAuditLog() {
    return clone(this.readState().auditLog);
  }

  saveRegistrationDraft(formData) {
    return this.upsertRegistration(formData, 'draft');
  }

  submitRegistration(formData) {
    return this.upsertRegistration(formData, 'pending');
  }

  upsertRegistration(formData, status) {
    const state = this.readState();
    const email = formData.email.trim().toLowerCase();
    const timestamp = this.now().toISOString();
    const existingApplication = state.applications.find((application) => application.email === email);
    const application = createApplicationFromRegistration({ ...formData, timestamp }, existingApplication);
    application.status = status;
    if (status === 'pending') application.submittedAt = timestamp;

    const nextApplications = existingApplication
      ? state.applications.map((entry) => (entry.email === email ? application : entry))
      : [...state.applications, application];
    state.applications = nextApplications;

    const existingAccount = state.accounts.find((account) => account.email === email);
    const account = {
      email,
      role: 'doctor',
      doctorSlug: application.slug,
      password: formData.password,
      otpCode: existingAccount?.otpCode ?? '123456',
      emailVerified: existingAccount?.emailVerified ?? false,
      twoFactorEnabled: existingAccount?.twoFactorEnabled ?? false,
      recoveryCodes: existingAccount?.recoveryCodes ?? [`${application.slug.toUpperCase()}-REC-1`, `${application.slug.toUpperCase()}-REC-2`],
      createdAt: existingAccount?.createdAt ?? timestamp
    };
    state.accounts = existingAccount
      ? state.accounts.map((entry) => (entry.email === email ? account : entry))
      : [...state.accounts, account];

    this.writeState(state);
    return clone(application);
  }

  verifyEmail(email) {
    const state = this.readState();
    const normalizedEmail = email.trim().toLowerCase();
    let verified = false;
    state.accounts = state.accounts.map((account) => {
      if (account.email !== normalizedEmail) return account;
      verified = true;
      return { ...account, emailVerified: true };
    });
    if (verified) this.writeState(state);
    return verified;
  }

  enableTwoFactor({ email, code, confirmedSavedCodes }) {
    if (!/^\d{6}$/.test(code) || !confirmedSavedCodes) return { success: false };

    const state = this.readState();
    const normalizedEmail = email.trim().toLowerCase();
    const account = state.accounts.find((entry) => entry.email === normalizedEmail);
    if (!account?.emailVerified) return { success: false };
    let enabledAccount = null;
    state.accounts = state.accounts.map((account) => {
      if (account.email !== normalizedEmail) return account;
      enabledAccount = { ...account, twoFactorEnabled: true, otpCode: code };
      return enabledAccount;
    });

    if (!enabledAccount) return { success: false };

    this.writeState(state);
    return { success: true, account: clone(enabledAccount) };
  }

  startPasswordReset(email) {
    const state = this.readState();
    const normalizedEmail = email.trim().toLowerCase();
    const account = state.accounts.find((entry) => entry.email === normalizedEmail);
    if (account) {
      state.passwordResetRequests.unshift({
        email: normalizedEmail,
        requestedAt: this.now().toISOString()
      });
      this.writeState(state);
    }
    return { success: true };
  }

  signIn({ email, password, otp }) {
    const state = this.readState();
    const normalizedEmail = email.trim().toLowerCase();
    const account = state.accounts.find((entry) => entry.email === normalizedEmail);
    if (!account || account.password !== password) {
      return { success: false, message: 'Incorrect email or password.' };
    }
    if (!account.emailVerified) {
      return { success: false, message: 'Verify your email before signing in.', redirectTo: `/pages/email-verification.html?email=${encodeURIComponent(normalizedEmail)}` };
    }
    if (!account.twoFactorEnabled) {
      return { success: false, message: 'Finish two-factor setup before signing in.', redirectTo: `/pages/two-factor-setup.html?email=${encodeURIComponent(normalizedEmail)}` };
    }
    if (account.otpCode !== otp.trim()) {
      return { success: false, message: 'Incorrect authenticator code.' };
    }

    state.currentSession = {
      email: normalizedEmail,
      role: account.role,
      doctorSlug: account.doctorSlug,
      signedInAt: this.now().toISOString()
    };
    this.writeState(state);
    return {
      success: true,
      session: clone(state.currentSession),
      redirectTo: account.role === 'admin' ? '/pages/admin-dashboard.html' : '/pages/doctor-dashboard.html'
    };
  }

  useRecoveryCode(code) {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) return { success: false };

    const state = this.readState();
    const account = state.accounts.find((entry) => entry.recoveryCodes.includes(normalizedCode));
    if (!account || !account.emailVerified || !account.twoFactorEnabled) return { success: false };

    account.recoveryCodes = account.recoveryCodes.filter((value) => value !== normalizedCode);
    state.currentSession = {
      email: account.email,
      role: account.role,
      doctorSlug: account.doctorSlug,
      signedInAt: this.now().toISOString()
    };
    this.writeState(state);
    return {
      success: true,
      redirectTo: account.role === 'admin' ? '/pages/admin-dashboard.html' : '/pages/doctor-dashboard.html'
    };
  }

  saveSupportRequest(formData) {
    const state = this.readState();
    state.supportRequests.unshift({
      id: `${this.now().toISOString()}-${state.supportRequests.length + 1}`,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      message: formData.message.trim(),
      submittedAt: this.now().toISOString()
    });
    this.writeState(state);
    return { success: true };
  }

  updateCurrentDoctorProfile(updates) {
    const session = this.getCurrentSession();
    if (session?.role !== 'doctor' || !session.doctorSlug) return null;

    const state = this.readState();
    let updatedApplication = null;

    state.applications = state.applications.map((application) => {
      if (application.slug !== session.doctorSlug) return application;

      updatedApplication = {
        ...application,
        updatedAt: this.now().toISOString(),
        profile: {
          ...application.profile,
          intro: updates.intro,
          visibility: {
            showExactAddress: updates.showExactAddress,
            showPublicPhone: updates.showPublicPhone,
            showWebsite: updates.showWebsite
          }
        }
      };
      return updatedApplication;
    });

    if (!updatedApplication) return null;

    this.writeState(state);
    return clone(updatedApplication);
  }

  setApplicationStatus({ slug, status, note = '', actorEmail = 'admin@beta.americasrealdoctors.local' }) {
    const state = this.readState();
    if (state.currentSession?.role !== 'admin') return null;
    const previous = state.applications.find((application) => application.slug === slug);
    if (!previous) return null;

    const nextStatus = status === 'approved' ? 'approved' : 'pending';
    const updatedApplication = {
      ...previous,
      status: nextStatus,
      updatedAt: this.now().toISOString(),
      reviewDate: nextStatus === 'approved' ? this.now().toISOString().slice(0, 10) : previous.reviewDate,
      notes: note || previous.notes
    };
    state.applications = state.applications.map((application) => (application.slug === slug ? updatedApplication : application));
    state.auditLog.unshift({
      actorEmail,
      date: this.now().toISOString(),
      action: nextStatus === 'approved' ? 'Approve' : 'Return to queue',
      profile: updatedApplication.profile.name,
      transition: `${titleCaseWords(previous.status)} → ${titleCaseWords(nextStatus)}`,
      note: note || (nextStatus === 'approved' ? 'Approved for beta publication' : 'Returned for follow-up')
    });
    this.writeState(state);
    return clone(updatedApplication);
  }

  toPublicDoctor(application) {
    const { profile } = application;
    return {
      slug: application.slug,
      name: profile.name,
      credentials: profile.credentials,
      specialty: profile.specialty,
      city: profile.city,
      region: profile.region,
      country: profile.country,
      intro: profile.intro,
      certifications: [...profile.certifications],
      languages: [...profile.languages],
      telehealth: profile.telehealth,
      inPerson: profile.inPerson,
      acceptingNewPatients: profile.acceptingNewPatients,
      distance: profile.distance,
      verification: [...application.verification]
    };
  }
}
