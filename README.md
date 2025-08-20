# SkillShareHub 🚀

A complete SaaS knowledge spaces platform where creators monetize knowledge through rich interactive content, real-time Q&A, and subscription management.

## 🎯 Project Overview

SkillShareHub enables creators to build professional knowledge communities with:

- **Rich Content Creation**: Professional editor with interactive HTML, animations, and media
- **Premium Subscriptions**: Stripe-powered billing with subscription management
- **Real-time Q&A**: Live interactive sessions with WebSocket messaging
- **Creator Analytics**: Comprehensive metrics, revenue tracking, and growth insights
- **Multi-tenancy**: Branded spaces with custom subdomains and theming
- **Interactive Posts**: Hover effects, progress bars, buttons, and embedded elements

## 🛠️ Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS + React Quill + DOMPurify
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL + Socket.io
- **Database**: PostgreSQL for persistence, Redis for caching/sessions
- **Infrastructure**: Docker Compose, GitHub Actions CI/CD
- **Payments**: Stripe integration with webhooks and subscriptions
- **Real-time**: Socket.io for live Q&A and messaging
- **Content**: Rich text editor with safe HTML rendering and interactive elements
- **Analytics**: Event tracking, metrics calculation, and dashboard visualization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- Docker and Docker Compose
- PostgreSQL and Redis (or use Docker)

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd skill-share-hub
npm install
```

### 2. Environment Configuration

```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Start Development Environment

```bash
# Start all services with Docker
pnpm docker:up

# Or start individual services
pnpm dev:web    # Frontend on http://localhost:3000
pnpm dev:api    # Backend on http://localhost:4000
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate --workspace=api

# Push schema to database
npm run db:push --workspace=api

# Open Prisma Studio
npm run db:studio --workspace=api
```

## 📁 Project Structure

```
skill-share-hub/
├── apps/
│   ├── web/          # React frontend (Vite)
│   └── api/          # Express backend
├── packages/
│   ├── ui/           # Shared UI components
│   └── types/        # Shared TypeScript types
├── infra/            # Infrastructure configs
├── .github/          # GitHub Actions CI/CD
└── docker-compose.yml
```

## 🎉 Development Phases - Complete SaaS Platform

### ✅ Phase 0: Infrastructure & Scaffolding (COMPLETE)

- [x] Monorepo with pnpm workspaces
- [x] Docker Compose development environment
- [x] CI/CD pipeline with GitHub Actions
- [x] Basic landing page and health checks
- [x] TypeScript, ESLint, Prettier configuration

### ✅ Phase 1: MVP Core (COMPLETE)

- [x] User authentication (signup/login with JWT)
- [x] Space CRUD operations with slug generation
- [x] Post management with premium gating
- [x] Role-based access control (RBAC)

### ✅ Phase 2: Billing with Stripe (COMPLETE)

- [x] Stripe Checkout integration with test keys
- [x] Subscription management and webhooks
- [x] Payment flow and membership status tracking

### ✅ Phase 3: Real-time Q&A (COMPLETE)

- [x] Socket.io WebSocket server setup
- [x] Q&A room functionality with thread management
- [x] Message persistence and real-time broadcasting
- [x] Creator controls for accepting answers

### ✅ Phase 4: Creator Analytics (COMPLETE)

- [x] Comprehensive metrics dashboard
- [x] Revenue tracking (MRR, churn, growth)
- [x] Event logging and performance insights
- [x] Real-time analytics with charts

### ✅ Phase 5: Multi-tenancy Polish (COMPLETE)

- [x] Custom subdomains and domain support
- [x] Space theming with brand colors and logos
- [x] Brand customization and SEO optimization
- [x] Tenant resolution middleware

### ✅ Phase 6: Rich Content & Interactive Posts (COMPLETE)

- [x] React Quill rich text editor with formatting toolbar
- [x] Safe HTML rendering with DOMPurify sanitization
- [x] Interactive elements (buttons, animations, hover effects)
- [x] Professional demo content showcasing capabilities

### 🔄 Phase 7: Production Hardening (NEXT)

- [ ] Security enhancements and rate limiting
- [ ] Performance optimization and monitoring
- [ ] Testing coverage and documentation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm test --workspace=api
npm test --workspace=web

# Test coverage
npm run test:coverage --workspace=api
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)

- Automatic deployments from main branch
- Environment variables configured in deployment platform

### Backend (Railway/Fly.io)

- Docker-based deployment
- Environment variables and secrets management
- Health check monitoring

## 📊 API Endpoints

