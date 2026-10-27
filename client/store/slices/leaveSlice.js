import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getLeaveRequests } from "@/lib/api";

export const fetchLeaves = createAsyncThunk(
  "leaves/fetchLeaves",
  async ({ filters = {}, token = null } = {}, { rejectWithValue }) => {
    try {
      const data = await getLeaveRequests(filters, token);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load leave requests");
    }
  }
);

const leaveSlice = createSlice({
  name: "leaves",
  initialState: {
    leaves: [],
    loading: false,
    isLoaded: false,
    error: null,
  },
  reducers: {
    setLeaves(state, action) {
      state.leaves = action.payload;
      state.isLoaded = true;
    },
    addLeave(state, action) {
      state.leaves.unshift(action.payload);
    },
    updateLeaveInStore(state, action) {
      const index = state.leaves.findIndex(
        (l) => l._id === action.payload._id || l.id === action.payload.id
      );
      if (index !== -1) {
        state.leaves[index] = { ...state.leaves[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (state) => {
        if (!state.isLoaded) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload || [];
        state.isLoaded = true;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setLeaves, addLeave, updateLeaveInStore } = leaveSlice.actions;
export default leaveSlice.reducer;
