# SkillShareHub MVP Roadmap

A SaaS knowledge spaces platform with premium content, real-time Q&A, and creator analytics.

## 🎯 Project Overview

**Goal**: Build a portfolio-worthy SaaS platform where creators can monetize knowledge through premium content and real-time Q&A sessions.

**Tech Stack**:

- **Frontend**: Next.js/Vite React + Tailwind + Shadcn
- **Backend**: Node.js + Express/Nest + Prisma
- **Database**: PostgreSQL + Redis
- **Infrastructure**: Docker Compose, Railway/Fly.io, Vercel/Netlify
- **Payments**: Stripe
- **Real-time**: Socket.io/WebSockets

---

## 📋 Phase 0: Prep and Scaffolding ✅

**Goal**: Repo ready, CI green, deploy hello world.

### 🏗️ Infrastructure Setup

- [x] Create monorepo with pnpm workspaces
  - `packages/ui` (shared components)
  - `apps/web` (Vite React)
  - `apps/api` (Node + Express)
  - `infra` (Docker)
- [x] Add Tailwind + Shadcn to web
- [x] Add Prisma to api
- [x] Add ESLint + Prettier
- [x] Set up Docker Compose for dev: api, postgres, redis, mailhog, stripe-cli
- [x] GitHub Actions: lint, typecheck, test, docker build
- [x] One-click deploy targets: Railway/Fly.io for api, Vercel/Netlify for web

### 🎫 Tickets

- [x] `chore: init monorepo and workspaces`
- [x] `ci: add lint+typecheck+tests`
- [x] `infra: docker-compose with postgres and redis`
- [x] `feat(web): landing page + healthcheck`
- [x] `feat(api): GET /health with version`

### ✅ Acceptance Criteria

- [x] Visiting the live URL shows landing page
- [x] CI passes on PR
- [x] Docker compose up works locally

---

## 🚀 Phase 1: MVP Core

**Goal**: Users can sign up, create a Space, publish premium content, and view it if subscribed. No payments yet.

### 🎯 Scope

- **Auth**: email+password + JWT cookies
- **Models**: User, Space, Post, Membership
- **Space CRUD**: by creator, public space page, gated premium posts
- **Basic RBAC**: creator vs viewer
- **Minimal design system**: via Shadcn

### 🗄️ DB Schema (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password_hash String
  role          String   @default("user")
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
}

model Space {
  id          String   @id @default(cuid())
  ownerId     String
  name        String
  slug        String   @unique
  description String?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  owner       User     @relation(fields: [ownerId], references: [id])
}

model Post {
  id           String    @id @default(cuid())
  spaceId      String
  title        String
  content_md   String
  is_premium   Boolean   @default(false)
  published_at DateTime?
  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt
  space        Space     @relation(fields: [spaceId], references: [id])
}

model Membership {
  id         String   @id @default(cuid())
  userId     String
  spaceId    String
  status     String   @default("none") // enum: free|paid|none
  started_at DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
  space      Space    @relation(fields: [spaceId], references: [id])
}
```

### 🔌 Key Endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `GET /spaces/:slug`
- `POST /spaces` (creator)
- `POST /spaces/:id/posts`
- `GET /spaces/:slug/posts`
- `GET /me`

### 🎫 Tickets

- [ ] `feat(api): auth controllers + tests`
- [ ] `feat(api): Space CRUD + slug service`
- [ ] `feat(api): Post CRUD + markdown render`
- [ ] `feat(web): sign up, login, dashboard`
- [ ] `feat(web): space page + gated content`
- [ ] `test: e2e happy path with supertest`

### ✅ Acceptance Criteria

- [ ] As creator, I can sign up, create a space, add a premium post
- [ ] As visitor, I can see public posts but premium is gated
- [ ] 80% test coverage on api auth and content routes

---

## 💳 Phase 2: Billing with Stripe

**Goal**: Real subscriptions with plan, checkout, webhooks.

### 🎯 Scope

- **Plans**: monthly, yearly per space
- **Stripe Checkout**: session creation
- **Webhooks**: checkout.session.completed, customer.subscription.updated
- **Update Membership.status**: to paid and set renewal dates

### 🗄️ New Tables

```prisma
model Plan {
  id           String   @id @default(cuid())
  spaceId      String
  interval     String   // enum: month|year
  price_cents  Int
  created_at   DateTime @default(now())
  space        Space    @relation(fields: [spaceId], references: [id])
}

