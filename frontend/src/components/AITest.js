import React, { useState } from 'react';
import { Brain } from 'lucide-react';

const AITest = () => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://13.201.120.170:5000/api/ai-meals/quick/breakfast', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSuggestions(data);
      
    } catch (err) {
      setError(err.message);
      console.error('AI Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-bold">AI System Test</h2>
      </div>
      
      <button
        onClick={testAI}
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Testing AI...' : 'Test AI Suggestions'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {suggestions && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800">Success!</h3>
          <p className="text-green-700">Message: {suggestions.message}</p>
          {suggestions.suggestion && (
            <div className="mt-2">
              <p><strong>Meal:</strong> {suggestions.suggestion.name}</p>
              <p><strong>Calories:</strong> {suggestions.suggestion.calories}</p>
              <p><strong>Prep Time:</strong> {suggestions.suggestion.prepTime} minutes</p>
              <p><strong>Reasoning:</strong> {suggestions.suggestion.reasoning}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AITest;
