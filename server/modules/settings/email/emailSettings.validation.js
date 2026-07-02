const { body } = require("express-validator");

const {
  EMAIL_PROVIDERS,
} = require("./emailSettings.constants");

// Create / Update Email Settings Validation


const emailSettingsValidation = [
  body("provider")
    .trim()
    .notEmpty()
    .withMessage("Email provider is required.")
    .isIn(Object.values(EMAIL_PROVIDERS))
    .withMessage("Invalid email provider."),

  body("smtpHost")
    .trim()
    .if(body("provider").equals(EMAIL_PROVIDERS.SMTP))
    .notEmpty()
    .withMessage("SMTP host is required."),

  body("smtpPort")
    .if(body("provider").equals(EMAIL_PROVIDERS.SMTP))
    .notEmpty()
    .withMessage("SMTP port is required.")
    .isInt({
      min: 1,
      max: 65535,
    })
    .withMessage("Invalid SMTP port."),

  body("smtpEmail")
    .trim()
    .if(body("provider").equals(EMAIL_PROVIDERS.SMTP))
    .notEmpty()
    .withMessage("SMTP email is required.")
    .isEmail()
    .withMessage("Invalid SMTP email.")
    .normalizeEmail(),

  body("smtpPassword")
    .trim()
    .if(body("provider").equals(EMAIL_PROVIDERS.SMTP))
    .notEmpty()
    .withMessage("SMTP password is required."),

  body("senderName")
    .trim()
    .notEmpty()
    .withMessage("Sender name is required.")
    .isLength({
      min: 2,
      max: 100,
    })
    .withMessage(
      "Sender name must be between 2 and 100 characters."
    ),

  body("senderEmail")
    .trim()
    .notEmpty()
    .withMessage("Sender email is required.")
    .isEmail()
    .withMessage("Invalid sender email.")
    .normalizeEmail(),

  body("enableEmailNotifications")
    .optional()
    .isBoolean()
    .withMessage(
      "Enable Email Notifications must be true or false."
    ),

  body("smtpSecure")
    .optional()
    .isBoolean()
    .withMessage(
      "SMTP Secure must be true or false."
    ),
];

// Test Email Validation

const testEmailValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email address.")
    .normalizeEmail(),
];

module.exports = {
  emailSettingsValidation,
  testEmailValidation,
};