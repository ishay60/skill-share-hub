#!/bin/bash

# SkillShareHub - One-Command Startup Script
# This script starts the entire platform with one command

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Function to kill processes on a port
kill_port() {
    if port_in_use $1; then
        print_warning "Killing existing process on port $1"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s $url >/dev/null 2>&1; then
            print_success "$name is ready!"
            return 0
        fi
        
        if [ $((attempt % 5)) -eq 0 ]; then
            print_status "Still waiting for $name... (attempt $attempt/$max_attempts)"
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$name failed to start after $max_attempts attempts"
    return 1
}

# Print the awesome header
print_header "
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              🚀 SkillShareHub Platform Launcher 🚀            ║
║                                                               ║
║  Your complete knowledge-sharing platform in one command!    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
"

# Parse command line arguments
SETUP_DEMO=false
RESET_DB=false
SKIP_DEPS=false
DEV_MODE=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --demo)
            SETUP_DEMO=true
            shift
            ;;
        --reset)
            RESET_DB=true
            shift
            ;;
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --prod)
            DEV_MODE=false
            shift
            ;;
        --help|-h)
            echo "SkillShareHub Platform Launcher"
            echo ""
            echo "Usage: ./start-skillshare.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --demo        Set up demo data with sample content"
            echo "  --reset       Reset database before starting"
            echo "  --skip-deps   Skip dependency installation"
            echo "  --prod        Run in production mode"
            echo "  --help, -h    Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./start-skillshare.sh --demo     # Start with demo data"
            echo "  ./start-skillshare.sh --reset    # Fresh start with clean DB"
            echo "  ./start-skillshare.sh            # Normal development start"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check dependencies
print_header "🔍 Checking Dependencies..."

MISSING_DEPS=()

if ! command_exists node; then
    MISSING_DEPS+=("node")
fi

if ! command_exists npm; then
    MISSING_DEPS+=("npm")
fi

if ! command_exists docker; then
    MISSING_DEPS+=("docker")
fi

if ! command_exists docker-compose; then
    MISSING_DEPS+=("docker-compose")
fi

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    print_error "Missing required dependencies: ${MISSING_DEPS[*]}"
    echo ""
    echo "Please install the missing dependencies:"
    echo "  - Node.js: https://nodejs.org/"
    echo "  - Docker: https://docker.com/"
    echo "  - Docker Compose: https://docs.docker.com/compose/"
    exit 1
fi

print_success "All dependencies found!"

# Clean up any existing processes
print_header "🧹 Cleaning Up Existing Processes..."
kill_port 3000  # Frontend (default)
kill_port 3001  # Frontend (alternative)
kill_port 4000  # API
kill_port 5432  # PostgreSQL (if running locally)
kill_port 6379  # Redis (if running locally)

# Install dependencies if not skipped
if [ "$SKIP_DEPS" = false ]; then
    print_header "📦 Installing Dependencies..."
    
    print_status "Installing root dependencies..."
    npm install
    
    print_status "Installing API dependencies..."
    cd apps/api && npm install && cd ../..
    
    print_status "Installing web dependencies..."
    cd apps/web && npm install && cd ../..
    
    print_success "Dependencies installed!"
else
    print_warning "Skipping dependency installation"
fi

# Start Docker services
print_header "🐳 Starting Docker Services..."
print_status "Starting PostgreSQL and Redis..."

docker-compose up -d postgres redis

wait_for_service "http://localhost:5432" "PostgreSQL"

# Database setup
print_header "🗄️  Setting Up Database..."

cd apps/api

if [ "$RESET_DB" = true ]; then
    print_status "Resetting database..."
    npx prisma db push --force-reset
else
    print_status "Synchronizing database schema..."
    npx prisma db push
fi

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Setup demo data if requested
if [ "$SETUP_DEMO" = true ]; then
    print_header "🎮 Setting Up Demo Data..."
    npm run demo:setup
fi

cd ../..

print_success "Database ready!"

# Start the API server
print_header "🔧 Starting API Server..."

cd apps/api

if [ "$DEV_MODE" = true ]; then
    print_status "Starting API in development mode..."
    npm run dev &
else
    print_status "Building and starting API in production mode..."
    npm run build
    npm start &
fi

API_PID=$!
cd ../..

# Wait for API to be ready
wait_for_service "http://localhost:4000/health" "API Server"

# Start the web frontend
print_header "🌐 Starting Web Frontend..."

cd apps/web

if [ "$DEV_MODE" = true ]; then
    print_status "Starting web app in development mode..."
    npm run dev &
else
    print_status "Building and starting web app in production mode..."
    npm run build
    npm run preview &
fi

WEB_PID=$!
cd ../..

# Wait for frontend to be ready
wait_for_service "http://localhost:3001" "Web Frontend"

# Print success information
print_header "
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                    🎉 SUCCESS! Platform Running! 🎉          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
"

echo ""
print_success "SkillShareHub is now running!"
echo ""
echo -e "${CYAN}📱 Frontend:${NC}  http://localhost:3001"
echo -e "${CYAN}🔧 API:${NC}       http://localhost:4000"
echo -e "${CYAN}📊 Health:${NC}    http://localhost:4000/health"
echo -e "${CYAN}🗄️  Database:${NC}  PostgreSQL on localhost:5432"

if [ "$SETUP_DEMO" = true ]; then
    echo ""
    echo -e "${YELLOW}🎮 Demo Account:${NC}"
    echo -e "   Email: demo@skillsharehub.com"
    echo -e "   Password: demo123"
    echo ""
    echo -e "${YELLOW}🌟 Demo Space:${NC} http://localhost:3001/spaces/skillshare-demo"
fi

echo ""
echo -e "${GREEN}🎯 Quick Actions:${NC}"
echo -e "   • Visit the app: open http://localhost:3001"
echo -e "   • View API docs: open http://localhost:4000/api/docs"
echo -e "   • Database admin: cd apps/api && npx prisma studio"

if [ "$DEV_MODE" = true ]; then
    echo ""
    echo -e "${BLUE}🔧 Development Mode Active:${NC}"
    echo -e "   • Hot reload enabled"
    echo -e "   • Rate limiting disabled"
    echo -e "   • Detailed error messages"
fi

echo ""
print_warning "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    print_header "🛑 Shutting Down Services..."
    
    if [ ! -z "$API_PID" ] && kill -0 $API_PID 2>/dev/null; then
        print_status "Stopping API server..."
        kill $API_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$WEB_PID" ] && kill -0 $WEB_PID 2>/dev/null; then
        print_status "Stopping web frontend..."
        kill $WEB_PID 2>/dev/null || true
    fi
    
    print_status "Stopping Docker services..."
    docker-compose down
    
    print_success "All services stopped. Goodbye! 👋"
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT SIGTERM

# Wait for processes to finish (they won't in dev mode, so this keeps script running)
wait
