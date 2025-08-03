import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ChefHat,
  ShoppingCart,
  Package,
  Target,
  Award,
  AlertCircle,
  Download
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30');

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/insights', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAnalytics(data.insights);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format = 'json') => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}&period=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smartmealbuddy-analytics-${Date.now()}.csv`;
        a.click();
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smartmealbuddy-analytics-${Date.now()}.json`;
        a.click();
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Unable to load analytics data</p>
      </div>
    );
  }

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'meal-planning', name: 'Meal Planning', icon: Calendar },
    { id: 'pantry', name: 'Pantry', icon: Package },
    { id: 'grocery', name: 'Grocery', icon: ShoppingCart },
    { id: 'nutrition', name: 'Nutrition', icon: Target }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Insights into your meal planning journey</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportData('json')}
              className="btn-outline btn-sm flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              JSON
            </button>
            <button
              onClick={() => exportData('csv')}
              className="btn-outline btn-sm flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Meal Plans"
          value={analytics.overview.mealPlansCount}
          change={analytics.trends.mealPlansChange}
          icon={Calendar}
          color="blue"
        />
        <MetricCard
          title="Recipes Used"
          value={analytics.overview.recipesUsedCount}
          change={analytics.trends.recipesUsedCount}
          icon={ChefHat}
          color="green"
        />
        <MetricCard
          title="Grocery Lists"
          value={analytics.overview.groceryListsCount}
          change={analytics.trends.groceryListsChange}
          icon={ShoppingCart}
          color="yellow"
        />
        <MetricCard
          title="Pantry Items"
          value={analytics.overview.pantryItemsCount}
          change={analytics.trends.pantryItemsChange}
          icon={Package}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && <OverviewTab analytics={analytics} />}
        {activeTab === 'meal-planning' && <MealPlanningTab analytics={analytics} />}
        {activeTab === 'pantry' && <PantryTab analytics={analytics} />}
        {activeTab === 'grocery' && <GroceryTab analytics={analytics} />}
        {activeTab === 'nutrition' && <NutritionTab analytics={analytics} />}
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-1">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Overview Tab
const OverviewTab = ({ analytics }) => {
  const utilizationData = [
    { name: 'Meal Planning', value: analytics.mealPlanning.planningFrequency || 0 },
    { name: 'Pantry Usage', value: analytics.pantry.utilizationRate || 0 },
    { name: 'Grocery Completion', value: analytics.grocery.completionRate || 0 }
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Feature Utilization</h3>
          <p className="card-description">How effectively you're using SmartMealBuddy</p>
        </div>
        <div className="card-content">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Health Score</h3>
          <p className="card-description">Your overall nutrition balance</p>
        </div>
        <div className="card-content">
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
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
                  strokeDasharray={`${analytics.nutrition.healthScore || 0}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {analytics.nutrition.healthScore || 0}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {analytics.nutrition.recommendations?.slice(0, 3).map((rec, index) => (
              <p key={index} className="text-sm text-gray-600">• {rec}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Meal Planning Tab
const MealPlanningTab = ({ analytics }) => {
  const cuisineData = analytics.mealPlanning.cuisinePreferences?.map((cuisine, index) => ({
    name: cuisine.cuisine,
    value: cuisine.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Cuisine Preferences</h3>
          <p className="card-description">Your favorite types of cuisine</p>
        </div>
        <div className="card-content">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cuisineData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {cuisineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Cooking Time Preferences</h3>
          <p className="card-description">How long you typically spend cooking</p>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Cooking Time</span>
              <span className="text-lg font-bold text-primary-600">
                {analytics.mealPlanning.cookingTimePreferences?.average || 0} min
              </span>
            </div>
            
            <div className="space-y-3">
              {Object.entries(analytics.mealPlanning.cookingTimePreferences?.distribution || {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{type} (&lt;20 min)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${Math.min((count / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pantry Tab
const PantryTab = ({ analytics }) => {
  const categoryData = analytics.pantry.categoryBreakdown?.map((cat, index) => ({
    name: cat.category,
    count: cat.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Pantry Categories</h3>
          <p className="card-description">Distribution of items in your pantry</p>
        </div>
        <div className="card-content">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Waste Reduction</h3>
          <p className="card-description">Your impact on reducing food waste</p>
        </div>
        <div className="card-content">
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analytics.pantry.wasteReduction?.itemsSaved || 0}
              </div>
              <p className="text-sm text-gray-600">Items saved from waste</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-2">
                ${analytics.pantry.wasteReduction?.estimatedMoneySaved || 0}
              </div>
              <p className="text-sm text-gray-600">Estimated money saved</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Great job!</span>
              </div>
              <p className="text-sm text-green-700">
                You're doing an excellent job managing your pantry and reducing waste.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Grocery Tab
const GroceryTab = ({ analytics }) => {
  const spendingData = analytics.grocery.categorySpending?.map((cat, index) => ({
    name: cat.category,
    amount: cat.estimatedCost,
    color: COLORS[index % COLORS.length]
  })) || [];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Category Spending</h3>
          <p className="card-description">Where your grocery budget goes</p>
        </div>
        <div className="card-content">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} $${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {spendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, 'Spending']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Shopping Efficiency</h3>
          <p className="card-description">Your grocery shopping patterns</p>
        </div>
        <div className="card-content">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-2xl font-bold text-primary-600">
                {analytics.grocery.completionRate || 0}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avg Items per List</span>
              <span className="text-lg font-bold text-gray-900">
                {analytics.grocery.averageItemsPerList || 0}
              </span>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Shopping Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Plan your route through the store</li>
                <li>• Shop during off-peak hours</li>
                <li>• Use your meal plan to avoid impulse buys</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Nutrition Tab
const NutritionTab = ({ analytics }) => {
  const goalProgress = analytics.nutrition.dietaryGoalProgress || {};

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Goal Progress</h3>
          <p className="card-description">How you're tracking toward your nutrition goals</p>
        </div>
        <div className="card-content">
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {goalProgress.progress || 0}%
              </div>
              <p className="text-sm text-gray-600">{goalProgress.status || 'No goals set'}</p>
            </div>

            {goalProgress.targetCalories && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Target: {goalProgress.targetCalories} cal/day</span>
                  <span>Actual: {goalProgress.actualCalories} cal/day</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${Math.min(goalProgress.progress, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recommendations</h3>
          <p className="card-description">Personalized nutrition advice</p>
        </div>
        <div className="card-content">
          <div className="space-y-3">
            {analytics.nutrition.recommendations?.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Target className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
