import { MapService } from '../services/mapService.js';
import { contentService } from '../services/contentService.js';

export class MapController {
  constructor({ documentRoot = document, doctors = [], mapService = new MapService(doctors) } = {}) {
    this.documentRoot = documentRoot;
    this.doctors = doctors;
    this.mapService = mapService;
    this.mapRoot = this.documentRoot.querySelector('[data-map-enabled]');
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
    this.renderDoctors(this.doctors);
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
                <small>${doctor.specialty} · ${doctor.city}, ${doctor.country}</small>
              </div>
            </div>
            <p>${doctor.intro}</p>
            <div>
              ${doctor.certifications.map((cert) => `<span class="badge">${cert}</span>`).join('')}
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
    this.documentRoot.querySelector('[data-search-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      this.renderDoctors(
        this.mapService.filterDoctors({
          name: formData.get('doctorName')?.toString() ?? '',
          city: formData.get('city')?.toString() ?? '',
          specialty: formData.get('specialty')?.toString() ?? '',
          telehealth: formData.get('telehealth')?.toString() ?? '',
          accepting: formData.get('accepting')?.toString() ?? ''
        })
      );
    });
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
