import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  Calendar,
  Loader,
  Eye,
  BarChart3
} from 'lucide-react';

const Pantry = () => {
  const { user } = useSelector((state) => state.auth);
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterExpiry, setFilterExpiry] = useState('all');

  useEffect(() => {
    fetchPantryItems();
  }, []);

  const fetchPantryItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pantry', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPantryItems(data.pantryItems || []);
      } else {
        // Set mock data for demonstration
        setPantryItems([
          {
            id: 1,
            name: "Rice",
            quantity: 2,
            unit: "kg",
            category: "grains",
            expiryDate: "2025-12-31",
            addedDate: "2025-08-01",
            location: "Pantry Shelf 1",
            notes: "Basmati rice from local store"
          },
          {
            id: 2,
            name: "Milk",
            quantity: 1,
            unit: "liter",
            category: "dairy",
            expiryDate: "2025-08-05",
            addedDate: "2025-08-02",
            location: "Refrigerator",
            notes: "Organic whole milk"
          },
          {
            id: 3,
            name: "Apples",
            quantity: 8,
            unit: "pieces",
            category: "fruits",
            expiryDate: "2025-08-10",
            addedDate: "2025-08-01",
            location: "Fruit Bowl",
            notes: "Red delicious apples"
          },
          {
            id: 4,
            name: "Chicken Breast",
            quantity: 1,
            unit: "kg",
            category: "protein",
            expiryDate: "2025-08-06",
            addedDate: "2025-08-03",
            location: "Freezer",
            notes: "Fresh chicken from butcher"
          },
          {
            id: 5,
            name: "Olive Oil",
            quantity: 500,
            unit: "ml",
            category: "other",
            expiryDate: "2026-01-15",
            addedDate: "2025-07-20",
            location: "Kitchen Cabinet",
            notes: "Extra virgin olive oil"
          },
          {
            id: 6,
            name: "Bread",
            quantity: 1,
            unit: "loaf",
            category: "grains",
            expiryDate: "2025-08-04",
            addedDate: "2025-08-02",
            location: "Bread Box",
            notes: "Whole wheat bread"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching pantry items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPantryItem = async (itemData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pantry', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });

      if (response.ok) {
        const data = await response.json();
        setPantryItems([data.pantryItem, ...pantryItems]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding pantry item:', error);
    }
  };

  const deletePantryItem = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item from your pantry?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pantry/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPantryItems(pantryItems.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting pantry item:', error);
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return 'none';
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 3) return 'expiring';
    if (daysUntilExpiry <= 7) return 'warning';
    return 'good';
  };

  const getExpiryColor = (status) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800';
      case 'expiring': return 'bg-orange-100 text-orange-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'good': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = pantryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    let matchesExpiry = true;
    if (filterExpiry !== 'all') {
      const expiryStatus = getExpiryStatus(item.expiryDate);
      matchesExpiry = expiryStatus === filterExpiry;
    }
    
    return matchesSearch && matchesCategory && matchesExpiry;
  });

  const categories = ['vegetables', 'fruits', 'dairy', 'grains', 'protein', 'spices', 'other'];
  const expiryFilters = ['expired', 'expiring', 'warning', 'good'];

  const getStats = () => {
    const total = pantryItems.length;
    const expiring = pantryItems.filter(item => ['expired', 'expiring'].includes(getExpiryStatus(item.expiryDate))).length;
    const lowStock = pantryItems.filter(item => item.quantity <= 1).length;
    const categories = [...new Set(pantryItems.map(item => item.category))].length;
    
    return { total, expiring, lowStock, categories };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="h-8 w-8 text-orange-600" />
                Pantry Management
              </h1>
              <p className="text-gray-600 mt-1">
                Track your ingredients and never run out of essentials
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiring}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Filter className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search pantry items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={filterExpiry}
                onChange={(e) => setFilterExpiry(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Items</option>
                <option value="expired">Expired</option>
                <option value="expiring">Expiring Soon</option>
                <option value="warning">Expiring This Week</option>
                <option value="good">Fresh</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-orange-600" />
            <span className="ml-2 text-gray-600">Loading pantry items...</span>
          </div>
        )}

        {/* Pantry Items Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <PantryItemCard
                key={item.id}
                item={item}
                onDelete={deletePantryItem}
                getExpiryStatus={getExpiryStatus}
                getExpiryColor={getExpiryColor}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pantry items found</h3>
            <p className="text-gray-600 mb-4">
              Add items to your pantry to start tracking your ingredients.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add Your First Item
            </button>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddPantryItemModal
          onClose={() => setShowAddModal(false)}
          onAdd={addPantryItem}
        />
      )}
    </div>
  );
};

// Pantry Item Card Component
const PantryItemCard = ({ item, onDelete, getExpiryStatus, getExpiryColor }) => {
  const expiryStatus = getExpiryStatus(item.expiryDate);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);

  const getCategoryIcon = (category) => {
    const icons = {
      vegetables: '🥬',
      fruits: '🍎',
      dairy: '🥛',
      grains: '🌾',
      protein: '🥩',
      spices: '🧂',
      other: '📦'
    };
    return icons[category] || '📦';
  };

  const getQuantityColor = (quantity) => {
    if (quantity <= 1) return 'text-red-600';
    if (quantity <= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {getCategoryIcon(item.category)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {item.category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Edit item"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Quantity</span>
            <span className={`text-lg font-bold ${getQuantityColor(item.quantity)}`}>
              {item.quantity} {item.unit}
            </span>
          </div>
          {item.quantity <= 1 && (
            <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Low stock
            </div>
          )}
        </div>

        {/* Expiry Status */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Expiry</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExpiryColor(expiryStatus)}`}>
              {expiryStatus === 'expired' && '❌ Expired'}
              {expiryStatus === 'expiring' && '⚠️ Expiring Soon'}
              {expiryStatus === 'warning' && '⏰ This Week'}
              {expiryStatus === 'good' && '✅ Fresh'}
              {expiryStatus === 'none' && '📅 No Date'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {formatDate(item.expiryDate)}
            {daysUntilExpiry !== null && (
              <span className="ml-2">
                ({daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 
                  daysUntilExpiry === 0 ? 'Expires today' : 
                  `${Math.abs(daysUntilExpiry)} days overdue`})
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        {item.location && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Location</span>
              <span className="text-sm text-gray-900">{item.location}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 italic">
              "{item.notes}"
            </p>
          </div>
        )}

        {/* Added Date */}
        <div className="text-xs text-gray-500 border-t pt-3">
          Added {formatDate(item.addedDate)}
        </div>
      </div>
    </div>
  );
};

// Add Pantry Item Modal Component
const AddPantryItemModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'pieces',
    category: 'other',
    expiryDate: '',
    location: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      addedDate: new Date().toISOString().split('T')[0]
    });
  };

  const categories = [
    { value: 'vegetables', label: 'Vegetables', icon: '🥬' },
    { value: 'fruits', label: 'Fruits', icon: '🍎' },
    { value: 'dairy', label: 'Dairy', icon: '🥛' },
    { value: 'grains', label: 'Grains', icon: '🌾' },
    { value: 'protein', label: 'Protein', icon: '🥩' },
    { value: 'spices', label: 'Spices', icon: '🧂' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  const units = [
    'pieces', 'kg', 'grams', 'liters', 'ml', 'cups', 'tbsp', 'tsp', 
    'cans', 'bags', 'boxes', 'bottles', 'jars', 'packets'
  ];

  const commonLocations = [
    'Pantry Shelf 1', 'Pantry Shelf 2', 'Refrigerator', 'Freezer', 
    'Kitchen Cabinet', 'Spice Rack', 'Fruit Bowl', 'Bread Box'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add Pantry Item</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Rice, Milk, Apples"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Where is this stored?"
                list="locations"
              />
              <datalist id="locations">
                {commonLocations.map(location => (
                  <option key={location} value={location} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Pantry;
