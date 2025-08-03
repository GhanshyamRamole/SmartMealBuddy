const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const aiService = require('../services/aiService');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Generate AI-powered meal plan suggestions
router.post('/meal-plan-suggestions', authenticateToken, async (req, res) => {
  try {
    const userPreferences = {
      dietaryPreferences: req.user.dietaryPreferences || [],
      allergies: req.user.allergies || [],
      goals: req.user.goals || 'maintenance',
      dailyCalories: req.user.dailyCalories || 2000,
      ...req.body // Allow override from request body
    };

    const suggestions = await aiService.generateMealPlanSuggestions(userPreferences);

    res.json({
      message: 'AI meal plan suggestions generated successfully',
      suggestions,
      userPreferences: {
        dietaryPreferences: userPreferences.dietaryPreferences,
        goals: userPreferences.goals,
        dailyCalories: userPreferences.dailyCalories
      }
    });
  } catch (error) {
    console.error('AI meal plan suggestions error:', error);
    res.status(500).json({
      error: 'AI suggestions failed',
      message: error.message
    });
  }
});

// Get AI-powered pantry-based recipe suggestions
router.get('/pantry-suggestions', authenticateToken, async (req, res) => {
  try {
    // Get user's pantry items
    const pantryItems = await prisma.pantryItem.findMany({
      where: { userId: req.user.id },
      select: {
        name: true,
        quantity: true,
        unit: true,
        category: true
      }
    });

    if (pantryItems.length === 0) {
      return res.json({
        message: 'No pantry items found',
        suggestions: [],
        tip: 'Add items to your pantry to get personalized recipe suggestions!'
      });
    }

    const userPreferences = {
      dietaryPreferences: req.user.dietaryPreferences || [],
      allergies: req.user.allergies || [],
      maxCookingTime: parseInt(req.query.maxCookingTime) || 30
    };

    const suggestions = await aiService.generatePantryBasedSuggestions(pantryItems, userPreferences);

    res.json({
      message: 'Pantry-based suggestions generated successfully',
      suggestions,
      pantryItemsUsed: pantryItems.length,
      userPreferences
    });
  } catch (error) {
    console.error('Pantry suggestions error:', error);
    res.status(500).json({
      error: 'Pantry suggestions failed',
      message: error.message
    });
  }
});

// Optimize grocery list with AI suggestions
router.post('/optimize-grocery-list/:listId', authenticateToken, async (req, res) => {
  try {
    const { listId } = req.params;
    const { userLocation } = req.body;

    // Get grocery list
    const groceryList = await prisma.groceryList.findFirst({
      where: {
        id: listId,
        userId: req.user.id
      }
    });

    if (!groceryList) {
      return res.status(404).json({
        error: 'Grocery list not found',
        message: 'The requested grocery list could not be found'
      });
    }

    const optimizations = await aiService.optimizeGroceryList(
      groceryList.items || [],
      userLocation
    );

    res.json({
      message: 'Grocery list optimization completed',
      listId,
      optimizations,
      originalItemCount: groceryList.items?.length || 0
    });
  } catch (error) {
    console.error('Grocery optimization error:', error);
    res.status(500).json({
      error: 'Grocery optimization failed',
      message: error.message
    });
  }
});

