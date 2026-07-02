const express = require("express");
const router = express.Router();

const documentController = require("./document.controller");
const { uploadDocumentValidation } = require("./document.validation");
const { verifyToken, checkPermission } = require("../../middleware/auth.middleware");
const upload = require("../../middleware/upload.middleware");

// =========================================
// Document Routes
// =========================================

// Get all documents / Upload new document
router
  .route("/")
  .get(verifyToken, checkPermission("documents:view_all", "documents:view_own"), documentController.getDocuments);

router.post(
  "/upload",
  verifyToken,
  checkPermission("documents:upload"),
  upload.single("document"),
  uploadDocumentValidation,
  documentController.uploadDocument
);

// Get, Update, Delete single document
router
  .route("/:id")
  .get(verifyToken, checkPermission("documents:view_all", "documents:view_own"), documentController.getDocumentById)
  .put(
    verifyToken,
    checkPermission("documents:upload"),
    upload.single("document"),
    documentController.updateDocument
  )
  .delete(verifyToken, checkPermission("documents:delete", "documents:view_own"), documentController.deleteDocument);

// Verify or Reject document
router.patch(
  "/:id/verify",
  verifyToken,
  checkPermission("documents:view_all"),
  documentController.verifyDocument
);

module.exports = router;