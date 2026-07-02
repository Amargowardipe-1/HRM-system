// Designation Status
const DESIGNATION_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

// Designation Levels
const DESIGNATION_LEVELS = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  MID: "Mid",
  SENIOR: "Senior",
  LEAD: "Lead",
  MANAGER: "Manager",
};

// API Messages
const DESIGNATION_MESSAGES = {
  CREATED: "Designation created successfully.",
  UPDATED: "Designation updated successfully.",
  DELETED: "Designation deleted successfully.",

  FETCH_ALL: "Designations fetched successfully.",
  FETCH_ONE: "Designation fetched successfully.",

  NOT_FOUND: "Designation not found.",
  ALREADY_EXISTS:
    "Designation already exists in this department.",
};

module.exports = {
  DESIGNATION_STATUS,
  DESIGNATION_LEVELS,
  DESIGNATION_MESSAGES,
};