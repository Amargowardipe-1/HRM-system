import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPayrolls } from "@/lib/api";

export const fetchPayrolls = createAsyncThunk(
  "payroll/fetchPayrolls",
  async (token, { rejectWithValue }) => {
    try {
      const data = await getPayrolls({}, token);
      return Array.isArray(data) ? data : (data?.payrolls || data?.data || []);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load payroll records");
    }
  }
);

const payrollSlice = createSlice({
  name: "payroll",
  initialState: {
    payrolls: [],
    loading: false,
    isLoaded: false,
    error: null,
  },
  reducers: {
    setPayrolls(state, action) {
      state.payrolls = Array.isArray(action.payload)
        ? action.payload
        : (action.payload?.payrolls || action.payload?.data || []);
      state.isLoaded = true;
    },
    addPayroll(state, action) {
      state.payrolls.unshift(action.payload);
    },
    updatePayrollInStore(state, action) {
      const index = state.payrolls.findIndex(
        (p) => p._id === action.payload._id || p.id === action.payload.id
      );
      if (index !== -1) {
        state.payrolls[index] = { ...state.payrolls[index], ...action.payload };
      }
    },
    removePayroll(state, action) {
      state.payrolls = state.payrolls.filter(
        (p) => p._id !== action.payload && p.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrolls.pending, (state) => {
        if (!state.isLoaded) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchPayrolls.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.payrolls || action.payload?.data || []);
        state.isLoaded = true;
      })
      .addCase(fetchPayrolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setPayrolls,
  addPayroll,
  updatePayrollInStore,
  removePayroll,
} = payrollSlice.actions;

export default payrollSlice.reducer;
