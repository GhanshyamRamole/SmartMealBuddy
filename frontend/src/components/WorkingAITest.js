import React, { useState } from 'react';
import { Brain, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const WorkingAITest = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runComprehensiveTest = async () => {
    setLoading(true);
    const results = {
      authentication: { status: 'pending', message: '' },
      aiSuggestions: { status: 'pending', message: '' },
      quickBreakfast: { status: 'pending', message: '' },
      dailyPlan: { status: 'pending', message: '' }
    };

    try {
      // Test 1: Authentication
      const authResponse = await fetch('http://13.201.120.170:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        const token = authData.token;
        results.authentication = { status: 'success', message: 'Login successful' };

        // Test 2: AI Suggestions
        try {
          const suggestionsResponse = await fetch('http://13.201.120.170:5000/api/ai-meals/suggestions', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (suggestionsResponse.ok) {
            const suggestionsData = await suggestionsResponse.json();
            results.aiSuggestions = { 
              status: 'success', 
              message: `${suggestionsData.message} - Confidence: ${Math.round(suggestionsData.confidence * 100)}%`,
              data: suggestionsData
            };
          } else {
            results.aiSuggestions = { status: 'error', message: `HTTP ${suggestionsResponse.status}` };
          }
        } catch (err) {
          results.aiSuggestions = { status: 'error', message: err.message };
        }

        // Test 3: Quick Breakfast
        try {
          const breakfastResponse = await fetch('http://13.201.120.170:5000/api/ai-meals/quick/breakfast', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (breakfastResponse.ok) {
            const breakfastData = await breakfastResponse.json();
            results.quickBreakfast = { 
              status: 'success', 
              message: `${breakfastData.message} - Meal: ${breakfastData.suggestion.name}`,
              data: breakfastData
            };
          } else {
            results.quickBreakfast = { status: 'error', message: `HTTP ${breakfastResponse.status}` };
          }
        } catch (err) {
          results.quickBreakfast = { status: 'error', message: err.message };
        }

        // Test 4: Daily Plan
        try {
          const dailyResponse = await fetch('http://13.201.120.170:5000/api/ai-meals/daily-plan', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (dailyResponse.ok) {
            const dailyData = await dailyResponse.json();
            results.dailyPlan = { 
              status: 'success', 
              message: `${dailyData.message} - Total Calories: ${dailyData.dailyPlan.totalCalories}`,
              data: dailyData
            };
          } else {
            results.dailyPlan = { status: 'error', message: `HTTP ${dailyResponse.status}` };
          }
        } catch (err) {
          results.dailyPlan = { status: 'error', message: err.message };
        }

      } else {
        results.authentication = { status: 'error', message: `HTTP ${authResponse.status}` };
      }

    } catch (err) {
      results.authentication = { status: 'error', message: err.message };
    }

    setTestResults(results);
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'pending': return <Loader className="h-5 w-5 text-gray-400 animate-spin" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'pending': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-bold">AI System Comprehensive Test</h2>
      </div>
      
      <button
        onClick={runComprehensiveTest}
        disabled={loading}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 mb-6"
      >
        {loading ? 'Running Tests...' : 'Run Complete AI Test'}
      </button>

      {testResults && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Test Results:</h3>
          
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <h4 className="font-medium capitalize">
                    {testName.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-sm text-gray-600">{result.message}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Success Summary */}
          {Object.values(testResults).every(r => r.status === 'success') && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-green-900">🎉 All Tests Passed!</h3>
                  <p className="text-green-800">Your AI meal suggestion system is fully operational!</p>
                </div>
              </div>
            </div>
          )}

          {/* Sample Data Display */}
          {testResults.aiSuggestions?.data && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-blue-900 mb-2">Sample AI Suggestion:</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Breakfast:</strong> {testResults.aiSuggestions.data.suggestions.breakfast[0]?.name}</p>
                <p><strong>Calories:</strong> {testResults.aiSuggestions.data.suggestions.breakfast[0]?.calories}</p>
                <p><strong>Reasoning:</strong> {testResults.aiSuggestions.data.suggestions.breakfast[0]?.reasoning}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkingAITest;
