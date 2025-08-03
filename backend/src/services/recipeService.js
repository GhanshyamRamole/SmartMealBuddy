const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class RecipeService {
  constructor() {
    this.apiKey = process.env.SPOONACULAR_API_KEY;
    this.baseUrl = 'https://api.spoonacular.com/recipes';
  }

  // Search recipes with filters
  async searchRecipes(filters = {}) {
    try {
      const {
        query = '',
        diet = '',
        intolerances = '',
        excludeIngredients = '',
        maxReadyTime = 60,
        number = 12,
        offset = 0
      } = filters;

      const params = {
        apiKey: this.apiKey,
        query,
        diet,
        intolerances,
        excludeIngredients,
        maxReadyTime,
        number,
        offset,
        addRecipeInformation: true,
        fillIngredients: true
      };

      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axios.get(`${this.baseUrl}/complexSearch`, { params });
      
      // Store recipes in database for caching
      const recipes = await Promise.all(
        response.data.results.map(async (recipe) => {
          return await this.storeRecipe(recipe);
        })
      );

      return {
        recipes,
        totalResults: response.data.totalResults,
        offset: response.data.offset,
        number: response.data.number
      };
    } catch (error) {
      console.error('Recipe search error:', error.response?.data || error.message);
      throw new Error('Failed to search recipes');
    }
  }

  // Get recipe details by ID
  async getRecipeById(id) {
    try {
      // First check if recipe exists in database
      const existingRecipe = await prisma.recipe.findFirst({
        where: {
          OR: [
            { id },
            { externalId: id.toString() }
          ]
        }
      });

      if (existingRecipe) {
        return existingRecipe;
      }

      // If not in database, fetch from API
      const response = await axios.get(`${this.baseUrl}/${id}/information`, {
        params: {
          apiKey: this.apiKey,
          includeNutrition: true
        }
      });

      // Store and return recipe
      return await this.storeRecipe(response.data);
    } catch (error) {
      console.error('Recipe fetch error:', error.response?.data || error.message);
      throw new Error('Failed to fetch recipe details');
    }
  }

  // Get random recipes
  async getRandomRecipes(filters = {}) {
    try {
      const {
        limitLicense = true,
        tags = '',
        number = 6
      } = filters;

      const params = {
        apiKey: this.apiKey,
        limitLicense,
        tags,
        number
      };

      const response = await axios.get(`${this.baseUrl}/random`, { params });
      
      const recipes = await Promise.all(
        response.data.recipes.map(async (recipe) => {
          return await this.storeRecipe(recipe);
        })
      );

      return recipes;
    } catch (error) {
      console.error('Random recipes error:', error.response?.data || error.message);
      throw new Error('Failed to fetch random recipes');
    }
  }

  // Store recipe in database
  async storeRecipe(recipeData) {
    try {
      const {
        id: externalId,
        title,
        image,
        readyInMinutes,
        servings,
        cuisines = [],
        dishTypes = [],
        diets = [],
        extendedIngredients = [],
        analyzedInstructions = [],
        nutrition = null
      } = recipeData;

      // Transform ingredients
      const ingredients = extendedIngredients.map(ing => ({
        id: ing.id,
        name: ing.name,
        original: ing.original,
        amount: ing.amount,
        unit: ing.unit,
        image: ing.image
      }));

      // Transform instructions
      const instructions = analyzedInstructions.length > 0 
        ? analyzedInstructions[0].steps.map(step => ({
            number: step.number,
            step: step.step,
            ingredients: step.ingredients || [],
            equipment: step.equipment || []
          }))
        : [];

      // Check if recipe already exists
      const existingRecipe = await prisma.recipe.findUnique({
        where: { externalId: externalId.toString() }
      });

      if (existingRecipe) {
        return existingRecipe;
      }

      // Create new recipe
      const recipe = await prisma.recipe.create({
        data: {
          externalId: externalId.toString(),
          title,
          image,
          readyInMinutes,
          servings,
          cuisines,
          dishTypes,
          diets,
          ingredients,
          instructions,
          nutrition
        }
      });

      return recipe;
    } catch (error) {
      console.error('Store recipe error:', error);
      throw new Error('Failed to store recipe');
    }
  }

  // Get recipes by ingredients (what's in pantry)
  async getRecipesByIngredients(ingredients, number = 6) {
    try {
      const params = {
        apiKey: this.apiKey,
        ingredients: ingredients.join(','),
        number,
        limitLicense: true,
        ranking: 1, // Maximize used ingredients
        ignorePantry: true
      };

      const response = await axios.get(`${this.baseUrl}/findByIngredients`, { params });
      
      // Get detailed information for each recipe
      const detailedRecipes = await Promise.all(
        response.data.map(async (recipe) => {
          return await this.getRecipeById(recipe.id);
        })
      );

      return detailedRecipes;
    } catch (error) {
      console.error('Recipes by ingredients error:', error.response?.data || error.message);
      throw new Error('Failed to find recipes by ingredients');
    }
  }

  // Generate meal plan
  async generateMealPlan(preferences = {}) {
    try {
      const {
        timeFrame = 'week',
        targetCalories = 2000,
        diet = '',
        exclude = ''
      } = preferences;

      const params = {
        apiKey: this.apiKey,
        timeFrame,
        targetCalories,
        diet,
        exclude
      };

      const response = await axios.get(`${this.baseUrl}/mealplans/generate`, { params });
      
      return response.data;
    } catch (error) {
      console.error('Meal plan generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate meal plan');
    }
  }
}

module.exports = new RecipeService();
