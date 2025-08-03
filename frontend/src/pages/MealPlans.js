import React from 'react';
import { Calendar } from 'lucide-react';

const MealPlans = () => {
  return (
    <div className="text-center py-12">
      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Meal Plans</h1>
      <p className="text-gray-600">Meal planning functionality coming soon!</p>
    </div>
  );
};

export default MealPlans;
