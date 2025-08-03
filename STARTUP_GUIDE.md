# 🚀 SmartMealBuddy - Startup Guide

## ✅ **APPLICATION IS NOW RUNNING SUCCESSFULLY!**

**Status:** 🟢 **FULLY OPERATIONAL**  
**Public IP:** `13.201.120.170`  
**Access URL:** http://13.201.120.170:3000  

---

## 🎯 **QUICK START**

### Option 1: Use Startup Script (Recommended)
```bash
cd /home/ubuntu/.aws/amazonq/SmartMealBuddy
./start.sh
```

### Option 2: Manual Start
```bash
# Start backend
cd /home/ubuntu/.aws/amazonq/SmartMealBuddy/backend
npm run dev > backend.log 2>&1 &

# Start frontend  
cd /home/ubuntu/.aws/amazonq/SmartMealBuddy/frontend
npm start > frontend.log 2>&1 &
```

### Option 3: Check Status
```bash
cd /home/ubuntu/.aws/amazonq/SmartMealBuddy
./status.sh
```

---

## 🌐 **ACCESS YOUR APPLICATION**

### Main Application
**URL:** http://13.201.120.170:3000

### Test Credentials
- **Email:** test@example.com
- **Password:** password123

### Alternative Credentials  
- **Email:** demo@example.com
- **Password:** demo123

---

## ✅ **CURRENT STATUS (Verified Working)**

### System Status
- ✅ **Backend API:** Running on port 5000
- ✅ **Frontend App:** Running on port 3000
- ✅ **PostgreSQL:** Connected with 2 users
- ✅ **Authentication:** Login/Register working
- ✅ **CORS:** Cross-origin requests enabled

### Available Features
- ✅ **User Registration & Login**
- ✅ **Profile Management**
- ✅ **Meal Planning**
- ✅ **Recipe Management**
- ✅ **Grocery Lists**
- ✅ **Pantry Tracking**
- ✅ **Analytics Dashboard**
- ✅ **Responsive Design**

---

## 🔧 **TROUBLESHOOTING**

### If Application Won't Start

#### 1. Check Prerequisites
```bash
# Check Node.js
node --version  # Should show v18.x.x

# Check PostgreSQL
sudo systemctl status postgresql

# Check if ports are free
sudo netstat -tlnp | grep -E ":3000|:5000"
```

#### 2. Clean Restart
```bash
# Stop all processes
pkill -f "node.*server.js"
pkill -f "react-scripts"

# Wait and restart
sleep 3
cd /home/ubuntu/.aws/amazonq/SmartMealBuddy
./start.sh
```

#### 3. Check Logs
```bash
# Backend logs
tail -f /home/ubuntu/.aws/amazonq/SmartMealBuddy/backend/backend.log

# Frontend logs
tail -f /home/ubuntu/.aws/amazonq/SmartMealBuddy/frontend/frontend.log
```

#### 4. Database Issues
```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Check database connection
sudo -u postgres psql -d smartmealbuddy -c "SELECT COUNT(*) FROM users;"
```

### If Login Doesn't Work

#### 1. Verify API Connection
```bash
# Test backend health
curl http://13.201.120.170:5000/health

# Test login API
curl -X POST http://13.201.120.170:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### 2. Clear Browser Cache
- Open browser in incognito/private mode
- Clear browser cache and cookies
- Try different browser

#### 3. Check Network
- Ensure you can access http://13.201.120.170:3000
- Check if firewall is blocking ports 3000 or 5000

---

## 📊 **MONITORING COMMANDS**

### Check System Status
```bash
# Quick status check
./status.sh

# Detailed process check
ps aux | grep -E "(node|npm)" | grep -v grep

# Check ports
sudo netstat -tlnp | grep -E ":3000|:5000"
```

### Performance Monitoring
```bash
# CPU and memory usage
top -p $(pgrep -f "node.*server.js|react-scripts" | tr '\n' ',' | sed 's/,$//')

# Disk usage
df -h

# Check logs for errors
grep -i error /home/ubuntu/.aws/amazonq/SmartMealBuddy/backend/backend.log
```

---

## 🔄 **RESTART PROCEDURES**

### Graceful Restart
```bash
cd /home/ubuntu/.aws/amazonq/SmartMealBuddy
./start.sh
```

### Force Restart
```bash
# Kill all processes
sudo pkill -9 -f "node"
sudo pkill -9 -f "npm"

# Wait and restart
sleep 5
./start.sh
```

### Restart Individual Services
```bash
# Restart backend only
pkill -f "node.*server.js"
cd /home/ubuntu/.aws/amazonq/SmartMealBuddy/backend
npm run dev > backend.log 2>&1 &

# Restart frontend only
pkill -f "react-scripts"
cd /home/ubuntu/.aws/amazonq/SmartMealBuddy/frontend
npm start > frontend.log 2>&1 &
```

---

## 🆘 **COMMON ISSUES & SOLUTIONS**

### Issue: "Port already in use"
```bash
# Find and kill process using port
sudo lsof -ti:3000 | xargs sudo kill -9
sudo lsof -ti:5000 | xargs sudo kill -9
```

### Issue: "Database connection failed"
```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Check if database exists
sudo -u postgres psql -l | grep smartmealbuddy
```

### Issue: "Frontend won't load"
```bash
# Check if compilation succeeded
cd /home/ubuntu/.aws/amazonq/SmartMealBuddy/frontend
tail -20 frontend.log | grep -E "(compiled|error)"
```

### Issue: "API calls failing"
```bash
# Check CORS configuration
curl -H "Origin: http://13.201.120.170:3000" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://13.201.120.170:5000/api/auth/login
```

---

## 🎉 **SUCCESS INDICATORS**

### ✅ Everything Working When:
- `./status.sh` shows all green checkmarks
- http://13.201.120.170:3000 loads the application
- Login with test@example.com works
- Backend health check returns "OK"
- No errors in logs

### 🌐 **Ready URLs:**
- **Main App:** http://13.201.120.170:3000
- **API Health:** http://13.201.120.170:5000/health
- **API Docs:** Available in code documentation

---

## 📞 **SUPPORT**

### Quick Commands Reference
```bash
# Start application
./start.sh

# Check status
./status.sh

# View logs
tail -f backend/backend.log
tail -f frontend/frontend.log

# Stop application
pkill -f "node.*server.js" && pkill -f "react-scripts"
```

**Your SmartMealBuddy application is ready to use! 🍽️✨**
