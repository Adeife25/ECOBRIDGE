const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { createPickupRequest, getMyPickups, updatePickupStatus } = require("../controllers/pickupController");

// SME routes
router.post("/", protect, createPickupRequest);
router.get("/", protect, getMyPickups);

// Admin route to update pickup status
router.patch("/:id/status", protect, authorizeRoles(["Admin"]), updatePickupStatus);

module.exports = router;
