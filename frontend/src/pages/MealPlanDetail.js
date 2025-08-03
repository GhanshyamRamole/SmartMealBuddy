import React from 'react';
import { useParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';

const MealPlanDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="text-center py-12">
      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Meal Plan Detail</h1>
      <p className="text-gray-600">Meal Plan ID: {id}</p>
      <p className="text-gray-600">Detailed meal plan view coming soon!</p>
    </div>
  );
};

export default MealPlanDetail;
