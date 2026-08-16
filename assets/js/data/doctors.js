/** @typedef {{name:string, credentials:string, specialty:string, city:string, region:string, country:string, intro:string, certifications:string[], languages:string[], telehealth:boolean, inPerson:boolean, acceptingNewPatients:boolean, distance:string, verification:string[]}} Doctor */

/** @type {Doctor[]} */
export const DOCTORS = [
  {
    name: 'Dr. Elena Morris',
    credentials: 'MD, IFMCP',
    specialty: 'Family Medicine',
    city: 'Philadelphia',
    region: 'Pennsylvania',
    country: 'USA',
    intro: 'Integrative family physician focused on informed consent and collaborative care plans.',
    certifications: ['ABFM', 'IFM Certified Practitioner'],
    languages: ['English', 'Spanish'],
    telehealth: true,
    inPerson: true,
    acceptingNewPatients: true,
    distance: '3.2 mi',
    verification: ['identity_verified', 'license_verified', 'certification_verified']
  },
  {
    name: 'Dr. Mateo Clarke',
    credentials: 'DO',
    specialty: 'Internal Medicine',
    city: 'Toronto',
    region: 'Ontario',
    country: 'Canada',
    intro: 'Patient-focused internist with special interest in preventive medicine and chronic condition coaching.',
    certifications: ['Royal College Internal Medicine'],
    languages: ['English', 'French'],
    telehealth: true,
    inPerson: true,
    acceptingNewPatients: false,
    distance: '8.7 mi',
    verification: ['identity_verified', 'license_verified', 'certification_submitted']
  },
  {
    name: 'Dr. Priya Rao',
    credentials: 'MD, FAAP',
    specialty: 'Pediatrics',
    city: 'Austin',
    region: 'Texas',
    country: 'USA',
    intro: 'Pediatrician supporting long-term doctor–family partnerships and transparent shared decision-making.',
    certifications: ['ABP', 'PALS'],
    languages: ['English', 'Hindi'],
    telehealth: false,
    inPerson: true,
    acceptingNewPatients: true,
    distance: '5.1 mi',
    verification: ['identity_verified', 'license_verified', 'certification_verified']
  }
];
