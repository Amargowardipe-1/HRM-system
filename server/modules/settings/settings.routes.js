const express = require("express");
const router = express.Router();

const settingsController = require("./settings.controller");
const { verifyToken, checkPermission } = require("../../middleware/auth.middleware");

router.get("/", verifyToken, checkPermission("settings:view"), settingsController.getSettings);
router.post("/roles", verifyToken, checkPermission("settings:update"), settingsController.createRole);
router.put("/roles/:role/permissions", verifyToken, checkPermission("settings:update"), settingsController.updateRolePermissions);

router.get("/attendance", verifyToken, checkPermission("settings:view"), settingsController.getAttendanceSettings);
router.put("/attendance", verifyToken, checkPermission("settings:update"), settingsController.updateAttendanceSettings);

module.exports = router;