model Subscription {
  id                  String   @id @default(cuid())
  userId              String
  spaceId             String
  stripe_customer_id  String
  stripe_sub_id       String
  status              String
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt
  user                User     @relation(fields: [userId], references: [id])
  space               Space    @relation(fields: [spaceId], references: [id])
}
```

### 🎫 Tickets

- [ ] `feat(api): create checkout session POST /billing/checkout`
- [ ] `feat(api): stripe webhook handler + signature verification`
- [ ] `feat(web): pricing UI on space page, paywall button`
- [ ] `chore: stripe-cli in docker compose for local tests`
- [ ] `test: webhook integration tests with fixtures`

### ✅ Acceptance Criteria

- [ ] Clicking Subscribe opens Stripe Checkout and on success unlocks premium posts
- [ ] Webhook retries are idempotent
- [ ] Subscription status visible on dashboard

---

## 💬 Phase 3: Realtime Q&A

**Goal**: Add a simple live Q&A per space.

### 🎯 Scope

- **Socket.io/WebSocket**: server on api
- **Q&A room per space**: message persistence in Redis with periodic flush to Postgres
- **Creator controls**: mark an answer as accepted

### 🗄️ New Tables

```prisma
model QAThread {
  id          String   @id @default(cuid())
  spaceId     String
  createdBy   String
  title       String
  created_at  DateTime @default(now())
  space       Space    @relation(fields: [spaceId], references: [id])
}

model QAMessage {
  id         String   @id @default(cuid())
  threadId   String
  userId     String
  content    String
  is_answer  Boolean  @default(false)
  created_at DateTime @default(now())
  thread     QAThread @relation(fields: [threadId], references: [id])
}
```

### 🎫 Tickets

- [ ] `feat(api): ws server + auth handshake`
- [ ] `feat(api): persist chat with Redis buffer`
- [ ] `feat(web): Q&A widget on space page`
- [ ] `feat(web): creator accept answer control`
- [ ] `test: ws unit tests for message flow`

### ✅ Acceptance Criteria

- [ ] Multiple users see messages in realtime
- [ ] Reconnect resumes session without dupes
- [ ] Accepted answer visually highlighted

---

## 📊 Phase 4: Creator Analytics

**Goal**: Useful dashboards for portfolio screenshots.

### 🎯 Scope

- **Metrics**: active subscribers, MRR, churn, ARPU, post views
- **Scheduled jobs**: compute aggregates daily
- **Charts**: with recharts

### 🗄️ New Tables

```prisma
model EventLog {
  id       String   @id @default(cuid())
  userId   String
  spaceId  String
  type     String   // enum: view|subscribe|cancel|post_view
  ts       DateTime @default(now())
  user     User     @relation(fields: [userId], references: [id])
  space    Space    @relation(fields: [spaceId], references: [id])
}

