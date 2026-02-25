const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Controllers
const authController = require('../controllers/authController');
const { login, forgotPassword, resetPassword } = require('../controllers/authController');

// =======================
// Local Signup
// =======================
router.post('/register/admin', authController.registerAdmin);
router.post('/register/partner', authController.registerPartner);
router.post('/register/businesses', authController.registerBusiness);

// =======================
// Local Login & Password
// =======================
router.post('/login', login);
router.post('/forgot-password', protect, forgotPassword);
router.post('/reset-password', protect,  resetPassword);

// =======================
// Google Signup (SME only)
// =======================

// Start Google login
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback after Google login
router.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    console.log("🎉 Google callback triggered");
    console.log("User object:", req.user);

    // Always SME role for Google signup
    const payload = { user: { id: req.user.id, role: 'SME' } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log("✅ JWT issued:", token);
    res.json({ token, role: 'SME' });
  }
);

module.exports = router;
