const RolePermission = require("./rolePermission.model");

const defaultPermissions = [
  {
    role: "Admin",
    permissions: [
      // Dashboard
      "dashboard:view",
      "dashboard:view_stats",
      "dashboard:view_own",
      // Employees
      "employees:create",
      "employees:view_all",
      "employees:view_own",
      "employees:update",
      "employees:delete",
      // Departments
      "departments:create",
      "departments:view",
      "departments:update",
      "departments:delete",
      // Designations
      "designations:create",
      "designations:view",
      "designations:update",
      "designations:delete",
      // Attendance
      "attendance:check_in",
      "attendance:check_out",
      "attendance:view_own",
      "attendance:view_all",
      "attendance:update",
      "attendance:delete",
      // Leave
      "leave:view_own",
      "leave:view_all",
      "leave:approve",
      "leave:reject",
      // Payroll
      "payroll:generate",
      "payroll:view_all",
      "payroll:view_own",
      "payroll:update",
      "payroll:mark_paid",
      "payroll:delete",
      // Documents
      "documents:upload",
      "documents:view_own",
      "documents:view_all",
      "documents:delete",
      // Bank Details
      "bank_details:add",
      "bank_details:view_own",
      "bank_details:view_all",
      "bank_details:verify",
      "bank_details:delete",
      // Holidays
      "holidays:view",
      "holidays:create",
      "holidays:update",
      "holidays:delete",
      // Settings
      "settings:view",
      "settings:update",
      "settings.email.view",
      "settings.email.update",
      "settings.email.test",
    ],
  },
  {
    role: "HR",
    permissions: [
      // Dashboard
      "dashboard:view",
      "dashboard:view_stats",
      "dashboard:view_own",
      // Employees
      "employees:create",
      "employees:view_all",
      "employees:view_own",
      "employees:update",
      // Departments
      "departments:create",
      "departments:view",
      "departments:update",
      // Designations
      "designations:create",
      "designations:view",
      "designations:update",
      // Attendance
      "attendance:check_in",
      "attendance:check_out",
      "attendance:view_own",
      "attendance:view_all",
      "attendance:update",
      // Leave
      "leave:view_own",
      "leave:view_all",
      "leave:approve",
      "leave:reject",
      // Payroll
      "payroll:generate",
      "payroll:view_all",
      "payroll:view_own",
      "payroll:update",
      "payroll:mark_paid",
      // Documents
      "documents:upload",
      "documents:view_own",
      "documents:view_all",
      "documents:delete",
      // Bank Details
      "bank_details:add",
      "bank_details:view_own",
      "bank_details:view_all",
      "bank_details:verify",
      // Holidays
      "holidays:view",
      "holidays:create",
      "holidays:update",
      "holidays:delete",
    ],
  },
  {
    role: "Employee",
    permissions: [
      // Dashboard
      "dashboard:view",
      "dashboard:view_own",
      // Employees
      "employees:view_own",
      // Departments
      "departments:view",
      // Designations
      "designations:view",
      // Attendance
      "attendance:check_in",
      "attendance:check_out",
      "attendance:view_own",
      // Leave
      "leave:apply",
      "leave:cancel_own",
      "leave:view_own",
      // Payroll
      "payroll:view_own",
      // Documents
      "documents:upload",
      "documents:view_own",
      // Bank Details
      "bank_details:add",
      "bank_details:update_own",
      "bank_details:view_own",
      // Holidays
      "holidays:view",
    ],
  },
];

const seedRolePermissions = async () => {
  try {
    const count = await RolePermission.countDocuments();
    if (count === 0) {
      await RolePermission.insertMany(defaultPermissions);
      console.log("Role permissions seeded successfully.");
    } else {
      // Proactively ensure existing roles have updated permissions matching the new matrix
      for (const def of defaultPermissions) {
        await RolePermission.findOneAndUpdate(
          { role: def.role },
          { $set: { permissions: def.permissions } },
          { upsert: true }
        );
      }
      console.log("Role permissions verified and updated.");
    }
  } catch (error) {
    console.error("Failed to seed role permissions:", error.message);
  }
};

module.exports = { seedRolePermissions };
