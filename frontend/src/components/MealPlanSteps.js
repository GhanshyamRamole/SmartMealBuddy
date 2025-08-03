import React from 'react';
import {
  Users,
  Clock,
  Target,
  DollarSign,
  Heart,
  Star,
  ShoppingCart,
  ExternalLink,
  Package,
  Truck,
  CreditCard
} from 'lucide-react';

// Step 1: Plan Details
export const PlanDetailsStep = ({ planData, setPlanData }) => {
  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'keto', label: 'Keto', icon: '🥑' },
    { id: 'paleo', label: 'Paleo', icon: '🥩' },
    { id: 'gluten-free', label: 'Gluten Free', icon: '🌾' },
    { id: 'dairy-free', label: 'Dairy Free', icon: '🥛' }
  ];

  const budgetOptions = [
    { id: 'low', label: 'Budget Friendly', description: '$50-80/week', icon: '💰' },
    { id: 'medium', label: 'Moderate', description: '$80-120/week', icon: '💳' },
    { id: 'high', label: 'Premium', description: '$120+/week', icon: '💎' }
  ];

  const toggleDietaryPreference = (preference) => {
    setPlanData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter(p => p !== preference)
        : [...prev.dietaryPreferences, preference]
    }));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Let's Create Your Perfect Meal Plan</h3>
        <p className="text-gray-600">Tell us your preferences and we'll generate a personalized plan with automatic grocery list</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Details */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan Name
            </label>
            <input
              type="text"
              value={planData.name}
              onChange={(e) => setPlanData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Healthy Week Plan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={planData.startDate}
              onChange={(e) => setPlanData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Number of Servings
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPlanData(prev => ({ ...prev, servings: Math.max(1, prev.servings - 1) }))}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">{planData.servings}</span>
              <button
                onClick={() => setPlanData(prev => ({ ...prev, servings: prev.servings + 1 }))}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Plan Duration
            </label>
            <select
              value={planData.duration}
              onChange={(e) => setPlanData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={3}>3 Days</option>
              <option value={7}>1 Week</option>
              <option value={14}>2 Weeks</option>
              <option value={30}>1 Month</option>
            </select>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dietary Preferences
            </label>
            <div className="grid grid-cols-2 gap-3">
              {dietaryOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => toggleDietaryPreference(option.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    planData.dietaryPreferences.includes(option.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Target className="inline h-4 w-4 mr-1" />
              Budget Range
            </label>
            <div className="space-y-3">
              {budgetOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setPlanData(prev => ({ ...prev, budget: option.id }))}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    planData.budget === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{option.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                    {planData.budget === option.id && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 2: Meal Selection
export const MealSelectionStep = ({ planData, availableRecipes, selectedMeals, onMealSelect, loading }) => {
  const getDaysArray = () => {
    const days = [];
    const startDate = new Date(planData.startDate);
    
    for (let i = 0; i < planData.duration; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        name: date.toLocaleDateString('en-US', { weekday: 'long' }),
        shortName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    return days;
  };

  const getRecipesByType = (type) => {
    return availableRecipes.filter(recipe => recipe.type === type);
  };

  const days = getDaysArray();
  const mealTypes = ['breakfast', 'lunch', 'dinner'];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
        <p className="text-gray-600">Finding perfect recipes for your preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Meals</h3>
        <p className="text-gray-600">Select recipes for each meal. We've pre-filtered based on your preferences.</p>
      </div>

      <div className="space-y-8">
        {days.map(day => (
          <div key={day.date} className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {day.name} - {new Date(day.date).toLocaleDateString()}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mealTypes.map(mealType => (
                <div key={mealType} className="space-y-3">
                  <h5 className="font-medium text-gray-700 capitalize flex items-center gap-2">
                    {mealType === 'breakfast' && '🌅'}
                    {mealType === 'lunch' && '☀️'}
                    {mealType === 'dinner' && '🌙'}
                    {mealType}
                  </h5>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getRecipesByType(mealType).map(recipe => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        isSelected={selectedMeals[day.date]?.[mealType]?.id === recipe.id}
                        onSelect={() => onMealSelect(day.date, mealType, recipe)}
                        servings={planData.servings}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Recipe Card Component
const RecipeCard = ({ recipe, isSelected, onSelect, servings }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start space-x-3">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <h6 className="font-medium text-sm text-gray-900 truncate">{recipe.title}</h6>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {recipe.cookTime}m
            </span>
            <span className="text-xs text-gray-500 flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-400" />
              {recipe.rating}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {recipe.calories * servings} cal • {recipe.protein * servings}g protein
          </div>
        </div>
        {isSelected && (
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Step 3: Grocery List
export const GroceryListStep = ({ groceryList, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
        <p className="text-gray-600">Generating your personalized grocery list...</p>
      </div>
    );
  }

  if (!groceryList) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No grocery list generated yet.</p>
      </div>
    );
  }

  const groupedItems = groceryList.items.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const categoryIcons = {
    dairy: '🥛',
    protein: '🥩',
    grains: '🌾',
    fruits: '🍎',
    vegetables: '🥬',
    other: '📦'
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Grocery List</h3>
        <p className="text-gray-600">
          We've automatically generated your shopping list based on your meal selections
        </p>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{groceryList.totalItems}</div>
            <div className="text-sm text-blue-800">Total Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">${groceryList.estimatedTotal.toFixed(2)}</div>
            <div className="text-sm text-blue-800">Estimated Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{Object.keys(groupedItems).length}</div>
            <div className="text-sm text-blue-800">Categories</div>
          </div>
        </div>
      </div>

      {/* Grouped Items */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">{categoryIcons[category] || '📦'}</span>
              {category.charAt(0).toUpperCase() + category.slice(1)}
              <span className="text-sm text-gray-500">({items.length} items)</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <div className="text-sm text-gray-600">
                      {item.quantity} {item.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${item.estimatedPrice.toFixed(2)}</div>
                    <div className="text-xs text-green-600">
                      {Object.values(item.available).filter(Boolean).length} stores
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Step 4: Purchase Options
export const PurchaseOptionsStep = ({ groceryList }) => {
  if (!groceryList) return null;

  const handleStoreClick = (store) => {
    // In a real app, this would integrate with the store's API
    window.open(store.url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Store</h3>
        <p className="text-gray-600">
          Select where you'd like to purchase your groceries online
        </p>
      </div>

      {/* Store Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groceryList.onlineStores.map((store, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{store.logo}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{store.name}</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-600">{store.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <Truck className="h-4 w-4 mr-1" />
                  Delivery Time
                </span>
                <span className="font-medium">{store.deliveryTime}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  Min Order
                </span>
                <span className="font-medium">${store.minOrder}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Delivery Fee
                </span>
                <span className="font-medium">${store.deliveryFee}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Estimated Total:</span>
                <span className="text-lg font-bold text-green-600">
                  ${(groceryList.estimatedTotal + store.deliveryFee).toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => handleStoreClick(store)}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Shop at {store.name}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Options */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Additional Options</h4>
        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-xl">📱</div>
                <div>
                  <p className="font-medium text-gray-900">Export to Shopping App</p>
                  <p className="text-sm text-gray-600">Send list to your preferred shopping app</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          </button>
          
          <button className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-xl">📧</div>
                <div>
                  <p className="font-medium text-gray-900">Email Grocery List</p>
                  <p className="text-sm text-gray-600">Send a copy to your email</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          </button>
          
          <button className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-xl">🖨️</div>
                <div>
                  <p className="font-medium text-gray-900">Print List</p>
                  <p className="text-sm text-gray-600">Print for in-store shopping</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
