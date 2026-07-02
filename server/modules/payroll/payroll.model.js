const mongoose = require("mongoose");

const {
  PAYROLL_STATUS,
  PAYMENT_METHOD,
} = require("./payroll.constants");

const payrollSchema = new mongoose.Schema(
  {
    
    

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // =========================================
    // Payroll Period
    // =========================================

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
      min: 2025,
    },

    // =========================================
    // Employee Snapshot
    // =========================================

    employeeSnapshot: {
      employeeCode: {
        type: String,
        default: "",
        trim: true,
      },

      name: {
        type: String,
        default: "",
        trim: true,
      },

      department: {
        type: String,
        default: "",
        trim: true,
      },

      designation: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // =========================================
    // Attendance Summary
    // =========================================

    attendanceSummary: {
      workingDays: {
        type: Number,
        default: 0,
        min: 0,
      },

      presentDays: {
        type: Number,
        default: 0,
        min: 0,
      },

      absentDays: {
        type: Number,
        default: 0,
        min: 0,
      },

      leaveDays: {
        type: Number,
        default: 0,
        min: 0,
      },

      overtimeHours: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // =========================================
    // Salary Details
    // =========================================

    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    allowance: {
      type: Number,
      default: 0,
      min: 0,
    },

    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },

    overtimeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    deduction: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    pf: {
      type: Number,
      default: 0,
      min: 0,
    },

    esic: {
      type: Number,
      default: 0,
      min: 0,
    },

    grossSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    // =========================================
    // Payment Information
    // =========================================

    status: {
      type: String,
      enum: Object.values(PAYROLL_STATUS),
      default: PAYROLL_STATUS.PENDING,
    },

    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.BANK_TRANSFER,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    // =========================================
    // Audit Fields
    // =========================================

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================
// Indexes
// =========================================

// Prevent duplicate payroll for same employee
// in the same month and year.
payrollSchema.index(
  {
    employee: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

// Faster queries
payrollSchema.index({
  status: 1,
});

payrollSchema.index({
  year: 1,
  month: 1,
});

module.exports = mongoose.model(
  "Payroll",
  payrollSchema
);