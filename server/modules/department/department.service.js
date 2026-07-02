const Department = require("./department.model");
const Employee = require("../employee/employee.model");

/**
 * Get all departments with manager details populated and dynamic employee counts.
 */
const getDepartments = async () => {
  const departments = await Department.find()
    .populate({
      path: "manager",
      select: "firstName lastName",
      populate: { path: "userId", select: "email" },
    })
    .populate("parentDepartment", "name");
  
  // Calculate employeeCount dynamically for each department from the Employee collection
  const result = await Promise.all(
    departments.map(async (d) => {
      const dept = d.toObject();
      const count = await Employee.countDocuments({ department: dept._id });
      
      if (dept.manager) {
        dept.manager = {
          _id: dept.manager._id,
          name: `${dept.manager.firstName} ${dept.manager.lastName}`,
          email: dept.manager.userId?.email || "",
        };
      }

      return {
        ...dept,
        employeeCount: count,
      };
    })
  );
  
  return result;
};

/**
 * Get a specific department by ID, with manager details, parent details, and its list of employee members + payroll cost totals.
 */
const getDepartmentById = async (id) => {
  const department = await Department.findById(id)
    .populate({
      path: "manager",
      select: "firstName lastName",
      populate: { path: "userId", select: "email" },
    })
    .populate("parentDepartment", "name");
    
  if (!department) {
    throw new Error("Department not found");
  }

  // Fetch all employees belonging to this department from the Employee collection
  const employees = await Employee.find({ department: id })
    .populate("userId", "email role isActive");

  // Map to frontend member structure
  const members = employees.map((emp) => ({
    _id: emp._id,
    name: `${emp.firstName} ${emp.lastName}`,
    email: emp.userId?.email || "",
    role: emp.userId?.role || "Employee",
    isActive: emp.userId?.isActive ?? true,
    salary: emp.salary || 0,
  }));

  // Sum up salaries of all active members
  const totalPayroll = members.reduce((sum, member) => sum + (member.isActive ? (member.salary || 0) : 0), 0);

  const deptObject = department.toObject();
  if (deptObject.manager) {
    deptObject.manager = {
      _id: deptObject.manager._id,
      name: `${deptObject.manager.firstName} ${deptObject.manager.lastName}`,
      email: deptObject.manager.userId?.email || "",
    };
  }

  return {
    ...deptObject,
    members,
    totalPayroll,
  };
};

/**
 * Create a new department.
 */
const createDepartment = async (departmentData) => {
  const { name, description, manager, parentDepartment, costCenterCode, allocatedBudget } = departmentData;

  const existingDept = await Department.findOne({ name });
  if (existingDept) {
    throw new Error("Department with this name already exists");
  }

  // Validate manager exists in Employee collection if provided
  if (manager) {
    const emp = await Employee.findById(manager);
    if (!emp) {
      throw new Error("Assigned manager does not exist");
    }
  }

  // Validate parentDepartment if provided
  if (parentDepartment) {
    const parent = await Department.findById(parentDepartment);
    if (!parent) {
      throw new Error("Parent department does not exist");
    }
  }

  const newDept = await Department.create({
    name,
    description,
    manager: manager || null,
    parentDepartment: parentDepartment || null,
    costCenterCode: costCenterCode || "GEN-CORP",
    allocatedBudget: Number(allocatedBudget) || 0,
  });

  return newDept;
};

/**
 * Update department details.
 */
const updateDepartment = async (id, departmentData) => {
  const { name, description, manager, parentDepartment, costCenterCode, allocatedBudget } = departmentData;

  // Validate name collision if name is changed
  if (name) {
    const collisionDept = await Department.findOne({ name, _id: { $ne: id } });
    if (collisionDept) {
      throw new Error("Department with this name already exists");
    }
  }

  // Validate manager exists in Employee collection if provided
  if (manager) {
    const emp = await Employee.findById(manager);
    if (!emp) {
      throw new Error("Assigned manager does not exist");
    }
  }

  // Validate parentDepartment if provided
  if (parentDepartment) {
    const parent = await Department.findById(parentDepartment);
    if (!parent) {
      throw new Error("Parent department does not exist");
    }
  }

  const updatedDept = await Department.findByIdAndUpdate(
    id,
    {
      name,
      description,
      manager: manager || null,
      parentDepartment: parentDepartment || null,
      costCenterCode: costCenterCode || "GEN-CORP",
      allocatedBudget: Number(allocatedBudget) || 0,
    },
    { new: true }
  );

  if (!updatedDept) {
    throw new Error("Department not found");
  }

  return updatedDept;
};

/**
 * Delete a department.
 */
const deleteDepartment = async (id) => {
  // Check if there are any employees assigned to this department
  const employeeCount = await Employee.countDocuments({ department: id, isDeleted: false });
  if (employeeCount > 0) {
    throw new Error("Cannot delete department because it has active employee members");
  }

  const deletedDept = await Department.findByIdAndDelete(id);
  if (!deletedDept) {
    throw new Error("Department not found");
  }

  return deletedDept;
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};