const userService = require("./user.service");

// POST User
const createUser = async (req, res) => {
  try {
    const creatorId = req.user?._id || req.user?.id || null;
    const user = await userService.createUser(req.body, creatorId);

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET Users
const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET User by ID
const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT (Update) User
const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await userService.updateUser(id, req.body, req.user);

    res.status(200).json({
      success: true,
      message: "User Updated Successfully",
      data: user,
    });
  } catch (error) {
    const statusCode = error.message.includes("Access Denied") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE User
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    await userService.deleteUser(id, req.user);

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    const statusCode = error.message.includes("Access Denied") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};