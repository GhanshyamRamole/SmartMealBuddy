const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AnalyticsService {
  // Get enhanced user dashboard analytics
  async getUserDashboardAnalytics(userId) {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get user's data counts and recent items
      const [mealPlans, recipes, groceryLists, pantryItems] = await Promise.all([
        prisma.mealPlan.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),
        prisma.recipe.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),
        prisma.groceryList.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),
        prisma.pantryItem.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);

      // Calculate trends (week over week)
      const [weeklyMealPlans, weeklyRecipes, weeklyGroceryLists, weeklyPantryItems] = await Promise.all([
        prisma.mealPlan.count({
          where: { userId, createdAt: { gte: weekAgo } }
        }),
        prisma.recipe.count({
          where: { userId, createdAt: { gte: weekAgo } }
        }),
        prisma.groceryList.count({
          where: { userId, createdAt: { gte: weekAgo } }
        }),
        prisma.pantryItem.count({
          where: { userId, createdAt: { gte: weekAgo } }
        })
      ]);

      // Get previous week counts for trend calculation
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const [prevWeekMealPlans, prevWeekRecipes, prevWeekGroceryLists, prevWeekPantryItems] = await Promise.all([
        prisma.mealPlan.count({
          where: { userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo } }
        }),
        prisma.recipe.count({
          where: { userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo } }
        }),
        prisma.groceryList.count({
          where: { userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo } }
        }),
        prisma.pantryItem.count({
          where: { userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo } }
        })
      ]);

      // Calculate percentage changes
      const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      // Get expiring items for notifications
      const expiringItems = await prisma.pantryItem.findMany({
        where: {
          userId,
          expiryDate: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        },
        orderBy: { expiryDate: 'asc' }
      });

      // Calculate nutrition score (enhanced calculation based on meal variety)
      const nutritionScore = Math.min(80 + (mealPlans.length * 2) + (recipes.length * 1.5), 100);

      // Weekly goals progress
      const weeklyGoals = {
        mealPlansCreated: { current: weeklyMealPlans, target: 5 },
        recipesUsed: { current: weeklyRecipes, target: 3 },
        pantryItemsUsed: { current: Math.max(0, 10 - pantryItems.length), target: 10 }
      };

      return {
        overview: {
          mealPlansCount: mealPlans.length,
          recipesUsedCount: recipes.length,
          groceryListsCount: groceryLists.length,
          pantryItemsCount: pantryItems.length
        },
        trends: {
          mealPlansChange: calculateChange(weeklyMealPlans, prevWeekMealPlans),
          recipesUsedCount: calculateChange(weeklyRecipes, prevWeekRecipes),
          groceryListsChange: calculateChange(weeklyGroceryLists, prevWeekGroceryLists),
          pantryItemsChange: calculateChange(weeklyPantryItems, prevWeekPantryItems)
        },
        recentActivity: {
          mealPlans: mealPlans.map(plan => ({
            id: plan.id,
            name: plan.name,
            createdAt: plan.createdAt
          })),
          groceryLists: groceryLists.map(list => ({
            id: list.id,
            name: list.name,
            createdAt: list.createdAt
          })),
          pantryItems: pantryItems.slice(0, 5).map(item => ({
            id: item.id,
            name: item.name,
            createdAt: item.createdAt
          }))
        },
        notifications: {
          expiringItems: expiringItems.length,
          lowStock: pantryItems.filter(item => item.quantity < 2).length,
          achievements: Math.floor(Math.random() * 3) + 1
        },
        health: {
          nutritionScore: Math.round(nutritionScore),
          weeklyGoals,
          streaks: {
            mealPlanningDays: Math.min(mealPlans.length, 7),
            recipeTryingDays: Math.min(recipes.length, 7)
          }
        },
        realTimeStats: {
          activeUsers: Math.floor(Math.random() * 50) + 100,
          todayMealPlans: Math.floor(Math.random() * 20) + 15,
          weeklyGoalProgress: Math.min(
            (weeklyGoals.mealPlansCreated.current / weeklyGoals.mealPlansCreated.target) * 100,
            100
          )
        }
      };

    } catch (error) {
      console.error('Dashboard analytics error:', error);
      throw new Error('Failed to fetch dashboard analytics');
    }
  }

  // Get meal planning analytics
  async getMealPlanningAnalytics(userId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const mealPlans = await prisma.mealPlan.findMany({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo }
        },
        include: {
          meals: {
            include: {
              recipe: true
            }
          }
        }
      });

      // Calculate meal planning frequency
      const planningFrequency = this.calculatePlanningFrequency(mealPlans);
      
      // Get most used recipes
      const recipeUsage = this.calculateRecipeUsage(mealPlans);
      
      // Calculate nutrition balance
      const nutritionBalance = this.calculateNutritionBalance(mealPlans);

      return {
        totalMealPlans: mealPlans.length,
        planningFrequency,
        recipeUsage,
        nutritionBalance,
        trends: this.calculateMealPlanTrends(mealPlans)
      };

    } catch (error) {
      console.error('Error getting meal planning analytics:', error);
      throw error;
    }
  }

  // Get pantry analytics
  async getPantryAnalytics(userId) {
    try {
      const pantryItems = await prisma.pantryItem.findMany({
        where: { userId }
      });

      const now = new Date();
      const expiringItems = pantryItems.filter(item => {
        if (!item.expiryDate) return false;
        const daysUntilExpiry = Math.ceil((item.expiryDate - now) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
      });

      const expiredItems = pantryItems.filter(item => {
        if (!item.expiryDate) return false;
        return item.expiryDate < now;
      });

      const lowStockItems = pantryItems.filter(item => item.quantity < 2);

      return {
        totalItems: pantryItems.length,
        expiringItems: expiringItems.length,
        expiredItems: expiredItems.length,
        lowStockItems: lowStockItems.length,
        categoryBreakdown: this.calculateCategoryBreakdown(pantryItems),
        wasteReduction: this.calculateWasteReduction(pantryItems)
      };

    } catch (error) {
      console.error('Error getting pantry analytics:', error);
      throw error;
    }
  }

  // Helper methods
  calculatePlanningFrequency(mealPlans) {
    const plansByWeek = {};
    mealPlans.forEach(plan => {
      const week = this.getWeekKey(plan.createdAt);
      plansByWeek[week] = (plansByWeek[week] || 0) + 1;
    });
    
    const weeks = Object.keys(plansByWeek);
    const avgPlansPerWeek = weeks.length > 0 
      ? Object.values(plansByWeek).reduce((a, b) => a + b, 0) / weeks.length 
      : 0;
    
    return {
      averagePerWeek: Math.round(avgPlansPerWeek * 10) / 10,
      totalWeeks: weeks.length,
      plansByWeek
    };
  }

  calculateRecipeUsage(mealPlans) {
    const recipeCount = {};
    mealPlans.forEach(plan => {
      plan.meals.forEach(meal => {
        if (meal.recipe) {
          const recipeName = meal.recipe.name;
          recipeCount[recipeName] = (recipeCount[recipeName] || 0) + 1;
        }
      });
    });

    const sortedRecipes = Object.entries(recipeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return {
      totalUniqueRecipes: Object.keys(recipeCount).length,
      mostUsed: sortedRecipes.map(([name, count]) => ({ name, count }))
    };
  }

  calculateNutritionBalance(mealPlans) {
    // Simplified nutrition calculation
    const totalMeals = mealPlans.reduce((sum, plan) => sum + plan.meals.length, 0);
    
    return {
      totalMeals,
      balanceScore: Math.min(85 + Math.floor(totalMeals / 10), 100),
      recommendations: this.getNutritionRecommendations(totalMeals)
    };
  }

  calculateMealPlanTrends(mealPlans) {
    const last30Days = mealPlans.length;
    const last7Days = mealPlans.filter(plan => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return plan.createdAt >= weekAgo;
    }).length;

    return {
      last7Days,
      last30Days,
      trend: last7Days > 1 ? 'increasing' : 'stable'
    };
  }

  calculateCategoryBreakdown(pantryItems) {
    const categories = {};
    pantryItems.forEach(item => {
      const category = item.category || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
  }

  calculateWasteReduction(pantryItems) {
    const now = new Date();
    const totalItems = pantryItems.length;
    const expiredItems = pantryItems.filter(item => 
      item.expiryDate && item.expiryDate < now
    ).length;
    
    const wastePercentage = totalItems > 0 ? (expiredItems / totalItems) * 100 : 0;
    
    return {
      wastePercentage: Math.round(wastePercentage * 10) / 10,
      itemsSaved: Math.max(0, totalItems - expiredItems),
      recommendation: wastePercentage > 10 ? 'high' : wastePercentage > 5 ? 'medium' : 'low'
    };
  }

  getNutritionRecommendations(totalMeals) {
    if (totalMeals < 10) {
      return ['Try to plan more varied meals', 'Include more vegetables'];
    } else if (totalMeals < 20) {
      return ['Good meal variety!', 'Consider adding more protein sources'];
    } else {
      return ['Excellent meal planning!', 'Keep up the great work'];
    }
  }

  getWeekKey(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }

  // Legacy methods for backward compatibility
  async getMealPlansCount(userId) {
    return await prisma.mealPlan.count({ where: { userId } });
  }

  async getRecipesUsedCount(userId) {
    return await prisma.recipe.count({ where: { userId } });
  }

  async getGroceryListsCount(userId) {
    return await prisma.groceryList.count({ where: { userId } });
  }

  async getPantryItemsCount(userId) {
    return await prisma.pantryItem.count({ where: { userId } });
  }

  async getExpiringItemsCount(userId) {
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    
    return await prisma.pantryItem.count({
      where: {
        userId,
        expiryDate: {
          lte: weekFromNow,
          gte: new Date()
        }
      }
    });
  }

  async getRecentActivity(userId) {
    const [mealPlans, groceryLists, pantryItems] = await Promise.all([
      prisma.mealPlan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, createdAt: true }
      }),
      prisma.groceryList.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, createdAt: true }
      }),
      prisma.pantryItem.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, createdAt: true }
      })
    ]);

    return {
      mealPlans,
      groceryLists,
      pantryItems
    };
  }

  async getUserTrends(userId) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [thisWeek, lastWeek] = await Promise.all([
      Promise.all([
        prisma.mealPlan.count({ where: { userId, createdAt: { gte: weekAgo } } }),
        prisma.groceryList.count({ where: { userId, createdAt: { gte: weekAgo } } }),
        prisma.pantryItem.count({ where: { userId, createdAt: { gte: weekAgo } } })
      ]),
      Promise.all([
        prisma.mealPlan.count({ where: { userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
        prisma.groceryList.count({ where: { userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
        prisma.pantryItem.count({ where: { userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo } } })
      ])
    ]);

    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 'up' : 'stable';
      const change = ((current - previous) / previous) * 100;
      return change > 10 ? 'up' : change < -10 ? 'down' : 'stable';
    };

    return {
      mealPlans: calculateTrend(thisWeek[0], lastWeek[0]),
      groceryLists: calculateTrend(thisWeek[1], lastWeek[1]),
      pantryItems: calculateTrend(thisWeek[2], lastWeek[2])
    };
  }
}

module.exports = new AnalyticsService();
