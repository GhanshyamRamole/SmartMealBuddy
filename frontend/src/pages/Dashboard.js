import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Calendar, 
  ChefHat, 
  ShoppingCart, 
  Package, 
  Plus,
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // Mock data - in real app, this would come from Redux store
  const stats = {
    mealPlansCount: 3,
    recipesCount: 24,
    groceryListsCount: 2,
    pantryItemsCount: 18,
    expiringItemsCount: 3,
  };

  const recentMealPlans = [
    {
      id: '1',
      name: 'Healthy Week Plan',
      startDate: '2024-02-05',
      endDate: '2024-02-11',
      recipesCount: 21,
    },
    {
      id: '2',
      name: 'Keto Meal Plan',
      startDate: '2024-01-29',
      endDate: '2024-02-04',
      recipesCount: 18,
    },
  ];

  const quickActions = [
    {
      title: 'Create Meal Plan',
      description: 'Generate a new weekly meal plan',
      icon: Calendar,
      link: '/meal-plans',
      color: 'bg-primary-500',
    },
    {
      title: 'Browse Recipes',
      description: 'Discover new recipes to try',
      icon: ChefHat,
      link: '/recipes',
      color: 'bg-secondary-500',
    },
    {
      title: 'Grocery List',
      description: 'Create or view grocery lists',
      icon: ShoppingCart,
      link: '/grocery-lists',
      color: 'bg-success-500',
    },
    {
      title: 'Manage Pantry',
      description: 'Update your pantry inventory',
      icon: Package,
      link: '/pantry',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-primary-100 mb-4">
          Ready to plan some delicious meals? Here's what's happening in your kitchen.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/meal-plans"
            className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Meal Plan
          </Link>
          <Link
            to="/recipes/random/suggestions"
            className="bg-primary-400 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-300 transition-colors"
          >
            Get Recipe Ideas
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meal Plans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.mealPlansCount}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saved Recipes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recipesCount}</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Grocery Lists</p>
              <p className="text-2xl font-bold text-gray-900">{stats.groceryListsCount}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pantry Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pantryItemsCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className="card p-6 hover:shadow-lg transition-shadow group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Meal Plans */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Meal Plans</h3>
            <p className="card-description">Your latest meal planning activity</p>
          </div>
          <div className="card-content">
            {recentMealPlans.length > 0 ? (
              <div className="space-y-4">
                {recentMealPlans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{plan.name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{plan.recipesCount} recipes</p>
                      <Link
                        to={`/meal-plans/${plan.id}`}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        View Plan
                      </Link>
                    </div>
                  </div>
                ))}
                <Link
                  to="/meal-plans"
                  className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All Meal Plans
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No meal plans yet</p>
                <Link to="/meal-plans" className="btn-primary btn-sm">
                  Create Your First Plan
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Pantry Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pantry Alerts</h3>
            <p className="card-description">Items that need your attention</p>
          </div>
          <div className="card-content">
            {stats.expiringItemsCount > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-secondary-50 rounded-lg border border-secondary-200">
                  <AlertTriangle className="h-5 w-5 text-secondary-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {stats.expiringItemsCount} items expiring soon
                    </p>
                    <p className="text-sm text-gray-600">
                      Check your pantry to avoid waste
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-success-50 rounded-lg border border-success-200">
                  <TrendingUp className="h-5 w-5 text-success-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Recipe suggestions available
                    </p>
                    <p className="text-sm text-gray-600">
                      Based on your current pantry items
                    </p>
                  </div>
                </div>

                <Link
                  to="/pantry"
                  className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Manage Pantry
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Your pantry is well organized!</p>
                <Link to="/pantry" className="btn-outline btn-sm">
                  View Pantry
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Meal Suggestion */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Today's Meal Suggestion</h3>
          <p className="card-description">A recipe recommendation just for you</p>
        </div>
        <div className="card-content">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mr-4">
                <ChefHat className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Mediterranean Quinoa Bowl</h4>
                <p className="text-sm text-gray-600">Healthy • 25 min • Vegetarian</p>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">Perfect for lunch</span>
                </div>
              </div>
            </div>
            <Link
              to="/recipes/1"
              className="btn-primary btn-sm"
            >
              View Recipe
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
