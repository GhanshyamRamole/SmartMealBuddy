const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Generate grocery list from meal plan
router.post('/generate/:mealPlanId', authenticateToken, async (req, res) => {
  try {
    const { mealPlanId } = req.params;
    const { name, excludePantryItems = true } = req.body;

    // Verify meal plan belongs to user
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: mealPlanId,
        userId: req.user.id
      },
      include: {
        recipes: {
          include: {
            recipe: true
          }
        }
      }
    });

    if (!mealPlan) {
      return res.status(404).json({
        error: 'Meal plan not found',
        message: 'The requested meal plan could not be found'
      });
    }

    // Get user's pantry items if excluding them
    let pantryItems = [];
    if (excludePantryItems) {
      pantryItems = await prisma.pantryItem.findMany({
        where: { userId: req.user.id },
        select: { name: true, quantity: true, unit: true }
      });
    }

    // Aggregate ingredients from all recipes
    const ingredientMap = new Map();

    mealPlan.recipes.forEach(mealPlanRecipe => {
      const recipe = mealPlanRecipe.recipe;
      const servingMultiplier = mealPlanRecipe.servings / (recipe.servings || 1);

      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ingredient => {
          const key = ingredient.name.toLowerCase();
          const amount = (ingredient.amount || 0) * servingMultiplier;
          const unit = ingredient.unit || 'piece';

          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key);
            // If same unit, add amounts; otherwise, keep separate entries
            if (existing.unit === unit) {
              existing.quantity += amount;
            } else {
              // Create a new entry with different unit
              const newKey = `${key}_${unit}`;
              ingredientMap.set(newKey, {
                name: ingredient.name,
                quantity: amount,
                unit: unit,
                category: categorizeIngredient(ingredient.name),
                purchased: false
              });
            }
          } else {
            ingredientMap.set(key, {
              name: ingredient.name,
              quantity: amount,
              unit: unit,
              category: categorizeIngredient(ingredient.name),
              purchased: false
            });
          }
        });
      }
    });

    // Convert map to array and filter out pantry items
    let groceryItems = Array.from(ingredientMap.values());

    if (excludePantryItems && pantryItems.length > 0) {
      groceryItems = groceryItems.filter(item => {
        const pantryItem = pantryItems.find(p => 
          p.name.toLowerCase() === item.name.toLowerCase()
        );
        
        if (pantryItem) {
          // If we have enough in pantry, exclude from grocery list
          // This is a simplified check - in reality, you'd want to consider units
          return pantryItem.quantity < item.quantity;
        }
        
        return true;
      });
    }

    // Round quantities
    groceryItems = groceryItems.map(item => ({
      ...item,
      quantity: Math.round(item.quantity * 100) / 100
    }));

    // Create grocery list
    const groceryList = await prisma.groceryList.create({
      data: {
        userId: req.user.id,
        name: name || `Grocery List for ${mealPlan.name}`,
        items: groceryItems,
        status: 'active'
      }
    });

    res.status(201).json({
      message: 'Grocery list generated successfully',
      groceryList,
      itemCount: groceryItems.length,
      excludedPantryItems: excludePantryItems ? pantryItems.length : 0
    });
  } catch (error) {
    console.error('Grocery list generation error:', error);
    res.status(500).json({
      error: 'Grocery list generation failed',
      message: error.message
    });
  }
});

// Create custom grocery list
router.post('/', authenticateToken, validateRequest(schemas.createGroceryList), async (req, res) => {
  try {
    const { name, items } = req.body;

    // Categorize items and ensure proper structure
    const processedItems = items.map(item => ({
      ...item,
      category: item.category || categorizeIngredient(item.name),
      purchased: item.purchased || false
    }));

    const groceryList = await prisma.groceryList.create({
      data: {
        userId: req.user.id,
        name,
        items: processedItems,
        status: 'active'
      }
    });

    res.status(201).json({
      message: 'Grocery list created successfully',
      groceryList
    });
  } catch (error) {
    console.error('Grocery list creation error:', error);
    res.status(500).json({
      error: 'Grocery list creation failed',
      message: error.message
    });
  }
});

// Get user's grocery lists
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = { userId: req.user.id };
    if (status !== 'all') {
      whereClause.status = status;
    }

    const groceryLists = await prisma.groceryList.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: parseInt(limit)
    });

    const totalCount = await prisma.groceryList.count({
      where: whereClause
    });

    res.json({
      message: 'Grocery lists retrieved successfully',
      groceryLists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Grocery lists fetch error:', error);
    res.status(500).json({
      error: 'Grocery lists fetch failed',
      message: error.message
    });
  }
});

