const Notification = require("./notification.model");
const User = require("../user/user.model");

// Create a single notification
const createNotification = async ({ recipient, sender, type, title, message, link }) => {
  return await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    link: link || "",
  });
};

// Notify all Admins and HRs (excluding the sender)
const notifyAdminsAndHRs = async ({ sender, type, title, message, link }) => {
  try {
    const managers = await User.find({
      role: { $in: ["Admin", "HR"] },
      isActive: true,
      _id: { $ne: sender },
    }).select("_id");

    if (!managers.length) return [];

    const notifications = managers.map((m) => ({
      recipient: m._id,
      sender,
      type,
      title,
      message,
      link: link || "",
    }));

    return await Notification.insertMany(notifications);
  } catch (error) {
    console.error("Failed to broadcast notifications to Admins/HRs:", error.message);
    return [];
  }
};

// Get notifications for a user
const getNotifications = async (userId) => {
  return await Notification.find({ recipient: userId, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(50);
};

// Mark notification as read
const markAsRead = async (id, userId) => {
  const notification = await Notification.findOne({ _id: id, recipient: userId, isDeleted: false });
  if (!notification) {
    throw new Error("Notification not found.");
  }

  notification.isRead = true;
  return await notification.save();
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { recipient: userId, isRead: false, isDeleted: false },
    { $set: { isRead: true } }
  );
};

// Soft delete notification
const deleteNotification = async (id, userId) => {
  const notification = await Notification.findOne({ _id: id, recipient: userId, isDeleted: false });
  if (!notification) {
    throw new Error("Notification not found.");
  }

  notification.isDeleted = true;
  return await notification.save();
};

module.exports = {
  createNotification,
  notifyAdminsAndHRs,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
