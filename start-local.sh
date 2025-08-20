#!/bin/bash

# SkillShareHub - Local Startup (No Docker Required)
# Uses local PostgreSQL instead of Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

kill_port() {
    if port_in_use $1; then
        print_warning "Killing existing process on port $1"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

print_header "
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        🚀 SkillShareHub - Local Setup (No Docker) 🚀         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
"

# Check if PostgreSQL is available
if ! command -v psql >/dev/null 2>&1; then
    print_error "PostgreSQL not found. Please install PostgreSQL:"
    echo "  macOS: brew install postgresql"
    echo "  Or use Docker version: ./start-skillshare.sh --demo"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    print_warning "Starting PostgreSQL..."
    brew services start postgresql || true
    sleep 3
    
    if ! pg_isready -q; then
        print_error "Could not start PostgreSQL. Try manually:"
        echo "  brew services start postgresql"
        echo "  Or use Docker version: ./start-skillshare.sh --demo"
        exit 1
    fi
fi

print_success "PostgreSQL is running!"

# Create database if it doesn't exist
print_status "Setting up database..."
createdb skillsharehub 2>/dev/null || true
createdb skillsharehub_test 2>/dev/null || true

# Create user if doesn't exist
psql -d postgres -c "CREATE USER skillsharehub_app WITH PASSWORD 'app_password';" 2>/dev/null || true
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE skillsharehub TO skillsharehub_app;" 2>/dev/null || true
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE skillsharehub_test TO skillsharehub_app;" 2>/dev/null || true

# Clean up processes
print_status "Cleaning up existing processes..."
kill_port 3001
kill_port 4000

# Install dependencies
print_status "Installing dependencies..."
npm install
cd apps/api && npm install && cd ../..
cd apps/web && npm install && cd ../..

# Setup database
print_status "Setting up database schema..."
cd apps/api

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp ../../../env.example .env
    # Update to use local PostgreSQL
    sed -i '' 's/localhost:5432/localhost:5432/g' .env
fi

npx prisma db push --force-reset
npx prisma generate

# Setup demo data
print_status "Setting up demo data..."
npm run demo:setup

cd ../..

# Start API
print_status "Starting API server..."
cd apps/api
npm run dev &
API_PID=$!
cd ../..

# Wait a bit for API to start
sleep 5

# Start frontend
print_status "Starting web frontend..."
cd apps/web
npm run dev &
WEB_PID=$!
cd ../..

print_header "
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                    🎉 Platform Running! 🎉                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
"

echo ""
print_success "SkillShareHub is now running!"
echo ""
echo -e "${CYAN}📱 Frontend:${NC}  http://localhost:3001"
echo -e "${CYAN}🔧 API:${NC}       http://localhost:4000"
echo ""
echo -e "${YELLOW}🎮 Demo Account:${NC}"
echo -e "   Email: demo@skillsharehub.com"
echo -e "   Password: demo123"
echo ""
echo -e "${YELLOW}🌟 Demo Space:${NC} http://localhost:3001/spaces/skillshare-demo"
echo ""
print_warning "Press Ctrl+C to stop all services"

# Cleanup function
cleanup() {
    print_status "Stopping services..."
    
    if [ ! -z "$API_PID" ] && kill -0 $API_PID 2>/dev/null; then
        kill $API_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$WEB_PID" ] && kill -0 $WEB_PID 2>/dev/null; then
        kill $WEB_PID 2>/dev/null || true
    fi
    
    print_success "Services stopped. Goodbye! 👋"
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
