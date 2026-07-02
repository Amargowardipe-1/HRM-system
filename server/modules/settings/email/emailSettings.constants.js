const EMAIL_SETTINGS_MESSAGES = {
  // Success Messages
  SETTINGS_FETCHED:
    "Email settings fetched successfully.",

  SETTINGS_CREATED:
    "Email settings created successfully.",

  SETTINGS_UPDATED:
    "Email settings updated successfully.",

  TEST_EMAIL_SENT:
    "Test email sent successfully.",

  // Error Messages
  SETTINGS_NOT_FOUND:
    "Email settings not found.",

  EMAIL_NOT_ENABLED:
    "Email notifications are disabled.",

  INVALID_PROVIDER:
    "Invalid email provider selected.",

  INVALID_SMTP_CONFIGURATION:
    "SMTP configuration is invalid.",

  TEST_EMAIL_FAILED:
    "Failed to send test email.",

  EMAIL_ALREADY_CONFIGURED:
    "Email settings already exist.",

  SAVE_SETTINGS_FIRST:
    "Please save email settings before sending a test email.",
};

const EMAIL_PROVIDERS = {
  SMTP: "SMTP",
  RESEND: "Resend",
};

module.exports = {
  EMAIL_SETTINGS_MESSAGES,
   EMAIL_PROVIDERS,
};