// Get specific grocery list
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const groceryList = await prisma.groceryList.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!groceryList) {
      return res.status(404).json({
        error: 'Grocery list not found',
        message: 'The requested grocery list could not be found'
      });
    }

    res.json({
      message: 'Grocery list retrieved successfully',
      groceryList
    });
  } catch (error) {
    console.error('Grocery list fetch error:', error);
    res.status(500).json({
      error: 'Grocery list fetch failed',
      message: error.message
    });
  }
});

// Update grocery list
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, items, status } = req.body;

    // Verify grocery list belongs to user
    const existingList = await prisma.groceryList.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingList) {
      return res.status(404).json({
        error: 'Grocery list not found',
        message: 'The requested grocery list could not be found'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (items) updateData.items = items;
    if (status) updateData.status = status;

    const updatedGroceryList = await prisma.groceryList.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Grocery list updated successfully',
      groceryList: updatedGroceryList
    });
  } catch (error) {
    console.error('Grocery list update error:', error);
    res.status(500).json({
      error: 'Grocery list update failed',
      message: error.message
    });
  }
});

// Mark item as purchased/unpurchased
router.patch('/:id/items/:itemIndex', authenticateToken, async (req, res) => {
  try {
    const { id, itemIndex } = req.params;
    const { purchased } = req.body;

    const groceryList = await prisma.groceryList.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!groceryList) {
      return res.status(404).json({
        error: 'Grocery list not found',
        message: 'The requested grocery list could not be found'
      });
    }

    const items = [...groceryList.items];
    const index = parseInt(itemIndex);

    if (index < 0 || index >= items.length) {
      return res.status(400).json({
        error: 'Invalid item index',
        message: 'The specified item index is out of range'
      });
    }

    items[index].purchased = purchased;

    const updatedGroceryList = await prisma.groceryList.update({
      where: { id },
      data: { items }
    });

    res.json({
      message: 'Item status updated successfully',
      groceryList: updatedGroceryList
    });
  } catch (error) {
    console.error('Item update error:', error);
    res.status(500).json({
      error: 'Item update failed',
      message: error.message
    });
  }
});

// Delete grocery list
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const groceryList = await prisma.groceryList.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!groceryList) {
      return res.status(404).json({
        error: 'Grocery list not found',
        message: 'The requested grocery list could not be found'
      });
    }

    await prisma.groceryList.delete({
      where: { id }
    });

    res.json({
      message: 'Grocery list deleted successfully'
    });
  } catch (error) {
    console.error('Grocery list deletion error:', error);
    res.status(500).json({
      error: 'Grocery list deletion failed',
      message: error.message
    });
  }
});

// Get grocery list summary (categories, total items, etc.)
router.get('/:id/summary', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const groceryList = await prisma.groceryList.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!groceryList) {
      return res.status(404).json({
        error: 'Grocery list not found',
        message: 'The requested grocery list could not be found'
      });
    }

    const items = groceryList.items || [];
    const summary = {
      totalItems: items.length,
      purchasedItems: items.filter(item => item.purchased).length,
      categories: {}
    };

    // Group by categories
    items.forEach(item => {
      const category = item.category || 'other';
      if (!summary.categories[category]) {
        summary.categories[category] = {
          total: 0,
          purchased: 0,
          items: []
        };
      }
      summary.categories[category].total++;
      if (item.purchased) {
        summary.categories[category].purchased++;
      }
      summary.categories[category].items.push(item);
    });

    summary.completionPercentage = summary.totalItems > 0 
      ? Math.round((summary.purchasedItems / summary.totalItems) * 100)
      : 0;

    res.json({
      message: 'Grocery list summary retrieved successfully',
      summary
    });
  } catch (error) {
    console.error('Grocery list summary error:', error);
    res.status(500).json({
      error: 'Grocery list summary failed',
      message: error.message
    });
  }
});

// Helper function to categorize ingredients
function categorizeIngredient(ingredientName) {
  const name = ingredientName.toLowerCase();
  
  const categories = {
    vegetables: ['tomato', 'onion', 'garlic', 'carrot', 'potato', 'bell pepper', 'spinach', 'lettuce', 'cucumber', 'broccoli', 'cauliflower', 'celery', 'mushroom'],
    fruits: ['apple', 'banana', 'orange', 'lemon', 'lime', 'berry', 'grape', 'avocado'],
    dairy: ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'egg'],
    protein: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'tofu', 'beans', 'lentils'],
    grains: ['rice', 'pasta', 'bread', 'flour', 'oats', 'quinoa', 'barley'],
    spices: ['salt', 'pepper', 'oregano', 'basil', 'thyme', 'cumin', 'paprika', 'cinnamon'],
    pantry: ['oil', 'vinegar', 'sugar', 'honey', 'stock', 'broth', 'sauce']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return category;
    }
  }

  return 'other';
}

module.exports = router;
