const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const recipeService = require('../services/recipeService');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's recipes (basic endpoint)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10, offset = 0 } = req.query;

    // Get user's saved/created recipes
    const recipes = await prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await prisma.recipe.count({
      where: { userId }
    });

    res.json({
      message: 'Recipes retrieved successfully',
      recipes,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });

  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      error: 'Failed to retrieve recipes',
      message: error.message
    });
  }
});

// Get recipe recommendations for meal planning
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const {
      diet = '',
      excludeIngredients = '',
      number = 12,
      mealType = ''
    } = req.query;

    // In a real app, this would use AI/ML to recommend recipes
    // For now, we'll return curated recommendations based on filters
    const mockRecommendations = [
      {
        id: 1, title: "Overnight Oats with Berries", type: "breakfast", 
        cookTime: 5, servings: 2, difficulty: "Easy", rating: 4.8,
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop",
        ingredients: ["oats", "milk", "berries", "honey", "chia seeds"],
        calories: 320, protein: 12, carbs: 45, fat: 8,
        vegetarian: true, vegan: false, glutenFree: true
      },
      {
        id: 2, title: "Avocado Toast with Egg", type: "breakfast",
        cookTime: 10, servings: 1, difficulty: "Easy", rating: 4.6,
        image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=300&h=200&fit=crop",
        ingredients: ["bread", "avocado", "eggs", "tomato", "salt", "pepper"],
        calories: 380, protein: 18, carbs: 25, fat: 22,
        vegetarian: true, vegan: false, glutenFree: false
      },
      {
        id: 3, title: "Greek Yogurt Parfait", type: "breakfast",
        cookTime: 5, servings: 1, difficulty: "Easy", rating: 4.7,
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop",
        ingredients: ["greek yogurt", "granola", "berries", "honey"],
        calories: 280, protein: 20, carbs: 35, fat: 6,
        vegetarian: true, vegan: false, glutenFree: false
      },
      {
        id: 4, title: "Quinoa Buddha Bowl", type: "lunch",
        cookTime: 25, servings: 2, difficulty: "Medium", rating: 4.9,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop",
        ingredients: ["quinoa", "chickpeas", "cucumber", "tomatoes", "feta", "olive oil"],
        calories: 450, protein: 18, carbs: 55, fat: 16,
        vegetarian: true, vegan: false, glutenFree: true
      },
      {
        id: 5, title: "Chicken Caesar Salad", type: "lunch",
        cookTime: 15, servings: 2, difficulty: "Easy", rating: 4.5,
        image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop",
        ingredients: ["chicken breast", "romaine lettuce", "parmesan", "croutons", "caesar dressing"],
        calories: 420, protein: 35, carbs: 15, fat: 25,
        vegetarian: false, vegan: false, glutenFree: false
      },
      {
        id: 6, title: "Vegetable Stir Fry", type: "lunch",
        cookTime: 20, servings: 2, difficulty: "Medium", rating: 4.4,
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop",
        ingredients: ["mixed vegetables", "tofu", "soy sauce", "ginger", "garlic", "rice"],
        calories: 380, protein: 15, carbs: 45, fat: 12,
        vegetarian: true, vegan: true, glutenFree: false
      },
      {
        id: 7, title: "Grilled Salmon with Vegetables", type: "dinner",
        cookTime: 30, servings: 2, difficulty: "Medium", rating: 4.8,
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop",
        ingredients: ["salmon fillet", "broccoli", "asparagus", "lemon", "olive oil", "herbs"],
        calories: 520, protein: 40, carbs: 20, fat: 28,
        vegetarian: false, vegan: false, glutenFree: true
      },
      {
        id: 8, title: "Pasta Primavera", type: "dinner",
        cookTime: 25, servings: 2, difficulty: "Medium", rating: 4.6,
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop",
        ingredients: ["pasta", "zucchini", "bell peppers", "cherry tomatoes", "parmesan", "basil"],
        calories: 480, protein: 18, carbs: 65, fat: 16,
        vegetarian: true, vegan: false, glutenFree: false
      },
      {
        id: 9, title: "Chicken Curry with Rice", type: "dinner",
        cookTime: 35, servings: 2, difficulty: "Medium", rating: 4.7,
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop",
        ingredients: ["chicken thighs", "coconut milk", "curry powder", "onions", "rice", "cilantro"],
        calories: 580, protein: 32, carbs: 55, fat: 22,
        vegetarian: false, vegan: false, glutenFree: true
      }
    ];

    // Filter based on dietary preferences
    let filteredRecipes = mockRecommendations;
    
    if (diet) {
      const dietPrefs = diet.split(',');
      filteredRecipes = filteredRecipes.filter(recipe => {
        return dietPrefs.some(pref => {
          switch (pref) {
            case 'vegetarian': return recipe.vegetarian;
            case 'vegan': return recipe.vegan;
            case 'gluten-free': return recipe.glutenFree;
            default: return true;
          }
        });
      });
    }

    // Filter by meal type if specified
    if (mealType) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.type === mealType);
    }

    // Exclude ingredients if specified
    if (excludeIngredients) {
      const excludeList = excludeIngredients.split(',').map(ing => ing.toLowerCase().trim());
      filteredRecipes = filteredRecipes.filter(recipe => {
        return !recipe.ingredients.some(ingredient => 
          excludeList.some(exclude => ingredient.toLowerCase().includes(exclude))
        );
      });
    }

    // Limit results
    const limitedRecipes = filteredRecipes.slice(0, parseInt(number));

    res.json({
      message: 'Recipe recommendations retrieved successfully',
      recipes: limitedRecipes,
      total: limitedRecipes.length
    });

  } catch (error) {
    console.error('Recipe recommendations error:', error);
    res.status(500).json({
      error: 'Failed to get recipe recommendations',
      message: error.message
    });
  }
});

