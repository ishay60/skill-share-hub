# Project TODO

A comprehensive roadmap for the SkillShareHub SaaS platform - a knowledge spaces platform with premium content, real-time Q&A, and creator analytics.

## Demo and Presentation

- [ ] Deploy live demo: web on Vercel, API on Railway or Fly.io, Stripe in test mode
  - Owner: Ishay
  - Effort: L
  - AC:
    - Live demo accessible via public URL
    - Stripe checkout working in test mode
    - All core features functional
  - Links: apps/web, apps/api, docker-compose.yml

- [ ] Add screenshots: landing, dashboard, editor, live Q&A, analytics
  - Owner: Ishay
  - Effort: M
  - AC:
    - High-quality screenshots of all major UI components
    - Screenshots showcase professional appearance
    - Include both light and dark mode if applicable
  - Links: apps/web/src/pages, apps/web/src/components

- [ ] Record a short walkthrough GIF or Loom
  - Owner: Ishay
  - Effort: M
  - AC:
    - 90-second demo showing core user journey
    - Clear demonstration of key features
    - Professional presentation quality
  - Links: README.md

## Security and Production Hardening

- [ ] Helmet and strict CORS in prod. Secure cookies
  - Owner: Ishay
  - Effort: M
  - AC:
    - Security headers properly configured
    - CORS restricted to production domains
    - Secure cookie settings for JWT
  - Links: apps/api/src/middleware/security.ts, apps/api/src/middleware/auth.ts

- [ ] Rate limiting on auth routes and webhooks
  - Owner: Ishay
  - Effort: M
  - AC:
    - Rate limiting per IP and per user
    - Webhook endpoints protected
    - Configurable limits for different endpoints
  - Links: apps/api/src/middleware/rateLimiting.ts

- [ ] Queue and retry Stripe webhooks
  - Owner: Ishay
  - Effort: M
  - AC:
    - Webhook failures queued for retry
    - Idempotent webhook processing
    - Dead letter queue for failed webhooks
  - Links: apps/api/src/controllers/billingController.ts

- [ ] Sentry error tracking
  - Owner: Ishay
  - Effort: S
  - AC:
    - Error tracking configured for API and web
    - Performance monitoring enabled
    - Error alerts configured
  - Links: apps/api/src/lib/logger.ts, apps/web/src/components/ErrorBoundary.tsx

- [ ] Liveness and readiness probes
  - Owner: Ishay
  - Effort: S
  - AC:
    - Health check endpoints for load balancers
    - Database connectivity checks
    - Service dependency validation
  - Links: apps/api/src/index.ts

- [ ] Postgres backup plan doc
  - Owner: Ishay
  - Effort: S
  - AC:
    - Backup strategy documented
    - Recovery procedures outlined
    - Automated backup scripts provided
  - Links: infra/postgres, README.md

- [ ] Simple threat model doc
  - Owner: Ishay
  - Effort: S
  - AC:
    - OWASP top 10 addressed
    - Attack vectors identified
    - Mitigation strategies documented
  - Links: docs/security.md

## Testing and CI

- [ ] Add badges to README for CI status and coverage
  - Owner: Ishay
  - Effort: S
  - AC:
    - CI status badge visible
    - Test coverage percentage displayed
    - Build status indicators
  - Links: README.md, .github/workflows

- [ ] Unit tests for API routes
  - Owner: Ishay
  - Effort: L
  - AC:
    - 80%+ test coverage on API
    - All controller methods tested
    - Mock database and external services
  - Links: apps/api/src/__tests__, apps/api/jest.config.js

- [ ] Component tests for web UI
  - Owner: Ishay
  - Effort: M
  - AC:
    - Key components have unit tests
    - User interactions tested
    - Accessibility features validated
  - Links: apps/web/src/components, apps/web/package.json

- [ ] One Playwright e2e that runs Stripe test checkout and verifies a member view
  - Owner: Ishay
  - Effort: M
  - AC:
    - End-to-end test covers signup to subscription
    - Stripe test mode integration verified
    - Premium content access validated
  - Links: apps/web/e2e, apps/web/package.json

## Multi Tenancy

- [ ] Document tenant isolation approach
  - Owner: Ishay
  - Effort: S
  - AC:
    - Isolation strategy clearly explained
    - Security implications documented
    - Implementation details outlined
  - Links: docs/architecture.md, apps/api/src/middleware/tenant.ts

- [ ] Middleware enforcing tenant_id scoping
  - Owner: Ishay
  - Effort: M
  - AC:
    - All database queries scoped by tenant
    - Cross-tenant access prevented
    - Middleware applied consistently
  - Links: apps/api/src/middleware/tenant.ts, apps/api/src/services/tenantService.ts

- [ ] Test proving cross tenant reads fail
  - Owner: Ishay
  - Effort: S
  - AC:
    - Test demonstrates isolation
    - Attempts to access other tenant data fail
    - Security boundary validated
  - Links: apps/api/src/__tests__, apps/api/src/middleware/tenant.ts

- [ ] Optional: Postgres RLS policies
  - Owner: Ishay
  - Effort: L
  - AC:
    - Row-level security policies implemented
    - Database-level isolation enforced
    - Performance impact assessed
  - Links: infra/postgres, apps/api/prisma/schema.prisma

