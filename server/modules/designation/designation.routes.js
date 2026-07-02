const express = require("express");

const router = express.Router();

const designationController = require("./designation.controller");

const {
  createDesignationValidation,
  updateDesignationValidation,
} = require("./designation.validation");

const validate = require("../../middleware/validate.middleware");

const {
  verifyToken,
  checkPermission,
} = require("../../middleware/auth.middleware");


//create
router.post(
  "/",
  verifyToken,
  checkPermission("designations:create"),
  createDesignationValidation,
  validate,
  designationController.createDesignation
);


//get all
router.get(
  "/",
  verifyToken,
  checkPermission("designations:view"),
  designationController.getDesignations
);

//get designations by department
router.get(
  "/department/:departmentId",
  verifyToken,
  checkPermission("designations:view"),
  designationController.getDesignationsByDepartment
);

//get by id
router.get(
  "/:id",
  verifyToken,
  checkPermission("designations:view"),
  designationController.getDesignationById
);


//update designation
router.put(
  "/:id",
  verifyToken,
  checkPermission("designations:update"),
  updateDesignationValidation,
  validate,
  designationController.updateDesignation
);

//delete designation
router.delete(
  "/:id",
  verifyToken,
  checkPermission("designations:delete"),
  designationController.deleteDesignation
);

module.exports = router;