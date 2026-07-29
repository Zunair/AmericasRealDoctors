import { MapService } from '../services/mapService.js';
import { DOCTORS } from '../data/doctors.js';

export function initializeMapAndList() {
  const mapRoot = document.querySelector('[data-map-enabled]');
  if (!mapRoot) return;

  const mapService = new MapService(DOCTORS);
  const clusterButtons = document.querySelectorAll('[data-cluster]');
  const preview = document.querySelector('[data-map-preview]');
  const cityField = document.querySelector('[name="city"]');
  const list = document.querySelector('[data-doctor-list]');

  const renderDoctors = (doctors) => {
    if (!list) return;
    list.innerHTML = doctors
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
  };

  clusterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const city = button.dataset.city;
      const docs = button.dataset.docs;
      if (preview) preview.innerHTML = `<strong>${city}</strong> · ${docs} doctors<br><small>Use Search this area to sync the list.</small>`;
      if (cityField) cityField.value = city;
    });
  });

  document.querySelector('[data-search-area]')?.addEventListener('click', () => {
    const city = cityField?.value ?? '';
    renderDoctors(mapService.filterDoctors({ city }));
  });

  document.querySelector('[data-search-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    renderDoctors(
      mapService.filterDoctors({
        name: formData.get('doctorName')?.toString() ?? '',
        city: formData.get('city')?.toString() ?? '',
        specialty: formData.get('specialty')?.toString() ?? '',
        telehealth: formData.get('telehealth')?.toString() ?? '',
        accepting: formData.get('accepting')?.toString() ?? ''
      })
    );
  });

  document.querySelector('[data-geolocate]')?.addEventListener('click', (event) => {
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

  document.querySelectorAll('[data-view-switch]').forEach((button) => {
    button.addEventListener('click', () => {
      mapRoot.setAttribute('data-mobile-view', button.dataset.viewSwitch);
    });
  });

  renderDoctors(DOCTORS);
}
