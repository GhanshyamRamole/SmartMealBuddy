const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const aiMealSuggestionService = require('../services/aiMealSuggestionService');

const router = express.Router();

// Get comprehensive AI meal suggestions
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferences = {
      mealType: req.query.mealType,
      timeOfDay: req.query.timeOfDay,
      cookingTime: req.query.cookingTime ? parseInt(req.query.cookingTime) : null,
      difficulty: req.query.difficulty,
      cuisine: req.query.cuisine
    };

    const suggestions = await aiMealSuggestionService.generateMealSuggestions(userId, preferences);

    res.json({
      message: 'AI meal suggestions generated successfully',
      suggestions: suggestions.suggestions,
      nutritionalTargets: suggestions.nutritionalTargets,
      reasoning: suggestions.reasoning,
      confidence: suggestions.confidence,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI meal suggestions error:', error);
    res.status(500).json({
      error: 'Failed to generate AI meal suggestions',
      message: error.message
    });
  }
});

// Get quick AI suggestion for specific meal
router.get('/quick/:mealType', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { mealType } = req.params;
    
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMealTypes.includes(mealType)) {
      return res.status(400).json({
        error: 'Invalid meal type',
        message: 'Meal type must be one of: breakfast, lunch, dinner, snack'
      });
    }

    const preferences = {
      urgency: req.query.urgency || 'normal',
      cookingTime: req.query.cookingTime ? parseInt(req.query.cookingTime) : null,
      ingredients: req.query.ingredients ? req.query.ingredients.split(',') : []
    };

    const suggestion = await aiMealSuggestionService.getQuickSuggestion(userId, mealType, preferences);

    res.json({
      message: `Quick ${mealType} suggestion generated successfully`,
      suggestion: suggestion.suggestion,
      reasoning: suggestion.reasoning,
      confidence: suggestion.confidence,
      mealType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quick AI suggestion error:', error);
    res.status(500).json({
      error: 'Failed to generate quick AI suggestion',
      message: error.message
    });
  }
});

// Get AI suggestions based on pantry items
router.get('/pantry-based', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // This would analyze user's pantry and suggest meals
    const suggestions = await aiMealSuggestionService.generatePantryBasedSuggestions(userId);

    res.json({
      message: 'Pantry-based AI suggestions generated successfully',
      suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Pantry-based suggestions error:', error);
    res.status(500).json({
      error: 'Failed to generate pantry-based suggestions',
      message: error.message
    });
  }
});

// Get AI suggestions for specific dietary goal
router.get('/goal-based/:goal', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goal } = req.params;
    
    const validGoals = ['weight-loss', 'muscle-gain', 'maintenance', 'heart-health', 'diabetes-friendly'];
    if (!validGoals.includes(goal)) {
      return res.status(400).json({
        error: 'Invalid goal',
        message: `Goal must be one of: ${validGoals.join(', ')}`
      });
    }

    const preferences = { healthGoal: goal };
    const suggestions = await aiMealSuggestionService.generateMealSuggestions(userId, preferences);

    res.json({
      message: `AI suggestions for ${goal} generated successfully`,
      suggestions: suggestions.suggestions,
      nutritionalTargets: suggestions.nutritionalTargets,
      reasoning: suggestions.reasoning,
      goal,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Goal-based suggestions error:', error);
    res.status(500).json({
      error: 'Failed to generate goal-based suggestions',
      message: error.message
    });
  }
});

// Get AI meal plan for entire day
router.get('/daily-plan', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const date = req.query.date || new Date().toISOString().split('T')[0];
    
    const preferences = {
      date,
      includeSnacks: req.query.includeSnacks === 'true',
      cookingTimeLimit: req.query.cookingTimeLimit ? parseInt(req.query.cookingTimeLimit) : null
    };

    // Generate suggestions for all meals of the day
    const [breakfast, lunch, dinner, snacks] = await Promise.all([
      aiMealSuggestionService.getQuickSuggestion(userId, 'breakfast', preferences),
      aiMealSuggestionService.getQuickSuggestion(userId, 'lunch', preferences),
      aiMealSuggestionService.getQuickSuggestion(userId, 'dinner', preferences),
      preferences.includeSnacks ? aiMealSuggestionService.getQuickSuggestion(userId, 'snack', preferences) : null
    ]);

    const dailyPlan = {
      date,
      meals: {
        breakfast: breakfast.suggestion,
        lunch: lunch.suggestion,
        dinner: dinner.suggestion,
        ...(snacks && { snacks: snacks.suggestion })
      },
      totalCalories: (breakfast.suggestion.calories || 0) + 
                    (lunch.suggestion.calories || 0) + 
                    (dinner.suggestion.calories || 0) + 
                    (snacks?.suggestion.calories || 0),
      reasoning: [breakfast.reasoning, lunch.reasoning, dinner.reasoning].filter(Boolean)
    };

    res.json({
      message: 'Daily AI meal plan generated successfully',
      dailyPlan,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Daily plan error:', error);
    res.status(500).json({
      error: 'Failed to generate daily AI meal plan',
      message: error.message
    });
  }
});

// Get AI nutritional analysis and recommendations
router.get('/nutritional-analysis', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userProfile = await aiMealSuggestionService.getUserProfile(userId);
    const dietaryAnalysis = aiMealSuggestionService.analyzeDietaryNeeds(userProfile);
    const nutritionalTargets = aiMealSuggestionService.calculateNutritionalTargets(userProfile, dietaryAnalysis);

    const analysis = {
      userProfile: {
        goals: userProfile.goals,
        dietaryPreferences: userProfile.dietaryPreferences,
        dailyCalories: userProfile.dailyCalories
      },
      nutritionalTargets,
      recommendations: aiMealSuggestionService.generateReasoningExplanation(dietaryAnalysis, nutritionalTargets),
      healthInsights: [
        `Your current calorie target of ${nutritionalTargets.calories} calories aligns with your ${userProfile.goals} goal.`,
        `Recommended protein intake: ${nutritionalTargets.protein}g per day for optimal results.`,
        `Focus on ${dietaryAnalysis.specialRequirements.join(', ')} foods based on your profile.`
      ]
    };

    res.json({
      message: 'Nutritional analysis completed successfully',
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Nutritional analysis error:', error);
    res.status(500).json({
      error: 'Failed to generate nutritional analysis',
      message: error.message
    });
  }
});

// Save user feedback on AI suggestions
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { suggestionId, rating, feedback, mealType } = req.body;

    // In a real AI system, this feedback would be used to improve recommendations
    // For now, we'll just acknowledge the feedback
    
    const feedbackData = {
      userId,
      suggestionId,
      rating: parseInt(rating),
      feedback,
      mealType,
      timestamp: new Date().toISOString()
    };

    // Here you would typically save to a feedback table and use for ML training
    console.log('AI Suggestion Feedback:', feedbackData);

    res.json({
      message: 'Feedback received successfully',
      message_detail: 'Your feedback helps improve our AI recommendations',
      feedbackId: `feedback_${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      error: 'Failed to save feedback',
      message: error.message
    });
  }
});

module.exports = router;
