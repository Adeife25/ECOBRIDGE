const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// =======================
// Admin Signup
// =======================
exports.registerAdmin = async (req, res) => {
  const { fullName, email, password, currentPassword, accessCode } = req.body;

  try {
    if (!fullName || !email || !password || !currentPassword || !accessCode) {
      return res.status(400).json({ msg: "All fields are required for Admin signup" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Validate Admin access code
    if (accessCode !== process.env.ADMIN_ACCESS_CODE) {
      return res.status(403).json({ msg: "Invalid Admin Access Code" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      fullName,
      email,
      password: hashedPassword,
      currentPassword,
      accessCode,
      role: 'Admin',
      authProvider: 'local'
    });

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// =======================
// Partner Signup
// =======================
exports.registerPartner = async (req, res) => {
  const { fullName, email, password, confirmPassword, organizationName, serviceLocation, serviceType } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      fullName,
      email,
      password: hashedPassword,
      organizationName,
      serviceLocation,
      serviceType,
      role: 'Partner',
      authProvider: 'local'
    });

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// =======================
// Business Signup
// =======================
exports.registerBusiness = async (req, res) => {
  const { fullName, email, password, confirmPassword, businessName, location, businessType } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      fullName,
      email,
      password: hashedPassword,
      businessName,
      location,
      businessType,
      role: 'SME',
      authProvider: 'local'
    });

    await user.save();

   const payload = { user: { id: user._id, role: user.role } };
jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
  if (err) throw err;
  res.status(201).json({ token });
});


  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// =======================
// Login
// =======================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// =======================
// Forgot Password
// =======================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const resetCode = Math.floor(100000 + Math.random() * 900000);
    user.resetCode = resetCode;
    await user.save();

    res.json({ msg: "Reset code generated", resetCode }); // MVP: return code directly
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// =======================
// Reset Password
// =======================
exports.resetPassword = async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.resetCode !== parseInt(resetCode)) {
      return res.status(400).json({ msg: "Invalid reset code" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetCode = undefined;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
