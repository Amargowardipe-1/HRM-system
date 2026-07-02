
const PAYROLL_STATUS = {
  PENDING: "Pending",
  GENERATED: "Generated",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};



const PAYMENT_METHOD = {
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Cash",
  CHEQUE: "Cheque",
  UPI: "UPI",
};


const MONTHS = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};



const PAYROLL_MESSAGES = {
  CREATED: "Payroll generated successfully.",

  UPDATED: "Payroll updated successfully.",

  PAID: "Payroll marked as paid successfully.",

  DELETED: "Payroll deleted successfully.",

  FETCHED: "Payroll fetched successfully.",

  LIST_FETCHED: "Payroll list fetched successfully.",

  ALREADY_EXISTS:
    "Payroll has already been generated for this employee and month.",

  NOT_FOUND: "Payroll not found.",

  EMPLOYEE_NOT_FOUND: "Employee not found.",

  INVALID_MONTH: "Invalid payroll month.",

  INVALID_YEAR: "Invalid payroll year.",

  ACCESS_DENIED:
    "You are not authorized to access this payroll.",
};



module.exports = {
  PAYROLL_STATUS,
  PAYMENT_METHOD,
  MONTHS,
  PAYROLL_MESSAGES,
};