const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const analytics = await analyticsService.getUserDashboardAnalytics(req.user.id);
    
    res.json({
      message: 'Dashboard analytics retrieved successfully',
      analytics
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      error: 'Analytics retrieval failed',
      message: error.message
    });
  }
});

// Get meal planning analytics
router.get('/meal-planning', authenticateToken, async (req, res) => {
  try {
    const analytics = await analyticsService.getMealPlanningAnalytics(req.user.id);
    
    res.json({
      message: 'Meal planning analytics retrieved successfully',
      analytics
    });
  } catch (error) {
    console.error('Meal planning analytics error:', error);
    res.status(500).json({
      error: 'Analytics retrieval failed',
      message: error.message
    });
  }
});

// Get pantry analytics
router.get('/pantry', authenticateToken, async (req, res) => {
  try {
    const analytics = await analyticsService.getPantryAnalytics(req.user.id);
    
    res.json({
      message: 'Pantry analytics retrieved successfully',
      analytics
    });
  } catch (error) {
    console.error('Pantry analytics error:', error);
    res.status(500).json({
      error: 'Analytics retrieval failed',
      message: error.message
    });
  }
});

// Get grocery shopping analytics
router.get('/grocery', authenticateToken, async (req, res) => {
  try {
    const analytics = await analyticsService.getGroceryAnalytics(req.user.id);
    
    res.json({
      message: 'Grocery analytics retrieved successfully',
      analytics
    });
  } catch (error) {
    console.error('Grocery analytics error:', error);
    res.status(500).json({
      error: 'Analytics retrieval failed',
      message: error.message
    });
  }
});

// Get nutrition analytics
router.get('/nutrition', authenticateToken, async (req, res) => {
  try {
    const analytics = await analyticsService.getNutritionAnalytics(req.user.id);
    
    res.json({
      message: 'Nutrition analytics retrieved successfully',
      analytics
    });
  } catch (error) {
    console.error('Nutrition analytics error:', error);
    res.status(500).json({
      error: 'Analytics retrieval failed',
      message: error.message
    });
  }
});

// Get comprehensive user insights
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const [
      dashboardAnalytics,
      mealPlanningAnalytics,
      pantryAnalytics,
      groceryAnalytics,
      nutritionAnalytics
    ] = await Promise.all([
      analyticsService.getUserDashboardAnalytics(req.user.id),
      analyticsService.getMealPlanningAnalytics(req.user.id),
      analyticsService.getPantryAnalytics(req.user.id),
      analyticsService.getGroceryAnalytics(req.user.id),
      analyticsService.getNutritionAnalytics(req.user.id)
    ]);

    const insights = {
      overview: dashboardAnalytics.overview,
      trends: dashboardAnalytics.trends,
      mealPlanning: {
        cuisinePreferences: mealPlanningAnalytics.cuisinePreferences,
        cookingTimePreferences: mealPlanningAnalytics.cookingTimePreferences,
        planningFrequency: mealPlanningAnalytics.planningFrequency
      },
      pantry: {
        utilizationRate: pantryAnalytics.utilizationRate,
        wasteReduction: pantryAnalytics.wasteReduction,
        categoryBreakdown: pantryAnalytics.categoryBreakdown
      },
      grocery: {
        completionRate: groceryAnalytics.completionRate,
        averageItemsPerList: groceryAnalytics.averageItemsPerList,
        categorySpending: groceryAnalytics.categorySpending
      },
      nutrition: {
        healthScore: nutritionAnalytics.healthScore,
        dietaryGoalProgress: nutritionAnalytics.dietaryGoalProgress,
        recommendations: nutritionAnalytics.recommendations
      }
    };

    res.json({
      message: 'User insights retrieved successfully',
      insights
    });
  } catch (error) {
    console.error('User insights error:', error);
    res.status(500).json({
      error: 'Insights retrieval failed',
      message: error.message
    });
  }
});

// Get weekly summary report
router.get('/weekly-summary', authenticateToken, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const summary = {
      period: {
        start: sevenDaysAgo.toISOString(),
        end: new Date().toISOString()
      },
      achievements: [],
      recommendations: [],
      upcomingTasks: []
    };

    // Get recent activity for achievements
    const dashboardAnalytics = await analyticsService.getUserDashboardAnalytics(req.user.id);
    
    if (dashboardAnalytics.trends.mealPlansChange > 0) {
      summary.achievements.push({
        type: 'meal_planning',
        message: `Created ${dashboardAnalytics.trends.mealPlansChange}% more meal plans this week`,
        icon: '📅'
      });
    }

    if (dashboardAnalytics.overview.expiringItemsCount === 0) {
      summary.achievements.push({
        type: 'pantry_management',
        message: 'Great job! No items expiring in your pantry',
        icon: '🎉'
      });
    }

    // Add recommendations based on analytics
    const nutritionAnalytics = await analyticsService.getNutritionAnalytics(req.user.id);
    summary.recommendations = nutritionAnalytics.recommendations.slice(0, 3);

    // Add upcoming tasks
    if (dashboardAnalytics.overview.expiringItemsCount > 0) {
      summary.upcomingTasks.push({
        type: 'pantry_check',
        message: `Check ${dashboardAnalytics.overview.expiringItemsCount} items expiring soon`,
        priority: 'high'
      });
    }

    summary.upcomingTasks.push({
      type: 'meal_planning',
      message: 'Plan meals for next week',
      priority: 'medium'
    });

    res.json({
      message: 'Weekly summary retrieved successfully',
      summary
    });
  } catch (error) {
    console.error('Weekly summary error:', error);
    res.status(500).json({
      error: 'Summary retrieval failed',
      message: error.message
    });
  }
});

// Export analytics data
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const { format = 'json', period = '30' } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const exportData = {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      },
      exportDate: new Date().toISOString(),
      period: `${period} days`,
      analytics: await analyticsService.getUserDashboardAnalytics(req.user.id)
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csv = this.convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="smartmealbuddy-analytics-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      // Return JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="smartmealbuddy-analytics-${Date.now()}.json"`);
      res.json(exportData);
    }
  } catch (error) {
    console.error('Analytics export error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error.message
    });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  const headers = ['Metric', 'Value', 'Date'];
  const rows = [headers.join(',')];

  // Add overview metrics
  const overview = data.analytics.overview;
  rows.push(`Meal Plans,${overview.mealPlansCount},${data.exportDate}`);
  rows.push(`Recipes Used,${overview.recipesUsedCount},${data.exportDate}`);
  rows.push(`Grocery Lists,${overview.groceryListsCount},${data.exportDate}`);
  rows.push(`Pantry Items,${overview.pantryItemsCount},${data.exportDate}`);
  rows.push(`Expiring Items,${overview.expiringItemsCount},${data.exportDate}`);

  return rows.join('\n');
}

module.exports = router;
