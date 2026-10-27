import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAttendanceRecords } from "@/lib/api";

export const fetchAttendanceRecords = createAsyncThunk(
  "attendance/fetchAttendanceRecords",
  async ({ filters = {}, token = null } = {}, { rejectWithValue }) => {
    try {
      const data = await getAttendanceRecords(filters, token);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load attendance records");
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    records: [],
    loading: false,
    isLoaded: false,
    error: null,
  },
  reducers: {
    setAttendanceRecords(state, action) {
      state.records = action.payload;
      state.isLoaded = true;
    },
    upsertAttendanceRecord(state, action) {
      const record = action.payload;
      const index = state.records.findIndex(
        (r) => r._id === record._id || r.id === record.id
      );
      if (index !== -1) {
        state.records[index] = record;
      } else {
        state.records.unshift(record);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceRecords.pending, (state) => {
        if (!state.isLoaded) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload || [];
        state.isLoaded = true;
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAttendanceRecords, upsertAttendanceRecord } = attendanceSlice.actions;
export default attendanceSlice.reducer;
