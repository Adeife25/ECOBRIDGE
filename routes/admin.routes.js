const express = require("express");
const router = express.Router();

const { getAdminDashboard } = require("../controllers/admin.controller");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Only Admin can access
router.get("/dashboard", protect, authorizeRoles("Admin"), getAdminDashboard);

module.exports = router;
