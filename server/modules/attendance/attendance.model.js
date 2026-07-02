const mongoose = require("mongoose");

const {
  ATTENDANCE_STATUS,
} = require("./attendance.constants");

const attendanceSchema = new mongoose.Schema(
  {
    // Employee Reference
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    // Attendance Date
    date: {
      type: Date,
      required: true,
      index: true,
    },

    // Check In Time
    checkIn: {
      type: Date,
      default: null,
    },

    // Check Out Time
    checkOut: {
      type: Date,
      default: null,
    },

    // Total Working Hours
    workingHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Attendance Status
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PRESENT,
    },

    // Remarks
    remarks: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Audit Fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One Attendance Per Employee Per Day
attendanceSchema.index(
  {
    employee: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Attendance", attendanceSchema);