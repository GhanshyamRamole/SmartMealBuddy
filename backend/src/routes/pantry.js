const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's pantry items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, expiring = false, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = { userId: req.user.id };

    // Filter by category
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // Filter expiring items (within 7 days)
    if (expiring === 'true') {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      whereClause.expiryDate = {
        lte: sevenDaysFromNow,
        gte: new Date()
      };
    }

    const pantryItems = await prisma.pantryItem.findMany({
      where: whereClause,
      orderBy: [
        { expiryDate: 'asc' },
        { name: 'asc' }
      ],
      skip: offset,
      take: parseInt(limit)
    });

    const totalCount = await prisma.pantryItem.count({
      where: whereClause
    });

    // Get category summary
    const categorySummary = await prisma.pantryItem.groupBy({
      by: ['category'],
      where: { userId: req.user.id },
      _count: {
        category: true
      }
    });

    res.json({
      message: 'Pantry items retrieved successfully',
      pantryItems,
      categorySummary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Pantry fetch error:', error);
    res.status(500).json({
      error: 'Pantry fetch failed',
      message: error.message
    });
  }
});

// Add pantry item
router.post('/', authenticateToken, validateRequest(schemas.addPantryItem), async (req, res) => {
  try {
    const { name, quantity, unit, category, expiryDate } = req.body;

    // Check if item already exists
    const existingItem = await prisma.pantryItem.findFirst({
      where: {
        userId: req.user.id,
        name: {
          equals: name,
          mode: 'insensitive'
        },
        unit
      }
    });

    if (existingItem) {
      // Update existing item quantity
      const updatedItem = await prisma.pantryItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          ...(expiryDate && { expiryDate: new Date(expiryDate) }),
          ...(category && { category })
        }
      });

      return res.json({
        message: 'Pantry item quantity updated',
        pantryItem: updatedItem
      });
    }

    // Create new pantry item
    const pantryItem = await prisma.pantryItem.create({
      data: {
        userId: req.user.id,
        name,
        quantity,
        unit,
        category: category || categorizeIngredient(name),
        ...(expiryDate && { expiryDate: new Date(expiryDate) })
      }
    });

    res.status(201).json({
      message: 'Pantry item added successfully',
      pantryItem
    });
  } catch (error) {
    console.error('Pantry item creation error:', error);
    res.status(500).json({
      error: 'Pantry item creation failed',
      message: error.message
    });
  }
});

// Get specific pantry item
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const pantryItem = await prisma.pantryItem.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!pantryItem) {
      return res.status(404).json({
        error: 'Pantry item not found',
        message: 'The requested pantry item could not be found'
      });
    }

    res.json({
      message: 'Pantry item retrieved successfully',
      pantryItem
    });
  } catch (error) {
    console.error('Pantry item fetch error:', error);
    res.status(500).json({
      error: 'Pantry item fetch failed',
      message: error.message
    });
  }
});

// Update pantry item
router.put('/:id', authenticateToken, validateRequest(schemas.updatePantryItem), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, unit, category, expiryDate } = req.body;

    // Verify pantry item belongs to user
    const existingItem = await prisma.pantryItem.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingItem) {
      return res.status(404).json({
        error: 'Pantry item not found',
        message: 'The requested pantry item could not be found'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (unit) updateData.unit = unit;
    if (category) updateData.category = category;
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);

    const updatedPantryItem = await prisma.pantryItem.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Pantry item updated successfully',
      pantryItem: updatedPantryItem
    });
  } catch (error) {
    console.error('Pantry item update error:', error);
    res.status(500).json({
      error: 'Pantry item update failed',
      message: error.message
    });
  }
});

// Delete pantry item
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const pantryItem = await prisma.pantryItem.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!pantryItem) {
      return res.status(404).json({
        error: 'Pantry item not found',
        message: 'The requested pantry item could not be found'
      });
    }

    await prisma.pantryItem.delete({
      where: { id }
    });

    res.json({
      message: 'Pantry item deleted successfully'
    });
  } catch (error) {
    console.error('Pantry item deletion error:', error);
    res.status(500).json({
      error: 'Pantry item deletion failed',
      message: error.message
    });
  }
});

