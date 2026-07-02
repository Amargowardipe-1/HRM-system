const cloudinary = require("../config/cloudinary");


// Upload File

const uploadToCloudinary = async (
  filePath,
  folder = "hrm/document"
) => {
  try {
    const result = await cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: "auto",
      }
    );

    return result;
  } catch (error) {
    throw new Error(
      "Failed to upload file to Cloudinary."
    );
  }
};


// Delete File

const deleteFromCloudinary = async (
  publicId
) => {
  try {
    return await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
      }
    );
  } catch (error) {
    throw new Error(
      "Failed to delete file from Cloudinary."
    );
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};