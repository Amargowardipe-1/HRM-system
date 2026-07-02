const Designation = require("./designation.model");
const Department = require("../department/department.model");

const {
  DESIGNATION_MESSAGES,
} = require("./designation.constants");


const createDesignation = async (designationData, userId) => {

  // Check Department Exists
  const department = await Department.findById(designationData.department);

  if (!department) {
    throw new Error("Department not found.");
  }

  // Check Duplicate
  const existingDesignation = await Designation.findOne({
    title: designationData.title,
    department: designationData.department,
    isDeleted: false,
  });

  if (existingDesignation) {
    throw new Error(DESIGNATION_MESSAGES.ALREADY_EXISTS);
  }

  const designation = await Designation.create({
    ...designationData,
    createdBy: userId,
  });

  return designation;
};


//get all designation

const getDesignations = async (queryParams = {}) => {
  const { search, page, limit, department, status } = queryParams;

  const query = { isDeleted: false };

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  if (department) {
    query.department = department;
  }

  if (status) {
    query.status = status;
  }

  if (page && limit) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Designation.countDocuments(query);
    const designations = await Designation.find(query)
      .populate("department", "name code")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return {
      designations,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  const designations = await Designation.find(query)
    .populate("department", "name code")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  return { designations };
};

/**
 * Get all active designations of a specific department.
 */
const getDesignationsByDepartment = async (departmentId) => {
  return await Designation.find({
    department: departmentId,
    status: "Active",
    isDeleted: false,
  }).select("title level");
};

//get designation by id

const getDesignationById = async (designationId) => {

  const designation = await Designation.findOne({
    _id: designationId,
    isDeleted: false,
  })
    .populate("department", "name code")
    .populate("createdBy", "name email");

  if (!designation) {
    throw new Error(DESIGNATION_MESSAGES.NOT_FOUND);
  }

  return designation;
};


//update designtion
const updateDesignation = async (
  designationId,
  updateData,
  userId
) => {

  const designation = await Designation.findOne({
    _id: designationId,
    isDeleted: false,
  });

  if (!designation) {
    throw new Error(DESIGNATION_MESSAGES.NOT_FOUND);
  }

  // Check Department Exists (only if changing department)
  if (updateData.department) {
    const department = await Department.findById(updateData.department);

    if (!department) {
      throw new Error("Department not found.");
    }
  }

  // Duplicate Check
  const duplicateDesignation = await Designation.findOne({
    _id: {
      $ne: designationId,
    },
    title: updateData.title,
    department:
      updateData.department || designation.department,
    isDeleted: false,
  });

  if (duplicateDesignation) {
    throw new Error(DESIGNATION_MESSAGES.ALREADY_EXISTS);
  }

  Object.assign(designation, updateData);

  designation.updatedBy = userId;

  await designation.save();

  return designation;
};


//delete designation

const deleteDesignation = async (
  designationId,
  userId
) => {

  const designation = await Designation.findOne({
    _id: designationId,
    isDeleted: false,
  });

  if (!designation) {
    throw new Error(DESIGNATION_MESSAGES.NOT_FOUND);
  }

  // Safety check: Prevent deletion if users are currently assigned to it
  const User = require("../user/user.model");
  const assignedUsersCount = await User.countDocuments({ designation: designationId });
  if (assignedUsersCount > 0) {
    throw new Error(`Cannot delete designation: ${assignedUsersCount} employee(s) are currently assigned to it. Reassign them first.`);
  }

  designation.isDeleted = true;

  designation.updatedBy = userId;

  await designation.save();

  return designation;
};


module.exports = {
  createDesignation,
  getDesignations,
  getDesignationsByDepartment,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
};