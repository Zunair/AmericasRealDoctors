import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_CONTENT } from '../assets/js/data/siteContent.js';

const workspaceRoot = process.cwd();
const sitemapPath = join(workspaceRoot, 'sitemap.xml');
const llmsPath = join(workspaceRoot, 'llms.txt');
const schemaPath = join(workspaceRoot, 'assets/js/data/generatedSchemas.js');

const doctorProfile = SITE_CONTENT.pages.find((page) => page.url === '/pages/doctor-profile.html');
const faqPage = SITE_CONTENT.pages.find((page) => page.url === '/pages/frequently-asked-questions.html');
const articlePage = SITE_CONTENT.pages.find((page) => page.url === '/pages/article-details.html');

const schemaIndex = {
  home: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONTENT.site.name,
    url: SITE_CONTENT.site.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_CONTENT.site.url}/pages/doctor-search-results.html?doctorName={doctorName}`,
      'query-input': 'required name=doctorName'
    }
  },
  faq: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I search without an account?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Public users can search without creating a patient account in version one.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does this site provide personalized medical advice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Content is educational only.'
        }
      }
    ]
  },
  article: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: articlePage?.title ?? 'Article Details',
    description: articlePage?.description ?? 'Educational article detail page.',
    author: {
      '@type': 'Person',
      name: 'Dr. Elena Morris'
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONTENT.site.name
    }
  },
  doctorProfile: {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: 'Dr. Elena Morris',
    medicalSpecialty: ['Family Medicine', 'Integrative Medicine', 'Preventive Care'],
    url: `${SITE_CONTENT.site.url}/pages/doctor-profile.html`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Philadelphia',
      addressRegion: 'PA',
      addressCountry: 'US'
    }
  },
  browsePages: SITE_CONTENT.pages
    .filter((page) => page.group === 'browse')
    .map((page) => ({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: page.title,
      description: page.description,
      url: `${SITE_CONTENT.site.url}${page.url}`
    }))
};

const sitemapUrls = SITE_CONTENT.pages
  .filter((page) => page.url.startsWith('/') && page.group !== 'admin')
  .map((page) => `  <url><loc>${SITE_CONTENT.site.url}${page.url}</loc></url>`)
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>
`;

const groupedPages = SITE_CONTENT.pages.reduce((groups, page) => {
  const group = page.group ?? 'other';
  groups[group] ??= [];
  groups[group].push(page);
  return groups;
}, {});

const llms = [
  '# America\'s Real Doctors',
  '',
  SITE_CONTENT.site.description,
  '',
  '## Purpose',
  '- Crawlable directory for verified, patient-focused doctors.',
  '- Public pages are the source of truth for SEO and AI discovery.',
  '- JSON-LD, sitemap.xml, and llms.txt are generated from the same content registry.',
  '',
  '## Search dimensions',
  `- ${SITE_CONTENT.browseDimensions.join(', ')}`,
  '',
  '## Public pages',
  ...Object.entries(groupedPages).flatMap(([group, pages]) => [
    `### ${group}`,
    ...pages.map((page) => `- [${page.title}](${SITE_CONTENT.site.url}${page.url}) — ${page.description}`),
    ''
  ]),
  '## Discovery notes',
  '- Keep HTML crawlable and readable without JavaScript.',
  '- Use schema markup to reinforce the meaning already present in the page text.',
  '- Avoid duplicating page descriptions or directory copy across files; generate shared text from the canonical registry.',
  '- Add new city, specialty, and doctor pages to the registry before publishing.'
].join('\n');

writeFileSync(sitemapPath, sitemap, 'utf8');
writeFileSync(llmsPath, `${llms}\n`, 'utf8');
writeFileSync(schemaPath, `export const GENERATED_SCHEMA_INDEX = ${JSON.stringify(schemaIndex, null, 2)};\n`, 'utf8');

console.log(`Generated ${readFileSync(sitemapPath, 'utf8').split('<url>').length - 1} sitemap entries, llms.txt, and schema index`);