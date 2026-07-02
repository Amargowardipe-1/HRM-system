const mongoose = require("mongoose");

const {
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
} = require("./document.constants");

const documentSchema = new mongoose.Schema(
  {
    // Employee Reference
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    // Document Type
    documentType: {
      type: String,
      enum: Object.values(DOCUMENT_TYPES),
      required: true,
      trim: true,
    },

    // Original File Name
    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    // Cloudinary / Storage URL
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // Cloudinary Public ID
    publicId: {
      type: String,
      required: true,
      trim: true,
    },

    // File Size (Bytes)
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },

    // MIME Type
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    // Verification Status
    status: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.PENDING,
    },

    // HR/Admin Remarks
    remarks: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    // Verified By (HR/Admin)
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Uploaded By
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// One Active Document Per Type Per Employee
documentSchema.index(
  {
    employee: 1,
    documentType: 1,
    isDeleted: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);