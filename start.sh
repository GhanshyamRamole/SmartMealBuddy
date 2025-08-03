#!/bin/bash

echo "🍽️  Starting SmartMealBuddy Application..."
echo "========================================"

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me)
echo "📍 Public IP: $PUBLIC_IP"

# Stop any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "node.*server.js" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
sleep 3

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL..."
if ! sudo systemctl is-active --quiet postgresql; then
    echo "🚀 Starting PostgreSQL..."
    sudo systemctl start postgresql
fi

# Check database connection
echo "🔍 Testing database connection..."
if sudo -u postgres psql -d smartmealbuddy -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Start backend
echo "🚀 Starting backend server..."
cd /home/ubuntu/.aws/amazonq/SmartMealBuddy/backend
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend
if curl -s http://$PUBLIC_IP:5000/health > /dev/null; then
    echo "✅ Backend started successfully"
else
    echo "❌ Backend failed to start"
    cat backend.log | tail -10
    exit 1
fi

# Start frontend
echo "🚀 Starting frontend server..."
cd /home/ubuntu/.aws/amazonq/SmartMealBuddy/frontend
npm start > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to compile
echo "⏳ Waiting for frontend to compile..."
sleep 15

# Test frontend
if curl -s -I http://$PUBLIC_IP:3000 | grep -q "200 OK"; then
    echo "✅ Frontend started successfully"
else
    echo "❌ Frontend failed to start"
    cat frontend.log | tail -10
    exit 1
fi

echo ""
echo "🎉 SmartMealBuddy is now running!"
echo "========================================"
echo "🌐 Frontend: http://$PUBLIC_IP:3000"
echo "🔗 Backend:  http://$PUBLIC_IP:5000"
echo "📊 Health:   http://$PUBLIC_IP:5000/health"
echo ""
echo "🧪 Test Credentials:"
echo "   Email: test@example.com"
echo "   Password: password123"
echo ""
echo "📝 Logs:"
echo "   Backend: tail -f /home/ubuntu/.aws/amazonq/SmartMealBuddy/backend/backend.log"
echo "   Frontend: tail -f /home/ubuntu/.aws/amazonq/SmartMealBuddy/frontend/frontend.log"
echo ""
echo "🛑 To stop: pkill -f 'node.*server.js' && pkill -f 'react-scripts'"
echo ""

# Test API endpoints
echo "🧪 Testing API endpoints..."
echo "Health check:"
curl -s http://$PUBLIC_IP:5000/health | jq .

echo ""
echo "Login test:"
curl -s -X POST http://$PUBLIC_IP:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq .message

echo ""
echo "✅ All systems operational!"
