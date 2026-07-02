const settingsService = require("./settings.service");

const getSettings = async (req, res) => {
  try {
    const data = await settingsService.getSystemSettings();

    return res.status(200).json({
      success: true,
      message: "System settings fetched successfully.",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateRolePermissions = async (req, res) => {
  try {
    const rolePermission = await settingsService.updateRolePermissions(
      req.params.role,
      req.body.permissions
    );

    return res.status(200).json({
      success: true,
      message: `${req.params.role} permissions updated successfully.`,
      data: rolePermission,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAttendanceSettings = async (req, res) => {
  try {
    const settings = await settingsService.getAttendanceSettings();
    return res.status(200).json({
      success: true,
      message: "Attendance settings fetched successfully.",
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAttendanceSettings = async (req, res) => {
  try {
    const settings = await settingsService.updateAttendanceSettings(req.body);
    return res.status(200).json({
      success: true,
      message: "Attendance settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const createRole = async (req, res) => {
  try {
    const { roleName } = req.body;
    const newRole = await settingsService.createRole(roleName);
    return res.status(201).json({
      success: true,
      message: "Role created successfully.",
      data: newRole,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateRolePermissions,
  getAttendanceSettings,
  updateAttendanceSettings,
  createRole,
};
