import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  ChefHat,
  Search,
  Filter,
  Clock,
  Users,
  Heart,
  Star,
  Plus,
  BookOpen,
  Utensils,
  Loader
} from 'lucide-react';

const Recipes = () => {
  const { user } = useSelector((state) => state.auth);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [maxTime, setMaxTime] = useState(60);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // First get user's saved recipes
      const savedResponse = await fetch('/api/recipes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        setRecipes(savedData.recipes || []);
      }
      
      // If no saved recipes, get some suggestions
      if (recipes.length === 0) {
        const suggestionsResponse = await fetch('/api/recipes/random/suggestions?number=12', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (suggestionsResponse.ok) {
          const suggestionsData = await suggestionsResponse.json();
          setRecipes(suggestionsData.recipes || []);
        }
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      // Set some mock recipes for demonstration
      setRecipes([
        {
          id: 1,
          title: "Mediterranean Quinoa Bowl",
          readyInMinutes: 25,
          servings: 4,
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop",
          summary: "A healthy and delicious quinoa bowl with Mediterranean flavors.",
          healthScore: 85,
          vegetarian: true,
          vegan: true,
          glutenFree: true
        },
        {
          id: 2,
          title: "Grilled Chicken with Herbs",
          readyInMinutes: 30,
          servings: 2,
          image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=200&fit=crop",
          summary: "Perfectly grilled chicken breast with fresh herbs and spices.",
          healthScore: 78,
          vegetarian: false,
          vegan: false,
          glutenFree: true
        },
        {
          id: 3,
          title: "Vegetable Stir Fry",
          readyInMinutes: 15,
          servings: 3,
          image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop",
          summary: "Quick and healthy vegetable stir fry with Asian flavors.",
          healthScore: 92,
          vegetarian: true,
          vegan: true,
          glutenFree: false
        },
        {
          id: 4,
          title: "Salmon with Lemon",
          readyInMinutes: 20,
          servings: 2,
          image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop",
          summary: "Fresh salmon fillet with lemon and dill seasoning.",
          healthScore: 88,
          vegetarian: false,
          vegan: false,
          glutenFree: true
        },
        {
          id: 5,
          title: "Pasta Primavera",
          readyInMinutes: 25,
          servings: 4,
          image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop",
          summary: "Colorful pasta with fresh seasonal vegetables.",
          healthScore: 75,
          vegetarian: true,
          vegan: false,
          glutenFree: false
        },
        {
          id: 6,
          title: "Greek Salad",
          readyInMinutes: 10,
          servings: 2,
          image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=200&fit=crop",
          summary: "Traditional Greek salad with feta cheese and olives.",
          healthScore: 95,
          vegetarian: true,
          vegan: false,
          glutenFree: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const searchRecipes = async () => {
    if (!searchQuery.trim()) {
      fetchRecipes();
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        query: searchQuery,
        diet: selectedDiet,
        maxReadyTime: maxTime,
        number: 12
      });

      const response = await fetch(`/api/recipes/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchRecipes();
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    if (searchQuery && !recipe.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedDiet === 'vegetarian' && !recipe.vegetarian) {
      return false;
    }
    if (selectedDiet === 'vegan' && !recipe.vegan) {
      return false;
    }
    if (recipe.readyInMinutes > maxTime) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ChefHat className="h-8 w-8 text-green-600" />
                Recipe Collection
              </h1>
              <p className="text-gray-600 mt-1">
                Discover and save delicious recipes for your meal planning
              </p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Recipe
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            {/* Search Button */}
            <button
              onClick={searchRecipes}
              className="btn-primary flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diet Type
                  </label>
                  <select
                    value={selectedDiet}
                    onChange={(e) => setSelectedDiet(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Diets</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="glutenFree">Gluten Free</option>
                    <option value="keto">Keto</option>
                    <option value="paleo">Paleo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Cooking Time
                  </label>
                  <select
                    value={maxTime}
                    onChange={(e) => setMaxTime(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={999}>Any time</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDiet('');
                      setMaxTime(60);
                      fetchRecipes();
                    }}
                    className="btn-outline w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Found ${filteredRecipes.length} recipes`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading recipes...</span>
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse our suggestions.
            </p>
            <button
              onClick={fetchRecipes}
              className="btn-primary"
            >
              Browse All Recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Recipe Card Component
const RecipeCard = ({ recipe }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = isFavorite ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/recipes/${recipe.id}/favorite`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getDietaryBadges = () => {
    const badges = [];
    if (recipe.vegetarian) badges.push({ label: 'Vegetarian', color: 'bg-green-100 text-green-800' });
    if (recipe.vegan) badges.push({ label: 'Vegan', color: 'bg-green-100 text-green-800' });
    if (recipe.glutenFree) badges.push({ label: 'Gluten Free', color: 'bg-blue-100 text-blue-800' });
    return badges;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Recipe Image */}
      <div className="relative h-48 bg-gray-200">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'
            }`}
          />
        </button>

        {/* Health Score */}
        {recipe.healthScore && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {recipe.healthScore}% Healthy
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        
        {recipe.summary && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {recipe.summary.replace(/<[^>]*>/g, '')}
          </p>
        )}

        {/* Recipe Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.readyInMinutes || 30} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings || 2} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{(Math.random() * 2 + 3).toFixed(1)}</span>
          </div>
        </div>

        {/* Dietary Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {getDietaryBadges().map((badge, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 btn-primary text-sm py-2">
            View Recipe
          </button>
          <button className="btn-outline text-sm py-2 px-3">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recipes;
