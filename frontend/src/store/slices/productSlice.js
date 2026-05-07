import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await API.get(`/products?${query}`);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try { const res = await API.get(`/products/${id}`); return res.data.product; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchFeatured = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try { const res = await API.get('/products/featured'); return res.data.products; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchCategories = createAsyncThunk('products/categories', async (_, { rejectWithValue }) => {
  try { const res = await API.get('/products/categories'); return res.data.categories; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [], product: null, featured: [], categories: [],
    pagination: null, loading: false, error: null,
  },
  reducers: { clearProduct: (state) => { state.product = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProduct.pending, (state) => { state.loading = true; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.loading = false; state.product = action.payload; })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeatured.fulfilled, (state, action) => { state.featured = action.payload; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload; });
  },
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;
