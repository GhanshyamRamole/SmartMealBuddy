const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AnalyticsService {
  // Get user dashboard analytics
  async getUserDashboardAnalytics(userId) {
    try {
      const [
        mealPlansCount,
        recipesUsedCount,
        groceryListsCount,
        pantryItemsCount,
        expiringItemsCount,
        recentActivity
      ] = await Promise.all([
        this.getMealPlansCount(userId),
        this.getRecipesUsedCount(userId),
        this.getGroceryListsCount(userId),
        this.getPantryItemsCount(userId),
        this.getExpiringItemsCount(userId),
        this.getRecentActivity(userId)
      ]);

      return {
        overview: {
          mealPlansCount,
          recipesUsedCount,
          groceryListsCount,
          pantryItemsCount,
          expiringItemsCount
        },
        recentActivity,
        trends: await this.getUserTrends(userId)
      };

    } catch (error) {
      console.error('Error getting user dashboard analytics:', error);
      throw error;
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
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        include: {
          recipes: {
            include: {
              recipe: {
                select: {
                  cuisines: true,
                  diets: true,
                  readyInMinutes: true
                }
              }
            }
          }
        }
      });

      const analytics = {
        totalMealPlans: mealPlans.length,
        averagePlanDuration: this.calculateAveragePlanDuration(mealPlans),
        cuisinePreferences: this.analyzeCuisinePreferences(mealPlans),
        dietaryPatterns: this.analyzeDietaryPatterns(mealPlans),
        cookingTimePreferences: this.analyzeCookingTimePreferences(mealPlans),
        mealTypeDistribution: this.analyzeMealTypeDistribution(mealPlans),
        planningFrequency: this.analyzePlanningFrequency(mealPlans)
      };

      return analytics;

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

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentlyAddedItems = pantryItems.filter(item => 
        new Date(item.createdAt) >= thirtyDaysAgo
      );

      const analytics = {
        totalItems: pantryItems.length,
        categoryBreakdown: this.analyzePantryCategories(pantryItems),
        expiryAnalysis: this.analyzeExpiryPatterns(pantryItems),
        utilizationRate: await this.calculatePantryUtilizationRate(userId),
        wasteReduction: this.calculateWasteReduction(pantryItems),
        restockingPatterns: this.analyzeRestockingPatterns(recentlyAddedItems),
        seasonalTrends: this.analyzeSeasonalPantryTrends(pantryItems)
      };

      return analytics;

    } catch (error) {
      console.error('Error getting pantry analytics:', error);
      throw error;
    }
  }

  // Get grocery shopping analytics
  async getGroceryAnalytics(userId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const groceryLists = await prisma.groceryList.findMany({
        where: {
          userId,
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      });

      const analytics = {
        totalLists: groceryLists.length,
        averageItemsPerList: this.calculateAverageItemsPerList(groceryLists),
        completionRate: this.calculateCompletionRate(groceryLists),
        categorySpending: this.analyzeCategorySpending(groceryLists),
        shoppingFrequency: this.analyzeShoppingFrequency(groceryLists),
        budgetTrends: this.analyzeBudgetTrends(groceryLists),
        seasonalPurchases: this.analyzeSeasonalPurchases(groceryLists)
      };

      return analytics;

    } catch (error) {
      console.error('Error getting grocery analytics:', error);
      throw error;
    }
  }

  // Get nutrition analytics
  async getNutritionAnalytics(userId) {
    try {
      const recentMealPlans = await prisma.mealPlan.findMany({
        where: { userId },
        include: {
          recipes: {
            include: {
              recipe: {
                select: {
                  nutrition: true,
                  servings: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      const nutritionData = this.extractNutritionData(recentMealPlans);

      const analytics = {
        averageDailyCalories: nutritionData.averageCalories,
        macronutrientBreakdown: nutritionData.macros,
        nutritionTrends: nutritionData.trends,
        dietaryGoalProgress: await this.analyzeDietaryGoalProgress(userId, nutritionData),
        healthScore: this.calculateHealthScore(nutritionData),
        recommendations: this.generateNutritionRecommendations(nutritionData)
      };

      return analytics;

    } catch (error) {
      console.error('Error getting nutrition analytics:', error);
      throw error;
    }
  }

  // Helper methods for calculations

  async getMealPlansCount(userId) {
    return await prisma.mealPlan.count({ where: { userId } });
  }

  async getRecipesUsedCount(userId) {
    const mealPlanRecipes = await prisma.mealPlanRecipe.findMany({
      where: {
        mealPlan: { userId }
      },
      distinct: ['recipeId']
    });
    return mealPlanRecipes.length;
  }

  async getGroceryListsCount(userId) {
    return await prisma.groceryList.count({ where: { userId } });
  }

  async getPantryItemsCount(userId) {
    return await prisma.pantryItem.count({ where: { userId } });
  }

  async getExpiringItemsCount(userId) {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return await prisma.pantryItem.count({
      where: {
        userId,
        expiryDate: {
          lte: sevenDaysFromNow,
          gte: new Date()
        }
      }
    });
  }

  async getRecentActivity(userId) {
    const [recentMealPlans, recentGroceryLists, recentPantryItems] = await Promise.all([
      prisma.mealPlan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          name: true,
          createdAt: true
        }
      }),
      prisma.groceryList.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          name: true,
          createdAt: true
        }
      }),
      prisma.pantryItem.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          createdAt: true
        }
      })
    ]);

    return {
      mealPlans: recentMealPlans,
      groceryLists: recentGroceryLists,
      pantryItems: recentPantryItems
    };
  }

  async getUserTrends(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [currentPeriod, previousPeriod] = await Promise.all([
      this.getPeriodStats(userId, thirtyDaysAgo, new Date()),
      this.getPeriodStats(userId, new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000), thirtyDaysAgo)
    ]);

    return {
      mealPlansChange: this.calculatePercentageChange(previousPeriod.mealPlans, currentPeriod.mealPlans),
      groceryListsChange: this.calculatePercentageChange(previousPeriod.groceryLists, currentPeriod.groceryLists),
      pantryItemsChange: this.calculatePercentageChange(previousPeriod.pantryItems, currentPeriod.pantryItems)
    };
  }

  async getPeriodStats(userId, startDate, endDate) {
    const [mealPlans, groceryLists, pantryItems] = await Promise.all([
      prisma.mealPlan.count({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.groceryList.count({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.pantryItem.count({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    return { mealPlans, groceryLists, pantryItems };
  }

  calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return Math.round(((newValue - oldValue) / oldValue) * 100);
  }

  calculateAveragePlanDuration(mealPlans) {
    if (mealPlans.length === 0) return 0;
    
    const totalDays = mealPlans.reduce((sum, plan) => {
      const duration = Math.ceil((new Date(plan.endDate) - new Date(plan.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      return sum + duration;
    }, 0);

    return Math.round(totalDays / mealPlans.length);
  }

  analyzeCuisinePreferences(mealPlans) {
    const cuisineCount = {};
    
    mealPlans.forEach(plan => {
      plan.recipes.forEach(mealPlanRecipe => {
        const cuisines = mealPlanRecipe.recipe.cuisines || [];
        cuisines.forEach(cuisine => {
          cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
        });
      });
    });

    return Object.entries(cuisineCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([cuisine, count]) => ({ cuisine, count }));
  }

  analyzeDietaryPatterns(mealPlans) {
    const dietCount = {};
    
    mealPlans.forEach(plan => {
      plan.recipes.forEach(mealPlanRecipe => {
        const diets = mealPlanRecipe.recipe.diets || [];
        diets.forEach(diet => {
          dietCount[diet] = (dietCount[diet] || 0) + 1;
        });
      });
    });

    return Object.entries(dietCount)
      .sort(([,a], [,b]) => b - a)
      .map(([diet, count]) => ({ diet, count }));
  }

  analyzeCookingTimePreferences(mealPlans) {
    const times = [];
    
    mealPlans.forEach(plan => {
      plan.recipes.forEach(mealPlanRecipe => {
        if (mealPlanRecipe.recipe.readyInMinutes) {
          times.push(mealPlanRecipe.recipe.readyInMinutes);
        }
      });
    });

    if (times.length === 0) return { average: 0, distribution: {} };

    const average = Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
    
    const distribution = {
      quick: times.filter(t => t <= 20).length,
      medium: times.filter(t => t > 20 && t <= 45).length,
      long: times.filter(t => t > 45).length
    };

    return { average, distribution };
  }

  analyzeMealTypeDistribution(mealPlans) {
    const mealTypeCount = {};
    
    mealPlans.forEach(plan => {
      plan.recipes.forEach(mealPlanRecipe => {
        const mealType = mealPlanRecipe.mealType;
        mealTypeCount[mealType] = (mealTypeCount[mealType] || 0) + 1;
      });
    });

    return mealTypeCount;
  }

  analyzePlanningFrequency(mealPlans) {
    if (mealPlans.length === 0) return 0;
    
    const dates = mealPlans.map(plan => new Date(plan.createdAt));
    const oldestDate = new Date(Math.min(...dates));
    const newestDate = new Date(Math.max(...dates));
    
    const daysDifference = Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24));
    
    return daysDifference > 0 ? Math.round((mealPlans.length / daysDifference) * 7) : 0; // Plans per week
  }

  analyzePantryCategories(pantryItems) {
    const categoryCount = {};
    
    pantryItems.forEach(item => {
      const category = item.category || 'other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  analyzeExpiryPatterns(pantryItems) {
    const now = new Date();
    const expired = pantryItems.filter(item => 
      item.expiryDate && new Date(item.expiryDate) < now
    ).length;
    
    const expiringSoon = pantryItems.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return expiryDate >= now && expiryDate <= sevenDaysFromNow;
    }).length;

    const fresh = pantryItems.filter(item => {
      if (!item.expiryDate) return true;
      const expiryDate = new Date(item.expiryDate);
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return expiryDate > sevenDaysFromNow;
    }).length;

    return {
      expired,
      expiringSoon,
      fresh,
      total: pantryItems.length
    };
  }

  async calculatePantryUtilizationRate(userId) {
    // This would require tracking when items are used/removed
    // For now, return a mock calculation
    const totalItems = await prisma.pantryItem.count({ where: { userId } });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentlyUsedItems = await prisma.pantryItem.count({
      where: {
        userId,
        updatedAt: { gte: thirtyDaysAgo }
      }
    });

    return totalItems > 0 ? Math.round((recentlyUsedItems / totalItems) * 100) : 0;
  }

  calculateWasteReduction(pantryItems) {
    const expiredItems = pantryItems.filter(item => 
      item.expiryDate && new Date(item.expiryDate) < new Date()
    ).length;
    
    const wastePercentage = pantryItems.length > 0 ? 
      Math.round((expiredItems / pantryItems.length) * 100) : 0;
    
    return {
      wastePercentage,
      itemsSaved: pantryItems.length - expiredItems,
      estimatedMoneySaved: (pantryItems.length - expiredItems) * 3 // $3 per item average
    };
  }

  analyzeRestockingPatterns(recentItems) {
    const patterns = {};
    
    recentItems.forEach(item => {
      const category = item.category || 'other';
      if (!patterns[category]) {
        patterns[category] = { count: 0, items: [] };
      }
      patterns[category].count++;
      patterns[category].items.push(item.name);
    });

    return patterns;
  }

  analyzeSeasonalPantryTrends(pantryItems) {
    const seasonalItems = {
      spring: ['asparagus', 'peas', 'strawberries'],
      summer: ['tomatoes', 'corn', 'berries'],
      fall: ['pumpkin', 'apples', 'squash'],
      winter: ['citrus', 'root vegetables', 'cabbage']
    };

    const currentSeason = this.getCurrentSeason();
    const seasonalCount = pantryItems.filter(item => {
      const itemName = item.name.toLowerCase();
      return seasonalItems[currentSeason].some(seasonal => 
        itemName.includes(seasonal)
      );
    }).length;

    return {
      currentSeason,
      seasonalItemsCount: seasonalCount,
      seasonalPercentage: pantryItems.length > 0 ? 
        Math.round((seasonalCount / pantryItems.length) * 100) : 0
    };
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  calculateAverageItemsPerList(groceryLists) {
    if (groceryLists.length === 0) return 0;
    
    const totalItems = groceryLists.reduce((sum, list) => {
      return sum + (list.items ? list.items.length : 0);
    }, 0);

    return Math.round(totalItems / groceryLists.length);
  }

  calculateCompletionRate(groceryLists) {
    const completedLists = groceryLists.filter(list => list.status === 'completed').length;
    return groceryLists.length > 0 ? 
      Math.round((completedLists / groceryLists.length) * 100) : 0;
  }

  analyzeCategorySpending(groceryLists) {
    const categorySpending = {};
    
    groceryLists.forEach(list => {
      if (list.items) {
        list.items.forEach(item => {
          const category = item.category || 'other';
          if (!categorySpending[category]) {
            categorySpending[category] = { count: 0, estimatedCost: 0 };
          }
          categorySpending[category].count++;
          categorySpending[category].estimatedCost += this.estimateItemCost(item);
        });
      }
    });

    return Object.entries(categorySpending)
      .map(([category, data]) => ({
        category,
        itemCount: data.count,
        estimatedCost: Math.round(data.estimatedCost)
      }))
      .sort((a, b) => b.estimatedCost - a.estimatedCost);
  }

  estimateItemCost(item) {
    // Simple cost estimation based on category and quantity
    const baseCosts = {
      vegetables: 2,
      fruits: 3,
      dairy: 4,
      protein: 8,
      grains: 3,
      other: 3
    };
    
    const baseCost = baseCosts[item.category] || 3;
    return baseCost * (item.quantity || 1);
  }

  analyzeShoppingFrequency(groceryLists) {
    if (groceryLists.length === 0) return 0;
    
    const dates = groceryLists.map(list => new Date(list.createdAt));
    const oldestDate = new Date(Math.min(...dates));
    const newestDate = new Date(Math.max(...dates));
    
    const daysDifference = Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24));
    
    return daysDifference > 0 ? Math.round((groceryLists.length / daysDifference) * 7) : 0; // Lists per week
  }

  analyzeBudgetTrends(groceryLists) {
    const monthlySpending = {};
    
    groceryLists.forEach(list => {
      const month = new Date(list.createdAt).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlySpending[month]) {
        monthlySpending[month] = 0;
      }
      
      if (list.items) {
        const listTotal = list.items.reduce((sum, item) => {
          return sum + this.estimateItemCost(item);
        }, 0);
        monthlySpending[month] += listTotal;
      }
    });

    return Object.entries(monthlySpending)
      .map(([month, spending]) => ({ month, spending: Math.round(spending) }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  analyzeSeasonalPurchases(groceryLists) {
    const seasonalPurchases = { spring: 0, summer: 0, fall: 0, winter: 0 };
    
    groceryLists.forEach(list => {
      const season = this.getSeasonFromDate(new Date(list.createdAt));
      seasonalPurchases[season]++;
    });

    return seasonalPurchases;
  }

  getSeasonFromDate(date) {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  extractNutritionData(mealPlans) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let mealCount = 0;

    mealPlans.forEach(plan => {
      plan.recipes.forEach(mealPlanRecipe => {
        const recipe = mealPlanRecipe.recipe;
        if (recipe.nutrition && recipe.nutrition.nutrients) {
          const nutrients = recipe.nutrition.nutrients;
          const servingMultiplier = mealPlanRecipe.servings / (recipe.servings || 1);

          nutrients.forEach(nutrient => {
            const amount = nutrient.amount * servingMultiplier;
            switch (nutrient.name.toLowerCase()) {
              case 'calories':
                totalCalories += amount;
                break;
              case 'protein':
                totalProtein += amount;
                break;
              case 'carbohydrates':
                totalCarbs += amount;
                break;
              case 'fat':
                totalFat += amount;
                break;
            }
          });
          mealCount++;
        }
      });
    });

    const averageCalories = mealCount > 0 ? Math.round(totalCalories / mealCount) : 0;

    return {
      averageCalories,
      macros: {
        protein: Math.round(totalProtein / mealCount) || 0,
        carbs: Math.round(totalCarbs / mealCount) || 0,
        fat: Math.round(totalFat / mealCount) || 0
      },
      trends: {
        totalMeals: mealCount,
        averageDailyCalories: averageCalories * 3 // Assuming 3 meals per day
      }
    };
  }

  async analyzeDietaryGoalProgress(userId, nutritionData) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { goals: true, dailyCalories: true }
    });

    if (!user || !user.dailyCalories) {
      return { progress: 0, status: 'No goals set' };
    }

    const targetCalories = user.dailyCalories;
    const actualCalories = nutritionData.trends.averageDailyCalories;
    
    const progress = targetCalories > 0 ? 
      Math.round((actualCalories / targetCalories) * 100) : 0;

    let status = 'On track';
    if (progress < 80) status = 'Below target';
    else if (progress > 120) status = 'Above target';

    return {
      progress,
      status,
      targetCalories,
      actualCalories,
      difference: actualCalories - targetCalories
    };
  }

  calculateHealthScore(nutritionData) {
    // Simple health score calculation based on balanced macros
    const { protein, carbs, fat } = nutritionData.macros;
    const total = protein + carbs + fat;
    
    if (total === 0) return 0;

    const proteinPercent = (protein / total) * 100;
    const carbsPercent = (carbs / total) * 100;
    const fatPercent = (fat / total) * 100;

    // Ideal ranges: Protein 15-25%, Carbs 45-65%, Fat 20-35%
    let score = 100;
    
    if (proteinPercent < 15 || proteinPercent > 25) score -= 20;
    if (carbsPercent < 45 || carbsPercent > 65) score -= 20;
    if (fatPercent < 20 || fatPercent > 35) score -= 20;

    return Math.max(0, score);
  }

  generateNutritionRecommendations(nutritionData) {
    const recommendations = [];
    const { protein, carbs, fat } = nutritionData.macros;
    const total = protein + carbs + fat;

    if (total === 0) {
      return ['Add more detailed nutrition tracking to get personalized recommendations'];
    }

    const proteinPercent = (protein / total) * 100;
    const carbsPercent = (carbs / total) * 100;
    const fatPercent = (fat / total) * 100;

    if (proteinPercent < 15) {
      recommendations.push('Consider adding more protein-rich foods like lean meats, fish, or legumes');
    }
    if (carbsPercent > 65) {
      recommendations.push('Try to balance carbohydrates with more protein and healthy fats');
    }
    if (fatPercent < 20) {
      recommendations.push('Include healthy fats like avocados, nuts, and olive oil in your meals');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Your nutrition balance looks good. Keep it up!');
    }

    return recommendations;
  }
}

module.exports = new AnalyticsService();
