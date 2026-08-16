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

  filterDoctors({ name = '', city = '', specialty = '', telehealth = '', accepting = '' }) {
    return this.doctors.filter((doctor) => {
      if (name && !doctor.name.toLowerCase().includes(name.toLowerCase())) return false;
      if (city && doctor.city.toLowerCase() !== city.toLowerCase()) return false;
      if (specialty && !doctor.specialty.toLowerCase().includes(specialty.toLowerCase())) return false;
      if (telehealth && String(doctor.telehealth) !== telehealth) return false;
      if (accepting && String(doctor.acceptingNewPatients) !== accepting) return false;
      return true;
    });
  }
}
