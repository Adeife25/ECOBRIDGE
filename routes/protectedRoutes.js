const express = require('express');
const router = express.Router();

// ✅ Import your real middleware
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// -----------------------
// Admin-only route
// -----------------------
router.get('/admin', protect, authorizeRoles(['Admin']), (req, res) => {
  res.json({
    message: "Welcome Admin!",
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// -----------------------
// Partner-only route
// -----------------------
router.get('/partner', protect, authorizeRoles(['Partner']), (req, res) => {
  res.json({
    message: "Welcome Partner!",
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// -----------------------
// SME-only route
// -----------------------
router.get('/sme', protect, authorizeRoles(['SME']), (req, res) => {
  res.json({
    message: "Welcome SME!",
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
