import { MapService } from '../services/mapService.js';
import { contentService } from '../services/contentService.js';
import { DOCTOR_SEARCH_FIELDS, DoctorSearchStateService } from '../services/doctorSearchStateService.js';

export class MapController {
  constructor({ documentRoot = document, doctors = [], mapService = new MapService(doctors), searchState = new DoctorSearchStateService() } = {}) {
    this.documentRoot = documentRoot;
    this.doctors = doctors;
    this.mapService = mapService;
    this.searchState = searchState;
    this.mapRoot = this.documentRoot.querySelector('[data-map-enabled]');
    this.searchForm = this.documentRoot.querySelector('[data-search-form]');
    this.clusterButtons = this.documentRoot.querySelectorAll('[data-cluster]');
    this.preview = this.documentRoot.querySelector('[data-map-preview]');
    this.cityField = this.documentRoot.querySelector('[name="city"]');
    this.list = this.documentRoot.querySelector('[data-doctor-list]');
  }

  initialize() {
    if (!this.mapRoot) return;

    this.bindClusterButtons();
    this.bindSearchArea();
    this.bindSearchForm();
    this.bindGeolocation();
    this.bindViewSwitches();
    this.renderDoctors(this.getInitialDoctors());
  }

  renderDoctors(doctors) {
    if (!this.list) return;

    if (!doctors.length) {
      this.list.innerHTML = '<p class="notice">No doctors match those filters yet. Try broadening the search or checking another city.</p>';
      return;
    }

    this.list.innerHTML = doctors
      .map(
        (doctor) => `
          <article class="doctor-card" aria-label="${doctor.name}">
            <div class="card-head">
              <div class="avatar" aria-hidden="true"></div>
              <div>
                <strong>${doctor.name}</strong> <span>${doctor.credentials}</span><br>
                <small>${doctor.specialty} · ${doctor.city}, ${doctor.region}, ${doctor.country}</small>
              </div>
            </div>
            <p>${doctor.intro}</p>
            <div>
              ${doctor.certifications.map((cert) => `<span class="badge">${cert}</span>`).join('')}
              ${doctor.languages.map((language) => `<span class="badge">${language}</span>`).join('')}
              ${doctor.telehealth ? '<span class="badge">Telehealth</span>' : ''}
              ${doctor.acceptingNewPatients ? '<span class="badge">Accepting New Patients</span>' : ''}
              <span class="badge">${doctor.distance}</span>
            </div>
            <a class="btn" href="/pages/doctor-profile.html?doctor=${encodeURIComponent(doctor.slug ?? '')}">View Profile</a>
          </article>`
      )
      .join('');
  }

  bindClusterButtons() {
    this.clusterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const city = button.dataset.city;
        const docs = button.dataset.docs;
        if (this.preview) this.preview.innerHTML = `<strong>${city}</strong> · ${docs} doctors<br><small>Use Search this area to sync the list.</small>`;
        if (this.cityField) this.cityField.value = city;
      });
    });
  }

  bindSearchArea() {
    this.documentRoot.querySelector('[data-search-area]')?.addEventListener('click', () => {
      const city = this.cityField?.value ?? '';
      this.renderDoctors(this.mapService.filterDoctors({ city }));
    });
  }

  bindSearchForm() {
    this.searchForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = this.readFormValues(event.currentTarget);
      if (event.currentTarget.hasAttribute('data-sync-search-url')) this.searchState.replace(values);
      this.renderDoctors(this.mapService.filterDoctors(this.toDoctorFilters(values)));
    });
  }

  getInitialDoctors() {
    if (!this.searchForm?.hasAttribute('data-sync-search-url')) return this.doctors;

    const values = this.searchState.read();
    for (const [field, value] of Object.entries(values)) {
      const control = this.searchForm.elements.namedItem(field);
      if (control) control.value = value;
    }

    return this.mapService.filterDoctors(this.toDoctorFilters(values));
  }

  readFormValues(form) {
    const formData = new FormData(form);
    return {
      doctorName: formData.get('doctorName')?.toString() ?? '',
      country: formData.get('country')?.toString() ?? '',
      region: formData.get('region')?.toString() ?? '',
      city: formData.get('city')?.toString() ?? '',
      distance: formData.get('distance')?.toString() ?? '',
      specialty: formData.get('specialty')?.toString() ?? '',
      certification: formData.get('certification')?.toString() ?? formData.get('certifications')?.toString() ?? '',
      language: formData.get('language')?.toString() ?? formData.get('languages')?.toString() ?? '',
      telehealth: formData.get('telehealth')?.toString() ?? '',
      accepting: formData.get('accepting')?.toString() ?? '',
      careMode: formData.get('careMode')?.toString() ?? this.normalizeCareMode(formData.get('mode')?.toString() ?? ''),
      verified: formData.get('verified')?.toString() ?? formData.get('verifiedOnly')?.toString() ?? ''
    };
  }

  toDoctorFilters(values) {
    return {
      name: values.doctorName ?? '',
      country: values.country ?? '',
      region: values.region ?? '',
      city: values.city ?? '',
      distance: values.distance ?? '',
      specialty: values.specialty ?? '',
      certification: values.certification ?? '',
      language: values.language ?? '',
      telehealth: values.telehealth ?? '',
      accepting: values.accepting ?? '',
      careMode: values.careMode ?? '',
      verified: values.verified ?? ''
    };
  }

  normalizeCareMode(value) {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'in-person') return 'in-person';
    if (normalized === 'telehealth') return 'telehealth';
    if (normalized === 'both') return 'both';
    return '';
  }

  bindGeolocation() {
    this.documentRoot.querySelector('[data-geolocate]')?.addEventListener('click', (event) => {
      const button = event.currentTarget;
      if (!navigator.geolocation) {
        button.textContent = 'Geolocation unsupported';
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          button.textContent = 'Location shared. Search this area enabled.';
        },
        () => {
          button.textContent = 'Location permission denied';
        },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    });
  }

  bindViewSwitches() {
    this.documentRoot.querySelectorAll('[data-view-switch]').forEach((button) => {
      button.addEventListener('click', () => {
        this.mapRoot.setAttribute('data-mobile-view', button.dataset.viewSwitch);
      });
    });
  }
}

export async function initializeMapAndList({ documentRoot = document, service = contentService, doctors: providedDoctors } = {}) {
  if (!documentRoot.querySelector('[data-map-enabled]')) return;

  const doctors = providedDoctors ?? await service.getDoctors();
  new MapController({ documentRoot, doctors }).initialize();
}
