const express = require("express");
const router = express.Router();
const authController = require("./auth.controllers");
const { verifyToken } = require("../../middleware/auth.middleware");
const {
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("./auth.validation");

const validate = require("../../middleware/validate.middleware");

// Public route for logging in
router.post(
  "/login",
  loginValidation,
  validate,
  authController.login
);

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validate,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  resetPasswordValidation,
  validate,
  authController.resetPassword
);

// Protected route to fetch current user profile
router.get("/me", verifyToken, authController.getCurrentUser);

module.exports = router;
