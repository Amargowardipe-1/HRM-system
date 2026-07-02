const User = require("./user.model");
const { hashPassword } = require("../../utils/auth.helper");

// Create User
const createUser = async (userData, creatorId = null) => {
  const { name, email, password, role, department, designation, salary } = userData;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    department: department || null,
    designation: designation || null,
    salary: salary || 0,
    createdBy: creatorId,
  });

  return user;
};

// Get All Users
const getUsers = async () => {
  return await User.find()
    .select("-password")
    .populate("department", "name")
    .populate("designation", "title level");
};

const getUserById = async (id) => {
  return await User.findById(id)
    .select("-password")
    .populate("department", "name")
    .populate("designation", "title level");
};

// Update User
const updateUser = async (id, userData, requester) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  // Ownership Check: Admin has full access, HR can only edit users they created
  const requesterId = (requester?._id || requester?.id || "").toString();
  const isAdmin = requester?.role === "Admin";
  const isCreator = user.createdBy && user.createdBy.toString() === requesterId;

  if (!isAdmin && !isCreator) {
    throw new Error("Access Denied: You are not authorized to edit this profile");
  }

  const { name, email, password, role, isActive, department, designation, salary } = userData;

  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      throw new Error("Email already exists");
    }
  }

  const updateData = { name, email, role };
  
  if (typeof isActive !== "undefined") {
    updateData.isActive = isActive;
  }

  if (typeof department !== "undefined") {
    updateData.department = department || null;
  }

  if (typeof designation !== "undefined") {
    updateData.designation = designation || null;
  }

  if (typeof salary !== "undefined") {
    updateData.salary = salary || 0;
  }

  if (password && password.trim() !== "") {
    updateData.password = await hashPassword(password);
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .populate("department", "name")
    .populate("designation", "title level");

  return updatedUser;
};

// Delete User
const deleteUser = async (id, requester) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  // Ownership Check: Admin has full access, HR can only delete users they created
  const requesterId = (requester?._id || requester?.id || "").toString();
  const isAdmin = requester?.role === "Admin";
  const isCreator = user.createdBy && user.createdBy.toString() === requesterId;

  if (!isAdmin && !isCreator) {
    throw new Error("Access Denied: You are not authorized to delete this profile");
  }

  const deletedUser = await User.findByIdAndDelete(id);
  return deletedUser;
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};