const mongoose = require("mongoose");

const AttendanceSettingSchema = new mongoose.Schema(
  {
    officeStartTime: { type: String, default: "09:00" },
    officeEndTime: { type: String, default: "18:00" },
    graceTime: { type: Number, default: 15 }, // minutes
    halfDayHours: { type: Number, default: 4 }, // hours
    fullDayHours: { type: Number, default: 8 }, // hours
    weekend: { type: [String], default: ["Saturday", "Sunday"] }, // days of week
    allowedLateMarks: { type: Number, default: 3 }, // late marks allowed per month
    deductionPerLateMark: { type: Number, default: 0.5 }, // day's salary deduction per late mark after allowed count
    overtimeEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AttendanceSetting", AttendanceSettingSchema);
