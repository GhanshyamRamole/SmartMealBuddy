import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pantryItems: [],
  expiringItems: [],
  isLoading: false,
  error: null,
  stats: {
    totalItems: 0,
    expiringCount: 0,
    categoryBreakdown: [],
  },
};

const pantrySlice = createSlice({
  name: 'pantry',
  initialState,
  reducers: {
    setPantryItems: (state, action) => {
      state.pantryItems = action.payload;
    },
    setExpiringItems: (state, action) => {
      state.expiringItems = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setPantryItems,
  setExpiringItems,
  setLoading,
  setError,
  setStats,
  clearError,
} = pantrySlice.actions;

export default pantrySlice.reducer;
