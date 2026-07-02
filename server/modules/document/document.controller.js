const { validationResult } = require("express-validator");
const documentService = require("./document.service");
const { DOCUMENT_MESSAGES } = require("./document.constants");

// Upload Document
const uploadDocument = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const { documentType, remarks } = req.body;

    const document = await documentService.uploadDocument(
      req.user.id,
      req.file,
      documentType,
      remarks
    );

    return res.status(201).json({
      success: true,
      message: DOCUMENT_MESSAGES.CREATED,
      data: document,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Documents (My Documents or All Documents)
const getDocuments = async (req, res) => {
  try {
    const documents = await documentService.getDocuments(req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      message: DOCUMENT_MESSAGES.FETCH_ALL,
      data: documents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Document By Id
const getDocumentById = async (req, res) => {
  try {
    const document = await documentService.getDocumentById(req.params.id, req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      message: DOCUMENT_MESSAGES.FETCH_ONE,
      data: document,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Document (Re-upload file)
const updateDocument = async (req, res) => {
  try {
    const document = await documentService.updateDocument(
      req.params.id,
      req.user.id,
      req.file,
      req.body.remarks
    );

    return res.status(200).json({
      success: true,
      message: DOCUMENT_MESSAGES.UPDATED,
      data: document,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify / Reject Document (HR/Admin only)
const verifyDocument = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const document = await documentService.verifyDocument(
      req.params.id,
      req.user.id,
      remarks,
      status
    );

    const message = status === "Verified" ? DOCUMENT_MESSAGES.VERIFIED : DOCUMENT_MESSAGES.REJECTED;

    return res.status(200).json({
      success: true,
      message,
      data: document,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Document (Soft Delete)
const deleteDocument = async (req, res) => {
  try {
    await documentService.deleteDocument(req.params.id, req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      message: DOCUMENT_MESSAGES.DELETED,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  verifyDocument,
  deleteDocument,
};