// Get personalized cooking tips and suggestions
router.get('/cooking-tips', authenticateToken, async (req, res) => {
  try {
    const { category = 'general' } = req.query;

    // Get user's recent meal plans to understand their cooking patterns
    const recentMealPlans = await prisma.mealPlan.findMany({
      where: { userId: req.user.id },
      include: {
        recipes: {
          include: {
            recipe: {
              select: {
                cuisines: true,
                readyInMinutes: true,
                dishTypes: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    // Analyze cooking patterns
    const cookingPatterns = this.analyzeCookingPatterns(recentMealPlans);

    const tips = this.generatePersonalizedTips(cookingPatterns, category, req.user);

    res.json({
      message: 'Personalized cooking tips generated',
      category,
      tips,
      cookingPatterns: {
        averageCookingTime: cookingPatterns.averageCookingTime,
        favoriteCuisines: cookingPatterns.favoriteCuisines.slice(0, 3),
        commonDishTypes: cookingPatterns.commonDishTypes.slice(0, 3)
      }
    });
  } catch (error) {
    console.error('Cooking tips error:', error);
    res.status(500).json({
      error: 'Cooking tips failed',
      message: error.message
    });
  }
});

// Get smart ingredient substitutions
router.post('/ingredient-substitutions', authenticateToken, async (req, res) => {
  try {
    const { ingredient, recipeContext, reason = 'unavailable' } = req.body;

    if (!ingredient) {
      return res.status(400).json({
        error: 'Missing ingredient',
        message: 'Ingredient name is required'
      });
    }

    const substitutions = this.getIngredientSubstitutions(
      ingredient,
      recipeContext,
      reason,
      req.user.dietaryPreferences || [],
      req.user.allergies || []
    );

    res.json({
      message: 'Ingredient substitutions found',
      originalIngredient: ingredient,
      reason,
      substitutions,
      userRestrictions: {
        dietaryPreferences: req.user.dietaryPreferences || [],
        allergies: req.user.allergies || []
      }
    });
  } catch (error) {
    console.error('Ingredient substitutions error:', error);
    res.status(500).json({
      error: 'Substitution lookup failed',
      message: error.message
    });
  }
});

// Get meal prep suggestions
router.get('/meal-prep-suggestions', authenticateToken, async (req, res) => {
  try {
    const { days = 7, servings = 4 } = req.query;

    // Get user's dietary preferences
    const userPreferences = {
      dietaryPreferences: req.user.dietaryPreferences || [],
      allergies: req.user.allergies || [],
      goals: req.user.goals || 'maintenance'
    };

    const mealPrepSuggestions = this.generateMealPrepSuggestions(
      parseInt(days),
      parseInt(servings),
      userPreferences
    );

    res.json({
      message: 'Meal prep suggestions generated',
      suggestions: mealPrepSuggestions,
      parameters: {
        days: parseInt(days),
        servings: parseInt(servings)
      },
      tips: [
        'Cook grains and proteins in bulk',
        'Prep vegetables at the beginning of the week',
        'Use glass containers for better food storage',
        'Label containers with dates and contents',
        'Plan for variety to avoid meal fatigue'
      ]
    });
  } catch (error) {
    console.error('Meal prep suggestions error:', error);
    res.status(500).json({
      error: 'Meal prep suggestions failed',
      message: error.message
    });
  }
});

// Get seasonal recipe recommendations
router.get('/seasonal-recommendations', authenticateToken, async (req, res) => {
  try {
    const currentSeason = this.getCurrentSeason();
    const { includeHolidays = true } = req.query;

    const seasonalRecommendations = {
      season: currentSeason,
      ingredients: this.getSeasonalIngredients(currentSeason),
      recipes: this.getSeasonalRecipeIdeas(currentSeason),
      cookingMethods: this.getSeasonalCookingMethods(currentSeason),
      nutritionFocus: this.getSeasonalNutritionFocus(currentSeason)
    };

    if (includeHolidays === 'true') {
      seasonalRecommendations.holidaySpecials = this.getHolidayRecipeIdeas(currentSeason);
    }

    res.json({
      message: 'Seasonal recommendations generated',
      recommendations: seasonalRecommendations,
      userPreferences: {
        dietaryPreferences: req.user.dietaryPreferences || [],
        allergies: req.user.allergies || []
      }
    });
  } catch (error) {
    console.error('Seasonal recommendations error:', error);
    res.status(500).json({
      error: 'Seasonal recommendations failed',
      message: error.message
    });
  }
});

// Helper methods
function analyzeCookingPatterns(mealPlans) {
  let totalCookingTime = 0;
  let recipeCount = 0;
  const cuisines = {};
  const dishTypes = {};

  mealPlans.forEach(plan => {
    plan.recipes.forEach(mealPlanRecipe => {
      const recipe = mealPlanRecipe.recipe;
      
      if (recipe.readyInMinutes) {
        totalCookingTime += recipe.readyInMinutes;
        recipeCount++;
      }

      recipe.cuisines?.forEach(cuisine => {
        cuisines[cuisine] = (cuisines[cuisine] || 0) + 1;
      });

      recipe.dishTypes?.forEach(dishType => {
        dishTypes[dishType] = (dishTypes[dishType] || 0) + 1;
      });
    });
  });

  return {
    averageCookingTime: recipeCount > 0 ? Math.round(totalCookingTime / recipeCount) : 30,
    favoriteCuisines: Object.entries(cuisines)
      .sort(([,a], [,b]) => b - a)
      .map(([cuisine]) => cuisine),
    commonDishTypes: Object.entries(dishTypes)
      .sort(([,a], [,b]) => b - a)
      .map(([dishType]) => dishType)
  };
}

function generatePersonalizedTips(patterns, category, user) {
  const tips = [];

  // Time-based tips
  if (patterns.averageCookingTime > 45) {
    tips.push({
      category: 'time-saving',
      tip: 'Try meal prepping on weekends to save time during busy weekdays',
      icon: '⏰'
    });
  } else if (patterns.averageCookingTime < 20) {
    tips.push({
      category: 'skill-building',
      tip: 'Consider trying some longer-cooking recipes to expand your culinary skills',
      icon: '👨‍🍳'
    });
  }

  // Cuisine-based tips
  if (patterns.favoriteCuisines.length > 0) {
    tips.push({
      category: 'exploration',
      tip: `You love ${patterns.favoriteCuisines[0]} cuisine! Try exploring ${this.getSimilarCuisine(patterns.favoriteCuisines[0])} for variety`,
      icon: '🌍'
    });
  }

  // Dietary preference tips
  if (user.dietaryPreferences?.includes('vegetarian')) {
    tips.push({
      category: 'nutrition',
      tip: 'Make sure to include protein-rich legumes and quinoa in your vegetarian meals',
      icon: '🥗'
    });
  }

  // General tips
  tips.push({
    category: 'general',
    tip: 'Keep your pantry stocked with versatile ingredients like olive oil, garlic, and herbs',
    icon: '🧄'
  });

  return tips.slice(0, 5); // Return top 5 tips
}

function getIngredientSubstitutions(ingredient, recipeContext, reason, dietaryPreferences, allergies) {
  const substitutions = {
    // Dairy substitutions
    'milk': [
      { substitute: 'almond milk', ratio: '1:1', notes: 'Best for cereals and baking' },
      { substitute: 'oat milk', ratio: '1:1', notes: 'Creamy texture, good for coffee' },
      { substitute: 'coconut milk', ratio: '1:1', notes: 'Rich flavor, great for curries' }
    ],
    'butter': [
      { substitute: 'olive oil', ratio: '3/4:1', notes: 'Use 3/4 amount, good for savory dishes' },
      { substitute: 'coconut oil', ratio: '1:1', notes: 'Solid at room temperature' },
      { substitute: 'applesauce', ratio: '1/2:1', notes: 'For baking, reduces calories' }
    ],
    'eggs': [
      { substitute: 'flax eggs', ratio: '1:1', notes: '1 tbsp ground flax + 3 tbsp water per egg' },
      { substitute: 'chia eggs', ratio: '1:1', notes: '1 tbsp chia seeds + 3 tbsp water per egg' },
      { substitute: 'applesauce', ratio: '1/4 cup:1 egg', notes: 'For baking only' }
    ],
    // Protein substitutions
    'chicken': [
      { substitute: 'tofu', ratio: '1:1', notes: 'Press and marinate for best flavor' },
      { substitute: 'tempeh', ratio: '1:1', notes: 'Nutty flavor, firm texture' },
      { substitute: 'mushrooms', ratio: '1:1', notes: 'Portobello or shiitake work well' }
    ],
    'beef': [
      { substitute: 'lentils', ratio: '1:1', notes: 'Great for bolognese and tacos' },
      { substitute: 'black beans', ratio: '1:1', notes: 'Perfect for burgers and chili' },
      { substitute: 'cauliflower', ratio: '1:1', notes: 'Crumbled, for lighter dishes' }
    ],
    // Grain substitutions
    'rice': [
      { substitute: 'quinoa', ratio: '1:1', notes: 'Higher protein content' },
      { substitute: 'cauliflower rice', ratio: '1:1', notes: 'Lower carb option' },
      { substitute: 'barley', ratio: '1:1', notes: 'Chewy texture, nutty flavor' }
    ],
    'pasta': [
      { substitute: 'zucchini noodles', ratio: '1:1', notes: 'Spiralize fresh zucchini' },
      { substitute: 'spaghetti squash', ratio: '1:1', notes: 'Roast and scrape into strands' },
      { substitute: 'shirataki noodles', ratio: '1:1', notes: 'Very low calorie option' }
    ]
  };

  const ingredientLower = ingredient.toLowerCase();
  let availableSubstitutions = substitutions[ingredientLower] || [];

  // Filter based on dietary preferences and allergies
  if (dietaryPreferences.includes('vegan')) {
    availableSubstitutions = availableSubstitutions.filter(sub => 
      !['milk', 'butter', 'eggs', 'chicken', 'beef'].some(animal => 
        sub.substitute.toLowerCase().includes(animal)
      )
    );
  }

  // Filter based on allergies
  allergies.forEach(allergy => {
    availableSubstitutions = availableSubstitutions.filter(sub => 
      !sub.substitute.toLowerCase().includes(allergy.toLowerCase())
    );
  });

  return availableSubstitutions.length > 0 ? availableSubstitutions : [
    {
      substitute: 'Check online recipe databases',
      ratio: 'varies',
      notes: 'No common substitutions found for your dietary restrictions'
    }
  ];
}

function generateMealPrepSuggestions(days, servings, userPreferences) {
  const suggestions = {
    proteins: [
      {
        name: 'Grilled Chicken Batch',
        prepTime: 30,
        servings: servings * 2,
        storage: '4-5 days in refrigerator',
        uses: ['salads', 'wraps', 'grain bowls']
      },
      {
        name: 'Baked Tofu Cubes',
        prepTime: 45,
        servings: servings * 2,
        storage: '5-6 days in refrigerator',
        uses: ['stir-fries', 'salads', 'grain bowls']
      }
    ],
    grains: [
      {
        name: 'Brown Rice Batch',
        prepTime: 45,
        servings: servings * 3,
        storage: '5-6 days in refrigerator',
        uses: ['bowls', 'fried rice', 'side dishes']
      },
      {
        name: 'Quinoa Mix',
        prepTime: 20,
        servings: servings * 2,
        storage: '4-5 days in refrigerator',
        uses: ['salads', 'bowls', 'breakfast porridge']
      }
    ],
    vegetables: [
      {
        name: 'Roasted Vegetable Mix',
        prepTime: 35,
        servings: servings * 2,
        storage: '4-5 days in refrigerator',
        uses: ['bowls', 'pasta', 'omelets']
      },
      {
        name: 'Fresh Salad Base',
        prepTime: 15,
        servings: servings,
        storage: '3-4 days in refrigerator',
        uses: ['salads', 'wraps', 'sandwiches']
      }
    ]
  };

  // Filter based on dietary preferences
  if (userPreferences.dietaryPreferences.includes('vegetarian') || 
      userPreferences.dietaryPreferences.includes('vegan')) {
    suggestions.proteins = suggestions.proteins.filter(protein => 
      !protein.name.toLowerCase().includes('chicken')
    );
  }

  return suggestions;
}

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

function getSeasonalIngredients(season) {
  const seasonalIngredients = {
    spring: ['asparagus', 'peas', 'strawberries', 'spinach', 'artichokes', 'radishes'],
    summer: ['tomatoes', 'corn', 'berries', 'zucchini', 'peaches', 'basil'],
    fall: ['pumpkin', 'apples', 'squash', 'brussels sprouts', 'sweet potatoes', 'cranberries'],
    winter: ['citrus', 'root vegetables', 'cabbage', 'kale', 'pomegranates', 'winter squash']
  };
  
  return seasonalIngredients[season] || [];
}

function getSeasonalRecipeIdeas(season) {
  const seasonalRecipes = {
    spring: ['Fresh pea soup', 'Asparagus risotto', 'Strawberry salad', 'Spring vegetable pasta'],
    summer: ['Gazpacho', 'Grilled vegetable platter', 'Berry parfait', 'Corn salad'],
    fall: ['Pumpkin soup', 'Apple crisp', 'Roasted root vegetables', 'Brussels sprouts gratin'],
    winter: ['Citrus salad', 'Hearty stews', 'Roasted winter squash', 'Kale and white bean soup']
  };
  
  return seasonalRecipes[season] || [];
}

function getSeasonalCookingMethods(season) {
  const cookingMethods = {
    spring: ['steaming', 'light sautéing', 'grilling', 'fresh preparations'],
    summer: ['grilling', 'no-cook preparations', 'light roasting', 'fresh salads'],
    fall: ['roasting', 'braising', 'slow cooking', 'baking'],
    winter: ['slow cooking', 'braising', 'hearty soups', 'warming spices']
  };
  
  return cookingMethods[season] || [];
}

function getSeasonalNutritionFocus(season) {
  const nutritionFocus = {
    spring: 'Detox and cleanse with fresh greens and light proteins',
    summer: 'Hydration and cooling foods with fresh fruits and vegetables',
    fall: 'Immune support with vitamin-rich root vegetables and warming spices',
    winter: 'Comfort and warmth with hearty proteins and vitamin D-rich foods'
  };
  
  return nutritionFocus[season] || 'Balanced nutrition year-round';
}

function getHolidayRecipeIdeas(season) {
  const holidayRecipes = {
    spring: ['Easter brunch dishes', 'Passover-friendly meals', 'Mother\'s Day specials'],
    summer: ['4th of July BBQ', 'Father\'s Day grilling', 'Summer picnic foods'],
    fall: ['Halloween treats', 'Thanksgiving classics', 'Harvest celebration dishes'],
    winter: ['Christmas cookies', 'New Year\'s party appetizers', 'Valentine\'s Day desserts']
  };
  
  return holidayRecipes[season] || [];
}

function getSimilarCuisine(cuisine) {
  const similarCuisines = {
    'italian': 'Mediterranean',
    'mexican': 'Latin American',
    'chinese': 'Asian',
    'indian': 'Middle Eastern',
    'french': 'European',
    'thai': 'Southeast Asian',
    'japanese': 'Korean',
    'greek': 'Turkish'
  };
  
  return similarCuisines[cuisine.toLowerCase()] || 'International';
}

module.exports = router;
