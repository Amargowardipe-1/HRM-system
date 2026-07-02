require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./modules/user/user.routes");
const authRoutes = require("./modules/auth/auth.routes");
const departmentRoutes = require("./modules/department/department.routes");
const designationRoutes = require("./modules/designation/designation.routes");
const employeeRoutes = require("./modules/employee/employee.routes");
const attendanceRoutes = require("./modules/attendance/attendance.routes");
const leaveRoutes = require("./modules/leave/leave.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const holidayRoutes = require("./modules/holiday/holiday.routes");
const documentRoutes = require("./modules/document/document.routes");
const notificationRoutes = require("./modules/notification/notification.routes");
const payrollRoutes = require("./modules/payroll/payroll.routes");
const settingsRoutes = require("./modules/settings/settings.routes");
const emailSettingsRoutes = require("./modules/settings/email/emailSetting.routes");



const app = express();

app.use(cors({
  origin: "http://localhost:3000",  // frontend ka URL
  credentials: true                 // agar cookies/session bhejne hain
}));
app.use(express.json());

// Mount Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/settings/email",emailSettingsRoutes);


const { seedAdmin } = require("./utils/seeder");
const { seedRolePermissions } = require("./modules/role/rolePermission.seed");

// Initialize DB and Seed
connectDB().then(() => {
  seedAdmin();
  seedRolePermissions();
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});

module.exports = app;
