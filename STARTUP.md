# 🚀 SkillShareHub - One-Command Startup

Welcome to SkillShareHub! This guide shows you how to get the entire platform running with just one command.

## ⚡ Quick Start (Recommended)

**The fastest way to see the platform in action:**

```bash
./quick-start.sh
```

This will:

- ✅ Start all services (Database, API, Frontend)
- ✅ Set up demo data with rich content
- ✅ Create demo accounts
- ✅ Open the platform at http://localhost:3001

**Demo Account:**

- Email: `demo@skillsharehub.com`
- Password: `demo123`

---

## 🛠️ Advanced Startup Options

### Full Startup Script

```bash
./start-skillshare.sh [OPTIONS]
```

### Available Options

| Option        | Description                                  |
| ------------- | -------------------------------------------- |
| `--demo`      | Set up demo data with sample content         |
| `--reset`     | Reset database before starting (fresh start) |
| `--skip-deps` | Skip dependency installation                 |
| `--prod`      | Run in production mode                       |
| `--help`      | Show help message                            |

### Usage Examples

```bash
# Start with demo data (recommended for first-time users)
./start-skillshare.sh --demo

# Fresh start with clean database
./start-skillshare.sh --reset

# Normal development start
./start-skillshare.sh

# Production mode
./start-skillshare.sh --prod

# Reset everything and set up demo
./start-skillshare.sh --reset --demo
```

---

## 🎯 What Gets Started

### Services

- **PostgreSQL Database** (Docker) - Port 5432
- **Redis Cache** (Docker) - Port 6379
- **API Server** - Port 4000
- **Web Frontend** - Port 3001

### URLs After Startup

- 🌐 **Frontend**: http://localhost:3001
- 🔧 **API**: http://localhost:4000
- 📊 **Health Check**: http://localhost:4000/health
- 🎮 **Demo Space**: http://localhost:3001/spaces/skillshare-demo (with --demo)

---

## 📋 Prerequisites

The script will check for these dependencies:

- **Node.js** (v16+)
- **npm**
- **Docker**
- **Docker Compose**

If any are missing, the script will show installation links.

---

## 🎮 Demo Mode Features

When using `--demo`, you get:

### 🏢 **Demo Space**: "SkillShare Academy"

- Rich interactive content
- Premium and free posts
- Q&A discussions
- Analytics data (30 days)

### 👥 **Demo Accounts**

- **Creator**: `demo@skillsharehub.com` / `demo123`
- **Users**: `alice@example.com`, `bob@example.com`, `charlie@example.com` / `demo123`

### 💎 **Premium Demo Mode**

- Toggle in bottom-right corner
- Switch between free/premium views
- Perfect for sales demos

### 📊 **Sample Data**

- 4 rich content posts (HTML, interactive elements)
- 2 Q&A threads with conversations
- 30 days of analytics data
- Subscription data
- Event logs

---

## 🔧 Manual Development Setup (Alternative)

If you prefer to start services manually:

```bash
# 1. Start Docker services
docker-compose up -d

# 2. Install dependencies
npm install
cd apps/api && npm install && cd ../..
cd apps/web && npm install && cd ../..

# 3. Setup database
cd apps/api
npx prisma db push
npx prisma generate

# 4. Optional: Add demo data
npm run demo:setup

# 5. Start API
npm run dev &

# 6. Start frontend (new terminal)
cd ../web
npm run dev
```

---

## 🛑 Stopping Services

### With Startup Script

Press `Ctrl+C` in the terminal where the script is running. It will automatically:

- Stop all Node.js processes
- Stop Docker containers
- Clean up gracefully

### Manual Stop

```bash
# Stop Docker services
docker-compose down

# Kill Node processes if needed
pkill -f "npm run dev"
pkill -f "node"
```

---

## 🐛 Troubleshooting

### Port Already in Use

The script automatically kills existing processes on required ports. If you still get errors:

```bash
# Check what's using the ports
lsof -ti:3001  # Frontend
lsof -ti:4000  # API
lsof -ti:5432  # PostgreSQL

# Kill specific processes
kill -9 $(lsof -ti:3001)
```

### Database Issues

```bash
# Reset everything
./start-skillshare.sh --reset --demo
```

### Missing Dependencies

The script will show installation links for missing dependencies.

### Docker Issues

```bash
# Clean up Docker
docker-compose down
docker system prune -f
```

---

## 📈 Performance Tips

### First Run

- Takes 2-3 minutes (downloads Docker images, installs dependencies)
- Subsequent runs are much faster (~30 seconds)

### Faster Subsequent Runs

```bash
# Skip dependency installation if no changes
./start-skillshare.sh --demo --skip-deps
```

### Development Workflow

```bash
# Normal development (no demo data needed)
./start-skillshare.sh
```

---

## 🎨 Platform Features Available

Once running, you can explore:

### ✅ **Content Management**

- Rich text editor with HTML support
- Premium/free content tiers
- Interactive post elements

### ✅ **User Management**

- Role-based access (Creator/User)
- Authentication & authorization
- User profiles

### ✅ **Billing & Subscriptions**

- Stripe integration
- Monthly/yearly plans
- Subscription management

### ✅ **Real-time Q&A**

- WebSocket-powered discussions
- Thread management
- Answer acceptance

### ✅ **Analytics Dashboard**

- Revenue tracking
- User engagement metrics
- Growth analytics

### ✅ **Multi-tenancy**

- Custom domains/subdomains
- Branding customization
- SEO optimization

### ✅ **Production Features**

- Rate limiting
- Security headers
- Error boundaries
- Structured logging

---

## 🚀 Next Steps

1. **Start the platform**: `./quick-start.sh`
2. **Explore the demo space**: Login with demo account
3. **Toggle premium mode**: Use the demo switch in bottom-right
4. **Check out the admin features**: Create posts, view analytics
5. **Test the Q&A system**: Ask questions and provide answers

**You now have a complete, production-ready knowledge-sharing platform running locally!** 🎉
