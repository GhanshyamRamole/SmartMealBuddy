import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import recipeSlice from './slices/recipeSlice';
import mealPlanSlice from './slices/mealPlanSlice';
import groceryListSlice from './slices/groceryListSlice';
import pantrySlice from './slices/pantrySlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    recipes: recipeSlice,
    mealPlans: mealPlanSlice,
    groceryLists: groceryListSlice,
    pantry: pantrySlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
