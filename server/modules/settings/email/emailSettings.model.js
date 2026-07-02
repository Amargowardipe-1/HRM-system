const mongoose = require("mongoose");
const { EMAIL_PROVIDERS } = require("./emailSettings.constants");

const emailSettingsSchema = new mongoose.Schema(
    {
        // Email Provider
        provider: {
            type: String,
            enum: Object.values(EMAIL_PROVIDERS),
            default: EMAIL_PROVIDERS.SMTP,
        },

        // SMTP Configuration
        smtpHost: {
            type: String,
            trim: true,
            default: "",
        },

        smtpPort: {
            type: Number,
            default: 587,
        },

        smtpEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },

        smtpPassword: {
            type: String,
            default: "",
        },

        // Email Information
        senderName: {
            type: String,
            trim: true,
            default: "HRMS",
        },

        senderEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },

        // Feature Toggle
        enableEmailNotifications: {
            type: Boolean,
            default: true,
        },

        // Default Values
        isActive: {
            type: Boolean,
            default: true,
        },

        // Audit
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

// Only One Email Settings Document
emailSettingsSchema.index(
    { isActive: 1 },
    {
        unique: true,
        partialFilterExpression: {
            isActive: true,
        },
    }
);

module.exports = mongoose.model(
    "EmailSettings",
    emailSettingsSchema
);