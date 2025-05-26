import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "..";

const backurl = import.meta.env.VITE_BACK_URL;

export interface User {
  id: string;
  email: string;
  name?: string;
  token?: string;
    avatar?: string;
}

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Simulating API calls with a delay
const mockApiCall = <T>(data: T, delay = 800): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

// Check if the user is already authenticated
export const checkAuth = createAsyncThunk(
  "user/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const userJson = localStorage.getItem("user");
      if (!userJson) return null;

      const user = JSON.parse(userJson) as User;
      return user;
    } catch (error) {
      return rejectWithValue("Failed to authenticate");
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${backurl}/api/v1/user/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true, // This ensures cookies are sent/stored
        }
      );

      const data = response.data.data;
      console.log("response", response);
      console.log("token and user", data.token, data.user);

      // Save token and user to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      return data.user;
    } catch (error: any) {
      const message =
        error.response?.message || "Login failed. Please try again.";
      return rejectWithValue(message);
    }
  }
);

// Register a new user

export const registerUser = createAsyncThunk(
  "user/register",
  async (
    {
      name,
      email,
      password,
    }: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${backurl}/api/v1/user/register`, {
        name,
        email,
        password,
      });

      return response.data; // Adjust based on your backend's response structure
    } catch (error: any) {
      const message = error.response?.message || "Registration failed";
      return rejectWithValue(message);
    }
  }
);

// // Logout a user
// export const logoutUser = createAsyncThunk("user/logout", async () => {
//   // Clear localStorage
//   localStorage.removeItem("token");
//   localStorage.removeItem("user");

//   return null;
// });

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, thunkAPI) => {
    try {
      // Call backend logout API
      await axios.post(
        `${backurl}/api/v1/auth/logout`,
        {},
        {
          withCredentials: true, // ensures cookies (token) are sent
        }
      );

      // Clear localStorage only after successful logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return null;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);


// Async thunk for updating user data

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (updatedUser: { email?: string; username?: string }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const currentUser = state.user.currentUser;
    
    if (!currentUser) {
      return rejectWithValue("No user logged in");
    }

    try {
      // Create axios instance with credentials
    

      const response = await axios.patch(
        `${backurl}/users`,
        {
          email: updatedUser.email,
          username: updatedUser.username
        },
        {
         withCredentials:true
        }
      );

      return response.data; // Return the updated user data
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        return rejectWithValue(
          error.response?.data?.message || 
          error.message || 
          "Failed to update profile"
        );
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Check auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.currentUser = null;
        state.error =
          (action.payload as string) || "Authentication check failed";
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login failed";
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        // Registration successful, but user needs to login
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Registration failed";
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
      })
        .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<Partial<User>>) => {
        state.loading = false;
        if (state.currentUser) {
          state.currentUser = {
            ...state.currentUser,
            ...action.payload
          };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update user";
      });
  },
});

export default userSlice.reducer;
