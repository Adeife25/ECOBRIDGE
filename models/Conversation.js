const mongoose = require("mongoose");
const conversationSchema = new mongoose.Schema({
  wasteLog: { type: mongoose.Schema.Types.ObjectId, ref: "WasteLog", required: false },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // SME + Partner(s)
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Conversation", conversationSchema);
