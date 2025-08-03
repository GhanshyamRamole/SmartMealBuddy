#!/bin/bash

# SmartMealBuddy Setup Script
echo "🍽️  Setting up SmartMealBuddy..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file from template. Please update with your configuration."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "📊 Please set up your PostgreSQL database and update the DATABASE_URL in backend/.env"
echo "Then run: cd backend && npx prisma migrate dev"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "1. Update backend/.env with your database URL and API keys"
echo "2. Run database migrations: cd backend && npx prisma migrate dev"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "📖 Check README.md for detailed instructions"
