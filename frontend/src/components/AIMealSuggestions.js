import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Brain,
  Sparkles,
  Target,
  Clock,
  Users,
  ChefHat,
  Heart,
  Zap,
  TrendingUp,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Info,
  CheckCircle,
  AlertCircle,
  Loader,
  Calendar
} from 'lucide-react';

const AIMealSuggestions = ({ isOpen, onClose, mealType = null, preferences = {} }) => {
  const { user } = useSelector((state) => state.auth);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [nutritionalTargets, setNutritionalTargets] = useState(null);
  const [reasoning, setReasoning] = useState([]);
  const [confidence, setConfidence] = useState(0);
  const [activeTab, setActiveTab] = useState('suggestions');

  useEffect(() => {
    if (isOpen) {
      if (mealType) {
        getQuickSuggestion();
      } else {
        getComprehensiveSuggestions();
      }
    }
  }, [isOpen, mealType]);

  const getComprehensiveSuggestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai-meals/suggestions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
        setNutritionalTargets(data.nutritionalTargets);
        setReasoning(data.reasoning);
        setConfidence(data.confidence);
      }
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuickSuggestion = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ai-meals/quick/${mealType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions({ [mealType]: [data.suggestion] });
        setReasoning([data.reasoning]);
        setConfidence(data.confidence);
      }
    } catch (error) {
      console.error('Error fetching quick suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDailyPlan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai-meals/daily-plan?includeSnacks=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const dailyPlan = data.dailyPlan;
        setSuggestions({
          breakfast: [dailyPlan.meals.breakfast],
          lunch: [dailyPlan.meals.lunch],
          dinner: [dailyPlan.meals.dinner],
          snacks: dailyPlan.meals.snacks ? [dailyPlan.meals.snacks] : []
        });
        setReasoning(dailyPlan.reasoning);
      }
    } catch (error) {
      console.error('Error fetching daily plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (suggestionId, rating, feedback) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/ai-meals/feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          suggestionId,
          rating,
          feedback,
          mealType
        })
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const refreshSuggestions = () => {
    if (mealType) {
      getQuickSuggestion();
    } else {
      getComprehensiveSuggestions();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Meal Suggestions</h2>
                <p className="text-purple-100">
                  Personalized recommendations based on your dietary preferences and goals
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-3 py-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {Math.round(confidence * 100)}% Confidence
                </span>
              </div>
              <button
                onClick={refreshSuggestions}
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'suggestions'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ChefHat className="inline h-4 w-4 mr-2" />
              Meal Suggestions
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'analysis'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Target className="inline h-4 w-4 mr-2" />
              Nutritional Analysis
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'daily'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="inline h-4 w-4 mr-2" />
              Daily Plan
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Brain className="h-8 w-8 text-purple-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI is thinking...</h3>
              <p className="text-gray-600">Analyzing your preferences and generating personalized suggestions</p>
            </div>
          )}

          {!loading && activeTab === 'suggestions' && (
            <SuggestionsTab
              suggestions={suggestions}
              reasoning={reasoning}
              onSelectSuggestion={setSelectedSuggestion}
              onFeedback={submitFeedback}
            />
          )}

          {!loading && activeTab === 'analysis' && (
            <AnalysisTab
              nutritionalTargets={nutritionalTargets}
              reasoning={reasoning}
              user={user}
            />
          )}

          {!loading && activeTab === 'daily' && (
            <DailyPlanTab
              onGeneratePlan={getDailyPlan}
              suggestions={suggestions}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Suggestions Tab Component
const SuggestionsTab = ({ suggestions, reasoning, onSelectSuggestion, onFeedback }) => {
  if (!suggestions) {
    return (
      <div className="text-center py-8">
        <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No suggestions available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* AI Reasoning */}
      {reasoning && reasoning.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">AI Reasoning</h3>
              <div className="space-y-2">
                {reasoning.map((reason, index) => (
                  <p key={index} className="text-blue-800 text-sm">{reason}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal Suggestions */}
      {Object.entries(suggestions).map(([mealType, mealOptions]) => (
        <div key={mealType} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 capitalize flex items-center gap-2">
            {getMealIcon(mealType)}
            {mealType} Suggestions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mealOptions.map((meal, index) => (
              <MealSuggestionCard
                key={index}
                meal={meal}
                mealType={mealType}
                onSelect={onSelectSuggestion}
                onFeedback={onFeedback}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Analysis Tab Component
const AnalysisTab = ({ nutritionalTargets, reasoning, user }) => {
  return (
    <div className="space-y-8">
      {/* User Profile Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          Your Nutritional Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{user?.goals || 'Maintenance'}</div>
            <div className="text-sm text-gray-600">Health Goal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{user?.dietaryPreferences?.length || 0}</div>
            <div className="text-sm text-gray-600">Dietary Preferences</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{user?.dailyCalories || 2000}</div>
            <div className="text-sm text-gray-600">Daily Calories</div>
          </div>
        </div>
      </div>

      {/* Nutritional Targets */}
      {nutritionalTargets && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Daily Nutritional Targets
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{nutritionalTargets.calories}</div>
              <div className="text-sm text-red-800">Calories</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{nutritionalTargets.protein}g</div>
              <div className="text-sm text-blue-800">Protein</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{nutritionalTargets.carbs}g</div>
              <div className="text-sm text-green-800">Carbs</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{nutritionalTargets.fat}g</div>
              <div className="text-sm text-yellow-800">Fat</div>
            </div>
          </div>
        </div>
      )}

      {/* Meal Distribution */}
      {nutritionalTargets?.meals && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Recommended Meal Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(nutritionalTargets.meals).map(([meal, calories]) => (
              <div key={meal} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getMealIcon(meal)}
                  <span className="font-medium capitalize">{meal}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{calories} cal</div>
                  <div className="text-sm text-gray-600">
                    {Math.round((calories / nutritionalTargets.calories) * 100)}% of daily
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Daily Plan Tab Component
const DailyPlanTab = ({ onGeneratePlan, suggestions }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Generated Daily Meal Plan</h3>
        <p className="text-gray-600 mb-6">
          Get a complete day's worth of meals optimized for your goals and preferences
        </p>
        <button
          onClick={onGeneratePlan}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <Sparkles className="h-4 w-4" />
          Generate Today's Plan
        </button>
      </div>

      {suggestions && (
        <div className="space-y-6">
          {Object.entries(suggestions).map(([mealType, meals]) => (
            meals.length > 0 && (
              <div key={mealType} className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 capitalize flex items-center gap-2">
                  {getMealIcon(mealType)}
                  {mealType}
                </h4>
                <MealSuggestionCard meal={meals[0]} mealType={mealType} compact />
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

// Meal Suggestion Card Component
const MealSuggestionCard = ({ meal, mealType, onSelect, onFeedback, compact = false }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);

  const handleFeedback = (thumbsUp) => {
    const feedbackRating = thumbsUp ? 5 : 1;
    setRating(feedbackRating);
    if (onFeedback) {
      onFeedback(`${mealType}_${Date.now()}`, feedbackRating, thumbsUp ? 'positive' : 'negative');
    }
    setShowFeedback(false);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${compact ? 'border-l-4 border-l-purple-500' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{meal.name}</h4>
        {!compact && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleFeedback(true)}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Meal Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-gray-600">
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

        {/* Ingredients */}
        {meal.ingredients && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {meal.ingredients.slice(0, compact ? 3 : 6).map((ingredient, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {ingredient}
                </span>
              ))}
              {meal.ingredients.length > (compact ? 3 : 6) && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{meal.ingredients.length - (compact ? 3 : 6)} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Nutritional Info */}
        {(meal.protein || meal.carbs || meal.fat) && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            {meal.protein && (
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-semibold text-blue-600">{meal.protein}g</div>
                <div className="text-blue-800">Protein</div>
              </div>
            )}
            {meal.carbs && (
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-semibold text-green-600">{meal.carbs}g</div>
                <div className="text-green-800">Carbs</div>
              </div>
            )}
            {meal.fat && (
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="font-semibold text-yellow-600">{meal.fat}g</div>
                <div className="text-yellow-800">Fat</div>
              </div>
            )}
          </div>
        )}

        {/* AI Reasoning */}
        {meal.reasoning && (
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-800">{meal.reasoning}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!compact && (
          <button
            onClick={() => onSelect && onSelect(meal)}
            className="w-full btn-primary text-sm py-2"
          >
            Select This Meal
          </button>
        )}
      </div>
    </div>
  );
};

// Helper function to get meal icons
const getMealIcon = (mealType) => {
  const icons = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snacks: '🍎',
    snack: '🍎'
  };
  return <span className="text-lg">{icons[mealType] || '🍽️'}</span>;
};

export default AIMealSuggestions;
