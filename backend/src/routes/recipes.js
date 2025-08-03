const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const recipeService = require('../services/recipeService');

const router = express.Router();
const prisma = new PrismaClient();

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
