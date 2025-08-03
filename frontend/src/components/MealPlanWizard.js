import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChefHat,
  ShoppingCart,
  Users,
  Clock,
  Target,
  Zap,
  Check,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Star,
  Heart,
  Utensils,
  Package
} from 'lucide-react';

const MealPlanWizard = ({ onClose, onCreate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [planData, setPlanData] = useState({
    name: '',
    duration: 7,
    servings: 2,
    dietaryPreferences: [],
    excludeIngredients: [],
    budget: 'medium',
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    startDate: new Date().toISOString().split('T')[0]
  });
  const [selectedMeals, setSelectedMeals] = useState({});
  const [generatedGroceryList, setGeneratedGroceryList] = useState(null);
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Plan Details', icon: Calendar },
    { id: 2, title: 'Meal Selection', icon: ChefHat },
    { id: 3, title: 'Grocery List', icon: ShoppingCart },
    { id: 4, title: 'Purchase Options', icon: Package }
  ];

  useEffect(() => {
    if (currentStep === 2) {
      fetchRecipeRecommendations();
    }
  }, [currentStep, planData]);

  const fetchRecipeRecommendations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        diet: planData.dietaryPreferences.join(','),
        excludeIngredients: planData.excludeIngredients.join(','),
        number: 21 // 7 days * 3 meals
      });

      const response = await fetch(`/api/recipes/recommendations?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableRecipes(data.recipes || getMockRecipes());
      } else {
        setAvailableRecipes(getMockRecipes());
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setAvailableRecipes(getMockRecipes());
    } finally {
      setLoading(false);
    }
  };

  const getMockRecipes = () => [
    {
      id: 1, title: "Overnight Oats with Berries", type: "breakfast", 
      cookTime: 5, servings: 2, difficulty: "Easy", rating: 4.8,
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop",
      ingredients: ["oats", "milk", "berries", "honey", "chia seeds"],
      calories: 320, protein: 12, carbs: 45, fat: 8
    },
    {
      id: 2, title: "Avocado Toast with Egg", type: "breakfast",
      cookTime: 10, servings: 1, difficulty: "Easy", rating: 4.6,
      image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=300&h=200&fit=crop",
      ingredients: ["bread", "avocado", "eggs", "tomato", "salt", "pepper"],
      calories: 380, protein: 18, carbs: 25, fat: 22
    },
    {
      id: 3, title: "Greek Yogurt Parfait", type: "breakfast",
      cookTime: 5, servings: 1, difficulty: "Easy", rating: 4.7,
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop",
      ingredients: ["greek yogurt", "granola", "berries", "honey"],
      calories: 280, protein: 20, carbs: 35, fat: 6
    },
    {
      id: 4, title: "Quinoa Buddha Bowl", type: "lunch",
      cookTime: 25, servings: 2, difficulty: "Medium", rating: 4.9,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop",
      ingredients: ["quinoa", "chickpeas", "cucumber", "tomatoes", "feta", "olive oil"],
      calories: 450, protein: 18, carbs: 55, fat: 16
    },
    {
      id: 5, title: "Chicken Caesar Salad", type: "lunch",
      cookTime: 15, servings: 2, difficulty: "Easy", rating: 4.5,
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop",
      ingredients: ["chicken breast", "romaine lettuce", "parmesan", "croutons", "caesar dressing"],
      calories: 420, protein: 35, carbs: 15, fat: 25
    },
    {
      id: 6, title: "Vegetable Stir Fry", type: "lunch",
      cookTime: 20, servings: 2, difficulty: "Medium", rating: 4.4,
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop",
      ingredients: ["mixed vegetables", "tofu", "soy sauce", "ginger", "garlic", "rice"],
      calories: 380, protein: 15, carbs: 45, fat: 12
    },
    {
      id: 7, title: "Grilled Salmon with Vegetables", type: "dinner",
      cookTime: 30, servings: 2, difficulty: "Medium", rating: 4.8,
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop",
      ingredients: ["salmon fillet", "broccoli", "asparagus", "lemon", "olive oil", "herbs"],
      calories: 520, protein: 40, carbs: 20, fat: 28
    },
    {
      id: 8, title: "Pasta Primavera", type: "dinner",
      cookTime: 25, servings: 2, difficulty: "Medium", rating: 4.6,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop",
      ingredients: ["pasta", "zucchini", "bell peppers", "cherry tomatoes", "parmesan", "basil"],
      calories: 480, protein: 18, carbs: 65, fat: 16
    },
    {
      id: 9, title: "Chicken Curry with Rice", type: "dinner",
      cookTime: 35, servings: 2, difficulty: "Medium", rating: 4.7,
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop",
      ingredients: ["chicken thighs", "coconut milk", "curry powder", "onions", "rice", "cilantro"],
      calories: 580, protein: 32, carbs: 55, fat: 22
    }
  ];

  const generateGroceryList = async () => {
    setLoading(true);
    try {
      // Collect all ingredients from selected meals
      const allIngredients = {};
      
      Object.values(selectedMeals).flat().forEach(meal => {
        meal.ingredients.forEach(ingredient => {
          if (allIngredients[ingredient]) {
            allIngredients[ingredient].quantity += planData.servings;
          } else {
            allIngredients[ingredient] = {
              name: ingredient,
              quantity: planData.servings,
              unit: getIngredientUnit(ingredient),
              category: getIngredientCategory(ingredient),
              estimatedPrice: getEstimatedPrice(ingredient),
              available: getOnlineAvailability(ingredient)
            };
          }
        });
      });

      const groceryList = {
        name: `${planData.name} - Grocery List`,
        generatedFrom: planData.name,
        totalItems: Object.keys(allIngredients).length,
        estimatedTotal: Object.values(allIngredients).reduce((sum, item) => sum + item.estimatedPrice, 0),
        items: Object.values(allIngredients),
        onlineStores: getAvailableStores()
      };

      setGeneratedGroceryList(groceryList);
    } catch (error) {
      console.error('Error generating grocery list:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIngredientUnit = (ingredient) => {
    const units = {
      'milk': 'liters', 'eggs': 'pieces', 'bread': 'loaf', 'rice': 'kg',
      'chicken breast': 'kg', 'salmon fillet': 'kg', 'pasta': 'kg',
      'oats': 'kg', 'quinoa': 'kg', 'olive oil': 'ml', 'honey': 'ml',
      'berries': 'grams', 'avocado': 'pieces', 'tomatoes': 'kg',
      'cucumber': 'pieces', 'bell peppers': 'pieces', 'onions': 'kg'
    };
    return units[ingredient] || 'pieces';
  };

  const getIngredientCategory = (ingredient) => {
    const categories = {
      'milk': 'dairy', 'eggs': 'dairy', 'greek yogurt': 'dairy', 'feta': 'dairy', 'parmesan': 'dairy',
      'chicken breast': 'protein', 'salmon fillet': 'protein', 'tofu': 'protein', 'chicken thighs': 'protein',
      'bread': 'grains', 'rice': 'grains', 'pasta': 'grains', 'oats': 'grains', 'quinoa': 'grains',
      'berries': 'fruits', 'avocado': 'fruits', 'lemon': 'fruits',
      'tomatoes': 'vegetables', 'cucumber': 'vegetables', 'bell peppers': 'vegetables', 'broccoli': 'vegetables',
      'olive oil': 'other', 'honey': 'other', 'soy sauce': 'other'
    };
    return categories[ingredient] || 'other';
  };

  const getEstimatedPrice = (ingredient) => {
    const prices = {
      'milk': 3.50, 'eggs': 4.00, 'bread': 2.50, 'rice': 5.00,
      'chicken breast': 12.00, 'salmon fillet': 18.00, 'pasta': 3.00,
      'oats': 4.50, 'quinoa': 8.00, 'olive oil': 6.00, 'honey': 7.00,
      'berries': 6.50, 'avocado': 2.00, 'tomatoes': 4.00
    };
    return prices[ingredient] || 3.00;
  };

  const getOnlineAvailability = (ingredient) => {
    return {
      amazon: true,
      instacart: true,
      walmart: Math.random() > 0.2,
      target: Math.random() > 0.3
    };
  };

  const getAvailableStores = () => [
    {
      name: 'Amazon Fresh',
      logo: '🛒',
      deliveryTime: '2-4 hours',
      minOrder: 35,
      deliveryFee: 4.99,
      rating: 4.5,
      url: 'https://amazon.com/fresh'
    },
    {
      name: 'Instacart',
      logo: '🥕',
      deliveryTime: '1-3 hours',
      minOrder: 10,
      deliveryFee: 3.99,
      rating: 4.3,
      url: 'https://instacart.com'
    },
    {
      name: 'Walmart Grocery',
      logo: '🏪',
      deliveryTime: '3-5 hours',
      minOrder: 35,
      deliveryFee: 7.95,
      rating: 4.1,
      url: 'https://walmart.com/grocery'
    },
    {
      name: 'Target Same Day',
      logo: '🎯',
      deliveryTime: '2-6 hours',
      minOrder: 35,
      deliveryFee: 9.99,
      rating: 4.2,
      url: 'https://target.com/c/grocery'
    }
  ];

  const handleMealSelection = (day, mealType, recipe) => {
    setSelectedMeals(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: recipe
      }
    }));
  };

  const nextStep = () => {
    if (currentStep === 2) {
      generateGroceryList();
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleCreatePlan = async () => {
    const finalPlan = {
      ...planData,
      meals: selectedMeals,
      groceryList: generatedGroceryList,
      status: 'planned',
      createdAt: new Date().toISOString()
    };

    onCreate(finalPlan);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Create Smart Meal Plan</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {currentStep === 1 && <PlanDetailsStep planData={planData} setPlanData={setPlanData} />}
          {currentStep === 2 && (
            <MealSelectionStep 
              planData={planData}
              availableRecipes={availableRecipes}
              selectedMeals={selectedMeals}
              onMealSelect={handleMealSelection}
              loading={loading}
            />
          )}
          {currentStep === 3 && (
            <GroceryListStep 
              groceryList={generatedGroceryList}
              loading={loading}
            />
          )}
          {currentStep === 4 && (
            <PurchaseOptionsStep 
              groceryList={generatedGroceryList}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="btn-primary flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleCreatePlan}
              className="btn-primary flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Create Plan & Grocery List
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlanWizard;
