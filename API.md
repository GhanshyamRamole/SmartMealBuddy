# SmartMealBuddy API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "dietaryPreferences": ["vegetarian", "gluten-free"],
  "allergies": ["nuts"],
  "goals": "weight-loss",
  "dailyCalories": 2000
}
```

#### Login User
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /auth/profile
```
*Requires authentication*

#### Update Profile
```http
PUT /auth/profile
```
*Requires authentication*

**Body:**
```json
{
  "name": "John Doe Updated",
  "dietaryPreferences": ["vegan"],
  "goals": "muscle-gain"
}
```

### Recipes

#### Search Recipes
```http
GET /recipes/search?query=pasta&diet=vegetarian&maxReadyTime=30&number=12
```
*Requires authentication*

#### Get Recipe by ID
```http
GET /recipes/:id
```
*Requires authentication*

#### Get Random Recipes
```http
GET /recipes/random/suggestions?number=6
```
*Requires authentication*

#### Get Pantry-Based Recipes
```http
GET /recipes/pantry/suggestions?number=6
```
*Requires authentication*

### Meal Plans

#### Generate Meal Plan
```http
POST /mealplans/generate
```
*Requires authentication*

**Body:**
```json
{
  "name": "Weekly Healthy Plan",
  "startDate": "2024-02-05T00:00:00.000Z",
  "endDate": "2024-02-11T00:00:00.000Z",
  "preferences": {
    "dietaryRestrictions": ["vegetarian"],
    "excludeIngredients": ["nuts"],
    "maxReadyTime": 45,
    "targetCalories": 2000
  }
}
```

#### Get Meal Plans
```http
GET /mealplans?page=1&limit=10
```
*Requires authentication*

#### Get Meal Plan by ID
```http
GET /mealplans/:id
```
*Requires authentication*

#### Update Meal Plan Recipe
```http
PUT /mealplans/:id/recipes/:mealPlanRecipeId
```
*Requires authentication*

**Body:**
```json
{
  "recipeId": "recipe-id",
  "servings": 2
}
```

#### Delete Meal Plan
```http
DELETE /mealplans/:id
```
*Requires authentication*

### Grocery Lists

#### Generate Grocery List from Meal Plan
```http
POST /grocery-lists/generate/:mealPlanId
```
*Requires authentication*

**Body:**
```json
{
  "name": "Weekly Groceries",
  "excludePantryItems": true
}
```

#### Create Custom Grocery List
```http
POST /grocery-lists
```
*Requires authentication*

**Body:**
```json
{
  "name": "Custom List",
  "items": [
    {
      "name": "Tomatoes",
      "quantity": 2,
      "unit": "lbs",
      "category": "vegetables"
    }
  ]
}
```

#### Get Grocery Lists
```http
GET /grocery-lists?status=active&page=1&limit=10
```
*Requires authentication*

#### Update Grocery List
```http
PUT /grocery-lists/:id
```
*Requires authentication*

#### Mark Item as Purchased
```http
PATCH /grocery-lists/:id/items/:itemIndex
```
*Requires authentication*

**Body:**
```json
{
  "purchased": true
}
```

### Pantry

#### Get Pantry Items
```http
GET /pantry?category=vegetables&expiring=false&page=1&limit=50
```
*Requires authentication*

#### Add Pantry Item
```http
POST /pantry
```
*Requires authentication*

**Body:**
```json
{
  "name": "Tomatoes",
  "quantity": 5,
  "unit": "pieces",
  "category": "vegetables",
  "expiryDate": "2024-02-15T00:00:00.000Z"
}
```

#### Update Pantry Item
```http
PUT /pantry/:id
```
*Requires authentication*

#### Delete Pantry Item
```http
DELETE /pantry/:id
```
*Requires authentication*

#### Use Pantry Item (Reduce Quantity)
```http
PATCH /pantry/:id/use
```
*Requires authentication*

**Body:**
```json
{
  "quantity": 2
}
```

#### Get Expiring Items
```http
GET /pantry/alerts/expiring?days=7
```
*Requires authentication*

#### Bulk Add Pantry Items
```http
POST /pantry/bulk
```
*Requires authentication*

**Body:**
```json
{
  "items": [
    {
      "name": "Rice",
      "quantity": 2,
      "unit": "lbs",
      "category": "grains"
    }
  ]
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

## External API Integration

The application integrates with:
- **Spoonacular API** for recipe data
- **BigBasket/Amazon Fresh** (mock integration) for grocery shopping
