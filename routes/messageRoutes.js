const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createMessage,
  getConversationMessages,
  getInbox,
  markSuccessful,
  markCompleted,
    getOrCreateConversation
} = require("../controllers/messageController");

// SME & Partner can send messages
router.post("/", protect, createMessage);

router.post("/conversation", protect, getOrCreateConversation);

// Both can view conversation messages
router.get("/conversation/:id", protect, getConversationMessages);

// Inbox for SME or Partner
router.get("/inbox", protect, getInbox);

// SME only: mark partner successful
router.put(
  "/conversation/:id/successful",
  protect,
  authorizeRoles(["SME"]),
  markSuccessful
);

// SME only: mark pickup completed
router.put(
  "/conversation/:id/completed",
  protect,
  authorizeRoles(["SME"]),
  markCompleted
);

module.exports = router;
