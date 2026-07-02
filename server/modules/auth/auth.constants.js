const AUTH_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: "Login successful.",
  REGISTER_SUCCESS: "User registered successfully.",
  LOGOUT_SUCCESS: "Logout successful.",

  // Credentials
  INVALID_CREDENTIALS: "Invalid email or password.",
  ACCOUNT_INACTIVE: "Your account is inactive.",

  // Password Reset
  FORGOT_PASSWORD_SUCCESS:
    "If an account with this email exists, a password reset link has been sent.",

  INVALID_RESET_TOKEN:
    "Invalid or expired password reset token.",

  PASSWORD_RESET_SUCCESS:
    "Password reset successfully.",

  RESET_TOKEN_EXPIRED:
    "Password reset link has expired.",

  PASSWORD_ALREADY_USED:
    "New password cannot be the same as the current password.",
};

module.exports = {
  AUTH_MESSAGES,
};