import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getHolidays } from "@/lib/api";

export const fetchHolidays = createAsyncThunk(
  "holidays/fetchHolidays",
  async (token, { rejectWithValue }) => {
    try {
      const data = await getHolidays(token);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load holidays");
    }
  }
);

const holidaySlice = createSlice({
  name: "holidays",
  initialState: {
    holidays: [],
    loading: false,
    isLoaded: false,
    error: null,
  },
  reducers: {
    setHolidays(state, action) {
      state.holidays = action.payload;
      state.isLoaded = true;
    },
    addHoliday(state, action) {
      state.holidays.push(action.payload);
      state.holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    updateHolidayInStore(state, action) {
      const index = state.holidays.findIndex(
        (h) => h._id === action.payload._id || h.id === action.payload.id
      );
      if (index !== -1) {
        state.holidays[index] = { ...state.holidays[index], ...action.payload };
        state.holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
    },
    removeHoliday(state, action) {
      state.holidays = state.holidays.filter(
        (h) => h._id !== action.payload && h.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHolidays.pending, (state) => {
        if (!state.isLoaded) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.loading = false;
        state.holidays = action.payload || [];
        state.isLoaded = true;
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setHolidays,
  addHoliday,
  updateHolidayInStore,
  removeHoliday,
} = holidaySlice.actions;

export default holidaySlice.reducer;
