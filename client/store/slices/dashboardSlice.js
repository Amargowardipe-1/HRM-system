import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardStats } from "@/lib/api";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchDashboardStats",
  async (token, { rejectWithValue }) => {
    try {
      const data = await getDashboardStats(token);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load dashboard stats");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: {},
    loading: false,
    isLoaded: false,
    error: null,
  },
  reducers: {
    setDashboardStats(state, action) {
      state.stats = action.payload;
      state.isLoaded = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        if (!state.isLoaded) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload || {};
        state.isLoaded = true;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setDashboardStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
