# Canonical Content Model

The site now treats the registry in `assets/js/data/siteContent.js` as the canonical public content model for SEO and AI discovery.

## Responsibilities

- `assets/js/data/siteContent.js` defines the public pages, browse surfaces, and search dimensions.
- `assets/js/data/doctors.js` defines the seed doctor records used by the search and profile UI.
- `scripts/generate-discovery-files.mjs` generates `sitemap.xml`, `llms.txt`, and a reusable schema index from the shared registry.
- `assets/js/pageContent.js` exposes the registry as page link data for UI consumers.

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
- If content needs to appear in multiple places, generate it from the registry instead of hand-maintaining parallel copies.
- Keep hand-authored files small and single-purpose: split HTML, JS, and docs when a file starts mixing unrelated concerns or becomes hard to review.
- Allow generated files such as `sitemap.xml`, `llms.txt`, and schema output to grow naturally, but keep their source generators compact and readable.