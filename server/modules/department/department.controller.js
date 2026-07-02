const departmentService = require("./department.service");

const {
  DEPARTMENT_MESSAGES,
} = require("./department.constants");

// create department
const createDepartment = async (req, res) => {
  try {
    const department = await departmentService.createDepartment(
      req.body,
      req.user._id
    );

    return res.status(201).json({
      success: true,
      message: DEPARTMENT_MESSAGES.CREATED,
      data: department,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// get all department
const getDepartments = async (req, res) => {
  try {
    const departments =
      await departmentService.getDepartments();

    return res.status(200).json({
      success: true,
      message: DEPARTMENT_MESSAGES.FETCH_ALL,
      data: departments,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//get department by id
const getDepartmentById = async (req, res) => {
  try {
    const department =
      await departmentService.getDepartmentById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: DEPARTMENT_MESSAGES.FETCH_ONE,
      data: department,
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

//update department
const updateDepartment = async (req, res) => {
  try {
    const department =
      await departmentService.updateDepartment(
        req.params.id,
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: DEPARTMENT_MESSAGES.UPDATED,
      data: department,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


//delete department
const deleteDepartment = async (req, res) => {
  try {
    await departmentService.deleteDepartment(
      req.params.id,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: DEPARTMENT_MESSAGES.DELETED,
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};


