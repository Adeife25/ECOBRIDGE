const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const WasteLog = require("../models/wasteLog");
const Notification = require("../models/Notification");

// POST /api/messages
exports.createMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, text } = req.body;

    // Find or create conversation
    let conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      recipient: recipientId,
      text
    });

    // Update conversation lastMessage
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Notify recipient
    await Notification.create({
      user: recipientId,
      type: "Message",
      title: "New Message",
      message: `You have a new message from ${req.user.name}`,
      relatedId: message._id,
      relatedModel: "Message"
    });

    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    console.error("Create Message Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/messages/conversation/:id
exports.getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ conversation: id })
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/conversations/:id/successful
exports.markSuccessful = async (req, res) => {
  try {
    const { id } = req.params; // conversation id
    const { partnerId } = req.body;

    const conversation = await Conversation.findById(id).populate("wasteLog");
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    // 🔹 Check if wasteLog exists
    if (!conversation.wasteLog) {
      return res.status(400).json({ message: "This conversation has no linked waste log" });
    }

    const wasteLog = await WasteLog.findById(conversation.wasteLog._id);
    if (!wasteLog) return res.status(404).json({ message: "Waste log not found" });

    // Only SME who created the waste log can mark successful
    if (wasteLog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update waste log status
    wasteLog.status = "Successful";
    wasteLog.pickupStatus = "Accepted";
    await wasteLog.save();

    // Notify chosen Partner
    await Notification.create({
      user: partnerId,
      type: "PickupReminder",
      title: "Pickup Accepted",
      message: `Your pickup request for ${wasteLog.wasteCategory} has been accepted.`,
      relatedId: wasteLog._id,
      relatedModel: "WasteLog"
    });

    res.json({ message: "Partner marked successful", data: wasteLog });
  } catch (error) {
    console.error("Mark Successful Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// PUT /api/conversations/:id/completed
exports.markCompleted = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id).populate("wasteLog");
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    const wasteLog = await WasteLog.findById(conversation.wasteLog._id);
    if (!wasteLog) return res.status(404).json({ message: "Waste log not found" });

    // Only SME can mark completed
    if (wasteLog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    wasteLog.pickupStatus = "Completed";
    await wasteLog.save();

    res.json({ message: "Pickup marked completed", data: wasteLog });
  } catch (error) {
    console.error("Mark Completed Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/messages/inbox
exports.getInbox = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate("wasteLog", "wasteCategory quantity pickupStatus status")
      .populate("participants", "name email businessName organizationName")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .lean();

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

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { receiverId, wasteLogId } = req.body;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
      wasteLog: wasteLogId || null
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
        wasteLog: wasteLogId || null
      });
    }

    res.json(conversation);

  } catch (error) {
    console.error("Create Conversation Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};