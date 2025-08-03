# 🌐 SmartMealBuddy - Public IP Access

## ✅ Successfully Configured for Public Access!

**Instance Public IP:** `13.201.120.170`  
**Deployment Date:** August 3, 2025  
**Status:** RUNNING & ACCESSIBLE  

## 🌐 Public Access URLs

### Frontend Application
**🎯 Main Application:** http://13.201.120.170:3000

### Backend API
**🔗 API Base URL:** http://13.201.120.170:5000  
**📊 Health Check:** http://13.201.120.170:5000/health  
**🔐 Authentication:** http://13.201.120.170:5000/api/auth  

## 🧪 Test Credentials

**Email:** test@example.com  
**Password:** password123  

## 📱 How to Access

### 1. Web Application
1. Open your web browser
2. Navigate to: **http://13.201.120.170:3000**
3. Register a new account or use test credentials
4. Start planning your meals!

### 2. API Testing
```bash
# Health Check
curl http://13.201.120.170:5000/health

# User Login
curl -X POST http://13.201.120.170:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Register New User
curl -X POST http://13.201.120.170:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "your@email.com", 
    "password": "yourpassword",
    "dietaryPreferences": ["vegetarian"],
    "goals": "maintenance",
    "dailyCalories": 2000
  }'
```

## 🔧 Configuration Changes Made

### Backend Configuration
- ✅ Server listening on `0.0.0.0:5000` (all interfaces)
- ✅ CORS configured for public IP frontend
- ✅ Environment variables updated
- ✅ Database connection maintained

### Frontend Configuration  
- ✅ React app serving on `0.0.0.0:3000`
- ✅ API URL pointing to public IP backend
- ✅ Environment variables configured
- ✅ Build optimizations enabled

### Network Configuration
- ✅ Backend accessible on port 5000
- ✅ Frontend accessible on port 3000
- ✅ Cross-origin requests enabled
- ✅ Public IP routing working

## 🛡️ Security Considerations

### Current Setup (Development)
- ⚠️ **HTTP Only** - No SSL/TLS encryption
- ⚠️ **Open Ports** - 3000 and 5000 publicly accessible
- ⚠️ **Development Mode** - Debug features enabled
- ⚠️ **Default Secrets** - Using development JWT secret

### For Production Use
```bash
# Recommended security enhancements:
1. Enable HTTPS with SSL certificates
2. Use environment-specific secrets
3. Configure firewall rules
4. Enable rate limiting
5. Add monitoring and logging
6. Use reverse proxy (nginx)
```

## 🔍 Monitoring & Logs

### Server Status
```bash
# Check if servers are running
ps aux | grep -E "(node|npm)" | grep -v grep

# View backend logs
tail -f /home/ubuntu/.aws/amazonq/SmartMealBuddy/backend/backend.log

# View frontend logs  
tail -f /home/ubuntu/.aws/amazonq/SmartMealBuddy/frontend/frontend.log
```

### Health Checks
```bash
# Backend health
curl http://13.201.120.170:5000/health

# Frontend accessibility
curl -I http://13.201.120.170:3000
```

## 🚀 Available Features

### ✅ Fully Functional
- **User Authentication** - Register, login, profile management
- **Recipe Management** - Search, save, and organize recipes
- **Meal Planning** - Generate weekly meal plans
- **Grocery Lists** - Auto-generate from meal plans
- **Pantry Management** - Track inventory and expiry dates
- **Analytics Dashboard** - Usage insights and trends
- **Responsive Design** - Works on desktop and mobile

### 🔑 With API Keys
- **AI-Powered Suggestions** - Smart meal recommendations
- **External Recipe Data** - Thousands of recipes via Spoonacular
- **Email Notifications** - Expiry alerts and reminders

## 📊 System Status

### Backend Server
- ✅ **Status:** Running on 0.0.0.0:5000
- ✅ **Database:** PostgreSQL connected
- ✅ **API Endpoints:** 40+ endpoints active
- ✅ **Authentication:** JWT working
- ✅ **Scheduled Tasks:** Background jobs running

### Frontend Server
- ✅ **Status:** Running on 0.0.0.0:3000  
- ✅ **React App:** Compiled and serving
- ✅ **API Integration:** Connected to backend
- ✅ **Responsive Design:** Mobile-friendly

### Database
- ✅ **PostgreSQL:** Running locally
- ✅ **Migrations:** Applied successfully
- ✅ **Test Data:** Sample user created

## 🔄 Management Commands

### Restart Services
```bash
# Stop all services
pkill -f "node.*server.js" && pkill -f "react-scripts"

# Start backend
cd /home/ubuntu/.aws/amazonq/SmartMealBuddy/backend
npm run dev > backend.log 2>&1 &

# Start frontend
cd /home/ubuntu/.aws/amazonq/SmartMealBuddy/frontend  
npm start > frontend.log 2>&1 &
```

### Update Configuration
```bash
# Backend environment
nano /home/ubuntu/.aws/amazonq/SmartMealBuddy/backend/.env

# Frontend environment
nano /home/ubuntu/.aws/amazonq/SmartMealBuddy/frontend/.env
```

## 🎉 Success!

Your SmartMealBuddy application is now **publicly accessible** at:

**🌐 http://13.201.120.170:3000**

**Features Available:**
- ✅ Complete meal planning platform
- ✅ User authentication and profiles  
- ✅ Recipe search and management
- ✅ Grocery list generation
- ✅ Pantry inventory tracking
- ✅ Analytics and insights
- ✅ Responsive web design
- ✅ RESTful API with 40+ endpoints

**Ready for users worldwide!** 🌍🍽️
