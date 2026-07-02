const designationService = require("./designation.service");

const {
  DESIGNATION_MESSAGES,
} = require("./designation.constants");

//create 
const createDesignation = async (req, res) => {
  try {
    const designation = await designationService.createDesignation(
      req.body,
      req.user._id
    );

    return res.status(201).json({
      success: true,
      message: DESIGNATION_MESSAGES.CREATED,
      data: designation,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


//get all
const getDesignations = async (req, res) => {
  try {
    const result = await designationService.getDesignations(req.query);

    return res.status(200).json({
      success: true,
      message: DESIGNATION_MESSAGES.FETCH_ALL,
      data: result.designations,
      pagination: result.pagination || null,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//get by id
const getDesignationById = async (req, res) => {
  try {
    const designation =
      await designationService.getDesignationById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: DESIGNATION_MESSAGES.FETCH_ONE,
      data: designation,
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


//update
const updateDesignation = async (req, res) => {
  try {
    const designation =
      await designationService.updateDesignation(
        req.params.id,
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: DESIGNATION_MESSAGES.UPDATED,
      data: designation,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


//delete designation
const deleteDesignation = async (req, res) => {
  try {
    await designationService.deleteDesignation(
      req.params.id,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: DESIGNATION_MESSAGES.DELETED,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// get designations by department ID
const getDesignationsByDepartment = async (req, res) => {
  try {
    const designations = await designationService.getDesignationsByDepartment(
      req.params.departmentId
    );

    return res.status(200).json({
      success: true,
      message: "Designations fetched successfully for department.",
      data: designations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createDesignation,
  getDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
  getDesignationsByDepartment,
};