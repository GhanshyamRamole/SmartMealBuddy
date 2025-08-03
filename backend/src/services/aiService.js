const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openaiBaseUrl = 'https://api.openai.com/v1';
  }

  // Generate meal plan suggestions using AI
  async generateMealPlanSuggestions(userPreferences) {
    try {
      const {
        dietaryPreferences = [],
        allergies = [],
        goals = 'maintenance',
        dailyCalories = 2000,
        cookingTime = 'moderate',
        cuisinePreferences = []
      } = userPreferences;

      const prompt = this.buildMealPlanPrompt({
        dietaryPreferences,
        allergies,
        goals,
        dailyCalories,
        cookingTime,
        cuisinePreferences
      });

      if (!this.openaiApiKey) {
        // Fallback to rule-based suggestions if no OpenAI key
        return this.generateRuleBasedSuggestions(userPreferences);
      }

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional nutritionist and meal planning expert. Provide practical, healthy meal suggestions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const suggestions = this.parseMealPlanResponse(response.data.choices[0].message.content);
      return suggestions;

    } catch (error) {
      console.error('AI meal plan generation error:', error);
      // Fallback to rule-based suggestions
      return this.generateRuleBasedSuggestions(userPreferences);
    }
  }

  // Generate recipe suggestions based on pantry items
  async generatePantryBasedSuggestions(pantryItems, userPreferences = {}) {
    try {
      const ingredientList = pantryItems.map(item => item.name).join(', ');
      
      const prompt = `Given these pantry ingredients: ${ingredientList}
      
User preferences:
- Dietary restrictions: ${userPreferences.dietaryPreferences?.join(', ') || 'None'}
- Allergies: ${userPreferences.allergies?.join(', ') || 'None'}
- Cooking time preference: ${userPreferences.maxCookingTime || 30} minutes

Suggest 3 practical recipes that can be made primarily with these ingredients. For each recipe, provide:
1. Recipe name
2. Main ingredients needed (from pantry)
3. Additional ingredients to buy (if any)
4. Estimated cooking time
5. Brief cooking method

Format as JSON array.`;

      if (!this.openaiApiKey) {
        return this.generateRuleBasedPantrySuggestions(pantryItems);
      }

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a creative chef who specializes in making delicious meals from available ingredients.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.8
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.parsePantryRecipeResponse(response.data.choices[0].message.content);

    } catch (error) {
      console.error('AI pantry suggestions error:', error);
      return this.generateRuleBasedPantrySuggestions(pantryItems);
    }
  }

  // Generate shopping optimization suggestions
  async optimizeGroceryList(groceryItems, userLocation = null) {
    try {
      const suggestions = {
        costSavings: [],
        seasonalAlternatives: [],
        bulkBuyRecommendations: [],
        storeRecommendations: []
      };

      // Analyze items for cost optimization
      const expensiveItems = groceryItems.filter(item => 
        this.isExpensiveItem(item.name)
      );

      for (const item of expensiveItems) {
        const alternatives = this.findCostEffectiveAlternatives(item);
        if (alternatives.length > 0) {
          suggestions.costSavings.push({
            original: item,
            alternatives: alternatives
          });
        }
      }

      // Seasonal recommendations
      const currentSeason = this.getCurrentSeason();
      const seasonalItems = this.getSeasonalAlternatives(groceryItems, currentSeason);
      suggestions.seasonalAlternatives = seasonalItems;

      // Bulk buy recommendations
      const bulkItems = groceryItems.filter(item => 
        this.isBulkBuyCandidate(item)
      );
      suggestions.bulkBuyRecommendations = bulkItems;

      return suggestions;

    } catch (error) {
      console.error('Grocery optimization error:', error);
      return { costSavings: [], seasonalAlternatives: [], bulkBuyRecommendations: [] };
    }
  }

  // Build meal plan prompt for AI
  buildMealPlanPrompt(preferences) {
    return `Create a 7-day meal plan with the following requirements:

Dietary Preferences: ${preferences.dietaryPreferences.join(', ') || 'None'}
Allergies to avoid: ${preferences.allergies.join(', ') || 'None'}
Health Goal: ${preferences.goals}
Daily Calorie Target: ${preferences.dailyCalories} calories
Cooking Time Preference: ${preferences.cookingTime}
Cuisine Preferences: ${preferences.cuisinePreferences.join(', ') || 'Any'}

For each day, provide:
- Breakfast (300-400 calories)
- Lunch (400-500 calories)  
- Dinner (500-600 calories)
- Snack (100-200 calories)

Include variety, balanced nutrition, and practical recipes. Format as structured text.`;
  }

  // Parse AI meal plan response
  parseMealPlanResponse(response) {
    // Simple parsing - in production, you'd want more robust parsing
    const days = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    let currentDay = null;
    let currentMeal = null;

    for (const line of lines) {
      if (line.includes('Day') || line.includes('day')) {
        if (currentDay) days.push(currentDay);
        currentDay = { day: days.length + 1, meals: {} };
      } else if (line.includes('Breakfast') || line.includes('breakfast')) {
        currentMeal = 'breakfast';
      } else if (line.includes('Lunch') || line.includes('lunch')) {
        currentMeal = 'lunch';
      } else if (line.includes('Dinner') || line.includes('dinner')) {
        currentMeal = 'dinner';
      } else if (line.includes('Snack') || line.includes('snack')) {
        currentMeal = 'snack';
      } else if (currentDay && currentMeal && line.trim()) {
        currentDay.meals[currentMeal] = line.trim();
      }
    }

    if (currentDay) days.push(currentDay);
    return days;
  }

  // Rule-based fallback for meal suggestions
  generateRuleBasedSuggestions(preferences) {
    const { dietaryPreferences = [], goals = 'maintenance' } = preferences;
    
    const mealTemplates = {
      breakfast: ['Oatmeal with fruits', 'Greek yogurt parfait', 'Avocado toast', 'Smoothie bowl'],
      lunch: ['Quinoa salad', 'Grilled chicken wrap', 'Vegetable soup', 'Buddha bowl'],
      dinner: ['Grilled salmon', 'Stir-fry vegetables', 'Lentil curry', 'Pasta primavera'],
      snack: ['Mixed nuts', 'Apple slices', 'Hummus with veggies', 'Greek yogurt']
    };

    // Filter based on dietary preferences
    if (dietaryPreferences.includes('vegetarian')) {
      mealTemplates.lunch = mealTemplates.lunch.filter(meal => 
        !meal.toLowerCase().includes('chicken')
      );
      mealTemplates.dinner = mealTemplates.dinner.filter(meal => 
        !meal.toLowerCase().includes('salmon')
      );
    }

    const suggestions = [];
    for (let day = 1; day <= 7; day++) {
      suggestions.push({
        day,
        meals: {
          breakfast: this.getRandomItem(mealTemplates.breakfast),
          lunch: this.getRandomItem(mealTemplates.lunch),
          dinner: this.getRandomItem(mealTemplates.dinner),
          snack: this.getRandomItem(mealTemplates.snack)
        }
      });
    }

    return suggestions;
  }

  // Rule-based pantry suggestions
  generateRuleBasedPantrySuggestions(pantryItems) {
    const suggestions = [];
    const ingredients = pantryItems.map(item => item.name.toLowerCase());

    // Simple recipe matching logic
    if (ingredients.includes('rice') && ingredients.includes('vegetables')) {
      suggestions.push({
        name: 'Vegetable Fried Rice',
        mainIngredients: ['rice', 'vegetables'],
        additionalIngredients: ['soy sauce', 'oil'],
        cookingTime: 20,
        method: 'Stir-fry rice with vegetables and seasonings'
      });
    }

    if (ingredients.includes('pasta') && ingredients.includes('tomatoes')) {
      suggestions.push({
        name: 'Pasta Marinara',
        mainIngredients: ['pasta', 'tomatoes'],
        additionalIngredients: ['garlic', 'herbs'],
        cookingTime: 25,
        method: 'Cook pasta and toss with tomato sauce'
      });
    }

    if (ingredients.includes('eggs') && ingredients.includes('cheese')) {
      suggestions.push({
        name: 'Cheese Omelet',
        mainIngredients: ['eggs', 'cheese'],
        additionalIngredients: ['butter', 'herbs'],
        cookingTime: 10,
        method: 'Beat eggs, cook in pan, add cheese and fold'
      });
    }

    return suggestions.slice(0, 3);
  }

  // Helper methods
  isExpensiveItem(itemName) {
    const expensiveItems = ['salmon', 'beef', 'lamb', 'organic', 'premium'];
    return expensiveItems.some(expensive => 
      itemName.toLowerCase().includes(expensive)
    );
  }

  findCostEffectiveAlternatives(item) {
    const alternatives = {
      'salmon': ['mackerel', 'sardines', 'tuna'],
      'beef': ['chicken', 'turkey', 'pork'],
      'organic': ['conventional'],
      'premium': ['regular', 'store brand']
    };

    for (const [expensive, cheaper] of Object.entries(alternatives)) {
      if (item.name.toLowerCase().includes(expensive)) {
        return cheaper.map(alt => ({
          name: item.name.replace(expensive, alt),
          estimatedSavings: '20-30%'
        }));
      }
    }

    return [];
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  getSeasonalAlternatives(groceryItems, season) {
    const seasonalProduce = {
      spring: ['asparagus', 'peas', 'strawberries', 'spinach'],
      summer: ['tomatoes', 'corn', 'berries', 'zucchini'],
      fall: ['pumpkin', 'apples', 'squash', 'brussels sprouts'],
      winter: ['citrus', 'root vegetables', 'cabbage', 'kale']
    };

    return seasonalProduce[season] || [];
  }

  isBulkBuyCandidate(item) {
    const bulkItems = ['rice', 'pasta', 'beans', 'oats', 'flour', 'oil'];
    return bulkItems.some(bulk => 
      item.name.toLowerCase().includes(bulk)
    );
  }

  parsePantryRecipeResponse(response) {
    try {
      // Try to parse as JSON first
      return JSON.parse(response);
    } catch {
      // Fallback to text parsing
      return this.parseTextRecipeResponse(response);
    }
  }

  parseTextRecipeResponse(response) {
    // Simple text parsing for recipe suggestions
    const recipes = [];
    const sections = response.split(/\d+\./).filter(section => section.trim());

    for (const section of sections.slice(0, 3)) {
      const lines = section.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        recipes.push({
          name: lines[0].trim(),
          description: lines.slice(1).join(' ').trim(),
          cookingTime: 30,
          difficulty: 'Medium'
        });
      }
    }

    return recipes;
  }

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

module.exports = new AIService();
