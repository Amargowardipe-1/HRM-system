const fs = require("fs");

const Document = require("./document.model");
const Employee = require("../employee/employee.model");

const {
  DOCUMENT_MESSAGES,
  DOCUMENT_STATUS,
} = require("./document.constants");

const {
  isValidFileType,
  isValidFileSize,
} = require("./document.helper");

const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utils/cloudinary.helper");

// Upload Document
const uploadDocument = async (userId, file, documentType, remarks) => {
  const employee = await Employee.findOne({
    userId,
  });

  if (!employee) {
    throw new Error("Employee not found.");
  }

  if (!file) {
    throw new Error("Please upload a document.");
  }

  if (!isValidFileType(file.mimetype)) {
    throw new Error("Invalid file type.");
  }

  if (!isValidFileSize(file.size)) {
    throw new Error("Maximum file size is 5 MB.");
  }

  const existingDocument = await Document.findOne({
    employee: employee._id,
    documentType,
    isDeleted: false,
  });

  if (existingDocument) {
    throw new Error(DOCUMENT_MESSAGES.ALREADY_EXISTS);
  }

  const uploadedFile = await uploadToCloudinary(file.path);

  console.log("=== CLOUDINARY UPLOAD RESULT ===");
  console.log(uploadedFile);
  console.log({
    resource_type: uploadedFile.resource_type,
    format: uploadedFile.format,
    secure_url: uploadedFile.secure_url,
    public_id: uploadedFile.public_id,
  });
  console.log("=================================");

  const document = await Document.create({
    employee: employee._id,
    documentType,
    fileName: file.originalname,
    fileUrl: uploadedFile.secure_url,
    publicId: uploadedFile.public_id,
    fileSize: file.size,
    mimeType: file.mimetype,
    remarks,
    uploadedBy: userId,
  });

  // Trigger Notification
  const notificationService = require("../notification/notification.service");
  const empName = `${employee.firstName} ${employee.lastName}`;
  await notificationService.notifyAdminsAndHRs({
    sender: userId,
    type: "Document_Uploaded",
    title: "New Document Uploaded",
    message: `${empName} has uploaded a new ${documentType}.`,
    link: "/documents",
  });

  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  return document;
};

// Get Documents (filtered by role and ownership)
const getDocuments = async (userId, userRole) => {
  if (userRole === "Admin" || userRole === "HR") {
    return await Document.find({ isDeleted: false })
      .populate("employee", "firstName lastName employeeCode")
      .sort({ createdAt: -1 });
  }

  const employee = await Employee.findOne({ userId });
  if (!employee) {
    return [];
  }

  return await Document.find({ employee: employee._id, isDeleted: false })
    .populate("employee", "firstName lastName employeeCode")
    .sort({ createdAt: -1 });
};

// Get Document By Id
const getDocumentById = async (id, userId, userRole) => {
  const document = await Document.findOne({ _id: id, isDeleted: false })
    .populate("employee", "firstName lastName employeeCode");

  if (!document) {
    throw new Error(DOCUMENT_MESSAGES.NOT_FOUND);
  }

  // If Employee, check ownership
  if (userRole !== "Admin" && userRole !== "HR" && document.uploadedBy.toString() !== userId.toString()) {
    throw new Error("Access Denied: You do not own this document.");
  }

  return document;
};

// Update Document (re-upload file)
const updateDocument = async (id, userId, file, remarks) => {
  const document = await Document.findOne({ _id: id, isDeleted: false });
  if (!document) {
    throw new Error(DOCUMENT_MESSAGES.NOT_FOUND);
  }

  // Only the owner can update
  if (document.uploadedBy.toString() !== userId.toString()) {
    throw new Error("Access Denied: You cannot edit this document.");
  }

  // If a new file is uploaded
  if (file) {
    if (!isValidFileType(file.mimetype)) {
      throw new Error("Invalid file type.");
    }

    if (!isValidFileSize(file.size)) {
      throw new Error("Maximum file size is 5 MB.");
    }

    // Delete the old file from Cloudinary
    try {
      await deleteFromCloudinary(document.publicId);
    } catch (err) {
      console.error("Failed to delete old file from Cloudinary:", err.message);
    }

    // Upload the new file
    const uploadedFile = await uploadToCloudinary(file.path);

    document.fileName = file.originalname;
    document.fileUrl = uploadedFile.secure_url;
    document.publicId = uploadedFile.public_id;
    document.fileSize = file.size;
    document.mimeType = file.mimetype;

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }

  if (typeof remarks !== "undefined") {
    document.remarks = remarks;
  }

  // Reset status to pending on re-upload
  document.status = DOCUMENT_STATUS.PENDING;
  document.verifiedBy = null;

  const savedDoc = await document.save();

  // Trigger Notification
  const notificationService = require("../notification/notification.service");
  const employee = await Employee.findOne({ userId });
  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : "An employee";
  await notificationService.notifyAdminsAndHRs({
    sender: userId,
    type: "Document_Uploaded",
    title: "Document Re-uploaded",
    message: `${employeeName} has updated their ${savedDoc.documentType}.`,
    link: "/documents",
  });

  return savedDoc;
};

// Verify / Reject Document (HR/Admin only)
const verifyDocument = async (id, verifierId, remarks, status) => {
  const document = await Document.findOne({ _id: id, isDeleted: false })
    .populate("employee", "firstName lastName employeeCode userId");

  if (!document) {
    throw new Error(DOCUMENT_MESSAGES.NOT_FOUND);
  }

  if (status !== DOCUMENT_STATUS.VERIFIED && status !== DOCUMENT_STATUS.REJECTED) {
    throw new Error("Invalid verification status.");
  }

  document.status = status;
  document.remarks = remarks || "";
  document.verifiedBy = verifierId;

  const savedDoc = await document.save();

  // Trigger Notification
  const notificationService = require("../notification/notification.service");
  const statusText = savedDoc.status === "Verified" ? "verified" : "rejected";
  await notificationService.createNotification({
    recipient: savedDoc.employee.userId,
    sender: verifierId,
    type: savedDoc.status === "Verified" ? "Document_Verified" : "Document_Rejected",
    title: `Document ${savedDoc.status}`,
    message: `Your ${savedDoc.documentType} has been ${statusText} by HR/Admin.`,
    link: "/documents",
  });

  return savedDoc;
};

// Delete Document (Soft Delete)
const deleteDocument = async (id, userId, userRole) => {
  const document = await Document.findOne({ _id: id, isDeleted: false });
  if (!document) {
    throw new Error(DOCUMENT_MESSAGES.NOT_FOUND);
  }

  // If Employee, check ownership
  if (userRole !== "Admin" && userRole !== "HR" && document.uploadedBy.toString() !== userId.toString()) {
    throw new Error("Access Denied: You cannot delete this document.");
  }

  document.isDeleted = true;
  return await document.save();
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  verifyDocument,
  deleteDocument,
};
