const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const WasteLog = require("../models/wasteLog");

// GET /api/conversations/inbox
exports.getInbox = async (req, res) => {
  try {
    // Find all conversations where the logged-in user is a participant
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate("wasteLog", "wasteCategory quantity pickupStatus status")
      .populate("participants", "name email businessName organizationName")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .lean();

    // Format inbox entries
    const inbox = conversations.map(conv => ({
      conversationId: conv._id,
      wasteLog: conv.wasteLog,
      participants: conv.participants,
      lastMessage: conv.lastMessage
        ? {
            text: conv.lastMessage.text,
            sender: conv.lastMessage.sender,
            createdAt: conv.lastMessage.createdAt
          }
        : null,
      updatedAt: conv.updatedAt
    }));

    res.json({ inbox });
  } catch (error) {
    console.error("Get Inbox Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
