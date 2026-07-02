const express = require("express");

const router = express.Router();

const emailSettingsController = require(
  "./emailSettings.controller"
);

const {
  emailSettingsValidation,
  testEmailValidation,
} = require("./emailSettings.validation");

const validate = require(
  "../../../middleware/validate.middleware"
);

const {
  verifyToken,
  checkPermission,
} = require(
  "../../../middleware/auth.middleware"
);

// Get Email Settings

router.get(
  "/",
  verifyToken,
  checkPermission("settings.email.view"),
  emailSettingsController.getEmailSettings
);


// Create / Update Email Settings

router.put(
  "/",
  verifyToken,
  checkPermission("settings.email.update"),
  emailSettingsValidation,
  validate,
  emailSettingsController.createOrUpdateEmailSettings
);

// =========================================
// Send Test Email
// =========================================

router.post(
  "/test",
  verifyToken,
  checkPermission("settings.email.test"),
  testEmailValidation,
  validate,
  emailSettingsController.sendTestEmail
);

module.exports = router;