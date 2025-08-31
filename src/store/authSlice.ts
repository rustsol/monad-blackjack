import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MonadUser } from '../types/game';
import axios from 'axios';

interface AuthState {
  isAuthenticated: boolean;
  user: MonadUser | null;
  walletAddress: string | null;
  isConnecting: boolean;
  error: string | null;
  needsUsernameRegistration: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  walletAddress: null,
  isConnecting: false,
  error: null,
  needsUsernameRegistration: false,
};

// Async thunk to fetch username from Monad Games ID API
export const fetchMonadUser = createAsyncThunk(
  'auth/fetchMonadUser',
  async (walletAddress: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://monad-games-id-site.vercel.app/api/check-wallet?wallet=${walletAddress}`
      );
      
      if (response.data.hasUsername) {
        return {
          username: response.data.user.username,
          walletAddress: response.data.user.walletAddress,
          hasUsername: true,
        } as MonadUser;
      } else {
        return {
          username: '',
          walletAddress,
          hasUsername: false,
        } as MonadUser;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setWalletAddress: (state, action: PayloadAction<string | null>) => {
      state.walletAddress = action.payload;
      if (action.payload) {
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
        state.user = null;
        state.needsUsernameRegistration = false;
      }
    },
    
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.walletAddress = null;
      state.needsUsernameRegistration = false;
      state.error = null;
    },
    
    setNeedsUsernameRegistration: (state, action: PayloadAction<boolean>) => {
      state.needsUsernameRegistration = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonadUser.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchMonadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.needsUsernameRegistration = !action.payload.hasUsername;
        state.error = null;
      })
      .addCase(fetchMonadUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.needsUsernameRegistration = true; // Assume no username if API fails
      });
  },
});

export const {
  setWalletAddress,
  setConnecting,
  clearError,
  logout,
  setNeedsUsernameRegistration,
} = authSlice.actions;

export default authSlice.reducer;