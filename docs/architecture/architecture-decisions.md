# Architecture Decisions

This document records durable decisions that help contributors and Copilot understand the current project shape without reconstructing history from every file. Keep entries concise, current, and limited to decisions that affect how future changes should be routed.

## Current Decisions

### Targeted context retrieval

- Use `project-index.md` to identify the owning area before reading implementation files.
- Read the owning module, its focused tests, and only the dependencies needed to make the requested change.
- Keep hand-authored files small and single-purpose so a change can be understood without loading unrelated code.
- Split modules that combine unrelated DOM wiring, business logic, data, or rendering responsibilities.

### Canonical content and discovery

- `assets/js/data/siteContent.js` is the canonical registry for shared site metadata and page discovery data.
- `assets/js/services/contentService.js` is the mandatory asynchronous access boundary for static data now and CMS providers later.
- Content logging, metrics, caching, and similar cross-cutting behavior belong in `ContentService` middleware so all browser and build consumers receive the same behavior.
- `scripts/generate-discovery-files.mjs` produces `sitemap.xml`, `llms.txt`, and the generated schema index.
- Public HTML remains the primary content surface; generated discovery files reinforce rather than replace it.

### Runtime and tooling

- Repository commands run through npm and must remain portable across Windows and Unix-like systems.
- `npm run serve` uses the dependency-free Node static server in `scripts/serve.mjs`.
- `npm run check` is the repository-wide validation entry point.

### Change communication

- Git history remains the chronological record of implementation changes.
- Commit or push handoffs include concise bullet points describing the completed changes and validation results.
- Pull request descriptions reuse those details when a pull request is created or updated.
- Change-summary bullets use consistent simple present tense, such as `Adds`, `Changes`, `Updates`, `Fixes`, or `Removes`; commit subjects use the standard imperative form.

## Maintenance Rule

Update this document when a change introduces a durable ownership boundary, canonical source, generator, runtime convention, or validation rule. Replace obsolete entries instead of appending a chronological change log.