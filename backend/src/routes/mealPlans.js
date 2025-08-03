const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const recipeService = require('../services/recipeService');

const router = express.Router();
const prisma = new PrismaClient();

// Generate a new meal plan
router.post('/generate', authenticateToken, validateRequest(schemas.createMealPlan), async (req, res) => {
  try {
    const { name, startDate, endDate, preferences = {} } = req.body;
    const userId = req.user.id;

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (daysDiff > 14) {
      return res.status(400).json({
        error: 'Invalid date range',
        message: 'Meal plans cannot exceed 14 days'
      });
    }

    // Merge user preferences with request preferences
    const dietaryRestrictions = [
      ...req.user.dietaryPreferences,
      ...(preferences.dietaryRestrictions || [])
    ];

    const excludeIngredients = [
      ...req.user.allergies,
      ...(preferences.excludeIngredients || [])
    ];

    // Create meal plan
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId,
        name,
        startDate: start,
        endDate: end
      }
    });

    // Generate recipes for each day and meal
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const mealPlanRecipes = [];

    for (let day = 1; day <= daysDiff; day++) {
      for (const mealType of mealTypes) {
        try {
          // Search for recipes based on meal type and preferences
          const searchFilters = {
            query: mealType,
            diet: dietaryRestrictions.join(','),
            excludeIngredients: excludeIngredients.join(','),
            maxReadyTime: preferences.maxReadyTime || 60,
            number: 3 // Get 3 options and pick the first one
          };

          const searchResults = await recipeService.searchRecipes(searchFilters);
          
          if (searchResults.recipes.length > 0) {
            const selectedRecipe = searchResults.recipes[0];
            
            mealPlanRecipes.push({
              mealPlanId: mealPlan.id,
              recipeId: selectedRecipe.id,
              day,
              mealType,
              servings: 1
            });
          }
        } catch (error) {
          console.error(`Error generating ${mealType} for day ${day}:`, error);
          // Continue with other meals even if one fails
        }
      }
    }

    // Save meal plan recipes
    if (mealPlanRecipes.length > 0) {
      await prisma.mealPlanRecipe.createMany({
        data: mealPlanRecipes
      });
    }

    // Fetch the complete meal plan with recipes
    const completeMealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlan.id },
      include: {
        recipes: {
          include: {
            recipe: true
          },
          orderBy: [
            { day: 'asc' },
            { mealType: 'asc' }
          ]
        }
      }
    });

    res.status(201).json({
      message: 'Meal plan generated successfully',
      mealPlan: completeMealPlan
    });
  } catch (error) {
    console.error('Meal plan generation error:', error);
    res.status(500).json({
      error: 'Meal plan generation failed',
      message: error.message
    });
  }
});

// Get user's meal plans
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const mealPlans = await prisma.mealPlan.findMany({
      where: { userId: req.user.id },
      include: {
        recipes: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                image: true,
                readyInMinutes: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: parseInt(limit)
    });

    const totalCount = await prisma.mealPlan.count({
      where: { userId: req.user.id }
    });

    res.json({
      message: 'Meal plans retrieved successfully',
      mealPlans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Meal plans fetch error:', error);
    res.status(500).json({
      error: 'Meal plans fetch failed',
      message: error.message
    });
  }
});

// Get specific meal plan
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        recipes: {
          include: {
            recipe: true
          },
          orderBy: [
            { day: 'asc' },
            { mealType: 'asc' }
          ]
        }
      }
    });

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Meal plan not found',
        message: 'The requested meal plan could not be found'
      });
    }

    res.json({
      message: 'Meal plan retrieved successfully',
      mealPlan
    });
  } catch (error) {
    console.error('Meal plan fetch error:', error);
    res.status(500).json({
      error: 'Meal plan fetch failed',
      message: error.message
    });
  }
});

