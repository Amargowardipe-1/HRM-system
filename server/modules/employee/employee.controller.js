const employeeService = require("./employee.service");

// Create Employee
const createEmployee = async (req, res) => {
  try {
    const employee = await employeeService.createEmployee(req.body, req.user._id);
    return res.status(201).json({
      success: true,
      message: "Employee profile and credentials created successfully.",
      data: employee,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Employees
const getEmployees = async (req, res) => {
  try {
    const employees = await employeeService.getEmployees();
    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully.",
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Employee By ID
const getEmployeeById = async (req, res) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    
    const RolePermission = require("../role/rolePermission.model");
    const rolePermission = await RolePermission.findOne({ role: req.user.role });
    const hasViewAll = rolePermission?.permissions.includes("employees:view_all") || false;
    const employeeUserId = employee.userId?._id || employee.userId;
    const isSelf = employeeUserId && employeeUserId.toString() === req.user._id.toString();

    if (!hasViewAll && !isSelf) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You are only authorized to view your own profile.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee profile fetched successfully.",
      data: employee,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Employee
const updateEmployee = async (req, res) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body, req.user);
    return res.status(200).json({
      success: true,
      message: "Employee profile updated successfully.",
      data: employee,
    });
  } catch (error) {
    // Determine status code based on error message
    const status = error.message.includes("Access Denied") ? 403 : 400;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
  try {
    await employeeService.deleteEmployee(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully.",
    });
  } catch (error) {
    const status = error.message.includes("Access Denied") ? 403 : 404;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
