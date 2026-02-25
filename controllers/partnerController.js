// controllers/partnerController.js
const WasteLog = require("../models/wasteLog");
const PickupRequest = require("../models/PickupRequest");
const Notification = require("../models/Notification");

// GET /api/partner/wastes → show only SME pickup requests
const getAvailableWaste = async (req, res) => {
  try {
    let { category, urgent, nearby, maxDistance } = req.query;

    const allowedCategories = [
      "plastic",
      "paper_cardboard",
      "metal",
      "glass",
      "food_organic",
      "sanitary_hygiene",
      "pre_production_waste"
    ];

    // Only show logs with pickupStatus = "Requested"
    let query = {
      status: "Submitted",
      pickupStatus: "Requested",
      wasteCategory: { $in: allowedCategories }
    };

    if (category && allowedCategories.includes(category)) {
      query.wasteCategory = category;
    }

    if (urgent === "true") {
      query.urgency = "Urgent";
    }

    if (nearby) {
      const [lng, lat] = nearby.split(",").map(Number);
      maxDistance = Number(maxDistance) || 5000;
      query.pickupLocation = {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistance
        }
      };
    }

    const wastes = await WasteLog.find(query)
      .populate("createdBy", "businessName email")
      .sort({ createdAt: -1 });

    res.json({ wastes });
  } catch (err) {
    console.error("Get Available Waste Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// POST /api/partner/request-pickup → accept existing SME pickup
   const requestPickupFromListing = async (req, res) => {
  try {
    const { pickupId } = req.body;

    const pickup = await PickupRequest.findByIdAndUpdate(
      pickupId,
      { status: "Accepted" },
      { returnDocument: "after" }
    ).populate({
      path: "wasteLog",
      populate: { path: "createdBy", select: "businessName email" }
    });

    if (!pickup)
      return res.status(404).json({ message: "Pickup request not found" });

    if (pickup.wasteLog) {
      pickup.wasteLog.pickupStatus = "Accepted";
      await pickup.wasteLog.save();

      await Notification.create({
        user: pickup.wasteLog.createdBy._id,
        type: "PickupStatus",
        title: "Pickup Accepted",
        message: `Partner accepted your pickup request.`,
        relatedId: pickup._id,
        relatedModel: "PickupRequest"
      });
    }

    res.json({ message: "Pickup accepted successfully", data: pickup });

  } catch (err) {
    console.error("Request Pickup Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
    

module.exports = {
  getAvailableWaste,
  requestPickupFromListing
};
