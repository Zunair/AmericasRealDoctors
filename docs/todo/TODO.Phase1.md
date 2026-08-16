# Phase 1 TODO

## Completed

- [x] Confirmed the repo structure separates pages, shared assets, security modules, tests, and architecture docs.
- [x] Verified the project passes formatting and automated tests.
- [x] Replaced the Windows-incompatible lint shell pipeline with a portable Node-based checker.
- [x] Added a compact architecture index for future expansion planning.
- [x] Added architecture decisions and targeted-context guidance so contributors and Copilot can route changes without reading the entire repository.
- [x] Replaced ad hoc page discovery with a canonical site content registry.
- [x] Added a generator that emits `sitemap.xml`, `llms.txt`, and reusable schema output from the shared registry.
- [x] Added architecture notes for the canonical content model and discovery pipeline.
- [x] Kept public discovery outputs aligned with crawlable HTML pages and crawlable browse surfaces.
- [x] Added explicit guidance to keep CMS data, directory data, and page copy in one canonical source.
- [x] Documented a file-size policy that keeps hand-authored files small and lets generated files grow as needed.
- [x] Documented a code-style policy that prefers OOP for services and controllers and keeps formatting consistent.
- [x] Standardized browser UI controllers around a class-based initialize pattern for consistency.
- [x] Normalized page chrome so public pages use the shared header and footer implementation instead of mixed handwritten variants.
- [x] Removed the last handwritten footer variants so all public pages now use the shared chrome controller.
- [x] Centralized FAQ content in the canonical registry and added checks for generated schema and crawlable HTML alignment.
- [x] Routed browser, build, and test content reads through one asynchronous service with middleware hooks for future CMS logging, metrics, and caching.
- [x] Moved standard section spacing into the shared page shell so multi-section pages cannot accidentally render joined panels.
- [x] Implemented the advertised doctor filters across canonical data, public projection, search service, and browser form wiring.
- [x] Added shareable doctor-search URLs that hydrate filters and results from the generated schema parameter contract.

## Detailed Plan

### 1. Canonical content model

- Define a single source of truth for doctors, articles, specialties, cities, FAQs, and policy pages.
- Keep the source normalized so HTML, JSON-LD, sitemap entries, and AI-facing indexes are generated from the same data.
- Preserve stable IDs and URLs so content can evolve without breaking links.

### 2. SEO and AI discovery surface

- Ensure every important page has a unique title, description, canonical URL, Open Graph metadata, and schema markup.
- Generate JSON-LD for `WebSite`, `Organization`, `Physician`, `MedicalOrganization`, `Article`, `FAQPage`, and `BreadcrumbList` where applicable.
- Add `llms.txt` as a discovery index for AI agents, but keep crawlable HTML as the primary public surface.
- Keep `sitemap.xml` generated from the same canonical content source.

### 3. Doctor search and browse experience

- Build a searchable doctor index that supports name, specialty, location, language, telehealth, and verification filters.
- Add indexable city and specialty pages so organic traffic has landing pages beyond the homepage.
- Keep the public search experience usable without JavaScript so crawlers and low-capability clients can still access it.

### 4. Delivery and automation

- Introduce a lightweight build step that emits HTML, structured data, sitemap, and agent hints from the source model.
- Consider Cloudflare Markdown for Agents as an optional delivery enhancement, not the primary content format.
- Add IndexNow or similar notification tooling when the public content set begins changing frequently.

### 5. Governance and operations

- Keep future work in this file or tracked issues rather than inline TODO comments.
- Expand tests around shared UI controllers and schema generation as soon as the content pipeline becomes dynamic.
- Revisit caching, versioning, and invalidation once the site starts serving generated data from an API or CMS.
- Avoid duplicating page text or directory content across files; generate repeated content from the canonical registry.
- Split a file once it starts mixing unrelated concerns, even if it has not hit a hard line-count limit, so contributors and Copilot can load only the context needed for a change.
- Keep the project index focused on ownership and architecture decisions focused on durable constraints; update both when project structure or conventions change.
- Include concise bullet points covering completed changes and validation whenever changes are committed or pushed, and reuse them in pull request descriptions when applicable.
- Keep change-summary bullets in consistent simple present tense, using verbs such as `Adds`, `Changes`, `Updates`, `Fixes`, or `Removes`.
- Prefer class-based or otherwise explicit object-oriented structure for reusable controllers and services rather than ad hoc one-off module patterns.
- Keep UI controllers, security services, and utility modules aligned to a small number of predictable styles so the repo stays easy to open-source.

## Notes

- The repo is in a good shape for a static-site plus server-side-security expansion model.
- The main operational risk found so far was cross-platform tooling, which is now addressed for linting.