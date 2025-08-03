import React from 'react';
import { useParams } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const RecipeDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="text-center py-12">
      <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Recipe Detail</h1>
      <p className="text-gray-600">Recipe ID: {id}</p>
      <p className="text-gray-600">Detailed recipe view coming soon!</p>
    </div>
  );
};

export default RecipeDetail;
