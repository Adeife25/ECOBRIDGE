const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: { type: String }, // required only if authProvider = 'local'
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  role: { type: String, enum: ['SME', 'Partner', 'Admin'], default: 'SME' },

  
  // Admin-specific
  adminAccessCode: { type: String },
  currentPassword: String,

  // Partner-specific
  organizationName: { type: String },
  serviceLocation: { type: String },
  serviceType: { type: String, enum: ['Composting', 'Recycling', 'Animal feed'] },

  // Business-specific
  businessName: { type: String },
  businessLocation: { type: String },
  businessType: { type: String, enum: ['Hotel', 'Restaurant', 'Catering', 'Event Center'] },

//forgot password flow 
resetCode: { 
    type: Number,
     default: null
     }
    }, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
