# Scalability, Abuse Protection, and Operations Baseline

## Horizontal Scaling Design

- Application servers remain stateless.
- Shared state (sessions, rate limits, abuse blocks, temp workflows) is stored in distributed systems (Redis + database).
- Uploaded files go to shared object storage, never local disk.
- Map/geocoding/email/storage/auth providers are abstracted behind service interfaces.
- Background jobs are queue-driven (email, geocoding, file processing, credential checks, article processing).
- Health-check endpoints: `/health/live`, `/health/ready`, `/health/startup`.
- Graceful shutdown drains active requests and workers before exit.

## Traffic and Abuse Controls

Layered protection strategy:
1. CDN/WAF edge controls
2. Reverse proxy/load balancer controls
3. Application rate limits backed by distributed store
4. Sensitive endpoint-specific limits and temporary block policies

Sensitive endpoint scopes include login, registration, password reset, email verification, 2FA verify, account recovery, doctor submission, uploads, scraping-like search bursts, and admin routes.

## Suspicious-404 Policy

- Sliding-window tracking by normalized client identity
- Weighted suspicious-path scoring (`/.env`, `/.git/`, `wp-admin`, backups, etc.)
- Unique-path counting threshold + weighted score threshold
- Escalating temporary blocks for repeat offenders
- Auto-expiring blocks
- Allowlist and manual unblock support
- Security audit log captures trigger details, thresholds, and durations

## Client IP Trust Model

- Trust forwarded headers only from trusted proxies/CDN ranges.
- Preserve both connection IP and verified client IP in security logs.
- Normalize IPv4 and IPv6 representations before storage or comparison.
- Reject direct spoofed forwarded headers when source is untrusted.

## Failure and Degradation Behavior

- Distributed-store outage degrades to local emergency limits for sensitive endpoints.
- Public traffic is throttled conservatively during partial outage, not globally blocked.
- Degraded protection state emits alerts and structured logs.
- Explicit fail behavior:
  - Sensitive auth endpoints: fail-safe throttled fallback
  - Public browsing endpoints: fail-open with coarse fallback limits

## Observability

Centralized and structured:
- request logs, security-event logs, audit logs
- traces and correlation IDs
- metrics: latency, status codes, auth/2FA failures, reset attempts, rate-limit events, queue depth, cache hit rate, DB pool usage, health status
- error reporting and alerts with ownership procedures

## Crawler Handling

- `robots.txt` + sitemap provided for discovery guidance.
- Private/auth/admin/account routes disallowed in crawler guidance.
- User-agent alone is insufficient for crawler trust; use network verification in backend implementation.

## Configuration and Change Management

- Thresholds and durations are environment-configurable.
- Infrastructure runbooks define rate-limit updates, allowlist/denylist changes, and false-positive review/unblock procedures.
- Future additions should be captured through issues/docs, not scattered inline TODO comments.