// Search recipes
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const {
      query = '',
      diet = '',
      intolerances = '',
      excludeIngredients = '',
      maxReadyTime = 60,
      number = 12,
      offset = 0
    } = req.query;

    // Apply user's dietary preferences if not specified
    let userDiet = diet;
    let userIntolerances = intolerances;

    if (!diet && req.user.dietaryPreferences.length > 0) {
      userDiet = req.user.dietaryPreferences.join(',');
    }

    if (!intolerances && req.user.allergies.length > 0) {
      userIntolerances = req.user.allergies.join(',');
    }

    const filters = {
      query,
      diet: userDiet,
      intolerances: userIntolerances,
      excludeIngredients,
      maxReadyTime: parseInt(maxReadyTime),
      number: parseInt(number),
      offset: parseInt(offset)
    };

    const results = await recipeService.searchRecipes(filters);

    res.json({
      message: 'Recipes retrieved successfully',
      ...results
    });
  } catch (error) {
    console.error('Recipe search error:', error);
    res.status(500).json({
      error: 'Recipe search failed',
      message: error.message
    });
  }
});

// Get recipe by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await recipeService.getRecipeById(id);

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'The requested recipe could not be found'
      });
    }

    res.json({
      message: 'Recipe retrieved successfully',
      recipe
    });
  } catch (error) {
    console.error('Recipe fetch error:', error);
    res.status(500).json({
      error: 'Recipe fetch failed',
      message: error.message
    });
  }
});

// Get random recipes
router.get('/random/suggestions', authenticateToken, async (req, res) => {
  try {
    const { number = 6 } = req.query;

    // Use user's dietary preferences as tags
    const tags = req.user.dietaryPreferences.join(',');

    const recipes = await recipeService.getRandomRecipes({
      tags,
      number: parseInt(number)
    });

    res.json({
      message: 'Random recipes retrieved successfully',
      recipes
    });
  } catch (error) {
    console.error('Random recipes error:', error);
    res.status(500).json({
      error: 'Random recipes fetch failed',
      message: error.message
    });
  }
});

// Get recipes based on pantry ingredients
router.get('/pantry/suggestions', authenticateToken, async (req, res) => {
  try {
    const { number = 6 } = req.query;

    // Get user's pantry items
    const pantryItems = await prisma.pantryItem.findMany({
      where: { userId: req.user.id },
      select: { name: true }
    });

    if (pantryItems.length === 0) {
      return res.json({
        message: 'No pantry items found',
        recipes: []
      });
    }

    const ingredients = pantryItems.map(item => item.name);
    const recipes = await recipeService.getRecipesByIngredients(ingredients, parseInt(number));

    res.json({
      message: 'Pantry-based recipes retrieved successfully',
      recipes,
      usedIngredients: ingredients
    });
  } catch (error) {
    console.error('Pantry recipes error:', error);
    res.status(500).json({
      error: 'Pantry recipes fetch failed',
      message: error.message
    });
  }
});

// Get user's favorite recipes (saved recipes)
router.get('/favorites/list', authenticateToken, async (req, res) => {
  try {
    // This would require a favorites table in the future
    // For now, return recent meal plan recipes
    const recentMealPlans = await prisma.mealPlan.findMany({
      where: { userId: req.user.id },
      include: {
        recipes: {
          include: {
            recipe: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    const favoriteRecipes = [];
    recentMealPlans.forEach(plan => {
      plan.recipes.forEach(mealPlanRecipe => {
        if (!favoriteRecipes.find(r => r.id === mealPlanRecipe.recipe.id)) {
          favoriteRecipes.push(mealPlanRecipe.recipe);
        }
      });
    });

    res.json({
      message: 'Favorite recipes retrieved successfully',
      recipes: favoriteRecipes.slice(0, 12)
    });
  } catch (error) {
    console.error('Favorite recipes error:', error);
    res.status(500).json({
      error: 'Favorite recipes fetch failed',
      message: error.message
    });
  }
});

// Get recipe nutrition information
router.get('/:id/nutrition', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await prisma.recipe.findFirst({
      where: {
        OR: [
          { id },
          { externalId: id }
        ]
      },
      select: {
        id: true,
        title: true,
        nutrition: true,
        servings: true
      }
    });

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'The requested recipe could not be found'
      });
    }

    res.json({
      message: 'Recipe nutrition retrieved successfully',
      recipe: {
        id: recipe.id,
        title: recipe.title,
        servings: recipe.servings,
        nutrition: recipe.nutrition
      }
    });
  } catch (error) {
    console.error('Recipe nutrition error:', error);
    res.status(500).json({
      error: 'Recipe nutrition fetch failed',
      message: error.message
    });
  }
});

module.exports = router;
