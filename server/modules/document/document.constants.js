

const DOCUMENT_TYPES = {
  AADHAR_CARD: "Aadhar Card",

  PAN_CARD: "PAN Card",

  RESUME: "Resume",

  OFFER_LETTER: "Offer Letter",

  EDUCATION_CERTIFICATE: "Education Certificate",

  OTHER: "Other",
};



const DOCUMENT_STATUS = {
  PENDING: "Pending",

  VERIFIED: "Verified",

  REJECTED: "Rejected",
};



const DOCUMENT_MESSAGES = {
  CREATED: "Document uploaded successfully.",

  FETCH_ALL: "Documents fetched successfully.",

  FETCH_ONE: "Document fetched successfully.",

  UPDATED: "Document updated successfully.",

  DELETED: "Document deleted successfully.",

  VERIFIED: "Document verified successfully.",

  REJECTED: "Document rejected successfully.",

  NOT_FOUND: "Document not found.",

  ALREADY_EXISTS: "Document already exists.",

  INVALID_DOCUMENT_TYPE: "Invalid document type.",
};

module.exports = {
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
  DOCUMENT_MESSAGES,
};