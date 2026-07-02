const Holiday = require("./holiday.model");
const { HOLIDAY_MESSAGES } = require("./holiday.constants");

// Create Holiday
const createHoliday = async (holidayData, userId) => {
  const date = new Date(holidayData.date);
  date.setHours(0, 0, 0, 0);

  // Check if holiday already exists on the same date
  const existing = await Holiday.findOne({ date, isDeleted: false });
  if (existing) {
    throw new Error(HOLIDAY_MESSAGES.DUPLICATE_DATE);
  }

  return await Holiday.create({
    name: holidayData.name,
    date,
    description: holidayData.description || "",
    type: holidayData.type,
    createdBy: userId,
  });
};

// Update Holiday
const updateHoliday = async (id, holidayData) => {
  const holiday = await Holiday.findOne({ _id: id, isDeleted: false });
  if (!holiday) {
    throw new Error(HOLIDAY_MESSAGES.NOT_FOUND);
  }

  if (holidayData.date) {
    const newDate = new Date(holidayData.date);
    newDate.setHours(0, 0, 0, 0);

    // If date has changed, check for duplicate date
    if (newDate.getTime() !== holiday.date.getTime()) {
      const existing = await Holiday.findOne({ date: newDate, isDeleted: false });
      if (existing) {
        throw new Error(HOLIDAY_MESSAGES.DUPLICATE_DATE);
      }
      holiday.date = newDate;
    }
  }

  if (holidayData.name) holiday.name = holidayData.name;
  if (typeof holidayData.description !== "undefined") holiday.description = holidayData.description;
  if (holidayData.type) holiday.type = holidayData.type;

  return await holiday.save();
};

// Delete Holiday (Soft Delete)
const deleteHoliday = async (id) => {
  const holiday = await Holiday.findOne({ _id: id, isDeleted: false });
  if (!holiday) {
    throw new Error(HOLIDAY_MESSAGES.NOT_FOUND);
  }

  holiday.isDeleted = true;
  await holiday.save();
  return holiday;
};

// Get All Active Holidays
const getHolidays = async () => {
  return await Holiday.find({ isDeleted: false }).sort({ date: 1 });
};

module.exports = {
  createHoliday,
  updateHoliday,
  deleteHoliday,
  getHolidays,
};
