import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AuthService } from "../../services/auth.service";
import {
  ForgotPasswordValues,
  LoginFormValues,
  RegisterFormValues,
} from "../../schema/authSchema";
import { clearUser, setUser } from "../user/user.slice";
import {
  handleAuthentication,
  verifyTokenClientSide,
  isTokenExpired,
  getToken,
  getRefreshToken,
  setTokens,
  clearAuthData,
} from "../../utils/authUtils";

interface AuthState {
  loading: boolean;
  error: string | null;
  registered: boolean;
  authenticated: boolean;
  initialized: boolean;
  isRefreshing: boolean;
}

const initialState: AuthState = {
  loading: false,
  error: null,
  registered: false,
  authenticated: false,
  initialized: false,
  isRefreshing: false,
};

export const verifyAuth = createAsyncThunk<{ authenticated: boolean }>(
  "auth/verify",
  async (_, { dispatch }) => {
    const token = getToken();
    if (!token) {
      return { authenticated: false };
    }

    // Check if token is expired
    if (isTokenExpired()) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        dispatch(forceLogout());
        return { authenticated: false };
      }

      try {
        const response = await AuthService.refreshToken(refreshToken);
        if (response.data) {
          const tokens = response.data;
          setTokens(tokens.accessToken, tokens.refreshToken);
          return { authenticated: true };
        } else {
          dispatch(forceLogout());
          return { authenticated: false };
        }
      } catch (error) {
        console.error("[AUTH_SLICE] Token refresh failed:", error);
        dispatch(forceLogout());
        return { authenticated: false };
      }
    }

    // Token is valid
    const authenticated = verifyTokenClientSide();

    if (!authenticated) {
      dispatch(forceLogout());
    }

    return { authenticated };
  }
);

export const refreshAuthToken = createAsyncThunk<
  { tokens: { accessToken: string; refreshToken: string } },
  void,
  { rejectValue: string }
>("auth/refreshToken", async (_, { rejectWithValue, dispatch }) => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    // console.log("[AUTH_SLICE] No refresh token found");
    dispatch(forceLogout());
    return rejectWithValue("No refresh token found");
  }

  try {
    const response = await AuthService.refreshToken(refreshToken);
    // console.log("[AUTH_SLICE] Token refresh successful", response);

    const tokens = response.data;
    if (!tokens?.accessToken || !tokens?.refreshToken) {
      throw new Error("Invalid token response structure");
    }

    setTokens(tokens.accessToken, tokens.refreshToken);
    return { tokens };
  } catch (error) {
    console.error("[AUTH_SLICE] Token refresh failed:", error);
    dispatch(forceLogout());

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Token refresh failed");
  }
});

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterFormValues, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData);
      return response;
    } catch (error) {
      console.error("[AUTH_SLICE] Registration failed:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (loginData: LoginFormValues, { rejectWithValue, dispatch }) => {
    try {
      const response = await AuthService.login(loginData);
      handleAuthentication({
        tokens: {
          accessToken: response.token,
          refreshToken: response.refreshToken,
        },
      });

      dispatch(setUser(response.user));
      return response;
    } catch (error) {
      console.error("[AUTH_SLICE] Login failed:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await AuthService.logout(); // Call logout API to invalidate refresh token on server
    } catch (error) {
      console.error("[AUTH_SLICE] Logout API error:", error);
      // Continue with local logout even if API call fails
    }

    // Always clear local data
    clearAuthData();
    dispatch(clearUser());

    // Redirect to login
    window.location.href = "/login";
    return true;
  }
);

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (data: ForgotPasswordValues, { rejectWithValue }) => {
    try {
      const response = await AuthService.requestPasswordReset(data.email);

      return response;
    } catch (error) {
      console.error("[AUTH_SLICE] Password reset request failed:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Password reset request failed");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: { password: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await AuthService.resetPassword(
        data.token,
        data.password
      );

      return response;
    } catch (error) {
      console.error("[AUTH_SLICE] Password reset failed:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Password reset failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetRegistration: (state) => {
      state.registered = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Add action to handle automatic logout when token refresh fails
    forceLogout: (state) => {
      // console.log("[AUTH_SLICE] Forcing logout");
      state.authenticated = false;
      state.error = null;
      state.initialized = true;
      clearAuthData();
    },
    setRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registered = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registered = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.registered = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
        state.authenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.authenticated = action.payload.authenticated;
        state.initialized = true;
        state.error = null;
      })
      .addCase(verifyAuth.rejected, (state) => {
        state.loading = false;
        state.authenticated = false;
        state.initialized = true;
      })
      .addCase(refreshAuthToken.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(refreshAuthToken.fulfilled, (state) => {
        state.isRefreshing = false;
        state.authenticated = true;
        state.error = null;
      })
      .addCase(refreshAuthToken.rejected, (state, action) => {
        state.isRefreshing = false;
        state.authenticated = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.authenticated = false;
        state.error = null;
      });
  },
});

export const { resetRegistration, clearError, forceLogout, setRefreshing } =
  authSlice.actions;
export default authSlice.reducer;
