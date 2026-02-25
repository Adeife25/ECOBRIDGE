const WasteLog = require("../models/wasteLog");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { createNotification } = require("../controllers/notificationController");

const sendInactivityReminders = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const users = await User.find();

    for (const user of users) {

      // Get latest waste log
      const latestLog = await WasteLog.findOne({ createdBy: user._id })
        .sort({ createdAt: -1 });

      if (!latestLog || latestLog.createdAt < sevenDaysAgo) {

        // Prevent duplicate reminder within last 24 hours
        const lastReminder = await Notification.findOne({
          user: user._id,
          type: "LoggingReminder",
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (!lastReminder) {
          await createNotification(
            user._id,
            "LoggingReminder",
            "Logging Reminder",
            "You haven’t logged any waste in the last 7 days. Please log your waste today."
          );
        }
      }
    }

    console.log("Inactivity reminder check completed.");
  } catch (error) {
    console.error("Reminder Service Error:", error);
  }
};

module.exports = { sendInactivityReminders };
