const express = require("express");
const router = express.Router();
const userController = require("./user.controllers");
const { verifyToken, authorizeRoles } = require("../../middleware/auth.middleware");

// Protect all routes under this router
router.use(verifyToken);


router.get("/", authorizeRoles("Admin", "HR", "Employee"), userController.getUsers);


router.get("/:id", authorizeRoles("Admin", "HR", "Employee"), userController.getUserById);


router.post("/", authorizeRoles("Admin", "HR"), userController.createUser);


router.put("/:id", authorizeRoles("Admin", "HR"), userController.updateUser);

router.delete("/:id", authorizeRoles("Admin", "HR"), userController.deleteUser);

module.exports = router;