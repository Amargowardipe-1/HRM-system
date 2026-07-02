const PERMISSION_GROUPS = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Access executive summaries and operational widgets.",
    permissions: [
      { key: "dashboard:view", label: "Open dashboard" },
      { key: "dashboard:view_stats", label: "View company stats" },
      { key: "dashboard:view_own", label: "View own summary" },
    ],
  },
  {
    key: "employees",
    label: "Employees",
    description: "Manage employee profiles, roles, and directory data.",
    permissions: [
      { key: "employees:create", label: "Create employees" },
      { key: "employees:view_all", label: "View all employees" },
      { key: "employees:view_own", label: "View own profile" },
      { key: "employees:update", label: "Update employees" },
      { key: "employees:delete", label: "Delete employees" },
    ],
  },
  {
    key: "departments",
    label: "Departments",
    description: "Maintain company departments, budgets, and managers.",
    permissions: [
      { key: "departments:create", label: "Create departments" },
      { key: "departments:view", label: "View departments" },
      { key: "departments:update", label: "Update departments" },
      { key: "departments:delete", label: "Delete departments" },
    ],
  },
  {
    key: "designations",
    label: "Designations",
    description: "Control job titles, levels, and department mappings.",
    permissions: [
      { key: "designations:create", label: "Create designations" },
      { key: "designations:view", label: "View designations" },
      { key: "designations:update", label: "Update designations" },
      { key: "designations:delete", label: "Delete designations" },
    ],
  },
  {
    key: "attendance",
    label: "Attendance",
    description: "Handle daily check-ins, records, and corrections.",
    permissions: [
      { key: "attendance:check_in", label: "Check in" },
      { key: "attendance:check_out", label: "Check out" },
      { key: "attendance:view_own", label: "View own attendance" },
      { key: "attendance:view_all", label: "View all attendance" },
      { key: "attendance:update", label: "Update attendance" },
      { key: "attendance:delete", label: "Delete attendance" },
    ],
  },
  {
    key: "leave",
    label: "Leave",
    description: "Submit, review, approve, and reject leave requests.",
    permissions: [
      { key: "leave:apply", label: "Apply leave" },
      { key: "leave:cancel_own", label: "Cancel own leave" },
      { key: "leave:view_own", label: "View own leaves" },
      { key: "leave:view_all", label: "View all leaves" },
      { key: "leave:approve", label: "Approve leaves" },
      { key: "leave:reject", label: "Reject leaves" },
    ],
  },
  {
    key: "payroll",
    label: "Payroll",
    description: "Generate salaries, edit payouts, and mark payments.",
    permissions: [
      { key: "payroll:generate", label: "Generate payroll" },
      { key: "payroll:view_all", label: "View all payroll" },
      { key: "payroll:view_own", label: "View own payroll" },
      { key: "payroll:update", label: "Update payroll" },
      { key: "payroll:mark_paid", label: "Mark paid" },
      { key: "payroll:delete", label: "Delete payroll" },
    ],
  },
  {
    key: "documents",
    label: "Documents",
    description: "Upload, review, verify, and remove employee documents.",
    permissions: [
      { key: "documents:upload", label: "Upload documents" },
      { key: "documents:view_own", label: "View own documents" },
      { key: "documents:view_all", label: "View all documents" },
      { key: "documents:delete", label: "Delete documents" },
    ],
  },
  {
    key: "bank_details",
    label: "Bank Details",
    description: "Maintain payout account details and verification.",
    permissions: [
      { key: "bank_details:add", label: "Add bank details" },
      { key: "bank_details:update_own", label: "Update own details" },
      { key: "bank_details:view_own", label: "View own details" },
      { key: "bank_details:view_all", label: "View all details" },
      { key: "bank_details:verify", label: "Verify details" },
      { key: "bank_details:delete", label: "Delete details" },
    ],
  },
  {
    key: "holidays",
    label: "Holidays",
    description: "Publish and maintain company holiday calendars.",
    permissions: [
      { key: "holidays:view", label: "View holidays" },
      { key: "holidays:create", label: "Create holidays" },
      { key: "holidays:update", label: "Update holidays" },
      { key: "holidays:delete", label: "Delete holidays" },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    description: "Admin-only system controls and access management.",
    permissions: [
      { key: "settings:view", label: "View settings" },
      { key: "settings:update", label: "Update settings" },
      { key: "settings.email.view", label: "View email settings" },
      { key: "settings.email.update", label: "Update email settings" },
      { key: "settings.email.test", label: "Test email configuration" },
    ],
  },
];

const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((group) =>
  group.permissions.map((permission) => permission.key)
);

module.exports = {
  PERMISSION_GROUPS,
  ALL_PERMISSIONS,
};
