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
            <a class="btn" href="/pages/doctor-profile.html">View Profile</a>
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
    return Object.fromEntries(DOCTOR_SEARCH_FIELDS.map((field) => [field, formData.get(field)?.toString() ?? '']));
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

export async function initializeMapAndList({ documentRoot = document, service = contentService } = {}) {
  if (!documentRoot.querySelector('[data-map-enabled]')) return;

  const doctors = await service.getDoctors();
  new MapController({ documentRoot, doctors }).initialize();
}
