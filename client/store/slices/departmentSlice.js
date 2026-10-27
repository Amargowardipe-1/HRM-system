import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDepartments } from "@/lib/api";

export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async (token, { rejectWithValue }) => {
    try {
      const data = await getDepartments(token);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load departments");
    }
  }
);

const departmentSlice = createSlice({
  name: "departments",
  initialState: {
    departments: [],
    loading: false,
    isLoaded: false,
    error: null,
  },
  reducers: {
    setDepartments(state, action) {
      state.departments = action.payload;
      state.isLoaded = true;
    },
    addDepartment(state, action) {
      state.departments.unshift(action.payload);
    },
    updateDepartmentInStore(state, action) {
      const index = state.departments.findIndex(
        (dept) => dept._id === action.payload._id || dept.id === action.payload.id
      );
      if (index !== -1) {
        state.departments[index] = { ...state.departments[index], ...action.payload };
      }
    },
    removeDepartment(state, action) {
      state.departments = state.departments.filter(
        (dept) => dept._id !== action.payload && dept.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        if (!state.isLoaded) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload || [];
        state.isLoaded = true;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setDepartments,
  addDepartment,
  updateDepartmentInStore,
  removeDepartment,
} = departmentSlice.actions;

export default departmentSlice.reducer;
