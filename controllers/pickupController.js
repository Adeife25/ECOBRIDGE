const PickupRequest = require("../models/PickupRequest");
const WasteLog = require("../models/wasteLog");
const Notification = require("../models/Notification");

// CREATE pickup request
const createPickupRequest = async (req, res) => {
  try {
    const {
      wasteCategory,
      quantity,
      pickupAddress,
      pickupLocation,
      availableDate,
      availableTime,
      wasteCondition,
      description,
      imagePath,
      wasteLogId // optional: link to WasteLog
    } = req.body;

    if (!wasteLogId) {
  return res.status(400).json({ message: "wasteLogId is required" });
}

    // ✅ Validate compulsory image
    if (!imagePath || imagePath.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const newRequest = await PickupRequest.create({
      createdBy: req.user._id,
      wasteLog: wasteLogId,
      wasteCategory,
      quantity,
      pickupAddress,
      pickupLocation,
      availableDate,
      availableTime,
      wasteCondition,
      description,
      imagePath,
      status: "Requested", // default when created
      urgency: req.body.urgency || "Normal" // 👈 include urgency
    });

    // 🔗 Sync with WasteLog if provided
    if (wasteLogId) {
      const wasteLog = await WasteLog.findById(wasteLogId);
      if (wasteLog) {
        wasteLog.pickupStatus = "Requested";
        await wasteLog.save();
      }
    }

    res.status(201).json({
      message: "Pickup request submitted successfully",
      data: newRequest
    });

  } catch (error) {
    console.error("Create Pickup Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/pickups?status=<optional>
const getMyPickups = async (req, res) => {
  try {
    const filterStatus = req.query.status;
    const query = { createdBy: req.user._id };

    if (filterStatus && filterStatus !== "All") query.status = filterStatus;

    const pickups = await PickupRequest.find(query).sort({ createdAt: -1 });

    // Count pickups by status
    const allPickups = await PickupRequest.find({ createdBy: req.user._id });
    const statusCounts = {
      All: allPickups.length,
      None: allPickups.filter(p => p.status === "None").length,
      Requested: allPickups.filter(p => p.status === "Requested").length,
      Accepted: allPickups.filter(p => p.status === "Accepted").length,
      Completed: allPickups.filter(p => p.status === "Completed").length,
      Cancelled: allPickups.filter(p => p.status === "Cancelled").length
    };

    res.json({ pickups, statusCounts });

  } catch (error) {
    console.error("Get Pickups Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE pickup status
const updatePickupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pickup = await PickupRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    // 🔗 Sync WasteLog
    if (pickup.wasteLog) {
      const wasteLog = await WasteLog.findById(pickup.wasteLog);
      if (wasteLog) {
        wasteLog.pickupStatus = status;
        await wasteLog.save();
      }
    }

    // 🔔 Notifications
    if (["Accepted", "Completed"].includes(status)) {
      await Notification.create({
        user: pickup.createdBy,
        type: "PickupStatus",
        title: `Pickup ${status}`,
        message: `Your pickup request has been ${status}.`,
        relatedId: pickup._id,
        relatedModel: "PickupRequest"
      });
    }

    res.json({ message: "Pickup status updated", data: pickup });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating pickup" });
  }
};

module.exports = { createPickupRequest, getMyPickups, updatePickupStatus };
