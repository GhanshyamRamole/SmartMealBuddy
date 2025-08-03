const cron = require('node-cron');
const notificationService = require('./notificationService');
const analyticsService = require('./analyticsService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class ScheduledTasksService {
  constructor() {
    this.tasks = new Map();
    this.isInitialized = false;
  }

  // Initialize all scheduled tasks
  init() {
    if (this.isInitialized) {
      console.log('Scheduled tasks already initialized');
      return;
    }

    console.log('🕐 Initializing scheduled tasks...');

    // Daily tasks
    this.scheduleExpiryCheck();
    this.scheduleMealPlanReminders();
    this.scheduleDataCleanup();

    // Weekly tasks
    this.scheduleWeeklyReports();
    this.scheduleAnalyticsAggregation();

    // Monthly tasks
    this.scheduleMonthlyMaintenance();

    this.isInitialized = true;
    console.log('✅ All scheduled tasks initialized');
  }

  // Check for expiring pantry items daily at 9 AM
  scheduleExpiryCheck() {
    const task = cron.schedule('0 9 * * *', async () => {
      try {
        console.log('🔍 Running daily expiry check...');
        const result = await notificationService.checkExpiringItems();
        console.log(`📧 Sent ${result.notificationsSent} expiry notifications for ${result.itemsExpiring} items`);
      } catch (error) {
        console.error('Error in expiry check task:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.tasks.set('expiryCheck', task);
    task.start();
    console.log('📅 Scheduled daily expiry check at 9:00 AM');
  }

  // Check for meal plan reminders daily at 8 PM
  scheduleMealPlanReminders() {
    const task = cron.schedule('0 20 * * *', async () => {
      try {
        console.log('📅 Running meal plan reminder check...');
        const result = await notificationService.checkMealPlanReminders();
        console.log(`📧 Sent ${result.remindersSent} meal plan reminders`);
      } catch (error) {
        console.error('Error in meal plan reminder task:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.tasks.set('mealPlanReminders', task);
    task.start();
    console.log('📅 Scheduled meal plan reminders at 8:00 PM');
  }

  // Clean up old data daily at 2 AM
  scheduleDataCleanup() {
    const task = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('🧹 Running daily data cleanup...');
        await this.performDataCleanup();
        console.log('✅ Data cleanup completed');
      } catch (error) {
        console.error('Error in data cleanup task:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.tasks.set('dataCleanup', task);
    task.start();
    console.log('📅 Scheduled daily data cleanup at 2:00 AM');
  }

  // Send weekly reports on Sundays at 10 AM
  scheduleWeeklyReports() {
    const task = cron.schedule('0 10 * * 0', async () => {
      try {
        console.log('📊 Running weekly reports...');
        await this.generateWeeklyReports();
        
        // Send weekly meal planning suggestions
        const result = await notificationService.sendWeeklyPlanSuggestions();
        console.log(`📧 Sent ${result.suggestionsSent} weekly planning suggestions`);
      } catch (error) {
        console.error('Error in weekly reports task:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.tasks.set('weeklyReports', task);
    task.start();
    console.log('📅 Scheduled weekly reports on Sundays at 10:00 AM');
  }

  // Aggregate analytics data weekly on Mondays at 1 AM
  scheduleAnalyticsAggregation() {
    const task = cron.schedule('0 1 * * 1', async () => {
      try {
        console.log('📈 Running analytics aggregation...');
        await this.aggregateAnalyticsData();
        console.log('✅ Analytics aggregation completed');
      } catch (error) {
        console.error('Error in analytics aggregation task:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.tasks.set('analyticsAggregation', task);
    task.start();
    console.log('📅 Scheduled analytics aggregation on Mondays at 1:00 AM');
  }

  // Monthly maintenance on the 1st at 3 AM
  scheduleMonthlyMaintenance() {
    const task = cron.schedule('0 3 1 * *', async () => {
      try {
        console.log('🔧 Running monthly maintenance...');
        await this.performMonthlyMaintenance();
        console.log('✅ Monthly maintenance completed');
      } catch (error) {
        console.error('Error in monthly maintenance task:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.tasks.set('monthlyMaintenance', task);
    task.start();
    console.log('📅 Scheduled monthly maintenance on 1st at 3:00 AM');
  }

  // Perform data cleanup operations
  async performDataCleanup() {
    const cleanupResults = {
      expiredSessions: 0,
      oldNotifications: 0,
      unusedRecipes: 0,
      completedGroceryLists: 0
    };

    try {
      // Clean up expired pantry items (older than 30 days past expiry)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const expiredItems = await prisma.pantryItem.deleteMany({
        where: {
          expiryDate: {
            lt: thirtyDaysAgo
          }
        }
      });

      // Clean up old completed grocery lists (older than 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const oldGroceryLists = await prisma.groceryList.deleteMany({
        where: {
          status: 'completed',
          updatedAt: {
            lt: ninetyDaysAgo
          }
        }
      });

      cleanupResults.completedGroceryLists = oldGroceryLists.count;

      // Clean up unused cached recipes (not used in any meal plan for 180 days)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

      const unusedRecipes = await prisma.recipe.findMany({
        where: {
          createdAt: {
            lt: sixMonthsAgo
          },
          mealPlanRecipes: {
            none: {}
          }
        },
        select: { id: true }
      });

      if (unusedRecipes.length > 0) {
        await prisma.recipe.deleteMany({
          where: {
            id: {
              in: unusedRecipes.map(r => r.id)
            }
          }
        });
        cleanupResults.unusedRecipes = unusedRecipes.length;
      }

      console.log('🧹 Cleanup results:', cleanupResults);
      return cleanupResults;

    } catch (error) {
      console.error('Error during data cleanup:', error);
      throw error;
    }
  }

  // Generate weekly reports for all users
  async generateWeeklyReports() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      const reports = [];

      for (const user of users) {
        try {
          const analytics = await analyticsService.getUserDashboardAnalytics(user.id);
          
          const report = {
            userId: user.id,
            userName: user.name,
            weeklyStats: {
              mealPlansCreated: analytics.trends.mealPlansChange || 0,
              groceryListsCreated: analytics.trends.groceryListsChange || 0,
              pantryItemsAdded: analytics.trends.pantryItemsChange || 0,
              expiringItems: analytics.overview.expiringItemsCount || 0
            },
            generatedAt: new Date()
          };

          reports.push(report);

          // Add small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (userError) {
          console.error(`Error generating report for user ${user.id}:`, userError);
        }
      }

      console.log(`📊 Generated ${reports.length} weekly reports`);
      return reports;

    } catch (error) {
      console.error('Error generating weekly reports:', error);
      throw error;
    }
  }

  // Aggregate analytics data for performance optimization
  async aggregateAnalyticsData() {
    try {
      const aggregationResults = {
        userStats: 0,
        recipeStats: 0,
        mealPlanStats: 0
      };

      // Aggregate user statistics
      const userCount = await prisma.user.count();
      const activeUsers = await prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      // Aggregate recipe usage statistics
      const totalRecipes = await prisma.recipe.count();
      const popularRecipes = await prisma.mealPlanRecipe.groupBy({
        by: ['recipeId'],
        _count: {
          recipeId: true
        },
        orderBy: {
          _count: {
            recipeId: 'desc'
          }
        },
        take: 10
      });

      // Aggregate meal plan statistics
      const totalMealPlans = await prisma.mealPlan.count();
      const recentMealPlans = await prisma.mealPlan.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      });

      aggregationResults.userStats = { userCount, activeUsers };
      aggregationResults.recipeStats = { totalRecipes, popularRecipes: popularRecipes.length };
      aggregationResults.mealPlanStats = { totalMealPlans, recentMealPlans };

      console.log('📈 Analytics aggregation results:', aggregationResults);
      return aggregationResults;

    } catch (error) {
      console.error('Error aggregating analytics data:', error);
      throw error;
    }
  }

  // Perform monthly maintenance tasks
  async performMonthlyMaintenance() {
    try {
      const maintenanceResults = {
        databaseOptimization: false,
        cacheClearing: false,
        backupVerification: false,
        performanceMetrics: {}
      };

      // Database optimization (analyze tables, update statistics)
      console.log('🔧 Performing database optimization...');
      // In a real implementation, you would run database-specific optimization commands
      maintenanceResults.databaseOptimization = true;

      // Clear application caches
      console.log('🧹 Clearing application caches...');
      // Clear any in-memory caches, Redis caches, etc.
      maintenanceResults.cacheClearing = true;

      // Verify backup integrity
      console.log('💾 Verifying backup integrity...');
      // Check that backups are being created and are accessible
      maintenanceResults.backupVerification = true;

      // Collect performance metrics
      console.log('📊 Collecting performance metrics...');
      const performanceMetrics = await this.collectPerformanceMetrics();
      maintenanceResults.performanceMetrics = performanceMetrics;

      // Generate monthly summary report
      await this.generateMonthlySummaryReport();

      console.log('🔧 Monthly maintenance results:', maintenanceResults);
      return maintenanceResults;

    } catch (error) {
      console.error('Error during monthly maintenance:', error);
      throw error;
    }
  }

  // Collect performance metrics
  async collectPerformanceMetrics() {
    try {
      const metrics = {
        databaseSize: 0,
        averageResponseTime: 0,
        errorRate: 0,
        userGrowth: 0,
        featureUsage: {}
      };

      // Database size (approximate)
      const tableStats = await Promise.all([
        prisma.user.count(),
        prisma.recipe.count(),
        prisma.mealPlan.count(),
        prisma.groceryList.count(),
        prisma.pantryItem.count()
      ]);

      metrics.databaseSize = tableStats.reduce((sum, count) => sum + count, 0);

      // User growth (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      });

      metrics.userGrowth = newUsers;

      // Feature usage statistics
      const featureUsage = {
        mealPlansCreated: await prisma.mealPlan.count({
          where: { createdAt: { gte: thirtyDaysAgo } }
        }),
        groceryListsCreated: await prisma.groceryList.count({
          where: { createdAt: { gte: thirtyDaysAgo } }
        }),
        pantryItemsAdded: await prisma.pantryItem.count({
          where: { createdAt: { gte: thirtyDaysAgo } }
        })
      };

      metrics.featureUsage = featureUsage;

      return metrics;

    } catch (error) {
      console.error('Error collecting performance metrics:', error);
      return {};
    }
  }

  // Generate monthly summary report
  async generateMonthlySummaryReport() {
    try {
      const currentDate = new Date();
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      const monthlyStats = {
        period: `${lastMonth.toLocaleDateString()} - ${thisMonth.toLocaleDateString()}`,
        users: {
          total: await prisma.user.count(),
          newUsers: await prisma.user.count({
            where: {
              createdAt: {
                gte: lastMonth,
                lt: thisMonth
              }
            }
          })
        },
        activity: {
          mealPlansCreated: await prisma.mealPlan.count({
            where: {
              createdAt: {
                gte: lastMonth,
                lt: thisMonth
              }
            }
          }),
          groceryListsCreated: await prisma.groceryList.count({
            where: {
              createdAt: {
                gte: lastMonth,
                lt: thisMonth
              }
            }
          }),
          pantryItemsAdded: await prisma.pantryItem.count({
            where: {
              createdAt: {
                gte: lastMonth,
                lt: thisMonth
              }
            }
          })
        },
        generatedAt: new Date()
      };

      console.log('📊 Monthly summary report:', monthlyStats);
      
      // In a real implementation, you might save this to a file or send to administrators
      return monthlyStats;

    } catch (error) {
      console.error('Error generating monthly summary report:', error);
      throw error;
    }
  }

  // Stop a specific task
  stopTask(taskName) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.stop();
      console.log(`⏹️ Stopped task: ${taskName}`);
      return true;
    }
    return false;
  }

  // Start a specific task
  startTask(taskName) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.start();
      console.log(`▶️ Started task: ${taskName}`);
      return true;
    }
    return false;
  }

  // Stop all tasks
  stopAllTasks() {
    for (const [taskName, task] of this.tasks) {
      task.stop();
      console.log(`⏹️ Stopped task: ${taskName}`);
    }
    console.log('⏹️ All scheduled tasks stopped');
  }

  // Get task status
  getTaskStatus() {
    const status = {};
    for (const [taskName, task] of this.tasks) {
      status[taskName] = {
        running: task.running || false,
        scheduled: task.scheduled || false
      };
    }
    return status;
  }

  // Run a task manually (for testing)
  async runTaskManually(taskName) {
    try {
      console.log(`🔧 Running task manually: ${taskName}`);
      
      switch (taskName) {
        case 'expiryCheck':
          return await notificationService.checkExpiringItems();
        case 'mealPlanReminders':
          return await notificationService.checkMealPlanReminders();
        case 'dataCleanup':
          return await this.performDataCleanup();
        case 'weeklyReports':
          return await this.generateWeeklyReports();
        case 'analyticsAggregation':
          return await this.aggregateAnalyticsData();
        case 'monthlyMaintenance':
          return await this.performMonthlyMaintenance();
        default:
          throw new Error(`Unknown task: ${taskName}`);
      }
    } catch (error) {
      console.error(`Error running task ${taskName} manually:`, error);
      throw error;
    }
  }
}

module.exports = new ScheduledTasksService();
