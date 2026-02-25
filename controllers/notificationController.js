const Notification = require("../models/Notification");

const createNotification = async (
  userId,
  type,
  title,
  message,
  relatedId = null,
  relatedModel = null
) => {
  return Notification.create({
    user: userId,
    type,
    title,
    message,
    relatedId,
    relatedModel,
  });
};



// Get all notifications for logged-in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get Notification Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Mark as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });

  } catch (error) {
    console.error("Mark Read Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Unread Count Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


module.exports = {
  getNotifications,
  markAsRead,
  getUnreadCount,
  createNotification
};