// Bulk add pantry items
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Items array is required and must not be empty'
      });
    }

    const processedItems = items.map(item => ({
      userId: req.user.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category || categorizeIngredient(item.name),
      ...(item.expiryDate && { expiryDate: new Date(item.expiryDate) })
    }));

    const createdItems = await prisma.pantryItem.createMany({
      data: processedItems,
      skipDuplicates: true
    });

    res.status(201).json({
      message: 'Pantry items added successfully',
      count: createdItems.count
    });
  } catch (error) {
    console.error('Bulk pantry creation error:', error);
    res.status(500).json({
      error: 'Bulk pantry creation failed',
      message: error.message
    });
  }
});

// Get expiring items
router.get('/alerts/expiring', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + parseInt(days));

    const expiringItems = await prisma.pantryItem.findMany({
      where: {
        userId: req.user.id,
        expiryDate: {
          lte: alertDate,
          gte: new Date()
        }
      },
      orderBy: { expiryDate: 'asc' }
    });

    const expiredItems = await prisma.pantryItem.findMany({
      where: {
        userId: req.user.id,
        expiryDate: {
          lt: new Date()
        }
      },
      orderBy: { expiryDate: 'desc' }
    });

    res.json({
      message: 'Expiring items retrieved successfully',
      expiringItems,
      expiredItems,
      counts: {
        expiring: expiringItems.length,
        expired: expiredItems.length
      }
    });
  } catch (error) {
    console.error('Expiring items fetch error:', error);
    res.status(500).json({
      error: 'Expiring items fetch failed',
      message: error.message
    });
  }
});

// Use pantry item (reduce quantity)
router.patch('/:id/use', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        error: 'Invalid quantity',
        message: 'Quantity must be a positive number'
      });
    }

    const pantryItem = await prisma.pantryItem.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!pantryItem) {
      return res.status(404).json({
        error: 'Pantry item not found',
        message: 'The requested pantry item could not be found'
      });
    }

    const newQuantity = Math.max(0, pantryItem.quantity - quantity);

    if (newQuantity === 0) {
      // Delete item if quantity reaches 0
      await prisma.pantryItem.delete({
        where: { id }
      });

      return res.json({
        message: 'Pantry item used up and removed',
        pantryItem: null,
        usedQuantity: quantity
      });
    }

    const updatedPantryItem = await prisma.pantryItem.update({
      where: { id },
      data: { quantity: newQuantity }
    });

    res.json({
      message: 'Pantry item quantity updated',
      pantryItem: updatedPantryItem,
      usedQuantity: quantity
    });
  } catch (error) {
    console.error('Pantry item use error:', error);
    res.status(500).json({
      error: 'Pantry item use failed',
      message: error.message
    });
  }
});

// Get pantry statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const totalItems = await prisma.pantryItem.count({
      where: { userId: req.user.id }
    });

    const expiringItems = await prisma.pantryItem.count({
      where: {
        userId: req.user.id,
        expiryDate: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          gte: new Date()
        }
      }
    });

    const expiredItems = await prisma.pantryItem.count({
      where: {
        userId: req.user.id,
        expiryDate: {
          lt: new Date()
        }
      }
    });

    const categoryStats = await prisma.pantryItem.groupBy({
      by: ['category'],
      where: { userId: req.user.id },
      _count: {
        category: true
      },
      _sum: {
        quantity: true
      }
    });

    res.json({
      message: 'Pantry statistics retrieved successfully',
      stats: {
        totalItems,
        expiringItems,
        expiredItems,
        categoryBreakdown: categoryStats.map(stat => ({
          category: stat.category || 'other',
          itemCount: stat._count.category,
          totalQuantity: stat._sum.quantity || 0
        }))
      }
    });
  } catch (error) {
    console.error('Pantry stats error:', error);
    res.status(500).json({
      error: 'Pantry stats fetch failed',
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
