const mongoose = require('mongoose');

const wasteLogSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  wasteCategory: {
    type: String,
    enum: [
      'plastic',
      'paper_cardboard',
      'metal',
      'glass',
      'food_organic',
      'sanitary_hygiene',
      'pre_production_waste'
    ],
    required: true
  },

  description: {
    type: String,
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  wasteCondition: {
    type: String,
    enum: ['Fresh', 'Stored'],
    required: true
  },

  imagePath: [String], // store image URLs

  media: [String], // optional media uploads (video/audio)

  pickupAddress: {
    type: String,
    required: true
  },

  availableDate: {
    type: Date,
    required: true
  },

  availableTime: {
    type: String,
    required: true
  },

  urgency: {
    type: String,
    enum: ['Normal', 'Urgent'],
    default: 'Normal'
  },

  price: {
    type: Number
  },

  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Successful'],
    default: 'Draft'
  },

  pickupStatus: {
    type: String,
    enum: ['None', 'Requested', 'Accepted', 'Completed'],
    default: 'None'
  },

  aiAnalysis: {
    classification: String,
    contaminationRisk: String,
    contaminationReason: String,
    recommendation: String
  }

}, { timestamps: true });

module.exports = mongoose.model('WasteLog', wasteLogSchema);
