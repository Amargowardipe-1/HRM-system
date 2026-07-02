const express = require("express");
const router = express.Router();

const dashboardController = require("./dashboard.controller");
const { verifyToken, checkPermission } = require("../../middleware/auth.middleware");

// =========================================
// Dashboard Routes
// =========================================

router.get(
  "/stats",
  verifyToken,
  checkPermission("dashboard:view"),
  dashboardController.getDashboardStats
);

module.exports = router;
