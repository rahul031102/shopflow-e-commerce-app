import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/register', data);
    localStorage.setItem('accessToken', res.data.accessToken);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/login', data);
    localStorage.setItem('accessToken', res.data.accessToken);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await API.post('/auth/logout');
    localStorage.removeItem('accessToken');
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/auth/me');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null, initialized: false },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null; };
    const handleRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; })
      .addCase(register.rejected, handleRejected)
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; })
      .addCase(login.rejected, handleRejected)
      .addCase(logout.fulfilled, (state) => { state.user = null; })
      .addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload.user; state.initialized = true; })
      .addCase(fetchMe.rejected, (state) => { state.initialized = true; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
