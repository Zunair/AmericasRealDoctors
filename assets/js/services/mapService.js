export class MapService {
  constructor(doctors) {
    this.doctors = doctors;
  }

  getClustersByCity() {
    const counts = new Map();
    this.doctors.forEach((doctor) => {
      const key = `${doctor.city}, ${doctor.country}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return [...counts.entries()].map(([location, count]) => ({ location, count }));
  }

  filterDoctors({
    name = '',
    country = '',
    region = '',
    city = '',
    distance = '',
    specialty = '',
    certification = '',
    language = '',
    telehealth = '',
    accepting = '',
    careMode = '',
    verified = ''
  } = {}) {
    return this.doctors.filter((doctor) => {
      if (!this.includes(doctor.name, name)) return false;
      if (!this.equals(doctor.country, country)) return false;
      if (!this.includes(doctor.region, region)) return false;
      if (!this.equals(doctor.city, city)) return false;
      if (distance && Number.parseFloat(doctor.distance) > Number(distance)) return false;
      if (!this.includes(doctor.specialty, specialty)) return false;
      if (certification && !doctor.certifications.some((value) => this.includes(value, certification))) return false;
      if (language && !doctor.languages.some((value) => this.includes(value, language))) return false;
      if (telehealth && String(doctor.telehealth) !== telehealth) return false;
      if (accepting && String(doctor.acceptingNewPatients) !== accepting) return false;
      if (!this.matchesCareMode(doctor, careMode)) return false;
      if (verified && String(this.isVerified(doctor)) !== verified) return false;
      return true;
    });
  }

  includes(value, query) {
    return !query || value.toLowerCase().includes(query.trim().toLowerCase());
  }

  equals(value, query) {
    return !query || value.toLowerCase() === query.trim().toLowerCase();
  }

  matchesCareMode(doctor, careMode) {
    if (!careMode) return true;
    if (careMode === 'in-person') return doctor.inPerson;
    if (careMode === 'telehealth') return doctor.telehealth;
    if (careMode === 'both') return doctor.inPerson && doctor.telehealth;
    return false;
  }

  isVerified(doctor) {
    return doctor.verification.length > 0 && doctor.verification.every((status) => status.endsWith('_verified'));
  }
}
