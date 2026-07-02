const { body } = require("express-validator");

const {
  DOCUMENT_TYPES,
} = require("./document.constants");



const uploadDocumentValidation = [
  body("documentType")
    .notEmpty()
    .withMessage("Document type is required.")
    .isIn(Object.values(DOCUMENT_TYPES))
    .withMessage("Invalid document type."),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks cannot exceed 500 characters."),
];



const verifyDocumentValidation = [
  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks cannot exceed 500 characters."),
];



const updateDocumentValidation = [
  body("documentType")
    .optional()
    .isIn(Object.values(DOCUMENT_TYPES))
    .withMessage("Invalid document type."),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks cannot exceed 500 characters."),
];

module.exports = {
  uploadDocumentValidation,
  verifyDocumentValidation,
  updateDocumentValidation,
};
