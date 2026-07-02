const authService = require("./auth.service");

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// Get current user profile controller (Improvement 6 - optimization)
const getCurrentUser = async (req, res) => {
  try {
    const Employee = require("../employee/employee.model");
    const RolePermission = require("../role/rolePermission.model");

    const [employee, rolePermission] = await Promise.all([
      Employee.findOne({ userId: req.user._id })
        .populate("department", "name costCenterCode")
        .populate("designation", "title level"),
      RolePermission.findOne({ role: req.user.role }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive,
        permissions: rolePermission ? rolePermission.permissions : [],
        firstName: employee ? employee.firstName : null,
        lastName: employee ? employee.lastName : null,
        name: employee ? `${employee.firstName} ${employee.lastName}`.trim() : "User",
        employeeCode: employee ? employee.employeeCode : null,
        phone: employee ? employee.phone : "",
        gender: employee ? employee.gender : "Male",
        dob: employee ? employee.dob : null,
        department: employee ? employee.department : null,
        designation: employee ? employee.designation : null,
        joiningDate: employee ? employee.joiningDate : null,
        employmentType: employee ? employee.employmentType : "Full-time",
        salary: employee ? employee.salary : 0,
        status: employee ? employee.status : "Active",
        employeeId: employee ? employee._id : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json({
      success: true,
      message: result.message || "Reset link sent to your email",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.status(200).json({
      success: true,
      message: result.message || "Password reset successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};