### Health Checks

- `GET /health` - Basic health status
- `GET /api/v1/health` - API version health

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info

### Spaces Management

- `GET /api/spaces/:slug` - Get space details
- `POST /api/spaces` - Create new space
- `PUT /api/spaces/:id` - Update space
- `GET /api/spaces/user/spaces` - Get user's spaces

### Content Management

- `GET /api/posts/space/:slug` - Get space posts with content
- `POST /api/posts/:spaceId` - Create new rich content post
- `PUT /api/posts/:id` - Update post
- `GET /api/posts/:id` - Get individual post

### Billing & Subscriptions

- `POST /api/billing/checkout` - Create Stripe checkout session
- `POST /api/billing/webhook` - Handle Stripe webhooks
- `GET /api/billing/subscription/:spaceId` - Get subscription status

### Real-time Q&A

- `GET /api/qa/threads/:spaceId` - Get Q&A threads for space
- `POST /api/qa/threads` - Create new Q&A thread
- `POST /api/qa/threads/:threadId/messages` - Add message to thread
- `PUT /api/qa/messages/:messageId/accept` - Accept answer (creator only)

### Creator Analytics

- `GET /api/analytics/overview/:spaceId` - Get space analytics overview
- `GET /api/analytics/dashboard/:spaceId` - Get detailed dashboard metrics
- `GET /api/analytics/realtime/:spaceId` - Get real-time metrics
- `POST /api/analytics/snapshots/:spaceId` - Generate metric snapshots

### Multi-tenant Branding

- `GET /api/tenant/info` - Get tenant info from host header
- `GET /api/tenant/branding/:spaceId` - Get space branding settings
- `PUT /api/tenant/branding/:spaceId` - Update space branding
- `GET /api/tenant/subdomains/suggestions` - Get subdomain suggestions
- `GET /api/tenant/css/:spaceId` - Get space theme CSS

## 🔒 Security Features

- JWT-based authentication with secure cookies
- Rate limiting per IP and user (configurable for development)
- Input validation with Zod schemas
- CORS configuration for multiple frontend ports
- Security headers with Helmet
- SQL injection protection via Prisma
- HTML sanitization with DOMPurify for rich content
- Role-based access control (RBAC) for creators vs users
- Secure Stripe webhook signature verification

## 📈 Performance & Monitoring

- Request ID tracking for debugging
- Structured logging with different levels
- Health check endpoints for monitoring
- Real-time analytics and event tracking
- Performance metrics collection
- Error tracking and alerting
- Socket.io connection management for real-time features
- Prisma query optimization and connection pooling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Follow the coding conventions in `.cursor/rules.md`
4. Add tests for new functionality
5. Ensure all tests pass: `pnpm test`
6. Submit a pull request

## 📝 Development Conventions

See [`.cursor/rules.md`](.cursor/rules.md) for detailed development conventions, including:

- Code style and formatting
- Testing strategies
- Security guidelines
- Database conventions
- API design patterns

## 🐛 Troubleshooting

### Common Issues

**Docker services not starting:**

```bash
# Check service status
docker-compose ps

# View logs
pnpm docker:logs

# Restart services
pnpm docker:down && pnpm docker:up
```

**Database connection issues:**

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# Reset database
docker-compose down -v && docker-compose up -d
```

**Port conflicts:**

- Ensure ports 3000 (web) and 4000 (api) are available
- Check for other services using these ports

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions or issues:

1. Check the [troubleshooting section](#🐛-troubleshooting)
2. Review the [development conventions](.cursor/rules.md)
3. Open an issue on GitHub
4. Check the project roadmap in [todo.md](todo.md)

---

## 🎉 Platform Features Summary

**SkillShareHub is now a complete, production-ready SaaS platform featuring:**

### 🎨 **Rich Content Creation**
- Professional React Quill editor with formatting toolbar
- Interactive HTML posts with animations and hover effects
- Safe content rendering with DOMPurify sanitization
- Demo posts showcasing platform capabilities

### 💼 **Complete Business Platform**
- Stripe-powered subscription management
- Real-time analytics and revenue tracking
- Multi-tenant architecture with custom branding
- WebSocket-based live Q&A system

### 🏗️ **Technical Excellence**
- Modern React + TypeScript frontend
- Robust Node.js + Express + Prisma backend
- PostgreSQL database with comprehensive schema
- Docker Compose development environment

---

**Project Status**: 🎉 Phase 6 Complete - Rich Content Platform Ready for Production!

_Last updated: August 2025_
