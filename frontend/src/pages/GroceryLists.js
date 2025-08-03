import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  Download,
  Share,
  Loader,
  CheckCircle,
  Circle
} from 'lucide-react';

const GroceryLists = () => {
  const { user } = useSelector((state) => state.auth);
  const [groceryLists, setGroceryLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchGroceryLists();
  }, []);

  const fetchGroceryLists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/grocery-lists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroceryLists(data.groceryLists || []);
      } else {
        // Set mock data for demonstration
        setGroceryLists([
          {
            id: 1,
            name: "Weekly Shopping",
            status: "active",
            totalItems: 12,
            completedItems: 8,
            createdAt: "2025-08-01T10:00:00Z",
            items: [
              { id: 1, name: "Milk", quantity: 2, unit: "liters", completed: true, category: "dairy" },
              { id: 2, name: "Bread", quantity: 1, unit: "loaf", completed: true, category: "grains" },
              { id: 3, name: "Apples", quantity: 6, unit: "pieces", completed: false, category: "fruits" },
              { id: 4, name: "Chicken Breast", quantity: 1, unit: "kg", completed: false, category: "protein" },
              { id: 5, name: "Rice", quantity: 2, unit: "kg", completed: true, category: "grains" }
            ]
          },
          {
            id: 2,
            name: "Party Supplies",
            status: "completed",
            totalItems: 8,
            completedItems: 8,
            createdAt: "2025-07-28T14:30:00Z",
            items: [
              { id: 6, name: "Chips", quantity: 3, unit: "bags", completed: true, category: "snacks" },
              { id: 7, name: "Soda", quantity: 6, unit: "cans", completed: true, category: "beverages" },
              { id: 8, name: "Ice Cream", quantity: 2, unit: "tubs", completed: true, category: "dairy" }
            ]
          },
          {
            id: 3,
            name: "Healthy Meal Prep",
            status: "pending",
            totalItems: 15,
            completedItems: 0,
            createdAt: "2025-08-03T09:15:00Z",
            items: [
              { id: 9, name: "Quinoa", quantity: 1, unit: "kg", completed: false, category: "grains" },
              { id: 10, name: "Salmon", quantity: 4, unit: "fillets", completed: false, category: "protein" },
              { id: 11, name: "Broccoli", quantity: 2, unit: "heads", completed: false, category: "vegetables" }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching grocery lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroceryList = async (listData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/grocery-lists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listData)
      });

      if (response.ok) {
        const data = await response.json();
        setGroceryLists([data.groceryList, ...groceryLists]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating grocery list:', error);
    }
  };

  const deleteGroceryList = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grocery list?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/grocery-lists/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setGroceryLists(groceryLists.filter(list => list.id !== id));
      }
    } catch (error) {
      console.error('Error deleting grocery list:', error);
    }
  };

  const toggleItemComplete = async (listId, itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/grocery-lists/${listId}/items/${itemId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setGroceryLists(groceryLists.map(list => {
          if (list.id === listId) {
            const updatedItems = list.items.map(item => {
              if (item.id === itemId) {
                return { ...item, completed: !item.completed };
              }
              return item;
            });
            const completedCount = updatedItems.filter(item => item.completed).length;
            return {
              ...list,
              items: updatedItems,
              completedItems: completedCount,
              status: completedCount === list.totalItems ? 'completed' : 'active'
            };
          }
          return list;
        }));
      }
    } catch (error) {
      console.error('Error toggling item:', error);
      // Optimistic update for demo
      setGroceryLists(groceryLists.map(list => {
        if (list.id === listId) {
          const updatedItems = list.items.map(item => {
            if (item.id === itemId) {
              return { ...item, completed: !item.completed };
            }
            return item;
          });
          const completedCount = updatedItems.filter(item => item.completed).length;
          return {
            ...list,
            items: updatedItems,
            completedItems: completedCount,
            status: completedCount === list.totalItems ? 'completed' : 'active'
          };
        }
        return list;
      }));
    }
  };

  const filteredLists = groceryLists.filter(list => {
    const matchesSearch = list.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || list.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🔵';
      case 'completed': return '✅';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-purple-600" />
                Grocery Lists
              </h1>
              <p className="text-gray-600 mt-1">
                Organize your shopping and never forget an item
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New List
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search grocery lists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Lists</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Lists</p>
                <p className="text-2xl font-bold text-gray-900">{groceryLists.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🔵</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {groceryLists.filter(l => l.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {groceryLists.filter(l => l.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {groceryLists.filter(l => l.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading grocery lists...</span>
          </div>
        )}

        {/* Grocery Lists Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLists.map((list) => (
              <GroceryListCard
                key={list.id}
                list={list}
                onDelete={deleteGroceryList}
                onToggleItem={toggleItemComplete}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredLists.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No grocery lists found</h3>
            <p className="text-gray-600 mb-4">
              Create your first grocery list to start organizing your shopping.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First List
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateGroceryListModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createGroceryList}
        />
      )}
    </div>
  );
};

// Grocery List Card Component
const GroceryListCard = ({ list, onDelete, onToggleItem }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🔵';
      case 'completed': return '✅';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  const progressPercentage = list.totalItems > 0 ? (list.completedItems / list.totalItems) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {list.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(list.status)}`}>
                <span className="mr-1">{getStatusIcon(list.status)}</span>
                {list.status.charAt(0).toUpperCase() + list.status.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                Created {formatDate(list.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Share list"
            >
              <Share className="h-4 w-4" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Download list"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(list.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Delete list"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{list.completedItems} of {list.totalItems} items completed</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Items Preview */}
        <div className="mb-4">
          <div className="space-y-2">
            {list.items.slice(0, expanded ? list.items.length : 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <button
                  onClick={() => onToggleItem(list.id, item.id)}
                  className="flex-shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <span className="text-xs text-gray-400 capitalize">
                  {item.category}
                </span>
              </div>
            ))}
          </div>

          {list.items.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-purple-600 hover:text-purple-800 mt-2"
            >
              {expanded ? 'Show less' : `Show ${list.items.length - 3} more items`}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 btn-primary text-sm py-2">
            Start Shopping
          </button>
          <button className="btn-outline text-sm py-2 px-3">
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Grocery List Modal Component
const CreateGroceryListModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    items: [{ name: '', quantity: 1, unit: 'pieces', category: 'other' }]
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, unit: 'pieces', category: 'other' }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = formData.items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = formData.items.filter(item => item.name.trim());
    if (validItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    onCreate({
      name: formData.name,
      items: validItems.map((item, index) => ({
        ...item,
        id: index + 1,
        completed: false
      })),
      status: 'pending',
      totalItems: validItems.length,
      completedItems: 0
    });
  };

  const categories = [
    'vegetables', 'fruits', 'dairy', 'grains', 'protein', 'spices', 'beverages', 'snacks', 'other'
  ];

  const units = ['pieces', 'kg', 'grams', 'liters', 'ml', 'cups', 'tbsp', 'tsp', 'cans', 'bags', 'boxes'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Grocery List</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                List Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Weekly Shopping"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items
              </label>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Item name"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="w-24">
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-28">
                      <select
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-2 text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
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
                Create List
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroceryLists;
