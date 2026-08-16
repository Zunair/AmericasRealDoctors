import test from 'node:test';
import assert from 'node:assert/strict';
import { DoctorSearchStateService } from '../../assets/js/services/doctorSearchStateService.js';

test('reads only supported doctor filters from the current URL', () => {
  const service = new DoctorSearchStateService({
    location: { href: 'https://example.test/pages/doctor-search-results.html?doctorName=Elena&language=Spanish&utm_source=test' },
    history: { replaceState() {} }
  });

  assert.deepEqual(service.read(), { doctorName: 'Elena', language: 'Spanish' });
});

test('replaces doctor filters while preserving unrelated query parameters', () => {
  let replacedUrl = '';
  const service = new DoctorSearchStateService({
    location: { href: 'https://example.test/pages/doctor-search-results.html?doctorName=Old&utm_source=test#results' },
    history: {
      replaceState(state, title, url) {
        replacedUrl = url;
      }
    }
  });

  const result = service.replace({ doctorName: 'Dr. Priya Rao', language: 'Hindi', city: '' });

  assert.equal(result, '/pages/doctor-search-results.html?utm_source=test&doctorName=Dr.+Priya+Rao&language=Hindi#results');
  assert.equal(replacedUrl, result);
});