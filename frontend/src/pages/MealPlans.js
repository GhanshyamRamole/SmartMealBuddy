import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import MealPlanWizard from '../components/MealPlanWizard';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  Users,
  ChefHat,
  Eye,
  Copy,
  Filter,
  Search,
  Loader,
  ShoppingCart,
  Zap,
  Star
} from 'lucide-react';

const MealPlans = () => {
  const { user } = useSelector((state) => state.auth);
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSmartWizard, setShowSmartWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/mealplans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMealPlans(data.mealPlans || []);
      } else {
        // Set mock data for demonstration
        setMealPlans([
          {
            id: 1,
            name: "Healthy Week Plan",
            startDate: "2025-08-04",
            endDate: "2025-08-10",
            status: "active",
            totalMeals: 21,
            createdAt: "2025-08-01T10:00:00Z",
            meals: [
              { day: "Monday", breakfast: "Oatmeal with Berries", lunch: "Quinoa Salad", dinner: "Grilled Salmon" },
              { day: "Tuesday", breakfast: "Greek Yogurt", lunch: "Chicken Wrap", dinner: "Vegetable Stir Fry" },
              { day: "Wednesday", breakfast: "Smoothie Bowl", lunch: "Lentil Soup", dinner: "Pasta Primavera" }
            ]
          },
          {
            id: 2,
            name: "Mediterranean Diet",
            startDate: "2025-08-11",
            endDate: "2025-08-17",
            status: "planned",
            totalMeals: 21,
            createdAt: "2025-08-02T14:30:00Z",
            meals: [
              { day: "Monday", breakfast: "Greek Yogurt with Honey", lunch: "Mediterranean Salad", dinner: "Grilled Fish" },
              { day: "Tuesday", breakfast: "Avocado Toast", lunch: "Hummus Bowl", dinner: "Lamb with Herbs" }
            ]
          },
          {
            id: 3,
            name: "Quick & Easy Meals",
            startDate: "2025-07-28",
            endDate: "2025-08-03",
            status: "completed",
            totalMeals: 21,
            createdAt: "2025-07-25T09:15:00Z",
            meals: [
              { day: "Monday", breakfast: "Cereal", lunch: "Sandwich", dinner: "Pasta" },
              { day: "Tuesday", breakfast: "Toast", lunch: "Salad", dinner: "Pizza" }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMealPlan = async (planData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/mealplans', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      });

      if (response.ok) {
        const data = await response.json();
        setMealPlans([data.mealPlan, ...mealPlans]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating meal plan:', error);
    }
  };

  const deleteMealPlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal plan?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mealplans/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMealPlans(mealPlans.filter(plan => plan.id !== id));
      }
    } catch (error) {
      console.error('Error deleting meal plan:', error);
    }
  };

  const duplicateMealPlan = async (plan) => {
    const newPlan = {
      ...plan,
      name: `${plan.name} (Copy)`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    delete newPlan.id;
    await createMealPlan(newPlan);
  };

  const filteredMealPlans = mealPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || plan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢';
      case 'planned': return '🔵';
      case 'completed': return '✅';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                Meal Plans
              </h1>
              <p className="text-gray-600 mt-1">
                Plan your meals for the week and stay organized
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSmartWizard(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Smart Plan + Grocery
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-outline flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Quick Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search meal plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Plans</p>
                <p className="text-2xl font-bold text-gray-900">{mealPlans.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🟢</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mealPlans.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🔵</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Planned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mealPlans.filter(p => p.status === 'planned').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mealPlans.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading meal plans...</span>
          </div>
        )}

        {/* Meal Plans Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMealPlans.map((plan) => (
              <MealPlanCard
                key={plan.id}
                plan={plan}
                onDelete={deleteMealPlan}
                onDuplicate={duplicateMealPlan}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredMealPlans.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meal plans found</h3>
            <p className="text-gray-600 mb-4">
              Create your first meal plan to get started with organized meal planning.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Plan
            </button>
          </div>
        )}
      </div>

      {/* Smart Wizard Modal */}
      {showSmartWizard && (
        <MealPlanWizard
          onClose={() => setShowSmartWizard(false)}
          onCreate={createMealPlan}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateMealPlanModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createMealPlan}
        />
      )}
    </div>
  );
};

// Meal Plan Card Component
const MealPlanCard = ({ plan, onDelete, onDuplicate }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢';
      case 'planned': return '🔵';
      case 'completed': return '✅';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {plan.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                <span className="mr-1">{getStatusIcon(plan.status)}</span>
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDuplicate(plan)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Duplicate plan"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(plan.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Delete plan"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{plan.totalMeals}</div>
            <div className="text-xs text-gray-600">Total Meals</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{plan.meals?.length || 0}</div>
            <div className="text-xs text-gray-600">Days Planned</div>
          </div>
        </div>

        {/* Enhanced Features */}
        {plan.groceryList && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Auto-Generated Grocery List</span>
              </div>
              <span className="text-xs text-green-600">
                ${plan.groceryList.estimatedTotal?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="text-xs text-green-700">
              {plan.groceryList.totalItems || 0} items • Ready for online purchase
            </div>
          </div>
        )}

        {/* Sample Meals */}
        {plan.meals && plan.meals.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Meals:</h4>
            <div className="space-y-1">
              {plan.meals.slice(0, 2).map((meal, index) => (
                <div key={index} className="text-xs text-gray-600">
                  <span className="font-medium">{meal.day}:</span> {meal.breakfast}, {meal.lunch}, {meal.dinner}
                </div>
              ))}
              {plan.meals.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{plan.meals.length - 2} more days...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1">
            <Eye className="h-4 w-4" />
            View Plan
          </button>
          {plan.groceryList && (
            <button className="btn-outline text-sm py-2 px-3 flex items-center gap-1">
              <ShoppingCart className="h-4 w-4" />
              Shop
            </button>
          )}
          <button className="btn-outline text-sm py-2 px-3">
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Meal Plan Modal Component
const CreateMealPlanModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      ...formData,
      status: 'planned',
      totalMeals: 21,
      meals: []
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Meal Plan</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Healthy Week Plan"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Describe your meal plan goals..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealPlans;
