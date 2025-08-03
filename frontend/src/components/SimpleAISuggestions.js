import React, { useState, useEffect } from 'react';
import { Brain, X, Loader, Star, Clock, Zap } from 'lucide-react';

const SimpleAISuggestions = ({ isOpen, onClose }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAISuggestions();
    }
  }, [isOpen]);

  const fetchAISuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to get AI suggestions');
      }

      const response = await fetch('http://13.201.120.170:5000/api/ai-meals/suggestions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch suggestions: ${response.status}`);
      }

      const data = await response.json();
      setSuggestions(data);
      
    } catch (err) {
      setError(err.message);
      console.error('AI Suggestions Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">AI Meal Suggestions</h2>
                <p className="text-purple-100">Personalized recommendations just for you</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-12">
              <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI is thinking...</h3>
              <p className="text-gray-600">Generating personalized meal suggestions</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchAISuggestions}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {suggestions && !loading && !error && (
            <div className="space-y-8">
              {/* AI Reasoning */}
              {suggestions.reasoning && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Reasoning
                  </h3>
                  <div className="space-y-2">
                    {suggestions.reasoning.map((reason, index) => (
                      <p key={index} className="text-blue-800 text-sm">• {reason}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutritional Targets */}
              {suggestions.nutritionalTargets && (
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-3">Your Daily Targets</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {suggestions.nutritionalTargets.calories}
                      </div>
                      <div className="text-sm text-green-800">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {suggestions.nutritionalTargets.protein}g
                      </div>
                      <div className="text-sm text-blue-800">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {suggestions.nutritionalTargets.carbs}g
                      </div>
                      <div className="text-sm text-yellow-800">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {suggestions.nutritionalTargets.fat}g
                      </div>
                      <div className="text-sm text-red-800">Fat</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Meal Suggestions */}
              {suggestions.suggestions && (
                <div className="space-y-6">
                  {Object.entries(suggestions.suggestions).map(([mealType, meals]) => (
                    <div key={mealType} className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900 capitalize flex items-center gap-2">
                        {getMealIcon(mealType)}
                        {mealType} Suggestions
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {meals.map((meal, index) => (
                          <MealCard key={index} meal={meal} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Confidence Score */}
              {suggestions.confidence && (
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-purple-800">
                    <strong>AI Confidence:</strong> {Math.round(suggestions.confidence * 100)}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Meal Card Component
const MealCard = ({ meal }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <h4 className="font-semibold text-gray-900 mb-2">{meal.name}</h4>
      
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        {meal.calories && (
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {meal.calories} cal
          </span>
        )}
        {meal.prepTime && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {meal.prepTime} min
          </span>
        )}
        {meal.difficulty && (
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {meal.difficulty}
          </span>
        )}
      </div>

      {meal.ingredients && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Ingredients:</p>
          <div className="flex flex-wrap gap-1">
            {meal.ingredients.slice(0, 4).map((ingredient, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {ingredient}
              </span>
            ))}
            {meal.ingredients.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{meal.ingredients.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {meal.reasoning && (
        <div className="bg-purple-50 rounded-lg p-3 mb-3">
          <p className="text-sm text-purple-800 flex items-start gap-2">
            <Brain className="h-4 w-4 flex-shrink-0 mt-0.5" />
            {meal.reasoning}
          </p>
        </div>
      )}

      <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm">
        Select This Meal
      </button>
    </div>
  );
};

// Helper function to get meal icons
const getMealIcon = (mealType) => {
  const icons = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snacks: '🍎'
  };
  return <span className="text-lg">{icons[mealType] || '🍽️'}</span>;
};

export default SimpleAISuggestions;
