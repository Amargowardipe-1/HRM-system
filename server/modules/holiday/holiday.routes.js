const express = require("express");
const router = express.Router();

const holidayController = require("./holiday.controller");
const { holidayValidation } = require("./holiday.validation");
const { verifyToken, checkPermission } = require("../../middleware/auth.middleware");

// =========================================
// Holiday Routes
// =========================================

// Get all holidays / Add holiday
router
  .route("/")
  .get(verifyToken, checkPermission("holidays:view"), holidayController.getHolidays)
  .post(verifyToken, checkPermission("holidays:create"), holidayValidation, holidayController.createHoliday);

// Update / Delete holiday
router
  .route("/:id")
  .put(verifyToken, checkPermission("holidays:update"), holidayValidation, holidayController.updateHoliday)
  .delete(verifyToken, checkPermission("holidays:delete"), holidayController.deleteHoliday);

module.exports = router;
