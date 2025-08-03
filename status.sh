#!/bin/bash

echo "🔍 SmartMealBuddy Status Check"
echo "=============================="

PUBLIC_IP=$(curl -s ifconfig.me)
echo "📍 Public IP: $PUBLIC_IP"

# Check processes
echo ""
echo "🔄 Running Processes:"
if ps aux | grep -E "(node.*server.js|react-scripts)" | grep -v grep > /dev/null; then
    ps aux | grep -E "(node.*server.js|react-scripts)" | grep -v grep | awk '{print "   ✅ " $11 " " $12 " " $13}'
else
    echo "   ❌ No SmartMealBuddy processes running"
fi

# Check backend
echo ""
echo "🔗 Backend Status:"
if curl -s http://$PUBLIC_IP:5000/health > /dev/null 2>&1; then
    echo "   ✅ Backend API: http://$PUBLIC_IP:5000 - RUNNING"
    curl -s http://$PUBLIC_IP:5000/health | jq -r '"   📊 Status: " + .status + " (" + .timestamp + ")"'
else
    echo "   ❌ Backend API: http://$PUBLIC_IP:5000 - NOT ACCESSIBLE"
fi

# Check frontend
echo ""
echo "🌐 Frontend Status:"
if curl -s -I http://$PUBLIC_IP:3000 | grep -q "200 OK"; then
    echo "   ✅ Frontend App: http://$PUBLIC_IP:3000 - RUNNING"
else
    echo "   ❌ Frontend App: http://$PUBLIC_IP:3000 - NOT ACCESSIBLE"
fi

# Check database
echo ""
echo "🗄️  Database Status:"
if sudo -u postgres psql -d smartmealbuddy -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
    USER_COUNT=$(sudo -u postgres psql -d smartmealbuddy -t -c "SELECT COUNT(*) FROM users;" | xargs)
    echo "   ✅ PostgreSQL: Connected ($USER_COUNT users registered)"
else
    echo "   ❌ PostgreSQL: Connection failed"
fi

echo ""
echo "🧪 Test Credentials:"
echo "   Email: test@example.com"
echo "   Password: password123"
echo ""
echo "🌐 Access URLs:"
echo "   Main App: http://$PUBLIC_IP:3000"
echo "   API: http://$PUBLIC_IP:5000"
echo "   Health: http://$PUBLIC_IP:5000/health"
