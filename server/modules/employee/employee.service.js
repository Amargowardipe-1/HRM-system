const Employee = require("./employee.model");
const User = require("../user/user.model");
const { hashPassword } = require("../../utils/auth.helper");
const sendEmail = require("../../utils/sendEmail");
const welcomeTemplate = require("../../utils/emailTemplates/welcome.template");

/**
 * Create Employee & User records in a synchronized flow.
 */
const createEmployee = async (employeeData, creatorId = null) => {
  const {
    email,
    password,
    role,
    employeeCode,
    firstName,
    lastName,
    phone,
    gender,
    dob,
    department,
    designation,
    manager,
    joiningDate,
    employmentType,
    salary,
    status,
    bankDetails,
  } = employeeData;

  // Check unique constraints
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exists.");
  }

  const existingEmployee = await Employee.findOne({ employeeCode });
  if (existingEmployee) {
    throw new Error("Employee Code already exists.");
  }

  // Create User
  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    email,
    password: hashedPassword,
    role: role || "Employee",
    isActive: true,
  });

  try {
    // Create Employee Profile
    const employee = await Employee.create({
      userId: user._id,
      employeeCode,
      firstName,
      lastName,
      phone: phone || "",
      gender: gender || "Male",
      dob: dob || null,
      department: department || null,
      designation: designation || null,
      manager: manager || null,
      joiningDate: joiningDate || new Date(),
      employmentType: employmentType || "Full-time",
      salary: salary || 0,
      status: status || "Active",
      bankDetails: bankDetails || { bankName: "", accountNumber: "", ifsc: "", branch: "" },
      createdBy: creatorId,
    });

    // Send Welcome Email (Non-blocking / Handled errors)
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const employeeName = `${firstName} ${lastName}`.trim();
    const htmlContent = welcomeTemplate(
      employeeName,
      email,
      password,
      role || "Employee",
      clientUrl
    );

    sendEmail(email, "Welcome to HRMS - Your Account Details", htmlContent).catch((err) => {
      console.error("Failed to send welcome email to:", email, err.message);
    });

    return employee;
  } catch (error) {
    // Rollback User creation if Employee creation fails
    await User.findByIdAndDelete(user._id);
    throw error;
  }
};

/**
 * Fetch all employees with populated user details, department, and designation.
 */
const getEmployees = async () => {
  return await Employee.find()
    .populate("userId", "email role isActive lastLogin")
    .populate("department", "name costCenterCode")
    .populate("designation", "title level")
    .populate("manager", "firstName lastName")
    .sort({ createdAt: -1 });
};

/**
 * Fetch a single employee by ID.
 */
const getEmployeeById = async (id) => {
  const employee = await Employee.findById(id)
    .populate("userId", "email role isActive lastLogin")
    .populate("department", "name costCenterCode")
    .populate("designation", "title level")
    .populate("manager", "firstName lastName");

  if (!employee) {
    throw new Error("Employee not found.");
  }

  return employee;
};

/**
 * Update employee profile & user credentials in a synchronized flow.
 */
const updateEmployee = async (id, employeeData, requester) => {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new Error("Employee not found.");
  }

  const RolePermission = require("../role/rolePermission.model");
  const rolePermission = await RolePermission.findOne({ role: requester.role });
  const hasUpdateAll = rolePermission?.permissions.includes("employees:update") || false;

  const requesterId = (requester?._id || requester?.id || "").toString();
  const isCreator = employee.createdBy && employee.createdBy.toString() === requesterId;
  const employeeUserId = employee.userId?._id || employee.userId;
  const isSelf = employeeUserId && employeeUserId.toString() === requesterId;

  if (!hasUpdateAll && !isCreator && !isSelf) {
    throw new Error("Access Denied: You are not authorized to edit this profile.");
  }

  // Security: If updating own profile (isSelf) and not Admin/HR with update permission, strip administrative fields
  if (isSelf && !hasUpdateAll && !isCreator) {
    delete employeeData.role;
    delete employeeData.isActive;
    delete employeeData.employeeCode;
    delete employeeData.department;
    delete employeeData.designation;
    delete employeeData.manager;
    delete employeeData.joiningDate;
    delete employeeData.employmentType;
    delete employeeData.salary;
    delete employeeData.status;
  }

  const {
    email,
    password,
    role,
    isActive,
    employeeCode,
    firstName,
    lastName,
    phone,
    gender,
    dob,
    department,
    designation,
    manager,
    joiningDate,
    employmentType,
    salary,
    status,
    bankDetails,
  } = employeeData;

  // Check unique constraints if values are changed
  if (employeeCode && employeeCode !== employee.employeeCode) {
    const existingEmployee = await Employee.findOne({ employeeCode, _id: { $ne: id } });
    if (existingEmployee) {
      throw new Error("Employee Code already exists.");
    }
  }

  // Update User Credentials
  const user = await User.findById(employee.userId);
  if (user) {
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        throw new Error("Email already exists.");
      }
      user.email = email;
    }
    if (role) user.role = role;
    if (typeof isActive !== "undefined") user.isActive = isActive;
    if (password && password.trim() !== "") {
      user.password = await hashPassword(password);
    }
    await user.save();
  }

  // Update Employee Profile
  const updateFields = {
    firstName,
    lastName,
    phone,
    gender,
    dob,
    department,
    designation,
    manager,
    joiningDate,
    employmentType,
    salary,
    status,
    bankDetails,
  };

  // Remove undefined fields
  Object.keys(updateFields).forEach((key) => {
    if (typeof updateFields[key] !== "undefined") {
      employee[key] = updateFields[key] === "" ? null : updateFields[key];
    }
  });

  if (employeeCode) {
    employee.employeeCode = employeeCode;
  }

  await employee.save();

  return await getEmployeeById(id);
};

/**
 * Delete employee profile and their User credentials in a synchronized flow.
 */
const deleteEmployee = async (id, requester) => {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new Error("Employee not found.");
  }

  // Ownership Check: Admin has full access, HR can only delete employees they created
  const requesterId = (requester?._id || requester?.id || "").toString();
  const isAdmin = requester?.role === "Admin";
  const isCreator = employee.createdBy && employee.createdBy.toString() === requesterId;

  if (!isAdmin && !isCreator) {
    throw new Error("Access Denied: You are not authorized to delete this profile.");
  }

  // Delete associated User credentials
  await User.findByIdAndDelete(employee.userId);

  // Delete Employee profile
  await Employee.findByIdAndDelete(id);

  return { message: "Employee deleted successfully." };
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