// Update meal plan (replace a recipe)
router.put('/:id/recipes/:mealPlanRecipeId', authenticateToken, async (req, res) => {
  try {
    const { id, mealPlanRecipeId } = req.params;
    const { recipeId, servings = 1 } = req.body;

    // Verify meal plan belongs to user
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Meal plan not found',
        message: 'The requested meal plan could not be found'
      });
    }

    // Verify recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    });

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found',
        message: 'The selected recipe could not be found'
      });
    }

    // Update meal plan recipe
    const updatedMealPlanRecipe = await prisma.mealPlanRecipe.update({
      where: { id: mealPlanRecipeId },
      data: {
        recipeId,
        servings: parseInt(servings)
      },
      include: {
        recipe: true
      }
    });

    res.json({
      message: 'Meal plan recipe updated successfully',
      mealPlanRecipe: updatedMealPlanRecipe
    });
  } catch (error) {
    console.error('Meal plan update error:', error);
    res.status(500).json({
      error: 'Meal plan update failed',
      message: error.message
    });
  }
});

// Delete meal plan
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify meal plan belongs to user
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Meal plan not found',
        message: 'The requested meal plan could not be found'
      });
    }

    // Delete meal plan (cascade will delete related recipes)
    await prisma.mealPlan.delete({
      where: { id }
    });

    res.json({
      message: 'Meal plan deleted successfully'
    });
  } catch (error) {
    console.error('Meal plan deletion error:', error);
    res.status(500).json({
      error: 'Meal plan deletion failed',
      message: error.message
    });
  }
});

// Get meal plan nutrition summary
router.get('/:id/nutrition', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        recipes: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                nutrition: true,
                servings: true
              }
            }
          }
        }
      }
    });

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Meal plan not found',
        message: 'The requested meal plan could not be found'
      });
    }

    // Calculate total nutrition
    let totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };

    mealPlan.recipes.forEach(mealPlanRecipe => {
      const recipe = mealPlanRecipe.recipe;
      if (recipe.nutrition && recipe.nutrition.nutrients) {
        const nutrients = recipe.nutrition.nutrients;
        const servingMultiplier = mealPlanRecipe.servings / (recipe.servings || 1);

        nutrients.forEach(nutrient => {
          switch (nutrient.name.toLowerCase()) {
            case 'calories':
              totalNutrition.calories += nutrient.amount * servingMultiplier;
              break;
            case 'protein':
              totalNutrition.protein += nutrient.amount * servingMultiplier;
              break;
            case 'carbohydrates':
              totalNutrition.carbs += nutrient.amount * servingMultiplier;
              break;
            case 'fat':
              totalNutrition.fat += nutrient.amount * servingMultiplier;
              break;
            case 'fiber':
              totalNutrition.fiber += nutrient.amount * servingMultiplier;
              break;
          }
        });
      }
    });

    // Round values
    Object.keys(totalNutrition).forEach(key => {
      totalNutrition[key] = Math.round(totalNutrition[key] * 100) / 100;
    });

    res.json({
      message: 'Meal plan nutrition retrieved successfully',
      mealPlanId: id,
      nutrition: totalNutrition,
      dailyAverage: {
        calories: Math.round((totalNutrition.calories / ((new Date(mealPlan.endDate) - new Date(mealPlan.startDate)) / (1000 * 60 * 60 * 24) + 1)) * 100) / 100,
        protein: Math.round((totalNutrition.protein / ((new Date(mealPlan.endDate) - new Date(mealPlan.startDate)) / (1000 * 60 * 60 * 24) + 1)) * 100) / 100,
        carbs: Math.round((totalNutrition.carbs / ((new Date(mealPlan.endDate) - new Date(mealPlan.startDate)) / (1000 * 60 * 60 * 24) + 1)) * 100) / 100,
        fat: Math.round((totalNutrition.fat / ((new Date(mealPlan.endDate) - new Date(mealPlan.startDate)) / (1000 * 60 * 60 * 24) + 1)) * 100) / 100,
        fiber: Math.round((totalNutrition.fiber / ((new Date(mealPlan.endDate) - new Date(mealPlan.startDate)) / (1000 * 60 * 60 * 24) + 1)) * 100) / 100
      }
    });
  } catch (error) {
    console.error('Meal plan nutrition error:', error);
    res.status(500).json({
      error: 'Meal plan nutrition fetch failed',
      message: error.message
    });
  }
});

module.exports = router;
