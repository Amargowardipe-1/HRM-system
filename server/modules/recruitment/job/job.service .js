const Job = require("./job.model");
const Department = require("../department/department.model");
const Designation = require("../designation/designation.model");
const { JOB_STATUS } = require("./job.constants");

//createJob

const createJob = async (data, userId) => {
  // Check Department
  const department = await Department.findById(data.department);

  if (!department) {
    throw new Error("Department not found.");
  }

  // Check Designation
  const designation = await Designation.findById(data.designation);

  if (!designation) {
    throw new Error("Designation not found.");
  }

  // Check duplicate active job
  const existingJob = await Job.findOne({
    title: data.title.trim(),
    department: data.department,
    designation: data.designation,
    isDeleted: false,
    status: {
      $ne: JOB_STATUS.ARCHIVED,
    },
  });

  if (existingJob) {
    throw new Error("Job already exists.");
  }

  const job = await Job.create({
    ...data,
    createdBy: userId,
  });

  return job;
};



// get all jobs

const getAllJobs = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    department,
    designation,
    status,
    employmentType,
    experienceLevel,
    sortBy = "createdAt",
    order = "desc",
  } = query;

  const filter = {
    isDeleted: false,
  };

  // Search
  if (search) {
    filter.$text = {
      $search: search,
    };
  }

  // Department
  if (department) {
    filter.department = department;
  }

  // Designation
  if (designation) {
    filter.designation = designation;
  }

  // Status
  if (status) {
    filter.status = status;
  }

  // Employment Type
  if (employmentType) {
    filter.employmentType = employmentType;
  }

  // Experience Level
  if (experienceLevel) {
    filter.experienceLevel = experienceLevel;
  }

  const skip = (page - 1) * limit;

  const jobs = await Job.find(filter)
    .populate("department", "name")
    .populate("designation", "title")
    .populate("createdBy", "email role")
    .sort({
      [sortBy]: order === "asc" ? 1 : -1,
    })
    .skip(skip)
    .limit(Number(limit));

  const total = await Job.countDocuments(filter);

  return {
    jobs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createJob,
  getAllJobs,
};