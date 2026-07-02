const express = require("express");
const router = express.Router();
const departmentController = require("./department.controllers");
const { verifyToken, checkPermission } = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");
const {
  createDepartmentValidation,
  updateDepartmentValidation,
} = require("./department.validation");

// Protect all routes under this router
router.use(verifyToken);

// GET All Departments
router.get("/", checkPermission("departments:view"), departmentController.getDepartments);

// GET Department by ID
router.get("/:id", checkPermission("departments:view"), departmentController.getDepartmentById);

// POST Create Department
router.post(
  "/",
  checkPermission("departments:create"),
  createDepartmentValidation,
  validate,
  departmentController.createDepartment
);

// PUT Update Department
router.put(
  "/:id",
  checkPermission("departments:update"),
  updateDepartmentValidation,
  validate,
  departmentController.updateDepartment
);

// DELETE Department
router.delete("/:id", checkPermission("departments:delete"), departmentController.deleteDepartment);

module.exports = router;
