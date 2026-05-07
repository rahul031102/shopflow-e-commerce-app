import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { const res = await API.get('/cart'); return res.data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity = 1 }, { rejectWithValue }) => {
  try { const res = await API.post('/cart/add', { productId, quantity }); return res.data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { rejectWithValue }) => {
  try { const res = await API.put('/cart/update', { productId, quantity }); return res.data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => {
  try { const res = await API.delete(`/cart/item/${productId}`); return res.data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try { await API.delete('/cart/clear'); return null; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const applyCoupon = createAsyncThunk('cart/coupon', async (couponCode, { rejectWithValue }) => {
  try { const res = await API.post('/cart/coupon', { couponCode }); return res.data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { cart: null, loading: false, error: null },
  reducers: { clearCartError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    const setCart = (state, action) => { state.loading = false; state.cart = action.payload; };
    const setPending = (state) => { state.loading = true; state.error = null; };
    const setError = (state, action) => { state.loading = false; state.error = action.payload; };

    [fetchCart, addToCart, updateCartItem, removeFromCart, applyCoupon].forEach((thunk) => {
      builder.addCase(thunk.pending, setPending).addCase(thunk.fulfilled, setCart).addCase(thunk.rejected, setError);
    });
    builder.addCase(clearCart.fulfilled, (state) => { state.cart = null; state.loading = false; });
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
