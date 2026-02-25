const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getHistory } = require("../controllers/historyController");

router.get("/", protect,
  authorizeRoles(['SME']),getHistory);

module.exports = router;
