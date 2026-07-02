const { validationResult } = require("express-validator");
const holidayService = require("./holiday.service");
const { HOLIDAY_MESSAGES } = require("./holiday.constants");

// Create Holiday
const createHoliday = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const holiday = await holidayService.createHoliday(req.body, req.user.id || req.user._id);

    return res.status(201).json({
      success: true,
      message: HOLIDAY_MESSAGES.CREATED,
      data: holiday,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// Update Holiday
const updateHoliday = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const holiday = await holidayService.updateHoliday(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: HOLIDAY_MESSAGES.UPDATED,
      data: holiday,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// Delete Holiday
const deleteHoliday = async (req, res) => {
  try {
    await holidayService.deleteHoliday(req.params.id);

    return res.status(200).json({
      success: true,
      message: HOLIDAY_MESSAGES.DELETED,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

// Get All Holidays
const getHolidays = async (req, res) => {
  try {
    const holidays = await holidayService.getHolidays();

    return res.status(200).json({
      success: true,
      message: HOLIDAY_MESSAGES.FETCHED_ALL,
      data: holidays,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

module.exports = {
  createHoliday,
  updateHoliday,
  deleteHoliday,
  getHolidays,
};
