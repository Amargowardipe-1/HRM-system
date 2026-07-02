const User = require("../user/user.model");
const Employee = require("../employee/employee.model");
const Department = require("../department/department.model");
const Designation = require("../designation/designation.model");
const Attendance = require("../attendance/attendance.model");
const Leave = require("../leave/leave.model");
const Holiday = require("../holiday/holiday.model");
const Document = require("../document/document.model");
const Payroll = require("../payroll/payroll.model");
const RolePermission = require("../role/rolePermission.model");
const { ALL_PERMISSIONS, PERMISSION_GROUPS } = require("./settings.constants");

const DATA_MODULES = [
  {
    key: "users",
    label: "Users",
    description: "Login accounts, roles, and activation state.",
    model: User,
  },
  {
    key: "employees",
    label: "Employees",
    description: "Employee profiles with job, salary, manager, and bank data.",
    model: Employee,
  },
  {
    key: "departments",
    label: "Departments",
    description: "Department hierarchy, budgets, cost centers, and managers.",
    model: Department,
  },
  {
    key: "designations",
    label: "Designations",
    description: "Job titles, levels, and department mappings.",
    model: Designation,
    filter: { isDeleted: false },
  },
  {
    key: "attendance",
    label: "Attendance",
    description: "Daily attendance, check-in/out, hours, and status.",
    model: Attendance,
    filter: { isDeleted: false },
  },
  {
    key: "leaves",
    label: "Leaves",
    description: "Leave applications, approvals, dates, and reasons.",
    model: Leave,
  },
  {
    key: "holidays",
    label: "Holidays",
    description: "Holiday calendar records and holiday types.",
    model: Holiday,
    filter: { isDeleted: false },
  },
  {
    key: "documents",
    label: "Documents",
    description: "Identity, resume, offer letter, and certificate files.",
    model: Document,
    filter: { isDeleted: false },
  },
  {
    key: "payroll",
    label: "Payroll",
    description: "Monthly salary calculations, deductions, and payment status.",
    model: Payroll,
    filter: { isDeleted: false },
  },
];

async function getSystemSettings() {
  const [roles, roleDistribution, moduleCounts] = await Promise.all([
    RolePermission.find().sort({ role: 1 }),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Promise.all(
      DATA_MODULES.map(async (module) => ({
        key: module.key,
        label: module.label,
        description: module.description,
        count: await module.model.countDocuments(module.filter || {}),
      }))
    ),
  ]);

  const roleCounts = roleDistribution.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    roles,
    roleCounts,
    permissionGroups: PERMISSION_GROUPS,
    allPermissions: ALL_PERMISSIONS,
    modules: moduleCounts,
    system: {
      roles: roles.length,
      permissions: ALL_PERMISSIONS.length,
      modules: DATA_MODULES.length,
      updatedAt: new Date(),
    },
  };
}

async function updateRolePermissions(role, permissions) {
  const roleExists = await RolePermission.findOne({ role });
  if (!roleExists) {
    throw new Error("Invalid role or role does not exist.");
  }

  if (!Array.isArray(permissions)) {
    throw new Error("Permissions must be an array.");
  }

  const uniquePermissions = [...new Set(permissions)];
  const invalidPermissions = uniquePermissions.filter(
    (permission) => !ALL_PERMISSIONS.includes(permission)
  );

  if (invalidPermissions.length) {
    throw new Error(`Invalid permissions: ${invalidPermissions.join(", ")}`);
  }

  if (role === "Admin") {
    const requiredAdminPermissions = ["settings:view", "settings:update"];
    const missing = requiredAdminPermissions.filter(
      (permission) => !uniquePermissions.includes(permission)
    );

    if (missing.length) {
      throw new Error("Admin must keep settings permissions enabled.");
    }
  }

  return RolePermission.findOneAndUpdate(
    { role },
    { $set: { permissions: uniquePermissions } },
    { new: true, upsert: true }
  );
}

async function createRole(roleName) {
  if (!roleName || typeof roleName !== "string" || !roleName.trim()) {
    throw new Error("Role name is required.");
  }
  const formattedRole = roleName.trim();
  
  const existing = await RolePermission.findOne({ role: { $regex: new RegExp(`^${formattedRole}$`, "i") } });
  if (existing) {
    throw new Error("Role name already exists.");
  }

  const newRole = await RolePermission.create({
    role: formattedRole,
    permissions: [],
  });
  return newRole;
}

const AttendanceSetting = require("./attendanceSetting.model");

async function getAttendanceSettings() {
  let settings = await AttendanceSetting.findOne();
  if (!settings) {
    settings = await AttendanceSetting.create({});
  }
  return settings;
}

async function updateAttendanceSettings(data) {
  let settings = await AttendanceSetting.findOne();
  if (!settings) {
    settings = new AttendanceSetting();
  }
  
  settings.officeStartTime = data.officeStartTime ?? settings.officeStartTime;
  settings.officeEndTime = data.officeEndTime ?? settings.officeEndTime;
  settings.graceTime = data.graceTime !== undefined ? Number(data.graceTime) : settings.graceTime;
  settings.halfDayHours = data.halfDayHours !== undefined ? Number(data.halfDayHours) : settings.halfDayHours;
  settings.fullDayHours = data.fullDayHours !== undefined ? Number(data.fullDayHours) : settings.fullDayHours;
  settings.weekend = Array.isArray(data.weekend) ? data.weekend : settings.weekend;
  settings.allowedLateMarks = data.allowedLateMarks !== undefined ? Number(data.allowedLateMarks) : settings.allowedLateMarks;
  settings.deductionPerLateMark = data.deductionPerLateMark !== undefined ? Number(data.deductionPerLateMark) : settings.deductionPerLateMark;
  settings.overtimeEnabled = data.overtimeEnabled !== undefined ? !!data.overtimeEnabled : settings.overtimeEnabled;

  return await settings.save();
}

module.exports = {
  getSystemSettings,
  updateRolePermissions,
  getAttendanceSettings,
  updateAttendanceSettings,
  createRole,
};
