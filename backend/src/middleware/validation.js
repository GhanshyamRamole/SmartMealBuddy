const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Confirm password is required'
      }),
    acceptTerms: Joi.boolean().valid(true).required()
      .messages({
        'any.only': 'You must accept the terms and conditions',
        'any.required': 'You must accept the terms and conditions'
      }),
    dietaryPreferences: Joi.array().items(
      Joi.string().valid('vegetarian', 'vegan', 'keto', 'gluten-free', 'dairy-free', 'nut-free', 'paleo')
    ).default([]),
    allergies: Joi.array().items(Joi.string()).default([]),
    goals: Joi.string().valid('weight-loss', 'muscle-gain', 'maintenance').optional(),
    dailyCalories: Joi.number().min(1000).max(5000).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    dietaryPreferences: Joi.array().items(
      Joi.string().valid('vegetarian', 'vegan', 'keto', 'gluten-free', 'dairy-free', 'nut-free', 'paleo')
    ).optional(),
    allergies: Joi.array().items(Joi.string()).optional(),
    goals: Joi.string().valid('weight-loss', 'muscle-gain', 'maintenance').optional(),
    dailyCalories: Joi.number().min(1000).max(5000).optional()
  }),

  createMealPlan: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    preferences: Joi.object({
      dietaryRestrictions: Joi.array().items(Joi.string()).default([]),
      excludeIngredients: Joi.array().items(Joi.string()).default([]),
      maxReadyTime: Joi.number().min(5).max(180).default(60),
      targetCalories: Joi.number().min(1000).max(5000).optional()
    }).default({})
  }),

  addPantryItem: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    quantity: Joi.number().min(0).required(),
    unit: Joi.string().min(1).max(20).required(),
    category: Joi.string().valid('vegetables', 'fruits', 'dairy', 'grains', 'protein', 'spices', 'other').optional(),
    expiryDate: Joi.date().iso().optional()
  }),

  updatePantryItem: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    quantity: Joi.number().min(0).optional(),
    unit: Joi.string().min(1).max(20).optional(),
    category: Joi.string().valid('vegetables', 'fruits', 'dairy', 'grains', 'protein', 'spices', 'other').optional(),
    expiryDate: Joi.date().iso().optional()
  }),

  createGroceryList: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    items: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().min(0).required(),
        unit: Joi.string().required(),
        category: Joi.string().optional(),
        purchased: Joi.boolean().default(false)
      })
    ).required()
  })
};

module.exports = { validateRequest, schemas };
