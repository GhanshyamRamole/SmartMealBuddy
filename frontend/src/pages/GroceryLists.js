import React from 'react';
import { ShoppingCart } from 'lucide-react';

const GroceryLists = () => {
  return (
    <div className="text-center py-12">
      <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Grocery Lists</h1>
      <p className="text-gray-600">Grocery list management coming soon!</p>
    </div>
  );
};

export default GroceryLists;
