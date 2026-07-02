const path = require("path");



const ALLOWED_MIME_TYPES = [
  "application/pdf",

  "image/jpeg",

  "image/jpg",

  "image/png",
];


const MAX_FILE_SIZE = 5 * 1024 * 1024;


// Validate File Type

const isValidFileType = (mimeType) => {
  return ALLOWED_MIME_TYPES.includes(mimeType);
};


// Validate File Size

const isValidFileSize = (fileSize) => {
  return fileSize <= MAX_FILE_SIZE;
};


// Get File Extension

const getFileExtension = (fileName) => {
  return path.extname(fileName).toLowerCase();
};

module.exports = {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  isValidFileType,
  isValidFileSize,
  getFileExtension,
};