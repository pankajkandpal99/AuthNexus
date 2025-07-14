import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserData, UserState } from "../../types/userTypes";
import { UpdateProfileFormValues } from "../../schema/authSchema";
import { UserService } from "../../services/user.service";

const initialState: UserState = {
  currentUser: null,
  viewedUser: null,
  users: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
  },
};

export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (
    { page, limit }: { page: number; limit: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await UserService.getAllUsers(page, limit);
      return response;
    } catch (error) {
      console.error("[USER_SLICE] Fetch users failed:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch users");
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { user: UserState };

      // Check if we're viewing the current user
      if (state.user.currentUser?.id === id) {
        return { user: state.user.currentUser, isCurrentUser: true };
      }

      const response = await UserService.getUserById(id);
      return { user: response, isCurrentUser: false };
    } catch (error) {
      console.error("[USER_SLICE] Fetch user by ID failed:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch user");
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (data: UpdateProfileFormValues, { rejectWithValue, dispatch }) => {
    try {
      const response = await UserService.updateProfile(data);
      dispatch(updateUser(response.data));
      return response.data;
    } catch (error) {
      console.error("[USER_SLICE] Profile update failed:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Profile update failed");
    }
  }
);

export const updateUserRoleStatus = createAsyncThunk(
  "user/updateUserRoleStatus",
  async (
    { id, role, status }: { id: string; role?: string; status?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await UserService.updateUser({ id, role, status });
      return response;
    } catch (error) {
      console.error("[USER_SLICE] Update user failed:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update user");
    }
  }
);

export const deleteUserById = createAsyncThunk(
  "user/deleteUserById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await UserService.deleteUser(id);

      console.log("deleted user in slice : ", response);

      return { id, ...response };
    } catch (error) {
      console.error("[USER_SLICE] Delete user failed:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete user");
    }
  }
);

export const searchUsers = createAsyncThunk(
  "user/searchUsers",
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await UserService.searchUsers(query);
      return response;
    } catch (error) {
      console.error("[USER_SLICE] Search users failed:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Search failed");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserData>) => {
      state.currentUser = action.payload;
      state.error = null;
    },
    setUsers: (state, action: PayloadAction<UserData[]>) => {
      state.users = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<UserState["pagination"]>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearUser: (state) => {
      state.currentUser = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    updateUserInList: (state, action: PayloadAction<UserData>) => {
      state.users = state.users.map((user) =>
        user.id === action.payload.id ? action.payload : user
      );
    },
    removeUserFromList: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch all users cases
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = {
          currentPage: action.payload.page,
          totalPages: action.payload.totalPages,
          totalUsers: action.payload.total,
          limit: state.pagination.limit,
        };
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch user by ID cases
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isCurrentUser) {
          state.currentUser = action.payload.user;
        } else {
          state.viewedUser = action.payload.user;
        }
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updated user role and status by ADMIN || SUPER_ADMIN
      .addCase(updateUserRoleStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRoleStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        );
      })
      .addCase(updateUserRoleStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // delete user by only SUPER_ADMIN
      .addCase(deleteUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(
          (user) => user.id !== action.payload.id
        );
        state.pagination.totalUsers -= 1;
      })
      .addCase(deleteUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // searching
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = {
          currentPage: 1,
          totalPages: 1,
          totalUsers: action.payload.total,
          limit: state.pagination.limit,
        };
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setUser,
  clearUser,
  setLoading,
  setError,
  updateUser,
  setUsers,
  setPagination,
  updateUserInList,
  removeUserFromList,
} = userSlice.actions;
export default userSlice.reducer;
