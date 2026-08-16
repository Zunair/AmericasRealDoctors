import test from 'node:test';
import assert from 'node:assert/strict';
import { MapService } from '../../assets/js/services/mapService.js';

const doctors = [
  {
    name: 'Dr. Ada North',
    country: 'USA',
    region: 'Pennsylvania',
    city: 'Philadelphia',
    distance: '4.5 mi',
    specialty: 'Family Medicine',
    certifications: ['ABFM'],
    languages: ['English', 'Spanish'],
    telehealth: true,
    inPerson: true,
    acceptingNewPatients: true,
    verification: ['identity_verified', 'license_verified']
  },
  {
    name: 'Dr. Sam West',
    country: 'Canada',
    region: 'Ontario',
    city: 'Toronto',
    distance: '12 mi',
    specialty: 'Internal Medicine',
    certifications: ['RCPSC'],
    languages: ['English', 'French'],
    telehealth: true,
    inPerson: false,
    acceptingNewPatients: false,
    verification: ['identity_verified', 'license_submitted']
  }
];

test('filters doctors across directory search dimensions', () => {
  const service = new MapService(doctors);
  const result = service.filterDoctors({
    name: 'ada',
    country: 'usa',
    region: 'penn',
    city: 'philadelphia',
    distance: '10',
    specialty: 'family',
    certification: 'abfm',
    language: 'span',
    telehealth: 'true',
    accepting: 'true',
    careMode: 'both',
    verified: 'true'
  });

  assert.deepEqual(result.map((doctor) => doctor.name), ['Dr. Ada North']);
});

test('distinguishes verification status and care mode', () => {
  const service = new MapService(doctors);

  assert.deepEqual(service.filterDoctors({ verified: 'false' }).map((doctor) => doctor.name), ['Dr. Sam West']);
  assert.deepEqual(service.filterDoctors({ careMode: 'telehealth' }).map((doctor) => doctor.name), ['Dr. Ada North', 'Dr. Sam West']);
  assert.deepEqual(service.filterDoctors({ careMode: 'in-person' }).map((doctor) => doctor.name), ['Dr. Ada North']);
});