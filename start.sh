#!/bin/bash

# SkillShareHub - Ultra Simple Start
# No health checks, just start everything

echo "🚀 Starting SkillShareHub..."

# Clean up
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "tsx watch" 2>/dev/null || true

# Start Docker
docker-compose up -d postgres redis

# Setup DB (only if needed)
if [ ! -f "apps/api/.env" ]; then
    echo "📋 First time setup..."
    cd apps/api
    npx prisma db push --force-reset
    npx prisma generate
    npm run demo:setup
    cd ../..
fi

echo "🔧 Starting services..."

# Start API
(cd apps/api && npm run dev) &

# Start Web  
(cd apps/web && npm run dev) &

echo ""
echo "✅ Started! Give it 30 seconds then visit:"
echo "   🌐 http://localhost:3000"
echo "   👤 demo@skillsharehub.com / demo123"
echo ""
echo "🛑 To stop: pkill -f 'npm run dev'"
