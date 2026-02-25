const WasteLog = require("../models/wasteLog");
const PickupRequest = require("../models/PickupRequest");

const getHistory = async (req, res) => {
  try {
    const {
      type,        // "logs" or "pickups"
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const baseQuery = { createdBy: req.user._id };

    // Status filter
    if (status && status !== "All") {
      baseQuery.status = status;
    }

    // Date filter
    if (startDate && endDate) {
      baseQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (page - 1) * limit;

    let wasteLogs = [];
    let pickups = [];

    // Fetch depending on type
    if (!type || type === "logs") {
      wasteLogs = await WasteLog.find(baseQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    }

    if (!type || type === "pickups") {
      pickups = await PickupRequest.find(baseQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    }

    res.status(200).json({
      wasteLogs,
      pickups,
      currentPage: Number(page),
    });

  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getHistory };
