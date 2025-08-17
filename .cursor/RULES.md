# SkillShareHub Development Rules & Conventions

## 🏗️ Project Structure

- **Monorepo**: Using npm workspaces
- **Apps**: `apps/web` (frontend), `apps/api` (backend)
- **Packages**: `packages/ui` (shared components), `packages/types` (shared types)
- **Infrastructure**: `infra/` for Docker, deployment configs

## 🎯 Development Workflow

- **Branching**: `main` (protected), feature branches: `feat/auth`, `feat/stripe`, etc.
- **Commits**: Conventional commits: `feat(api): add auth endpoints`, `fix(web): resolve login bug`
- **PRs**: Required for all changes, CI must pass before merge

## 🛠️ Tech Stack Conventions

- **Frontend**: Vite + React + TypeScript + Tailwind + Shadcn/ui
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Database**: PostgreSQL for persistence, Redis for caching/sessions
- **Testing**: Jest for unit tests, Supertest for API tests
- **Linting**: ESLint + Prettier with strict TypeScript rules

## 📁 File Naming

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`User.ts`, `Space.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

## 🔧 Code Style

- **TypeScript**: Strict mode enabled, no `any` types
- **React**: Functional components with hooks, no class components
- **API**: RESTful endpoints, consistent error responses
- **Database**: Prisma for ORM, meaningful table/column names
- **Environment**: Use `.env.example` files, never commit secrets

## 🧪 Testing Strategy

- **Unit Tests**: 80%+ coverage required for API routes
- **Integration Tests**: Test database operations and external services
- **E2E Tests**: Critical user flows (auth, payments)
- **Test Files**: Co-located with source: `UserService.test.ts`

## 🚀 Deployment

- **Frontend**: Vercel/Netlify with automatic deployments
- **Backend**: Railway/Fly.io with health checks
- **Database**: Managed PostgreSQL service
- **Environment**: Separate configs for dev/staging/prod

## 📝 Documentation

- **README**: Project overview, quick start, architecture
- **API Docs**: OpenAPI/Swagger specification
- **Architecture**: Sequence diagrams for complex flows
- **Changelog**: Keep track of breaking changes

## 🔒 Security

- **Authentication**: JWT tokens with secure cookies
- **Validation**: Zod schemas for all input validation
- **Rate Limiting**: Per IP and per user limits
- **CORS**: Configured for production domains only
- **Secrets**: Environment variables, never hardcoded

## 🎨 UI/UX Guidelines

- **Design System**: Shadcn/ui components as foundation
- **Responsive**: Mobile-first design approach
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Lazy loading, code splitting, image optimization

## 📊 Monitoring & Observability

- **Logging**: Structured logging with request IDs
- **Metrics**: HTTP metrics, database performance
- **Error Tracking**: Capture and alert on errors
- **Health Checks**: Endpoint monitoring for all services

## 🔄 Database Conventions

- **Naming**: snake_case for tables/columns, PascalCase for models
- **Timestamps**: Always include `created_at`, `updated_at`
- **Relations**: Clear foreign key naming (`userId`, `spaceId`)
- **Indexes**: On frequently queried fields (email, slug)
- **Migrations**: Version controlled, never edit production directly

## 💳 Payment Integration

- **Stripe**: Use test keys for development
- **Webhooks**: Idempotent handlers with signature verification
- **Subscriptions**: Track status changes and renewal dates
- **Testing**: Stripe CLI for local webhook testing

## 🌐 Real-time Features

- **WebSockets**: Socket.io for Q&A sessions
- **Authentication**: JWT verification on connection
- **Persistence**: Redis buffer with periodic Postgres flush
- **Reconnection**: Handle disconnects gracefully

## 📈 Analytics & Metrics

- **Event Logging**: Track user actions and conversions
- **Aggregation**: Daily scheduled jobs for metrics
- **Charts**: Recharts for data visualization
- **Privacy**: Anonymize sensitive user data

## 🚧 Development Phases

1. **Phase 0**: Infrastructure and scaffolding
2. **Phase 1**: Core MVP functionality
3. **Phase 2**: Payment integration
4. **Phase 3**: Real-time features
5. **Phase 4**: Analytics dashboard
6. **Phase 5**: Multi-tenancy
7. **Phase 6**: Production hardening

## 📋 Quality Gates

- **Code Coverage**: 80%+ for critical paths
- **Linting**: No ESLint errors or warnings
- **Type Checking**: TypeScript compilation passes
- **Tests**: All tests pass in CI
- **Security**: No known vulnerabilities
- **Performance**: Lighthouse score >90

## 🔍 Code Review Checklist

- [ ] TypeScript types are correct
- [ ] Tests are included and pass
- [ ] Error handling is appropriate
- [ ] Security considerations addressed
- [ ] Performance impact assessed
- [ ] Documentation updated if needed
- [ ] Breaking changes documented

## 🚨 Emergency Procedures

- **Database Issues**: Rollback to last known good migration
- **Deployment Failures**: Automatic rollback to previous version
- **Security Incidents**: Immediate incident response plan
- **Data Loss**: Regular backups with point-in-time recovery

---

_These rules should be followed consistently throughout development. Update this file when new conventions are established._
