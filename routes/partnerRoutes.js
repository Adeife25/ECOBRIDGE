const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getAvailableWaste,
  requestPickupFromListing
} = require("../controllers/partnerController");

// Only partners can access these routes
router.get("/wastes", protect, authorizeRoles(["Partner"]), getAvailableWaste);

// Partner accepts SME pickup request (using pickupId)
router.post("/request-pickup", protect, authorizeRoles(["Partner"]), requestPickupFromListing);

module.exports = router;
