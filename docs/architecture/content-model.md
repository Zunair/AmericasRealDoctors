# Canonical Content Model

The site treats the registry in `assets/js/data/siteContent.js` as the canonical public content model for SEO and AI discovery. Consumers access that model through `assets/js/services/contentService.js`, which is the provider and middleware boundary for a future CMS.

## Responsibilities

- `assets/js/data/siteContent.js` defines the public pages, FAQs, browse surfaces, and search dimensions.
- `assets/js/data/doctors.js` defines the seed doctor records and normalized search dimensions used by the search and profile UI.
- `assets/js/services/contentService.js` is the only module that imports raw content providers and exposes content reads to browser, build, and test consumers.
- `assets/js/services/mapService.js` evaluates the shared doctor filter contract independently of the data provider or UI.
- `scripts/generate-discovery-files.mjs` generates `sitemap.xml`, `llms.txt`, and a reusable schema index from the shared registry.
- `assets/js/pageContent.js` exposes the registry as page link data for UI consumers.

## Content access boundary

- Route every content read through `ContentService`; do not import `siteContent.js` or `doctors.js` from generators, controllers, tests, or feature modules.
- Providers implement `getSiteContent()` and `getDoctors()`. The current static provider can be replaced by a CMS provider without changing consumers.
- Content middleware receives `{ resource, provider }` and `next`, allowing shared logging, timing, metrics, caching, and error handling around every provider read.
- Keep the service asynchronous so a network-backed CMS provider does not require a second consumer migration.
- Register cross-cutting middleware at composition roots rather than adding logging or cache logic to individual consumers.

## Outputs derived from the registry

- Crawlable HTML pages remain the primary public content surface.
- `sitemap.xml` enumerates the indexable public pages.
- `llms.txt` summarizes the public site structure for AI systems.
- `assets/js/data/generatedSchemas.js` holds reusable JSON-LD definitions derived from the same content source.
- JSON-LD should continue to be emitted from the same canonical content where applicable.

## Rules

- Add new public pages to the registry before publishing them.
- Keep URLs stable and use redirects when a page moves.
- Prefer page text and semantic HTML first, then add structured data as reinforcement.
- Keep page copy, metadata, and directory descriptions in one canonical source so the same text is not duplicated across HTML, JSON-LD, sitemap notes, and docs.
- Treat the doctor directory as one dataset and one rendering path, even if it later comes from a CMS or API.
- Keep doctor region, certification, language, care-mode, acceptance, and verification fields normalized so static and future CMS providers use the same filter contract.
- Keep raw provider imports private to `ContentService`; the content boundary test enforces this rule.
- If content needs to appear in multiple places, generate it from the registry instead of hand-maintaining parallel copies.
- Keep crawlable FAQ text and inline FAQ schema aligned with the canonical FAQ entries; focused tests enforce this until HTML generation owns both outputs.
- Keep hand-authored files small and single-purpose: split HTML, JS, and docs when a file starts mixing unrelated concerns or becomes hard to review.
- Allow generated files such as `sitemap.xml`, `llms.txt`, and schema output to grow naturally, but keep their source generators compact and readable.