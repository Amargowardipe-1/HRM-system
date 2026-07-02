const HOLIDAY_TYPE = {
  NATIONAL: "National Holiday",
  RESTRICTED: "Restricted Holiday",
  COMPANY: "Company Holiday",
};

const HOLIDAY_MESSAGES = {
  CREATED: "Holiday added successfully.",
  UPDATED: "Holiday updated successfully.",
  DELETED: "Holiday deleted successfully.",
  FETCHED_ALL: "Holidays fetched successfully.",
  NOT_FOUND: "Holiday not found.",
  ACCESS_DENIED: "Access Denied: Only Admin can perform this action.",
  DUPLICATE_DATE: "A holiday is already scheduled on this date.",
};

module.exports = {
  HOLIDAY_TYPE,
  HOLIDAY_MESSAGES,
};