model MetricSnapshot {
  id           String   @id @default(cuid())
  spaceId      String
  date         DateTime
  active_subs  Int
  mrr_cents    Int
  churn_rate   Float
  space        Space    @relation(fields: [spaceId], references: [id])
}
```

### 🎫 Tickets

- [ ] `feat(api): event logging middleware`
- [ ] `feat(api): daily snapshot job via cron or hosted scheduler`
- [ ] `feat(web): analytics dashboard with charts`
- [ ] `test: metrics calculator unit tests`

### ✅ Acceptance Criteria

- [ ] Dashboard shows last 30 days charts
- [ ] Numbers reconcile with Stripe data for paid subs

---

## 🎨 Phase 5: Multi-tenancy Polish

**Goal**: Branded spaces and custom subdomains.

### 🎯 Scope

- **Tenant-aware routing**: creator.skillsharehub.com
- **Theming per space**: logo, brand color
- **Image upload**: via S3 compatible storage

### 🎫 Tickets

- [ ] `feat(web): subdomain routing with Next middleware or custom router`
- [ ] `feat(api): tenant resolution by host header`
- [ ] `feat(api): S3 upload signed URLs`
- [ ] `feat(web): theme switcher per space`

### ✅ Acceptance Criteria

- [ ] A space loads at its subdomain with brand theme
- [ ] Uploading a logo updates nav and Open Graph

---

## 🛡️ Phase 6: Production Hardening

**Goal**: Confidence to showcase.

### 🎯 Scope

- **Rate limiting + input validation**: zod
- **Security headers**: helmet, CORS
- **Error boundary UX**: and audit logging
- **Seed script**: with sample data and demo accounts
- **Observability**: HTTP metrics, request IDs, OpenTelemetry exporter

### 🎫 Tickets

- [ ] `sec: rate limiter per ip and per user`
- [ ] `sec: zod schemas on all endpoints`
- [ ] `chore: seed script + demo mode`
- [ ] `infra: basic logs and metrics dashboard`
- [ ] `doc: runbook and architecture diagram`

### ✅ Acceptance Criteria

- [ ] OWASP top 10 checks addressed
- [ ] Seed data spins up a demo space in 1 command

---

## 📅 Timeline & GitHub Hygiene

### 🗓️ Suggested Timeline

- **Week 1**: Phase 0 to early Phase 1
- **Week 2**: Finish Phase 1 + Phase 2
- **Week 3**: Phase 3 + Phase 4
- **Week 4**: Phase 5 + Phase 6 + polish

### 🌿 Branching Strategy

- `main` protected
- Feature branches per ticket: `feat/auth`, `feat/stripe`, etc.
- Conventional commits: `feat/api`, `fix/web`, `chore`, `ci`, `docs`, `test`

### 📋 Project Board Columns

- Backlog
- Next up
- In progress
- In review
- Done

---

## 🚀 Quick Start

### Environment Setup

```bash
# apps/api/.env.example
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/skillsharehub
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
APP_URL=http://localhost:3000
```

### Docker Compose

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
    ports: ['5432:5432']
  redis:
    image: redis:7
    ports: ['6379:6379']
  api:
    build: ./apps/api
    env_file: ./apps/api/.env
    depends_on: [postgres, redis]
    ports: ['4000:4000']
  web:
    build: ./apps/web
    environment:
      VITE_API_URL: http://localhost:4000
    depends_on: [api]
    ports: ['3000:3000']
```

### Local Development

```bash
# Start all services
docker-compose up -d

# Install dependencies
pnpm install

# Run development servers
pnpm dev:web    # Frontend on http://localhost:3000
pnpm dev:api    # Backend on http://localhost:4000
```

---

## 🎯 Portfolio Extras

### 🎬 Demo & Showcase

- [ ] Public demo space with fake data and test card flow (Stripe test mode)
- [ ] Record 90 second Loom demo and embed in README
- [ ] Architecture.md with sequence diagrams for checkout and webhook handling
- [ ] .cursorrules or prompts.md explaining dev workflow

### 🤖 Optional AI Add-ons (for later)

- [ ] AI assistant that summarizes a space's posts and answers common questions
- [ ] Semantic search over posts with embeddings
- [ ] Moderation of Q&A messages

---

## 📚 README Essentials

### 📝 Content Checklist

- [ ] One-paragraph pitch
- [ ] Tech stack overview
- [ ] Screenshots/GIFs
- [ ] Live demo link
- [ ] Quickstart: docker compose up, env template
- [ ] Architecture diagram, ERD, endpoints table
- [ ] Roadmap checklist with checkmarks for completed phases

### 🔗 Links

- **Live Demo**: [Coming Soon]
- **API Docs**: [Coming Soon]
- **Architecture**: [Coming Soon]

---

## 🎉 Success Metrics

### 🚀 Deployment

- [ ] Phase 0: Hello World deployed
- [ ] Phase 1: Core MVP live
- [ ] Phase 2: Payments working
- [ ] Phase 3: Real-time Q&A functional
- [ ] Phase 4: Analytics dashboard live
- [ ] Phase 5: Multi-tenancy working
- [ ] Phase 6: Production ready

### 📊 Quality Gates

- [ ] 80%+ test coverage on API
- [ ] CI/CD pipeline green
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed

---

_Last updated: [Current Date]_
_Project Status: 🚧 In Progress_
