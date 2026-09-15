export const DOCTOR_SEARCH_FIELDS = [
  'doctorName',
  'country',
  'region',
  'city',
  'distance',
  'specialty',
  'certification',
  'language',
  'telehealth',
  'accepting',
  'careMode',
  'verified'
];

const DOCTOR_SEARCH_INPUTS = {
  doctorName: ['doctorName'],
  country: ['country'],
  region: ['region'],
  city: ['city'],
  distance: ['distance'],
  specialty: ['specialty'],
  certification: ['certification', 'certifications'],
  language: ['language', 'languages'],
  telehealth: ['telehealth'],
  accepting: ['accepting'],
  careMode: ['careMode', 'mode'],
  verified: ['verified', 'verifiedOnly']
};

function readSourceValue(source, key) {
  if (typeof source.get === 'function') {
    return source.get(key)?.toString() ?? '';
  }
  return source[key]?.toString() ?? '';
}

function normalizeCareMode(value) {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'in-person') return 'in-person';
  if (normalized === 'telehealth') return 'telehealth';
  if (normalized === 'both') return 'both';
  return '';
}

export function normalizeDoctorSearchValues(source) {
  return {
    doctorName: readSourceValue(source, 'doctorName'),
    country: readSourceValue(source, 'country'),
    region: readSourceValue(source, 'region'),
    city: readSourceValue(source, 'city'),
    distance: readSourceValue(source, 'distance'),
    specialty: readSourceValue(source, 'specialty'),
    certification: DOCTOR_SEARCH_INPUTS.certification.map((key) => readSourceValue(source, key)).find(Boolean) ?? '',
    language: DOCTOR_SEARCH_INPUTS.language.map((key) => readSourceValue(source, key)).find(Boolean) ?? '',
    telehealth: readSourceValue(source, 'telehealth'),
    accepting: readSourceValue(source, 'accepting'),
    careMode: normalizeCareMode(DOCTOR_SEARCH_INPUTS.careMode.map((key) => readSourceValue(source, key)).find(Boolean) ?? ''),
    verified: DOCTOR_SEARCH_INPUTS.verified.map((key) => readSourceValue(source, key)).find(Boolean) ?? ''
  };
}

export class DoctorSearchStateService {
  constructor({ location = globalThis.location, history = globalThis.history } = {}) {
    this.location = location;
    this.history = history;
  }

  read() {
    const searchParams = new URL(this.location.href).searchParams;
    return Object.fromEntries(
      DOCTOR_SEARCH_FIELDS
        .map((field) => [field, searchParams.get(field)?.trim() ?? ''])
        .filter(([, value]) => value)
    );
  }

  replace(values) {
    const url = new URL(this.location.href);

    for (const field of DOCTOR_SEARCH_FIELDS) {
      const value = values[field]?.trim() ?? '';
      url.searchParams.delete(field);
      if (value) url.searchParams.set(field, value);
    }

    const relativeUrl = `${url.pathname}${url.search}${url.hash}`;
    this.history.replaceState(null, '', relativeUrl);
    return relativeUrl;
  }
}