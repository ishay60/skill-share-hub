#!/bin/bash

# SkillShareHub Development Script
# Usage: ./dev.sh [command]

case "$1" in
  "api")
    echo "🚀 Starting API server..."
    cd apps/api && npm run dev
    ;;
  "web")
    echo "🌐 Starting Web server..."
    cd apps/web && npm run dev
    ;;
  "db")
    echo "🗄️ Starting database services..."
    docker-compose up -d postgres redis
    ;;
  "all")
    echo "🚀 Starting all services..."
    docker-compose up -d postgres redis
    echo "Starting API in background..."
    cd apps/api && npm run dev &
    echo "Starting Web in background..."
    cd apps/web && npm run dev &
    echo "✅ All services started!"
    echo "📊 API: http://localhost:4000"
    echo "🌐 Web: http://localhost:3000"
    ;;
  "stop")
    echo "🛑 Stopping all services..."
    pkill -f "npm run dev"
    docker-compose down
    echo "✅ All services stopped!"
    ;;
  "restart")
    echo "🔄 Restarting all services..."
    ./dev.sh stop
    sleep 2
    ./dev.sh all
    ;;
  "logs")
    echo "📋 Showing logs..."
    docker-compose logs -f
    ;;
  "test")
    echo "🧪 Running tests..."
    cd apps/api && npm test
    ;;
  "seed")
    echo "🌱 Seeding database..."
    cd apps/api && npm run db:seed
    ;;
  "help"|*)
    echo "SkillShareHub Development Script"
    echo ""
    echo "Commands:"
    echo "  api     - Start API server"
    echo "  web     - Start Web server"
    echo "  db      - Start database services"
    echo "  all     - Start all services"
    echo "  stop    - Stop all services"
    echo "  restart - Restart all services"
    echo "  logs    - Show database logs"
    echo "  test    - Run API tests"
    echo "  seed    - Seed database"
    echo "  help    - Show this help"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh api    - Start just the API"
    echo "  ./dev.sh all    - Start everything"
    echo "  ./dev.sh stop   - Stop everything"
    ;;
esac
