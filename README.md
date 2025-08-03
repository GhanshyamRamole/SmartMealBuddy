# SmartMealBuddy

A full-stack meal planning application that helps users plan meals based on dietary preferences, generates weekly meal plans, creates grocery lists, tracks pantry items, and integrates with online grocery stores.

## Features

- 🔐 User Authentication (JWT-based)
- 🍽️ Meal Planning Engine with dietary preferences
- 📝 Recipe Management with external API integration
- 🛒 Smart Grocery List Generation
- 📦 Pantry Inventory Tracking
- 🛍️ Online Grocery Store Integration
- 📱 Responsive Web Interface

## Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Redux Toolkit for state management
- React Router for navigation

### Backend
- Node.js with Express.js
- PostgreSQL with Prisma ORM
- JWT Authentication
- External Recipe API integration

### APIs Integrated
- Spoonacular Recipe API
- BigBasket/Amazon Fresh (mock integration)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/GhanshyamRamole/SmartMealBuddy.git
cd SmartMealBuddy
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
```bash
# Backend .env
DATABASE_URL="postgresql://username:password@localhost:5432/smartmealbuddy"
JWT_SECRET="your-jwt-secret"
SPOONACULAR_API_KEY="your-spoonacular-api-key"
```

5. Run database migrations
```bash
cd backend
npx prisma migrate dev
```

6. Start the development servers
```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 3000)
cd frontend
npm start
```

## Project Structure

```
SmartMealBuddy/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── prisma/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── services/
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Recipes
- `GET /api/recipes` - Get recipes with filters
- `GET /api/recipes/:id` - Get recipe details

### Meal Plans
- `POST /api/mealplans` - Generate meal plan
- `GET /api/mealplans` - Get user meal plans

### Grocery Lists
- `POST /api/grocery-lists` - Generate grocery list
- `GET /api/grocery-lists` - Get user grocery lists
- `PUT /api/grocery-lists/:id` - Update grocery list

### Pantry
- `GET /api/pantry` - Get pantry items
- `POST /api/pantry` - Add pantry item
- `PUT /api/pantry/:id` - Update pantry item
- `DELETE /api/pantry/:id` - Remove pantry item

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