## API and Documentation

- [ ] Generate OpenAPI spec for all listed endpoints
  - Owner: Ishay
  - Effort: M
  - AC:
    - Complete API documentation generated
    - All endpoints documented with examples
    - Request/response schemas defined
  - Links: apps/api/src/routes, apps/api/package.json

- [ ] Add Swagger UI in dev mode
  - Owner: Ishay
  - Effort: S
  - AC:
    - Interactive API documentation available
    - Endpoint testing interface
    - Development environment only
  - Links: apps/api/src/index.ts, apps/api/package.json

- [ ] Add an architecture diagram for web ↔ API ↔ Socket.io and auth flow
  - Owner: Ishay
  - Effort: M
  - AC:
    - System architecture clearly visualized
    - Data flow between components shown
    - Authentication flow documented
  - Links: docs/architecture.md, apps/api/src/lib/socket.ts

## Data Model and Seed

- [ ] Document core Prisma models and important indexes
  - Owner: Ishay
  - Effort: M
  - AC:
    - All models documented with relationships
    - Database indexes explained
    - Performance considerations noted
  - Links: apps/api/prisma/schema.prisma, docs/database.md

- [ ] Seed script: demo space, posts, subscription, Q&A thread
  - Owner: Ishay
  - Effort: M
  - AC:
    - One-command demo data setup
    - Realistic sample content
    - Test accounts for demonstration
  - Links: apps/api/src/scripts/demo-seed.ts, apps/api/src/scripts/seed.ts

## Content Safety

- [ ] Add CSP headers for iframe or embed use
  - Owner: Ishay
  - Effort: S
  - AC:
    - Content Security Policy configured
    - Iframe embedding controlled
    - XSS prevention enhanced
  - Links: apps/api/src/middleware/security.ts, apps/web/index.html

- [ ] Tests that DOMPurify strips disallowed tags
  - Owner: Ishay
  - Effort: S
  - AC:
    - Malicious HTML properly sanitized
    - Allowed tags preserved
    - Security tests passing
  - Links: apps/web/src/components/SafeHTMLContent.tsx, apps/web/src/__tests__

## Analytics and Metrics

- [ ] Mock analytics dashboard screenshot
  - Owner: Ishay
  - Effort: S
  - AC:
    - Professional dashboard appearance
    - Key metrics prominently displayed
    - Portfolio-ready quality
  - Links: apps/web/src/pages/AnalyticsPage.tsx

- [ ] Metrics doc: MRR, churn, retention. Show formulas and sample queries
  - Owner: Ishay
  - Effort: M
  - AC:
    - Business metrics clearly defined
    - Calculation formulas provided
    - Sample SQL queries included
  - Links: docs/analytics.md, apps/api/src/services/analyticsService.ts

- [ ] Event schema doc. Optional PostHog wiring
  - Owner: Ishay
  - Effort: M
  - AC:
    - Event tracking schema documented
    - PostHog integration optional
    - Analytics implementation guide
  - Links: docs/events.md, apps/api/src/middleware/analytics.ts

## Developer Ergonomics

- [ ] Improve quick-start.sh to fully set env, run docker compose, prisma migrate, seed, and open URLs
  - Owner: Ishay
  - Effort: M
  - AC:
    - One-command local development setup
    - Environment automatically configured
    - All services started and ready
  - Links: quick-start.sh, start-local.sh

- [ ] Troubleshooting section in README with common errors and fixes
  - Owner: Ishay
  - Effort: S
  - AC:
    - Common issues documented
    - Step-by-step solutions provided
    - Links to relevant resources
  - Links: README.md, docs/troubleshooting.md

## Accessibility and i18n

- [ ] Keyboard navigation and focus rings
  - Owner: Ishay
  - Effort: M
  - AC:
    - All interactive elements keyboard accessible
    - Focus indicators visible
    - Tab order logical
  - Links: apps/web/src/components, apps/web/src/pages

- [ ] RTL check with a simple he-IL locale
  - Owner: Ishay
  - Effort: S
  - AC:
    - Right-to-left layout support
    - Hebrew locale example
    - Text direction handling
  - Links: apps/web/src/components, apps/web/src/pages

## Product Features

- [ ] Mock pricing tiers with feature flags
  - Owner: Ishay
  - Effort: M
  - AC:
    - Multiple pricing tiers defined
    - Feature flags implemented
    - Tier comparison UI
  - Links: apps/web/src/components/Pricing.tsx, apps/api/src/services/planService.ts

- [ ] Gate premium features by plan type in UI and API
  - Owner: Ishay
  - Effort: M
  - AC:
    - Feature access controlled by subscription
    - UI elements conditionally rendered
    - API endpoints properly protected
  - Links: apps/web/src/components, apps/api/src/middleware/auth.ts

## Roadmap and Community

- [ ] Convert major tasks into GitHub Issues with labels
  - Owner: Ishay
  - Effort: S
  - AC:
    - All major tasks have GitHub issues
    - Appropriate labels applied
    - Clear acceptance criteria
  - Links: .github/ISSUE_TEMPLATE

- [ ] Create a GitHub Project board and link it from README
  - Owner: Ishay
  - Effort: S
  - AC:
    - Project board created with columns
    - Issues organized by priority
    - README updated with link
  - Links: README.md, .github/projects
