#!/bin/bash

# SkillShareHub - Simple & Reliable Startup
# This version focuses on working reliably without complex health checks

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║              🚀 SkillShareHub - Simple Start 🚀             ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Starting Docker Desktop...${NC}"
    open -a Docker
    echo -e "${YELLOW}⏳ Waiting for Docker to start...${NC}"
    
    # Wait for Docker to start (max 60 seconds)
    for i in {1..30}; do
        if docker ps > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Docker is ready!${NC}"
            break
        fi
        echo "   Attempt $i/30..."
        sleep 2
    done
    
    if ! docker ps > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker failed to start. Please start Docker Desktop manually.${NC}"
        exit 1
    fi
fi

# Clean up any existing processes
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Kill processes on common ports
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

echo -e "${GREEN}✅ Cleanup complete${NC}"

# Start Docker services
echo -e "${BLUE}🐳 Starting database services...${NC}"
docker-compose up -d postgres redis

# Wait a moment for services to initialize
echo -e "${YELLOW}⏳ Waiting for services to initialize...${NC}"
sleep 5

# Check if PostgreSQL is accessible
echo -e "${BLUE}🔍 Checking database connection...${NC}"
for i in {1..10}; do
    if docker-compose exec -T postgres pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready!${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Database failed to start${NC}"
        exit 1
    fi
    echo "   Attempt $i/10..."
    sleep 2
done

# Setup database
echo -e "${BLUE}🗄️  Setting up database...${NC}"
cd apps/api

# Reset database if requested
if [[ "$1" == "--reset" ]] || [[ "$2" == "--reset" ]]; then
    echo -e "${YELLOW}🔄 Resetting database...${NC}"
    npx prisma db push --force-reset
else
    npx prisma db push
fi

npx prisma generate

# Setup demo data if requested
if [[ "$1" == "--demo" ]] || [[ "$2" == "--demo" ]]; then
    echo -e "${BLUE}🎮 Setting up demo data...${NC}"
    npm run demo:setup
fi

cd ../..

# Start API server
echo -e "${BLUE}🔧 Starting API server...${NC}"
cd apps/api
npm run dev > ../api.log 2>&1 &
API_PID=$!
cd ../..

# Wait for API to start
echo -e "${YELLOW}⏳ Waiting for API server...${NC}"
sleep 8

# Check if API is running
if ! curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  API health check failed, but continuing...${NC}"
fi

# Start web frontend
echo -e "${BLUE}🌐 Starting web frontend...${NC}"
cd apps/web
npm run dev > ../web.log 2>&1 &
WEB_PID=$!
cd ../..

# Wait for frontend
echo -e "${YELLOW}⏳ Waiting for frontend...${NC}"
sleep 5

# Success message
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║                    🎉 Platform Running! 🎉                  ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo ""
echo -e "${GREEN}🚀 SkillShareHub is starting up!${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC}  http://localhost:3000"
echo -e "${BLUE}🔧 API:${NC}       http://localhost:4000"
echo -e "${BLUE}📊 Health:${NC}    http://localhost:4000/health"

if [[ "$1" == "--demo" ]] || [[ "$2" == "--demo" ]]; then
    echo ""
    echo -e "${YELLOW}🎮 Demo Account:${NC}"
    echo -e "   Email: demo@skillsharehub.com"
    echo -e "   Password: demo123"
    echo ""
    echo -e "${YELLOW}🌟 Demo Space:${NC} http://localhost:3000/spaces/skillshare-demo"
fi

echo ""
echo -e "${YELLOW}📋 Logs:${NC}"
echo -e "   API logs: tail -f apps/api.log"
echo -e "   Web logs: tail -f apps/web.log"
echo ""
echo -e "${GREEN}🎯 Quick check: Visit http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}⚠️  If services don't start immediately, wait 30 seconds and refresh${NC}"
echo -e "${RED}🛑 To stop: pkill -f 'npm run dev'${NC}"

# Keep script running to show it's active
echo ""
echo -e "${BLUE}✅ Startup complete! Services are running in background.${NC}"
echo -e "${YELLOW}💡 This terminal can be closed. Services will continue running.${NC}"
echo ""

# Optional: Keep running to catch Ctrl+C
trap 'echo -e "\n${YELLOW}🛑 To stop services: pkill -f \"npm run dev\"${NC}"; exit 0' SIGINT

# Show live status
echo -e "${BLUE}🔄 Live status (Ctrl+C to exit this monitor):${NC}"
while true; do
    if curl -s http://localhost:4000/health > /dev/null 2>&1; then
        API_STATUS="✅"
    else
        API_STATUS="❌"
    fi
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        WEB_STATUS="✅"
    else
        WEB_STATUS="❌"
    fi
    
    echo -e "\r${API_STATUS} API  ${WEB_STATUS} Frontend  $(date +%H:%M:%S)" | tr -d '\n'
    sleep 5
done
