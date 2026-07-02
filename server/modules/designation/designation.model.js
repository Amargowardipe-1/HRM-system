const mongoose = require("mongoose");

const {
  DESIGNATION_STATUS,
  DESIGNATION_LEVELS,
} = require("./designation.constants");

const designationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Designation title is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },

    level: {
      type: String,
      enum: Object.values(DESIGNATION_LEVELS),
      default: DESIGNATION_LEVELS.JUNIOR,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    status: {
      type: String,
      enum: Object.values(DESIGNATION_STATUS),
      default: DESIGNATION_STATUS.ACTIVE,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

/*

| Indexes

*/

// Prevent duplicate designation within the same department
designationSchema.index(
  {
    title: 1,
    department: 1,
  },
  {
    unique: true,
  }
);

// Faster filtering
designationSchema.index({
  department: 1,
  status: 1,
});

module.exports = mongoose.model("Designation", designationSchema);