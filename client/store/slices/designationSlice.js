import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDesignations } from "@/lib/api";

export const fetchDesignations = createAsyncThunk(
  "designations/fetchDesignations",
  async (token, { rejectWithValue }) => {
    try {
      const res = await getDesignations({}, token);
      const list = Array.isArray(res) ? res : (res?.data || []);
      return list;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load designations");
    }
  }
);

const designationSlice = createSlice({
  name: "designations",
  initialState: {
    designations: [],
    loading: false,
    isLoaded: false,
    error: null,
  },
  reducers: {
    setDesignations(state, action) {
      state.designations = Array.isArray(action.payload)
        ? action.payload
        : (action.payload?.data || []);
      state.isLoaded = true;
    },
    addDesignation(state, action) {
      state.designations.unshift(action.payload);
    },
    updateDesignationInStore(state, action) {
      const index = state.designations.findIndex(
        (d) => d._id === action.payload._id || d.id === action.payload.id
      );
      if (index !== -1) {
        state.designations[index] = { ...state.designations[index], ...action.payload };
      }
    },
    removeDesignation(state, action) {
      state.designations = state.designations.filter(
        (d) => d._id !== action.payload && d.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDesignations.pending, (state) => {
        if (!state.isLoaded) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.loading = false;
        state.designations = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.data || []);
        state.isLoaded = true;
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setDesignations,
  addDesignation,
  updateDesignationInStore,
  removeDesignation,
} = designationSlice.actions;

export default designationSlice.reducer;
