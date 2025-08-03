import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  groceryLists: [],
  currentGroceryList: null,
  isLoading: false,
  error: null,
};

const groceryListSlice = createSlice({
  name: 'groceryLists',
  initialState,
  reducers: {
    setGroceryLists: (state, action) => {
      state.groceryLists = action.payload;
    },
    setCurrentGroceryList: (state, action) => {
      state.currentGroceryList = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
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
  setGroceryLists,
  setCurrentGroceryList,
  setLoading,
  setError,
  clearError,
} = groceryListSlice.actions;

export default groceryListSlice.reducer;
