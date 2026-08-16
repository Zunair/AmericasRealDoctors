# America's Real Doctors

America's Real Doctors is a secure, map-based physician directory connecting patients with verified, independent, and patient-focused doctors.

## Project Structure

- `/index.html` – homepage experience (hero, map/list discovery, filters, verification messaging)
- `/pages` – requested product pages (doctor flows, auth flows, admin, legal, support)
- `/assets/css` – shared UI styling, dark/light themes, accessibility-first states
- `/assets/js/ui` – presentation controllers (theme, map/list interactions, registration UI)
- `/assets/js/services` – reusable domain services (map filtering, geocoding abstraction, auth policy)
- `/assets/js/data` – seed doctor data for UI previews
- `/src/security` – server-side security architecture modules (rate limiting, proxy trust, suspicious-404 defense)
- `/tests/security` – automated tests for abuse protection and distributed-rate-limit behavior
- `/docs/architecture` – architecture and infrastructure decisions

## Local Setup

```bash
npm install
npm run serve
```

Open `http://localhost:4173`.

## Quality Gates

```bash
npm run format
npm run lint
npm run typecheck
npm run test
npm run check
```

## Environment Variables (for backend implementation)

- `REDIS_URL` – distributed session/rate-limit/abuse state
- `DATABASE_URL` – primary transactional datastore
- `OBJECT_STORAGE_BUCKET` – shared storage for profile images and credential documents
- `ENCRYPTION_KEY_REFERENCE` – shared key management reference
- `TRUSTED_PROXY_IPS` – trusted load balancer / reverse proxy CIDRs
- `RATE_LIMIT_POLICY_JSON` – environment-specific endpoint limit policy

## Migrations and Deployment

- Use additive, rollback-safe migrations compatible with rolling deploys.
- Avoid coupled deploys requiring simultaneous restart of every app instance.
- Run web and worker services independently to support horizontal scale and queue workloads.
