import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  recipes: [],
  currentRecipe: null,
  isLoading: false,
  error: null,
  filters: {
    query: '',
    diet: '',
    maxReadyTime: 60,
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
  },
};

const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setRecipes: (state, action) => {
      state.recipes = action.payload;
    },
    setCurrentRecipe: (state, action) => {
      state.currentRecipe = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setRecipes,
  setCurrentRecipe,
  setLoading,
  setError,
  setFilters,
  setPagination,
  clearError,
} = recipeSlice.actions;

export default recipeSlice.reducer;
