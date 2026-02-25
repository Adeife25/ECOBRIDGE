const mongoose = require("mongoose");
const wasteLog = require("./wasteLog");

const PickupRequestSchema = new mongoose.Schema({
  wasteLog: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "wasteLog", 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",   // ✅ Reference the User who submitted the pickup
    required: true 
  },

  wasteCategory: { 
    type: String, 
    enum: [
      "plastic",
      "paper_cardboard",
      "metal",
      "glass",
      "food_organic",
      "sanitary_hygiene",
      "pre_production_waste"
    ],
    required: true 
  },

  description: { type: String },

  quantity: { type: Number, required: true },

  wasteCondition: { 
    type: String, 
    enum: ["Fresh", "Stored"], 
    required: true 
  },

  imagePath: { 
    type: [String], 
    required: true // compulsory image upload
  },

  pickupAddress: { type: String, required: true },

  pickupLocation: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },

  availableDate: { type: Date, required: true },
  availableTime: { type: String, required: true },

  status: {
    type: String,
    enum: ['None', 'Requested', 'Accepted', 'Completed','Cancelled'],
    default: "None"
  },

  urgency: { 
    type: String, 
    enum: ["Normal", "Urgent"], 
    default: "Normal"   // 👈 added field
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PickupRequest", PickupRequestSchema);
