# SkillShareHub 🚀

A SaaS knowledge spaces platform where creators can monetize knowledge through premium content and real-time Q&A sessions.

## 🎯 Project Overview

SkillShareHub enables creators to build monetized knowledge communities with:

- **Premium Content**: Gated posts and courses with subscription access
- **Real-time Q&A**: Live interactive sessions with audience engagement
- **Creator Analytics**: Comprehensive metrics and growth insights
- **Multi-tenancy**: Branded spaces with custom subdomains

## 🛠️ Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS + Shadcn/ui
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Database**: PostgreSQL for persistence, Redis for caching/sessions
- **Infrastructure**: Docker Compose, GitHub Actions CI/CD
- **Payments**: Stripe integration (Phase 2)
- **Real-time**: Socket.io for Q&A sessions (Phase 3)

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

## 🚧 Development Phases

### ✅ Phase 0: Infrastructure & Scaffolding (COMPLETE)

- [x] Monorepo with pnpm workspaces
- [x] Docker Compose development environment
- [x] CI/CD pipeline with GitHub Actions
- [x] Basic landing page and health checks
- [x] TypeScript, ESLint, Prettier configuration

### 🔄 Phase 1: MVP Core (IN PROGRESS)

- [ ] User authentication (signup/login)
- [ ] Space CRUD operations
- [ ] Post management with premium gating
- [ ] Basic RBAC system

### 📋 Phase 2: Billing with Stripe

- [ ] Stripe Checkout integration
- [ ] Subscription management
- [ ] Webhook handling

### 📋 Phase 3: Real-time Q&A

- [ ] WebSocket server setup
- [ ] Q&A room functionality
- [ ] Message persistence

### 📋 Phase 4: Creator Analytics

- [ ] Metrics dashboard
- [ ] Revenue tracking
- [ ] Performance insights

### 📋 Phase 5: Multi-tenancy Polish

- [ ] Custom subdomains
- [ ] Space theming
- [ ] Brand customization

### 📋 Phase 6: Production Hardening

- [ ] Security enhancements
- [ ] Performance optimization
- [ ] Monitoring and logging

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

### Authentication (Phase 1)

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /me` - Current user info

### Spaces (Phase 1)

- `GET /spaces/:slug` - Get space details
- `POST /spaces` - Create new space
- `PUT /spaces/:id` - Update space
- `DELETE /spaces/:id` - Delete space

### Posts (Phase 1)

- `GET /spaces/:slug/posts` - Get space posts
- `POST /spaces/:id/posts` - Create new post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

## 🔒 Security Features

- JWT-based authentication with secure cookies
- Rate limiting per IP and user
- Input validation with Zod schemas
- CORS configuration for production domains
- Security headers with Helmet
- SQL injection protection via Prisma

## 📈 Performance & Monitoring

- Request ID tracking for debugging
- Structured logging with different levels
- Health check endpoints for monitoring
- Performance metrics collection
- Error tracking and alerting

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

**Project Status**: 🚧 Phase 0 Complete - Ready for Phase 1 Development

_Last updated: December 2024_
