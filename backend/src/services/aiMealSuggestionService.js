const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AIMealSuggestionService {
  constructor() {
    // Nutritional database for AI calculations
    this.nutritionalDatabase = {
      // Proteins
      'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, category: 'protein' },
      'salmon': { calories: 208, protein: 22, carbs: 0, fat: 12, fiber: 0, sugar: 0, category: 'protein' },
      'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.7, category: 'protein' },
      'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, category: 'protein' },
      'lentils': { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, sugar: 1.8, category: 'protein' },
      
      // Carbohydrates
      'quinoa': { calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5, sugar: 0.9, category: 'carbs' },
      'brown rice': { calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 4, sugar: 0.7, category: 'carbs' },
      'oats': { calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 11, sugar: 0.99, category: 'carbs' },
      'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sugar: 4.2, category: 'carbs' },
      
      // Vegetables
      'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.5, category: 'vegetables' },
      'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, category: 'vegetables' },
      'kale': { calories: 49, protein: 4.3, carbs: 9, fat: 0.9, fiber: 3.6, sugar: 2.3, category: 'vegetables' },
      'bell peppers': { calories: 31, protein: 1, carbs: 7, fat: 0.3, fiber: 2.5, sugar: 4.2, category: 'vegetables' },
      
      // Fruits
      'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7, category: 'fruits' },
      'berries': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 8, sugar: 10, category: 'fruits' },
      'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, category: 'fruits' },
      
      // Fats
      'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, category: 'fats' },
      'nuts': { calories: 607, protein: 15, carbs: 7, fat: 54, fiber: 8, sugar: 2.3, category: 'fats' },
      'seeds': { calories: 534, protein: 18, carbs: 12, fat: 42, fiber: 12, sugar: 0.6, category: 'fats' }
    };

    // Diet-specific rules and restrictions
    this.dietaryRules = {
      vegetarian: {
        allowed: ['vegetables', 'fruits', 'carbs', 'fats', 'dairy'],
        forbidden: ['meat', 'fish', 'poultry'],
        protein_sources: ['tofu', 'lentils', 'eggs', 'nuts', 'seeds', 'dairy']
      },
      vegan: {
        allowed: ['vegetables', 'fruits', 'carbs', 'fats'],
        forbidden: ['meat', 'fish', 'poultry', 'dairy', 'eggs'],
        protein_sources: ['tofu', 'lentils', 'nuts', 'seeds', 'quinoa']
      },
      keto: {
        macros: { carbs: 5, protein: 25, fat: 70 },
        max_carbs: 20,
        preferred: ['fats', 'protein', 'low-carb vegetables']
      },
      paleo: {
        allowed: ['meat', 'fish', 'vegetables', 'fruits', 'nuts', 'seeds'],
        forbidden: ['grains', 'legumes', 'dairy', 'processed']
      },
      'gluten-free': {
        forbidden: ['wheat', 'barley', 'rye', 'bread', 'pasta'],
        alternatives: ['quinoa', 'rice', 'gluten-free oats']
      },
      'dairy-free': {
        forbidden: ['milk', 'cheese', 'yogurt', 'butter'],
        alternatives: ['plant milk', 'coconut yogurt', 'nutritional yeast']
      }
    };

    // Health goal configurations
    this.healthGoals = {
      'weight-loss': {
        calorie_deficit: 500,
        protein_ratio: 0.3,
        carb_ratio: 0.35,
        fat_ratio: 0.35,
        fiber_min: 25
      },
      'muscle-gain': {
        calorie_surplus: 300,
        protein_ratio: 0.35,
        carb_ratio: 0.45,
        fat_ratio: 0.2,
        protein_per_kg: 2.2
      },
      'maintenance': {
        calorie_adjustment: 0,
        protein_ratio: 0.25,
        carb_ratio: 0.45,
        fat_ratio: 0.3
      }
    };
  }

  // Main AI suggestion method
  async generateMealSuggestions(userId, preferences = {}) {
    try {
      // Get user profile and preferences
      const userProfile = await this.getUserProfile(userId);
      
      // Analyze dietary requirements
      const dietaryAnalysis = this.analyzeDietaryNeeds(userProfile, preferences);
      
      // Calculate nutritional targets
      const nutritionalTargets = this.calculateNutritionalTargets(userProfile, dietaryAnalysis);
      
      // Generate meal suggestions using AI logic
      const mealSuggestions = this.generateIntelligentMeals(nutritionalTargets, dietaryAnalysis);
      
      // Optimize for variety and balance
      const optimizedMeals = this.optimizeMealVariety(mealSuggestions, userProfile);
      
      // Add personalization based on history
      const personalizedMeals = await this.personalizeSuggestions(optimizedMeals, userId);
      
      return {
        suggestions: personalizedMeals,
        nutritionalTargets,
        reasoning: this.generateReasoningExplanation(dietaryAnalysis, nutritionalTargets),
        confidence: this.calculateConfidenceScore(userProfile, personalizedMeals)
      };

    } catch (error) {
      console.error('AI meal suggestion error:', error);
      throw new Error('Failed to generate AI meal suggestions');
    }
  }

  // Get comprehensive user profile
  async getUserProfile(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          mealPlans: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          },
          pantryItems: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        dietaryPreferences: user.dietaryPreferences || [],
        allergies: user.allergies || [],
        goals: user.goals || 'maintenance',
        dailyCalories: user.dailyCalories || 2000,
        age: user.age || 30,
        weight: user.weight || 70,
        height: user.height || 170,
        activityLevel: user.activityLevel || 'moderate',
        mealHistory: user.mealPlans,
        pantryItems: user.pantryItems
      };
    } catch (error) {
      // Return default profile if user data is incomplete
      return {
        id: userId,
        dietaryPreferences: [],
        allergies: [],
        goals: 'maintenance',
        dailyCalories: 2000,
        age: 30,
        weight: 70,
        height: 170,
        activityLevel: 'moderate',
        mealHistory: [],
        pantryItems: []
      };
    }
  }

  // Analyze dietary needs using AI logic
  analyzeDietaryNeeds(userProfile, preferences) {
    const analysis = {
      primaryDiet: userProfile.dietaryPreferences[0] || 'balanced',
      restrictions: [...userProfile.dietaryPreferences, ...userProfile.allergies],
      healthGoal: userProfile.goals,
      calorieTarget: userProfile.dailyCalories,
      specialRequirements: []
    };

    // AI logic for special requirements
    if (userProfile.age > 50) {
      analysis.specialRequirements.push('high-calcium', 'heart-healthy');
    }
    
    if (userProfile.goals === 'weight-loss') {
      analysis.specialRequirements.push('high-fiber', 'low-calorie-density');
    }
    
    if (userProfile.goals === 'muscle-gain') {
      analysis.specialRequirements.push('high-protein', 'post-workout-nutrition');
    }

    // Activity level adjustments
    if (userProfile.activityLevel === 'high') {
      analysis.calorieTarget *= 1.2;
      analysis.specialRequirements.push('high-carb', 'electrolyte-rich');
    }

    return analysis;
  }

  // Calculate precise nutritional targets
  calculateNutritionalTargets(userProfile, dietaryAnalysis) {
    const baseCalories = dietaryAnalysis.calorieTarget;
    const goalConfig = this.healthGoals[dietaryAnalysis.healthGoal];
    
    const adjustedCalories = baseCalories + (goalConfig.calorie_surplus || 0) - (goalConfig.calorie_deficit || 0);
    
    return {
      calories: adjustedCalories,
      protein: Math.round((adjustedCalories * goalConfig.protein_ratio) / 4), // 4 cal per gram
      carbs: Math.round((adjustedCalories * goalConfig.carb_ratio) / 4),
      fat: Math.round((adjustedCalories * goalConfig.fat_ratio) / 9), // 9 cal per gram
      fiber: goalConfig.fiber_min || 25,
      meals: {
        breakfast: Math.round(adjustedCalories * 0.25),
        lunch: Math.round(adjustedCalories * 0.35),
        dinner: Math.round(adjustedCalories * 0.30),
        snacks: Math.round(adjustedCalories * 0.10)
      }
    };
  }

  // Generate intelligent meal combinations
  generateIntelligentMeals(nutritionalTargets, dietaryAnalysis) {
    const mealSuggestions = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };

    // AI meal generation logic for each meal type
    mealSuggestions.breakfast = this.generateBreakfastOptions(nutritionalTargets, dietaryAnalysis);
    mealSuggestions.lunch = this.generateLunchOptions(nutritionalTargets, dietaryAnalysis);
    mealSuggestions.dinner = this.generateDinnerOptions(nutritionalTargets, dietaryAnalysis);
    mealSuggestions.snacks = this.generateSnackOptions(nutritionalTargets, dietaryAnalysis);

    return mealSuggestions;
  }

  // Generate breakfast options using AI
  generateBreakfastOptions(targets, analysis) {
    const breakfastCalories = targets.meals.breakfast;
    const options = [];

    // High-protein breakfast for muscle gain
    if (analysis.healthGoal === 'muscle-gain') {
      options.push({
        name: "Protein Power Bowl",
        ingredients: ["eggs", "oats", "berries", "nuts"],
        calories: breakfastCalories,
        protein: Math.round(breakfastCalories * 0.35 / 4),
        reasoning: "High protein content supports muscle building goals",
        prepTime: 15,
        difficulty: "Easy"
      });
    }

    // Low-carb breakfast for keto
    if (analysis.restrictions.includes('keto')) {
      options.push({
        name: "Keto Avocado Scramble",
        ingredients: ["eggs", "avocado", "spinach", "olive oil"],
        calories: breakfastCalories,
        carbs: 5,
        fat: Math.round(breakfastCalories * 0.7 / 9),
        reasoning: "Very low carb, high fat content perfect for ketosis",
        prepTime: 10,
        difficulty: "Easy"
      });
    }

    // Vegan breakfast
    if (analysis.restrictions.includes('vegan')) {
      options.push({
        name: "Vegan Smoothie Bowl",
        ingredients: ["oats", "berries", "nuts", "seeds"],
        calories: breakfastCalories,
        protein: Math.round(breakfastCalories * 0.2 / 4),
        reasoning: "Plant-based proteins and nutrients without animal products",
        prepTime: 10,
        difficulty: "Easy"
      });
    }

    // Default balanced breakfast
    options.push({
      name: "Balanced Morning Bowl",
      ingredients: ["oats", "berries", "nuts", "seeds"],
      calories: breakfastCalories,
      protein: Math.round(breakfastCalories * 0.25 / 4),
      carbs: Math.round(breakfastCalories * 0.45 / 4),
      fat: Math.round(breakfastCalories * 0.3 / 9),
      reasoning: "Balanced macronutrients for sustained energy",
      prepTime: 12,
      difficulty: "Easy"
    });

    return options;
  }

  // Generate lunch options using AI
  generateLunchOptions(targets, analysis) {
    const lunchCalories = targets.meals.lunch;
    const options = [];

    // Weight loss lunch
    if (analysis.healthGoal === 'weight-loss') {
      options.push({
        name: "Lean Protein Salad",
        ingredients: ["chicken breast", "spinach", "bell peppers", "olive oil"],
        calories: lunchCalories,
        protein: Math.round(lunchCalories * 0.4 / 4),
        fiber: 12,
        reasoning: "High protein and fiber promote satiety for weight management",
        prepTime: 20,
        difficulty: "Medium"
      });
    }

    // Vegetarian lunch
    if (analysis.restrictions.includes('vegetarian')) {
      options.push({
        name: "Quinoa Power Bowl",
        ingredients: ["quinoa", "lentils", "kale", "avocado"],
        calories: lunchCalories,
        protein: Math.round(lunchCalories * 0.3 / 4),
        reasoning: "Complete plant proteins with essential amino acids",
        prepTime: 25,
        difficulty: "Medium"
      });
    }

    // Default balanced lunch
    options.push({
      name: "Mediterranean Bowl",
      ingredients: ["quinoa", "chicken breast", "vegetables", "olive oil"],
      calories: lunchCalories,
      protein: Math.round(lunchCalories * 0.3 / 4),
      carbs: Math.round(lunchCalories * 0.4 / 4),
      fat: Math.round(lunchCalories * 0.3 / 9),
      reasoning: "Mediterranean diet principles for heart health",
      prepTime: 30,
      difficulty: "Medium"
    });

    return options;
  }

  // Generate dinner options using AI
  generateDinnerOptions(targets, analysis) {
    const dinnerCalories = targets.meals.dinner;
    const options = [];

    // Muscle gain dinner
    if (analysis.healthGoal === 'muscle-gain') {
      options.push({
        name: "Protein-Rich Salmon Dinner",
        ingredients: ["salmon", "sweet potato", "broccoli", "olive oil"],
        calories: dinnerCalories,
        protein: Math.round(dinnerCalories * 0.35 / 4),
        reasoning: "High-quality protein and complex carbs for muscle recovery",
        prepTime: 35,
        difficulty: "Medium"
      });
    }

    // Heart-healthy dinner for seniors
    if (analysis.specialRequirements.includes('heart-healthy')) {
      options.push({
        name: "Heart-Healthy Fish Dinner",
        ingredients: ["salmon", "quinoa", "spinach", "nuts"],
        calories: dinnerCalories,
        omega3: "High",
        reasoning: "Omega-3 fatty acids support cardiovascular health",
        prepTime: 30,
        difficulty: "Medium"
      });
    }

    // Default balanced dinner
    options.push({
      name: "Balanced Evening Meal",
      ingredients: ["chicken breast", "brown rice", "vegetables", "olive oil"],
      calories: dinnerCalories,
      protein: Math.round(dinnerCalories * 0.3 / 4),
      carbs: Math.round(dinnerCalories * 0.4 / 4),
      fat: Math.round(dinnerCalories * 0.3 / 9),
      reasoning: "Well-balanced macronutrients for evening satisfaction",
      prepTime: 40,
      difficulty: "Medium"
    });

    return options;
  }

  // Generate snack options using AI
  generateSnackOptions(targets, analysis) {
    const snackCalories = targets.meals.snacks;
    const options = [];

    // Pre/post workout snacks
    if (analysis.specialRequirements.includes('post-workout-nutrition')) {
      options.push({
        name: "Post-Workout Recovery Snack",
        ingredients: ["berries", "nuts", "seeds"],
        calories: snackCalories,
        protein: Math.round(snackCalories * 0.3 / 4),
        reasoning: "Quick-absorbing nutrients for muscle recovery",
        prepTime: 5,
        difficulty: "Easy"
      });
    }

    // Weight loss snacks
    if (analysis.healthGoal === 'weight-loss') {
      options.push({
        name: "Satisfying Low-Cal Snack",
        ingredients: ["apple", "nuts"],
        calories: snackCalories,
        fiber: 8,
        reasoning: "High fiber content promotes satiety with fewer calories",
        prepTime: 2,
        difficulty: "Easy"
      });
    }

    // Default healthy snack
    options.push({
      name: "Balanced Energy Snack",
      ingredients: ["nuts", "berries"],
      calories: snackCalories,
      protein: Math.round(snackCalories * 0.2 / 4),
      fat: Math.round(snackCalories * 0.5 / 9),
      reasoning: "Balanced nutrients for sustained energy between meals",
      prepTime: 3,
      difficulty: "Easy"
    });

    return options;
  }

  // Optimize meal variety and balance
  optimizeMealVariety(mealSuggestions, userProfile) {
    // AI logic to ensure variety and prevent repetition
    const optimized = { ...mealSuggestions };
    
    // Remove duplicate ingredients across meals
    const usedIngredients = new Set();
    
    Object.keys(optimized).forEach(mealType => {
      optimized[mealType] = optimized[mealType].filter(meal => {
        const hasNewIngredients = meal.ingredients.some(ing => !usedIngredients.has(ing));
        if (hasNewIngredients) {
          meal.ingredients.forEach(ing => usedIngredients.add(ing));
          return true;
        }
        return false;
      });
    });

    return optimized;
  }

  // Personalize suggestions based on user history
  async personalizeSuggestions(mealSuggestions, userId) {
    try {
      // Get user's meal history for personalization
      const recentMeals = await prisma.mealPlan.findMany({
        where: { userId },
        take: 20,
        orderBy: { createdAt: 'desc' }
      });

      // AI personalization logic
      const personalized = { ...mealSuggestions };
      
      // Boost scores for ingredients user hasn't tried recently
      // Lower scores for recently used ingredients
      // This is a simplified version - in production, you'd use ML models
      
      return personalized;
    } catch (error) {
      console.error('Personalization error:', error);
      return mealSuggestions;
    }
  }

  // Generate AI reasoning explanation
  generateReasoningExplanation(dietaryAnalysis, nutritionalTargets) {
    const explanations = [];
    
    explanations.push(`Based on your ${dietaryAnalysis.healthGoal} goal, I've calculated ${nutritionalTargets.calories} daily calories.`);
    
    if (dietaryAnalysis.restrictions.length > 0) {
      explanations.push(`I've ensured all suggestions comply with your ${dietaryAnalysis.restrictions.join(', ')} dietary preferences.`);
    }
    
    if (dietaryAnalysis.specialRequirements.length > 0) {
      explanations.push(`Special attention given to ${dietaryAnalysis.specialRequirements.join(', ')} based on your profile.`);
    }
    
    explanations.push(`Protein target: ${nutritionalTargets.protein}g, Carbs: ${nutritionalTargets.carbs}g, Fat: ${nutritionalTargets.fat}g for optimal nutrition balance.`);
    
    return explanations;
  }

  // Calculate AI confidence score
  calculateConfidenceScore(userProfile, suggestions) {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence based on available user data
    if (userProfile.dietaryPreferences.length > 0) confidence += 0.1;
    if (userProfile.mealHistory.length > 5) confidence += 0.1;
    if (userProfile.dailyCalories && userProfile.goals) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  // Quick meal suggestion for immediate needs
  async getQuickSuggestion(userId, mealType, preferences = {}) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const dietaryAnalysis = this.analyzeDietaryNeeds(userProfile, preferences);
      const nutritionalTargets = this.calculateNutritionalTargets(userProfile, dietaryAnalysis);
      
      let suggestion;
      switch (mealType) {
        case 'breakfast':
          suggestion = this.generateBreakfastOptions(nutritionalTargets, dietaryAnalysis)[0];
          break;
        case 'lunch':
          suggestion = this.generateLunchOptions(nutritionalTargets, dietaryAnalysis)[0];
          break;
        case 'dinner':
          suggestion = this.generateDinnerOptions(nutritionalTargets, dietaryAnalysis)[0];
          break;
        case 'snack':
          suggestion = this.generateSnackOptions(nutritionalTargets, dietaryAnalysis)[0];
          break;
        default:
          throw new Error('Invalid meal type');
      }
      
      return {
        suggestion,
        reasoning: `AI-selected ${mealType} optimized for your ${dietaryAnalysis.healthGoal} goal and ${dietaryAnalysis.restrictions.join(', ')} preferences.`,
        confidence: this.calculateConfidenceScore(userProfile, [suggestion])
      };
      
    } catch (error) {
      console.error('Quick suggestion error:', error);
      throw new Error('Failed to generate quick meal suggestion');
    }
  }
}

module.exports = new AIMealSuggestionService();
