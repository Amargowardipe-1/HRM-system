import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUsers, getSystemSettings } from "@/lib/api";

export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (token, { rejectWithValue }) => {
    try {
      const [users, settings] = await Promise.all([
        getUsers(token),
        getSystemSettings(token).catch(() => ({ roles: [] })),
      ]);
      const roles = settings?.roles?.map((r) => r.role) || ["Employee", "HR", "Admin"];
      return { users, roles };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load employees");
    }
  }
);

const employeeSlice = createSlice({
  name: "employees",
  initialState: {
    employees: [],
    roles: ["Employee", "HR", "Admin"],
    loading: false,
    isLoaded: false,
    error: null,
  },
  reducers: {
    setEmployees(state, action) {
      state.employees = action.payload;
      state.isLoaded = true;
    },
    addEmployee(state, action) {
      state.employees.unshift(action.payload);
    },
    updateEmployeeInStore(state, action) {
      const index = state.employees.findIndex(
        (emp) => emp._id === action.payload._id || emp.id === action.payload.id
      );
      if (index !== -1) {
        state.employees[index] = { ...state.employees[index], ...action.payload };
      }
    },
    removeEmployee(state, action) {
      state.employees = state.employees.filter(
        (emp) => emp._id !== action.payload && emp.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        if (!state.isLoaded) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.users || [];
        if (action.payload.roles?.length) {
          state.roles = action.payload.roles;
        }
        state.isLoaded = true;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setEmployees,
  addEmployee,
  updateEmployeeInStore,
  removeEmployee,
} = employeeSlice.actions;

export default employeeSlice.reducer;
