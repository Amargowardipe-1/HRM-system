const User = require("../user/user.model");
const Employee = require("../employee/employee.model");
const RolePermission = require("../role/rolePermission.model");
const resetPasswordTemplate = require("../../utils/emailTemplates/resetPassword.template");
const EMAIL_SUBJECTS = require("../../utils/emailSubjects");


const {
  comparePassword,
  hashPassword,
  generateToken,
} = require("../../utils/auth.helper");

const {
  generateResetToken,
  hashResetToken,
} = require("../../utils/passwordToken.helper");

const sendEmail = require("../../utils/sendEmail");

const { AUTH_MESSAGES } = require("./auth.constants");

// =========================================
// Login User
// =========================================

const login = async (email, password) => {
  if (!email || !password) {
    throw new Error("Please provide email and password");
  }

  // Find user
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check active account
  if (!user.isActive) {
    throw new Error(
      "Account is deactivated. Please contact your administrator"
    );
  }

  // Compare password
  const isPasswordMatched = await comparePassword(
    password,
    user.password
  );

  if (!isPasswordMatched) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT
  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  const [employee, rolePermission] =
    await Promise.all([
      Employee.findOne({
        userId: user._id,
      }),
      RolePermission.findOne({
        role: user.role,
      }),
    ]);

  return {
    token,
    user: {
      _id: user._id,
      name: employee
        ? `${employee.firstName} ${employee.lastName}`.trim()
        : "User",
      email: user.email,
      role: user.role,
      permissions: rolePermission
        ? rolePermission.permissions
        : [],
      employeeId: employee
        ? employee._id
        : null,
    },
  };
};

// =========================================
// Forgot Password
// =========================================

const forgotPassword = async (email) => {
  const user = await User.findOne({
    email,
    isActive: true,
  });

  // Always return same message
  if (!user) {
    return {
      message:
        AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS,
    };
  }

  // Generate Token
  const resetToken = generateResetToken();

  // Hash Token
  const hashedToken =
    hashResetToken(resetToken);

  // Save Token
  user.resetPasswordToken =
    hashedToken;

  user.resetPasswordExpires =
    Date.now() + 15 * 60 * 1000;

  await user.save();

  // Frontend URL
  const resetUrl =
    `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  // Email HTML
  const html =
  resetPasswordTemplate(
    user.name || "User",
    resetUrl
  );

  try {
    await sendEmail(
    user.email,
    EMAIL_SUBJECTS.RESET_PASSWORD,
    html
);
  } catch (error) {
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    throw new Error(
      "Unable to send reset email."
    );
  }

  return {
    message:
      AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS,
  };
};

// =========================================
// Reset Password
// =========================================

const resetPassword = async (
  token,
  password
) => {
  // Hash incoming token
  const hashedToken =
    hashResetToken(token);

  // Find user
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    throw new Error(
      AUTH_MESSAGES.INVALID_RESET_TOKEN
    );
  }

  // Prevent same password
  const isSamePassword =
    await comparePassword(
      password,
      user.password
    );

  if (isSamePassword) {
    throw new Error(
      AUTH_MESSAGES.PASSWORD_ALREADY_USED
    );
  }

  // Hash password
  user.password = await hashPassword(password);

  // Clear reset fields
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  return {
    message:
      AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
  };
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
};