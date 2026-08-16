import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contentService } from '../../assets/js/services/contentService.js';
import { GENERATED_SCHEMA_INDEX } from '../../assets/js/data/generatedSchemas.js';

const siteContent = await contentService.getSiteContent();

test('generates FAQ schema from every canonical FAQ', () => {
  const schemaFaqs = GENERATED_SCHEMA_INDEX.faq.mainEntity.map((entity) => ({
    question: entity.name,
    answer: entity.acceptedAnswer.text
  }));

  assert.deepEqual(schemaFaqs, siteContent.faqs);
});

test('keeps crawlable FAQ content and inline schema aligned with canonical FAQs', () => {
  const faqHtml = readFileSync('pages/frequently-asked-questions.html', 'utf8');

  for (const faq of siteContent.faqs) {
    assert.match(faqHtml, new RegExp(escapeRegExp(faq.question)));
    assert.match(faqHtml, new RegExp(escapeRegExp(faq.answer)));
  }
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}