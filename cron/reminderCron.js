const { sendInactivityReminders } = require("../services/reminderServices");

const cron = require("node-cron");

// Runs every day at 8 PM
cron.schedule("0 20 * * *", async () => {
  console.log("Running inactivity reminder job...");
  await sendInactivityReminders();
});