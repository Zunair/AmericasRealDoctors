# Project Index

This repository is already organized around a clear separation of concerns. Use this page as the quick map for future expansion.

## Top-Level Areas

- `index.html` and `pages/` hold the public site, product flows, legal pages, and marketing-facing content.
- `assets/css/` contains the shared visual system for layout, theme, and accessibility states.
- `assets/js/ui/` contains presentation controllers that wire shared interactions across pages.
- `assets/js/services/` contains reusable client-side domain services such as geocoding, auth policy, and map logic.
- `assets/js/data/` contains seed data used for UI previews and local development.
- `src/security/` contains server-side security logic for trust boundaries, rate limiting, and abuse protection.
- `tests/security/` covers the security services with focused automated tests.
- `docs/architecture/` contains long-lived architecture and operations decisions.

## Expansion Path

- Move shared page behavior into reusable UI controllers before duplicating logic across HTML files.
- Keep business rules in services instead of embedding them in page markup.
- Add server-side modules under `src/` when the application starts gaining live state, background jobs, or API endpoints.
- Keep tests aligned with the owning service or controller so growth stays traceable.
- Prefer documentation and issue tracking for roadmap work instead of inline TODO comments.

## Operating Rules

- Keep scripts portable across Windows and Unix-like systems.
- Keep security behavior explicit and test-backed.
- Prefer additive changes that preserve existing pages while introducing shared abstractions.