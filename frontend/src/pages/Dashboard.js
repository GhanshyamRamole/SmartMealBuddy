import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import websocketService from '../services/websocketService';
import '../styles/dashboard.css';
import {
  Calendar,
  ChefHat,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Award,
  AlertCircle,
  Bell,
  Activity,
  Users,
  Zap,
  Heart,
  Star,
  Plus,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [realTimeStats, setRealTimeStats] = useState({
    activeUsers: 0,
    todayMealPlans: 0,
    weeklyGoalProgress: 0
  });

  // Real-time data fetching and WebSocket setup
  useEffect(() => {
    fetchDashboardData();
    
    // Initialize WebSocket service
    websocketService.connect();
    
    // Subscribe to real-time updates
    websocketService.subscribeToStats((newStats) => {
      setRealTimeStats(newStats);
    });

    websocketService.subscribeToNotifications((notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications
    });

    websocketService.subscribeToActivity((activity) => {
      // Handle real-time activity updates
      console.log('New activity:', activity);
    });
    
    // Set up periodic data refresh
    const interval = setInterval(() => {
      fetchDashboardData();
      setLastUpdated(new Date());
    }, 60000); // Refresh every minute

    return () => {
      clearInterval(interval);
      websocketService.disconnect();
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.analytics);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Simulate real-time notifications
      const mockNotifications = [
        {
          id: 1,
          type: 'expiry',
          message: '3 items in your pantry expire soon',
          time: '2 min ago',
          urgent: true
        },
        {
          id: 2,
          type: 'achievement',
          message: 'You completed your weekly meal plan!',
          time: '1 hour ago',
          urgent: false
        },
        {
          id: 3,
          type: 'suggestion',
          message: 'New recipe suggestions based on your pantry',
          time: '3 hours ago',
          urgent: false
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const updateRealTimeStats = () => {
    // Simulate real-time stats updates
    setRealTimeStats(prev => ({
      activeUsers: Math.floor(Math.random() * 50) + 100,
      todayMealPlans: Math.floor(Math.random() * 20) + 15,
      weeklyGoalProgress: Math.min(prev.weeklyGoalProgress + Math.random() * 5, 100)
    }));
  };

  const refreshData = async () => {
    setLoading(true);
    await fetchDashboardData();
    await fetchNotifications();
    updateRealTimeStats();
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'Create Meal Plan',
      description: 'Plan your week ahead',
      icon: Calendar,
      color: 'bg-blue-500',
      href: '/meal-plans/create'
    },
    {
      title: 'Find Recipes',
      description: 'Discover new dishes',
      icon: ChefHat,
      color: 'bg-green-500',
      href: '/recipes'
    },
    {
      title: 'Grocery List',
      description: 'Generate shopping list',
      icon: ShoppingCart,
      color: 'bg-purple-500',
      href: '/grocery-lists'
    },
    {
      title: 'Manage Pantry',
      description: 'Track your ingredients',
      icon: Package,
      color: 'bg-orange-500',
      href: '/pantry'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreeting()}, {user?.name}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Ready to plan some delicious meals today?
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Real-time indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
              
              {/* Refresh button */}
              <button
                onClick={refreshData}
                className="btn-outline btn-sm flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <Bell className="h-6 w-6" />
                  {notifications.filter(n => n.urgent).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => n.urgent).length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Last updated */}
          <div className="mt-2 text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Stats Bar */}
        <div className="stats-bar gradient-animated rounded-xl p-6 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 mr-2 icon-bounce" />
                <span className="text-2xl font-bold count-up">{realTimeStats.activeUsers}</span>
              </div>
              <p className="text-blue-100">Active Users Today</p>
              <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-2 pulse-glow"></div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 mr-2 icon-bounce" />
                <span className="text-2xl font-bold count-up">{realTimeStats.todayMealPlans}</span>
              </div>
              <p className="text-blue-100">Meal Plans Created Today</p>
              <div className="w-2 h-2 bg-yellow-400 rounded-full mx-auto mt-2 pulse-glow"></div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 mr-2 icon-bounce" />
                <span className="text-2xl font-bold count-up">{Math.round(realTimeStats.weeklyGoalProgress)}%</span>
              </div>
              <p className="text-blue-100">Weekly Goal Progress</p>
              <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-2 pulse-glow"></div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Meal Plans"
                value={dashboardData?.overview?.mealPlansCount || 0}
                change={dashboardData?.trends?.mealPlansChange || 0}
                icon={Calendar}
                color="blue"
                trend="up"
              />
              <MetricCard
                title="Recipes"
                value={dashboardData?.overview?.recipesUsedCount || 0}
                change={dashboardData?.trends?.recipesUsedCount || 0}
                icon={ChefHat}
                color="green"
                trend="up"
              />
              <MetricCard
                title="Grocery Lists"
                value={dashboardData?.overview?.groceryListsCount || 0}
                change={dashboardData?.trends?.groceryListsChange || 0}
                icon={ShoppingCart}
                color="purple"
                trend="up"
              />
              <MetricCard
                title="Pantry Items"
                value={dashboardData?.overview?.pantryItemsCount || 0}
                change={dashboardData?.trends?.pantryItemsChange || 0}
                icon={Package}
                color="orange"
                trend={dashboardData?.trends?.pantryItemsChange >= 0 ? 'up' : 'down'}
              />
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Actions
                </h3>
                <p className="card-description">Get started with your meal planning</p>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <QuickActionCard key={index} {...action} />
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Recent Activity
                </h3>
                <p className="card-description">Your latest meal planning activities</p>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {dashboardData?.recentActivity?.mealPlans?.map((plan, index) => (
                    <ActivityItem
                      key={index}
                      icon={Calendar}
                      title={`Created meal plan: ${plan.name}`}
                      time={new Date(plan.createdAt).toLocaleDateString()}
                      color="blue"
                    />
                  ))}
                  {dashboardData?.recentActivity?.groceryLists?.map((list, index) => (
                    <ActivityItem
                      key={index}
                      icon={ShoppingCart}
                      title={`Generated grocery list: ${list.name}`}
                      time={new Date(list.createdAt).toLocaleDateString()}
                      color="purple"
                    />
                  ))}
                  {dashboardData?.recentActivity?.pantryItems?.slice(0, 2).map((item, index) => (
                    <ActivityItem
                      key={index}
                      icon={Package}
                      title={`Added to pantry: ${item.name}`}
                      time={new Date(item.createdAt).toLocaleDateString()}
                      color="orange"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-500" />
                  Notifications
                  {notifications.filter(n => n.urgent).length > 0 && (
                    <span className="badge badge-danger">
                      {notifications.filter(n => n.urgent).length}
                    </span>
                  )}
                </h3>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <NotificationItem key={notification.id} {...notification} />
                  ))}
                </div>
              </div>
            </div>

            {/* Health Score */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Health Score
                </h3>
                <p className="card-description">Your nutrition balance</p>
              </div>
              <div className="card-content">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray="85, 100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">85</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Great job! Your nutrition is well balanced.</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Protein</span>
                      <span className="text-green-600">Good</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbs</span>
                      <span className="text-green-600">Balanced</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fats</span>
                      <span className="text-yellow-600">Moderate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Goals */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Weekly Goals
                </h3>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  <GoalProgress
                    title="Meal Plans Created"
                    current={3}
                    target={5}
                    color="blue"
                  />
                  <GoalProgress
                    title="New Recipes Tried"
                    current={2}
                    target={3}
                    color="green"
                  />
                  <GoalProgress
                    title="Pantry Items Used"
                    current={8}
                    target={10}
                    color="orange"
                  />
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Recent Achievements
                </h3>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <AchievementItem
                    title="Meal Planning Master"
                    description="Created 10 meal plans"
                    icon="🏆"
                    earned={true}
                  />
                  <AchievementItem
                    title="Recipe Explorer"
                    description="Tried 25 new recipes"
                    icon="🍳"
                    earned={true}
                  />
                  <AchievementItem
                    title="Zero Waste Hero"
                    description="No expired pantry items this month"
                    icon="♻️"
                    earned={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component: Metric Card
const MetricCard = ({ title, value, change, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="card metric-card card-hover p-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 count-up">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-1">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]} float-animation`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Component: Quick Action Card
const QuickActionCard = ({ title, description, icon: Icon, color, href }) => {
  return (
    <div className="group cursor-pointer quick-action">
      <div className="card card-hover p-4 transition-all duration-300">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center icon-bounce`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
};

// Component: Activity Item
const ActivityItem = ({ icon: Icon, title, time, color }) => {
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500'
  };

  return (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
};

// Component: Notification Item
const NotificationItem = ({ type, message, time, urgent }) => {
  const getIcon = () => {
    switch (type) {
      case 'expiry': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'achievement': return <Award className="h-4 w-4 text-yellow-500" />;
      case 'suggestion': return <Star className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`notification-item p-3 rounded-lg border-l-4 transition-all duration-300 hover:shadow-md ${
      urgent ? 'border-red-500 bg-red-50 hover:bg-red-100' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
    }`}>
      <div className="flex items-start space-x-2">
        <div className="icon-bounce">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
          <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
        {urgent && (
          <div className="w-2 h-2 bg-red-500 rounded-full pulse-glow"></div>
        )}
      </div>
    </div>
  );
};

// Component: Goal Progress
const GoalProgress = ({ title, current, target, color }) => {
  const percentage = Math.min((current / target) * 100, 100);
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-900">{title}</span>
        <span className="text-gray-500 count-up">{current}/{target}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ease-out progress-animated ${colorClasses[color]}`}
          style={{ 
            width: `${percentage}%`,
            '--progress-width': `${percentage}%`
          }}
        />
      </div>
      {percentage === 100 && (
        <div className="flex items-center text-xs text-green-600">
          <Star className="h-3 w-3 mr-1 success-animation" />
          Goal completed!
        </div>
      )}
    </div>
  );
};

// Component: Achievement Item
const AchievementItem = ({ title, description, icon, earned }) => {
  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
      earned ? 'bg-yellow-50 achievement-glow hover:bg-yellow-100' : 'bg-gray-50 hover:bg-gray-100'
    }`}>
      <div className={`text-2xl ${earned ? 'float-animation' : 'grayscale'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${earned ? 'text-gray-900' : 'text-gray-500'}`}>
          {title}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      {earned && (
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-500 icon-bounce" />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
