import { DOCTORS } from '../data/doctors.js';
import { SITE_CONTENT } from '../data/siteContent.js';

export const staticContentProvider = {
  name: 'static-content',
  async getSiteContent() {
    return SITE_CONTENT;
  },
  async getDoctors() {
    return DOCTORS;
  }
};

export class ContentService {
  constructor({ provider = staticContentProvider, middleware = [] } = {}) {
    this.provider = provider;
    this.middleware = [...middleware];
  }

  use(middleware) {
    this.middleware.push(middleware);
    return this;
  }

  async getSiteContent() {
    return this.run('siteContent', () => this.provider.getSiteContent());
  }

  async getDoctors() {
    return this.run('doctors', () => this.provider.getDoctors());
  }

  async getPublicDoctorIndex() {
    const doctors = await this.getDoctors();
    return doctors.map((doctor) => ({
      name: doctor.name,
      credentials: doctor.credentials,
      specialty: doctor.specialty,
      city: doctor.city,
      region: doctor.region,
      country: doctor.country,
      intro: doctor.intro,
      certifications: doctor.certifications,
      languages: doctor.languages,
      telehealth: doctor.telehealth,
      inPerson: doctor.inPerson,
      acceptingNewPatients: doctor.acceptingNewPatients,
      distance: doctor.distance,
      verification: doctor.verification
    }));
  }

  async run(resource, readProvider) {
    const context = { resource, provider: this.provider.name ?? 'content-provider' };

    const dispatch = async (index) => {
      const middleware = this.middleware[index];
      if (!middleware) return readProvider();

      let nextCalled = false;
      return middleware(context, async () => {
        if (nextCalled) throw new Error('Content middleware next() called more than once');
        nextCalled = true;
        return dispatch(index + 1);
      });
    };

    return dispatch(0);
  }
}

export const contentService = new ContentService();