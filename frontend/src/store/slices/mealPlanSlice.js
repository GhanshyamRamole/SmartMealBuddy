import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mealPlans: [],
  currentMealPlan: null,
  isLoading: false,
  error: null,
  isGenerating: false,
};

const mealPlanSlice = createSlice({
  name: 'mealPlans',
  initialState,
  reducers: {
    setMealPlans: (state, action) => {
      state.mealPlans = action.payload;
    },
    setCurrentMealPlan: (state, action) => {
      state.currentMealPlan = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setGenerating: (state, action) => {
      state.isGenerating = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setMealPlans,
  setCurrentMealPlan,
  setLoading,
  setGenerating,
  setError,
  clearError,
} = mealPlanSlice.actions;

export default mealPlanSlice.reducer;
