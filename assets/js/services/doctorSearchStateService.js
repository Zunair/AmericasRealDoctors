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